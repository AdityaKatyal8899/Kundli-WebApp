from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database import get_db
from app.models.sqlalchemy_model import User, UserPhoto
from app.schemas.pydantic_model import (
    PhotoUploadRequest, PhotoUploadResponse, 
    PhotoConfirmRequest, PhotoResponse, PhotoUrlResponse
)
from app.services import s3_service
from app.oauth2 import get_current_user

router = APIRouter(
    prefix="/photos",
    tags=["Photos"]
)

@router.post("/generate-upload-url", response_model=PhotoUploadResponse)
def generate_upload_url(
    request: PhotoUploadRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        response = s3_service.generate_upload_url(str(current_user.id), request.file_type)
        print(f"[UPLOAD URL GENERATED] user_id={current_user.id} object_key={response['object_key']}")
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/confirm", response_model=PhotoResponse)
def confirm_photo(
    request: PhotoConfirmRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Security check: Ensure object_key belongs to current user
    expected_prefix = f"profiles/{current_user.id}/"
    if not request.object_key.startswith(expected_prefix):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Invalid object key for this user"
        )

    # Check if this is the first photo
    existing_count = db.query(UserPhoto).filter(UserPhoto.user_id == current_user.id).count()
    is_primary = existing_count == 0

    # Store in DB
    new_photo = UserPhoto(
        user_id=current_user.id,
        object_key=request.object_key,
        is_primary=is_primary
    )
    db.add(new_photo)
    db.commit()
    db.refresh(new_photo)

    # Generate view URL for response
    response_data = PhotoResponse.model_validate(new_photo, from_attributes=True)
    response_data.view_url = s3_service.gen_presigned_url(new_photo.object_key)
    
    return response_data

@router.get("", response_model=List[PhotoResponse])
def get_user_photos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    photos = db.query(UserPhoto).filter(
        UserPhoto.user_id == current_user.id
    ).order_by(UserPhoto.created_at.desc()).all()

    # Inject signed URLs
    results = []
    for p in photos:
        res = PhotoResponse.model_validate(p, from_attributes=True)
        res.view_url = s3_service.gen_presigned_url(p.object_key)
        results.append(res)
    
    return results

@router.put("/{photo_id}/set-primary")
def set_primary(
    photo_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    photo = db.query(UserPhoto).filter(
        UserPhoto.id == photo_id,
        UserPhoto.user_id == current_user.id
    ).first()

    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    # Remove primary from all user photos
    db.query(UserPhoto).filter(
        UserPhoto.user_id == current_user.id
    ).update({"is_primary": False})

    photo.is_primary = True
    db.commit()

    return {"message": "Primary photo updated"}

@router.get("/users/{user_id}/profile-photo")
def get_public_profile_photo(
    user_id: UUID,
    db: Session = Depends(get_db)
):
    photo = db.query(UserPhoto).filter(
        UserPhoto.user_id == user_id,
        UserPhoto.is_primary == True
    ).first()

    if not photo:
        return {"url": None}

    url = s3_service.gen_presigned_url(photo.object_key)
    return {"url": url}

@router.get("/{photo_id}", response_model=PhotoUrlResponse)
def get_photo_url(
    photo_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    photo = db.query(UserPhoto).filter(
        UserPhoto.id == photo_id,
        UserPhoto.user_id == current_user.id
    ).first()
    
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    url = s3_service.gen_presigned_url(photo.object_key)
    return {"url": url}

@router.delete("/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_photo(
    photo_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    photo = db.query(UserPhoto).filter(
        UserPhoto.id == photo_id, 
        UserPhoto.user_id == current_user.id
    ).first()
    
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
        
    # Delete from S3
    try:
        s3_service.delete_s3_object(photo.object_key)
    except Exception as e:
        print(f"Error deleting from S3: {e}")
        # We might still want to delete the DB record if S3 delete fails (e.g. file already gone)
        
    # Delete from DB
    db.delete(photo)
    db.commit()
    
    return None
