from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.sqlalchemy_model import User
from app.schemas.pydantic_model import ConnectionResponse, NotificationResponse, ProfileViewResponse
from app.services import connection_service
from app.oauth2 import get_current_user
from typing import List

router = APIRouter(
    tags=["Connections"]
)

@router.post("/connect/{user_id}", response_model=ConnectionResponse)
def send_connection_request(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return connection_service.send_connection(db, current_user, user_id)

@router.patch("/connect/{connection_id}/accept", response_model=ConnectionResponse)
def accept_connection(
    connection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return connection_service.accept_connection(db, connection_id, current_user)

@router.patch("/connect/{connection_id}/reject", response_model=ConnectionResponse)
def reject_connection(
    connection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return connection_service.reject_connection(db, connection_id, current_user)

@router.patch("/connect/{connection_id}/dissolve", response_model=ConnectionResponse)
def dissolve_connection(
    connection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return connection_service.dissolve_connection(db, connection_id, current_user)

from app.schemas.pydantic_model import ConnectionResponse, NotificationResponse, ProfileViewResponse, GroupedConnectionsResponse

@router.get("/connections", response_model=GroupedConnectionsResponse)
def get_connections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return connection_service.get_user_connections(db, current_user)

@router.get("/notifications/connections", response_model=NotificationResponse)
def get_connection_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return connection_service.get_notifications(db, current_user)

@router.get("/notifications/profile-views", response_model=List[ProfileViewResponse])
def get_profile_view_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return connection_service.get_profile_views(db, current_user)

from app.services import chat_service
@router.get("/notifications/chats/unread")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = chat_service.get_unread_count(db, current_user)
    return {"count": count}
