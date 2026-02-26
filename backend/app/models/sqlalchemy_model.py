from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Date, Text, UniqueConstraint, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database import Base


# ──────────────────────────────────────────────
# Taxonomy Tables (Phase 1)
# ──────────────────────────────────────────────

class Religion(Base):
    __tablename__ = "religions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)


class EducationLevel(Base):
    __tablename__ = "education_levels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)


class OccupationType(Base):
    __tablename__ = "occupation_types"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)


class SalaryRange(Base):
    __tablename__ = "salary_ranges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    label = Column(String, unique=True, nullable=False)
    min_value = Column(Integer, nullable=True)
    max_value = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)


# ──────────────────────────────────────────────
# Core User / Profile Models
# ──────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=True)  # nullable for Google users

    provider = Column(String, default="email")  # email / google
    provider_id = Column(String, nullable=True)

    is_unlocked = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    profile = relationship("Profile", back_populates="user", uselist=False)


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)

    full_name = Column(String, nullable=False)
    dob = Column(Date, nullable=False)
    birth_time = Column(String, nullable=False)
    birth_place = Column(String, nullable=False)

    # Legacy free-text fields — kept for backward compatibility
    religion = Column(String, nullable=True)
    education = Column(String, nullable=True)
    occupation = Column(String, nullable=True)
    salary = Column(Integer, nullable=True)

    about = Column(Text, nullable=True)
    layout = Column(String, default="classic")

    # Extended fields for profile completion
    community = Column(String(100), nullable=True)
    phone_verified = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)

    # Structured taxonomy FK columns (Phase 3) — nullable, additive only
    religion_id = Column(UUID(as_uuid=True), ForeignKey("religions.id"), nullable=True)
    education_level_id = Column(UUID(as_uuid=True), ForeignKey("education_levels.id"), nullable=True)
    occupation_type_id = Column(UUID(as_uuid=True), ForeignKey("occupation_types.id"), nullable=True)
    salary_range_id = Column(UUID(as_uuid=True), ForeignKey("salary_ranges.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="profile")

    # Taxonomy relationships
    religion_ref = relationship("Religion", foreign_keys=[religion_id])
    education_level = relationship("EducationLevel", foreign_keys=[education_level_id])
    occupation_type = relationship("OccupationType", foreign_keys=[occupation_type_id])
    salary_range = relationship("SalaryRange", foreign_keys=[salary_range_id])


class Connection(Base):
    __tablename__ = "connections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    receiver_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # status: pending, accepted, rejected, dissolved
    status = Column(String, default="pending", nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships (Optional but helpful)
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])

    __table_args__ = (
        UniqueConstraint('sender_id', 'receiver_id', name='_sender_receiver_uc'),
    )


class ProfileView(Base):
    __tablename__ = "profile_views"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    viewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    viewed_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    viewed_at = Column(DateTime(timezone=True), server_default=func.now())

    viewer = relationship("User", foreign_keys=[viewer_id])
    viewed = relationship("User", foreign_keys=[viewed_id])


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    connection_id = Column(UUID(as_uuid=True), ForeignKey("connections.id"), nullable=False)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    connection = relationship("Connection")
    sender = relationship("User")


class UserPhoto(Base):
    __tablename__ = "user_photos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    object_key = Column(String, nullable=False)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="photos")

    