from sqlalchemy.orm import Session
from app.models.sqlalchemy_model import Connection, Message, User
from fastapi import HTTPException, status
import uuid

def validate_connection(db: Session, connection_id: str, user: User):
    connection = db.query(Connection).filter(Connection.id == connection_id).first()
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    if connection.status != "accepted":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Chat is not allowed for {connection.status} connections"
        )
    
    if str(user.id) not in [str(connection.sender_id), str(connection.receiver_id)]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not part of this connection"
        )
    
    return connection

def save_message(db: Session, connection_id: str, sender_id: str, message_text: str):
    message = Message(
        connection_id=connection_id,
        sender_id=sender_id,
        message=message_text
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message

def get_messages(db: Session, connection_id: str, user: User):
    # Validation
    validate_connection(db, connection_id, user)
    
    return db.query(Message).filter(
        Message.connection_id == connection_id
    ).order_by(Message.created_at.asc()).all()

def mark_messages_read(db: Session, connection_id: str, user: User):
    # Validation
    validate_connection(db, connection_id, user)
    
    # Mark messages as read where sender is NOT the current user
    db.query(Message).filter(
        Message.connection_id == connection_id,
        Message.sender_id != user.id,
        Message.is_read == False
    ).update({Message.is_read: True})
    
    db.commit()
    return {"status": "success"}

def get_unread_count(db: Session, user: User):
    # Find all connections where user is either sender or receiver
    connections = db.query(Connection).filter(
        ((Connection.sender_id == user.id) | (Connection.receiver_id == user.id)),
        Connection.status == "accepted"
    ).all()
    
    conn_ids = [str(c.id) for c in connections]
    
    if not conn_ids:
        return 0
        
    return db.query(Message).filter(
        Message.connection_id.in_(conn_ids),
        Message.sender_id != user.id,
        Message.is_read == False
    ).count()

def clear_messages(db: Session, connection_id: str, user: User):
    # Validation
    validate_connection(db, connection_id, user)
    
    db.query(Message).filter(Message.connection_id == connection_id).delete()
    db.commit()
    return {"status": "success", "message": "Chat cleared"}
