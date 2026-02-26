from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.sqlalchemy_model import User, UserPhoto, Religion, EducationLevel, OccupationType, SalaryRange
from app.schemas.pydantic_model import (
    ProfileCreate, ProfileResponse, ProfileUpdate, LayoutUpdate,
    ProfileOptionsResponse, TaxonomyOption, SalaryRangeOption
)
from app.services import profile_service, search_service, connection_service
from app.oauth2 import get_current_user, get_current_user_optional
from app.utils.profile_completion import calculate_profile_completion
from typing import Optional

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


def _inject_taxonomy_labels(profile):
    """Populate *_label fields from structured FK relationships (Phase 4 backward compat)."""
    # Religion: structured → legacy text
    if profile.religion_ref:
        profile.religion_label = profile.religion_ref.name
    elif profile.religion:
        profile.religion_label = profile.religion

    # Education
    if profile.education_level:
        profile.education_label = profile.education_level.name
    elif profile.education:
        profile.education_label = profile.education

    # Occupation
    if profile.occupation_type:
        profile.occupation_label = profile.occupation_type.name
    elif profile.occupation:
        profile.occupation_label = profile.occupation

    # Salary
    if profile.salary_range:
        profile.salary_label = profile.salary_range.label
    elif profile.salary:
        profile.salary_label = f"₹{profile.salary:,}"

    return profile


# ── Phase 5: Options endpoint (must be before /{user_id}) ──────────────────
@router.get("/options", response_model=ProfileOptionsResponse)
def get_profile_options(db: Session = Depends(get_db)):
    """Return all active dropdown options from DB. Frontend must call this — no hardcoding."""
    religions = (
        db.query(Religion)
        .filter(Religion.is_active == True)
        .order_by(Religion.display_order)
        .all()
    )
    education_levels = (
        db.query(EducationLevel)
        .filter(EducationLevel.is_active == True)
        .order_by(EducationLevel.display_order)
        .all()
    )
    occupation_types = (
        db.query(OccupationType)
        .filter(OccupationType.is_active == True)
        .order_by(OccupationType.display_order)
        .all()
    )
    salary_ranges = (
        db.query(SalaryRange)
        .filter(SalaryRange.is_active == True)
        .order_by(SalaryRange.display_order)
        .all()
    )
    return {
        "religions": religions,
        "education_levels": education_levels,
        "occupation_types": occupation_types,
        "salary_ranges": salary_ranges,
    }


@router.post("", response_model=ProfileResponse)
def create_or_update_profile(
    profile_data: ProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_profile = profile_service.get_profile(db, current_user)
    
    if db_profile:
        db_profile = profile_service.update_profile(db, db_profile, profile_data.model_dump())
    else:
        db_profile = profile_service.create_profile(db, current_user, profile_data)

    primary_photo = db.query(UserPhoto).filter(
        UserPhoto.user_id == current_user.id,
        UserPhoto.is_primary == True
    ).first()
    db_profile.profile_completion = calculate_profile_completion(db_profile, primary_photo is not None)
    _inject_taxonomy_labels(db_profile)
    return db_profile


@router.get("", response_model=ProfileResponse)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_profile = profile_service.get_profile(db, current_user)
    if not db_profile:
        from datetime import date
        from app.schemas.pydantic_model import ProfileCreate
        default_profile = ProfileCreate(
            full_name=current_user.email.split('@')[0],
            dob=date(1990, 1, 1),
            birth_time="12:00",
            birth_place="Unknown"
        )
        db_profile = profile_service.create_profile(db, current_user, default_profile)
    
    from app.services import s3_service
    for photo in db_profile.user.photos:
        photo.view_url = s3_service.gen_presigned_url(photo.object_key)

    primary_photo = db.query(UserPhoto).filter(
        UserPhoto.user_id == current_user.id,
        UserPhoto.is_primary == True
    ).first()
    has_primary_photo = primary_photo is not None
    db_profile.profile_completion = calculate_profile_completion(db_profile, has_primary_photo)
    db_profile.user.is_unlocked = True
    _inject_taxonomy_labels(db_profile)
    return db_profile


@router.patch("/layout", response_model=ProfileResponse)
def update_layout(
    layout_data: LayoutUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_profile = profile_service.get_profile(db, current_user)
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    updated = profile_service.update_profile(db, db_profile, {"layout": layout_data.layout})
    _inject_taxonomy_labels(updated)
    return updated


@router.get("/{user_id}", response_model=ProfileResponse)
def get_profile_by_id(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    profile, status_code = search_service.get_profile_by_user_id(db, user_id)
    
    if status_code == 404:
        raise HTTPException(status_code=404, detail="Profile not found")
    if status_code == 403:
        raise HTTPException(status_code=403, detail="User profile is locked")
    
    if current_user and current_user.id != user_id:
        connection_service.record_profile_view(db, current_user.id, user_id)
    
    from app.services import s3_service
    for photo in profile.user.photos:
        photo.view_url = s3_service.gen_presigned_url(photo.object_key)

    _inject_taxonomy_labels(profile)
    return profile
