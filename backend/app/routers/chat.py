from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from app.database import get_db, SessionLocal
from app.models.sqlalchemy_model import User
from app.schemas.pydantic_model import MessageResponse
from app.services import chat_service
from app.oauth2 import verify_token
from typing import List, Dict
import json
import logging

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

# --- Connection Manager ---
class ConnectionManager:
    def __init__(self):
        # connection_id -> list of websockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, connection_id: str):
        await websocket.accept()
        if connection_id not in self.active_connections:
            self.active_connections[connection_id] = []
        self.active_connections[connection_id].append(websocket)

    def disconnect(self, websocket: WebSocket, connection_id: str):
        if connection_id in self.active_connections:
            self.active_connections[connection_id].remove(websocket)
            if not self.active_connections[connection_id]:
                del self.active_connections[connection_id]

    async def broadcast(self, connection_id: str, message: dict):
        if connection_id in self.active_connections:
            for connection in self.active_connections[connection_id]:
                await connection.send_text(json.dumps(message))

manager = ConnectionManager()

# --- WebSocket Endpoint ---
@router.websocket("/ws/{connection_id}")
async def websocket_chat(
    websocket: WebSocket,
    connection_id: str,
    token: str
):
    db: Session = SessionLocal()
    try:
        # Authenticate
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
        user = verify_token(token, db, credentials_exception)
        
        # Validate connection
        chat_service.validate_connection(db, connection_id, user)
        
        # Accept connection
        await manager.connect(websocket, connection_id)
        
        try:
            while True:
                data = await websocket.receive_text()
                try:
                    payload = json.loads(data)
                    message_text = payload.get("content", data)
                except json.JSONDecodeError:
                    message_text = data

                # Save to DB
                msg = chat_service.save_message(db, connection_id, user.id, message_text)
                
                # Broadcast
                await manager.broadcast(connection_id, {
                    "id": str(msg.id),
                    "sender_id": str(msg.sender_id),
                    "message": msg.message,
                    "created_at": msg.created_at.isoformat(),
                    "is_read": msg.is_read
                })
        except WebSocketDisconnect:
            manager.disconnect(websocket, connection_id)
            
    except Exception as e:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        logging.error(f"WebSocket error: {e}")
    finally:
        db.close()

# --- HTTP Endpoints ---
from app.oauth2 import get_current_user

@router.get("/{connection_id}", response_model=List[MessageResponse])
def get_chat_history(
    connection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return chat_service.get_messages(db, connection_id, current_user)

@router.patch("/{connection_id}/read")
def mark_read(
    connection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return chat_service.mark_messages_read(db, connection_id, current_user)

@router.delete("/{connection_id}")
def clear_chat(
    connection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return chat_service.clear_messages(db, connection_id, current_user)
