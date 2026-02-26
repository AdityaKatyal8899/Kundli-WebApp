from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from ..hasher import Hash
from app.JWT_token import create_access_token
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.sqlalchemy_model import User
from app.schemas.pydantic_model import UserCreate, GoogleAuth
from app.services.auth_service import google_login
from app.services import user_service

router = APIRouter()

@router.post("/login")
def login(request: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == request.username).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not Hash.verify(request.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token(
        data={"sub": str(user.id)}
    )

    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register")
def register(request: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == request.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = Hash.bcrypt(request.password)

    user_service.create_user(
        db=db,
        email=request.email,
        password=hashed_password,
        provider="email"
    )

    return {"message": "User created successfully"}

@router.post("/google")
def google_login_route(payload: GoogleAuth, db: Session = Depends(get_db)):

    access_token = google_login(payload.id_token, db)

    if not access_token:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }