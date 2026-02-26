from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional
from app.database import get_db
from app.models.sqlalchemy_model import User, Profile, UserPhoto
from app.schemas.pydantic_model import UserPublicResponse
from app.services import s3_service

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("/{user_id}", response_model=UserPublicResponse)
def get_public_profile(user_id: UUID, db: Session = Depends(get_db)):
    # Fetch user and join profile
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    
    # Get primary photo
    primary_photo = db.query(UserPhoto).filter(
        UserPhoto.user_id == user.id,
        UserPhoto.is_primary == True
    ).first()

    photo_url = None
    if primary_photo:
        photo_url = s3_service.gen_presigned_url(primary_photo.object_key)

    return {
        "id": user.id,
        "name": user.name or (profile.full_name if profile else None),
        "education": profile.education if profile else None,
        "profession": profile.occupation if profile else None,
        "photo_url": photo_url
    }
