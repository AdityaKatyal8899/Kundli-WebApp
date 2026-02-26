from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.sqlalchemy_model import User, Profile, Religion, EducationLevel, OccupationType, SalaryRange
from app.schemas.pydantic_model import ProfileCreate


def get_profile(db: Session, user: User):
    return db.query(Profile).filter(Profile.user_id == user.id).first()


def create_profile(db: Session, user: User, profile_data: ProfileCreate):
    db_profile = Profile(
        **profile_data.model_dump(),
        user_id=user.id
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile


_TAXONOMY_MAP = {
    "religion_id": (Religion, "Invalid religion"),
    "education_level_id": (EducationLevel, "Invalid education level"),
    "occupation_type_id": (OccupationType, "Invalid occupation type"),
    "salary_range_id": (SalaryRange, "Invalid salary range"),
}


def update_profile(db: Session, db_profile: Profile, profile_data: dict):
    # Phase 6: Validate taxonomy IDs before applying
    for field, (model, error_msg) in _TAXONOMY_MAP.items():
        value = profile_data.get(field)
        if value is not None:
            record = db.query(model).filter(model.id == value, model.is_active == True).first()
            if not record:
                raise HTTPException(status_code=400, detail=error_msg)

    for key, value in profile_data.items():
        if value is not None:
            setattr(db_profile, key, value)

    db.commit()
    db.refresh(db_profile)
    return db_profile
