from sqlalchemy import Column, String, Float, DateTime, Date, Time, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.database import Base

class Chart(Base):
    __tablename__ = "charts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    
    birth_date = Column(Date, nullable=False)
    birth_time = Column(Time, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    chart_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
