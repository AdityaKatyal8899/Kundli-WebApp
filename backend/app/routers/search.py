from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.pydantic_model import ProfileResponse
from app.services import search_service
from typing import List, Optional

router = APIRouter(
    prefix="/search",
    tags=["Search"]
)


@router.get("", response_model=List[ProfileResponse])
def search(
    min_age: Optional[int | str] = Query(None),
    max_age: Optional[int | str] = Query(None),
    religion: Optional[str] = Query(None),
    education: Optional[str] = Query(None),
    layout: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return search_service.search_profiles(
        db, min_age, max_age, religion, education, layout
    )
