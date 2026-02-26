from sqlalchemy.orm import Session
from sqlalchemy import extract
from app.models.sqlalchemy_model import User, Profile
from datetime import date


def search_profiles(
    db: Session,
    min_age: int = None,
    max_age: int = None,
    religion: str = None,
    education: str = None,
    layout: str = None
):
    # query = db.query(Profile).join(User).filter(User.is_unlocked == True)
    # Unlock temporarily bypassed for testing
    query = db.query(Profile).join(User)

    if religion:
        query = query.filter(Profile.religion.ilike(f"%{religion}%"))
    
    if education:
        query = query.filter(Profile.education.ilike(f"%{education}%"))
    
    if layout:
        query = query.filter(Profile.layout == layout)

    if min_age is not None and min_age != "":
        try:
            min_age_int = int(min_age)
            today = date.today()
            birth_year_limit = today.year - min_age_int
            query = query.filter(extract('year', Profile.dob) <= birth_year_limit)
        except ValueError:
            pass
        
    if max_age is not None and max_age != "":
        try:
            max_age_int = int(max_age)
            today = date.today()
            birth_year_limit = today.year - max_age_int
            query = query.filter(extract('year', Profile.dob) >= birth_year_limit)
        except ValueError:
            pass

    profiles = query.all()
    
    # Inject primary photo URLs and map profession
    from app.services import s3_service
    from app.models.sqlalchemy_model import UserPhoto
    
    for p in profiles:
        primary_photo = db.query(UserPhoto).filter(
            UserPhoto.user_id == p.user_id,
            UserPhoto.is_primary == True
        ).first()
        p.photo_url = s3_service.gen_presigned_url(primary_photo.object_key) if primary_photo else None
        p.profession = p.occupation  # Map for frontend consistency
        
    return profiles


def get_profile_by_user_id(db: Session, user_id: str):
    profile = db.query(Profile).join(User).filter(
        Profile.user_id == user_id
    ).first()

    if not profile:
        return None, 404
    
    # if not profile.user.is_unlocked:
    #     return None, 403
    # Unlock temporarily bypassed for testing
    
    # Inject primary photo URL and map profession
    from app.services import s3_service
    from app.models.sqlalchemy_model import UserPhoto
    
    primary_photo = db.query(UserPhoto).filter(
        UserPhoto.user_id == profile.user_id,
        UserPhoto.is_primary == True
    ).first()
    profile.photo_url = s3_service.gen_presigned_url(primary_photo.object_key) if primary_photo else None
    profile.profession = profile.occupation
    
    return profile, 200
