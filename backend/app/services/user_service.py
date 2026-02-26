from sqlalchemy.orm import Session
from app.models.sqlalchemy_model import User
from fastapi import Depends
from ..database import get_db


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: str):
    return db.query(User).filter(User.id == user_id).first()


def create_user(
    db: Session,
    email: str,
    password: str | None = None,
    provider: str = "email",
    provider_id: str | None = None,
    name: str | None = None
):
    # First 20 users unlock logic
    total_users = db.query(User).count()
    is_unlocked = True if total_users < 20 else False

    user = User(
        email=email,
        password=password,
        provider=provider,
        provider_id=provider_id,
        name=name,
        is_unlocked=is_unlocked
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user