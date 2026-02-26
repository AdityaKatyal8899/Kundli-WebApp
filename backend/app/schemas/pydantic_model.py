from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from typing import Optional, Literal, List
from datetime import date, datetime
from uuid import UUID


# -------- Register --------
class UserCreate(BaseModel):
    email: EmailStr
    password: str



# -------- Login --------
class Login(BaseModel):
    email: EmailStr
    password: str


# -------- Google Login --------
class GoogleAuth(BaseModel):
    id_token: str


class UserShort(BaseModel):
    id: UUID
    name: Optional[str] = None
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)


# -------- Response --------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[UUID] = None


# -------- Photos --------
class PhotoUploadRequest(BaseModel):
    file_type: str


class PhotoUploadResponse(BaseModel):
    upload_url: str
    object_key: str


class PhotoConfirmRequest(BaseModel):
    object_key: str


class PhotoResponse(BaseModel):
    id: UUID
    object_key: str
    is_primary: bool
    view_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PhotoUrlResponse(BaseModel):
    url: str

    model_config = ConfigDict(from_attributes=True)


# -------- Taxonomy Options --------
class TaxonomyOption(BaseModel):
    id: UUID
    name: str
    display_order: int

    model_config = ConfigDict(from_attributes=True)


class SalaryRangeOption(BaseModel):
    id: UUID
    label: str
    min_value: Optional[int] = None
    max_value: Optional[int] = None
    display_order: int

    model_config = ConfigDict(from_attributes=True)


class ProfileOptionsResponse(BaseModel):
    religions: List[TaxonomyOption]
    education_levels: List[TaxonomyOption]
    occupation_types: List[TaxonomyOption]
    salary_ranges: List[SalaryRangeOption]


# -------- Profile --------
class ProfileBase(BaseModel):
    full_name: str
    dob: date
    birth_time: str
    birth_place: str
    # Legacy free-text fields
    religion: Optional[str] = None
    education: Optional[str] = None
    occupation: Optional[str] = None
    about: Optional[str] = None
    layout: str = "classic"
    salary: Optional[int] = None
    community: Optional[str] = None
    # Structured taxonomy FK fields
    religion_id: Optional[UUID] = None
    education_level_id: Optional[UUID] = None
    occupation_type_id: Optional[UUID] = None
    salary_range_id: Optional[UUID] = None


class ProfileCreate(ProfileBase):
    @field_validator("salary", mode="before")
    @classmethod
    def salary_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Salary must be a positive integer")
        return v

    @field_validator("community", mode="before")
    @classmethod
    def community_max_length(cls, v):
        if v is not None and len(v) > 100:
            raise ValueError("Community must be 100 characters or less")
        return v

    @field_validator("about", mode="before")
    @classmethod
    def about_max_length(cls, v):
        if v is not None and len(v) > 500:
            raise ValueError("Bio must be 500 characters or less")
        return v


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    dob: Optional[date] = None
    birth_time: Optional[str] = None
    birth_place: Optional[str] = None
    # Legacy free-text (still accepted for backward compat)
    religion: Optional[str] = None
    education: Optional[str] = None
    occupation: Optional[str] = None
    about: Optional[str] = None
    layout: Optional[str] = None
    salary: Optional[int] = None
    community: Optional[str] = None
    # Structured taxonomy FK fields
    religion_id: Optional[UUID] = None
    education_level_id: Optional[UUID] = None
    occupation_type_id: Optional[UUID] = None
    salary_range_id: Optional[UUID] = None

    @field_validator("salary", mode="before")
    @classmethod
    def salary_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Salary must be a positive integer")
        return v

    @field_validator("community", mode="before")
    @classmethod
    def community_max_length(cls, v):
        if v is not None and len(v) > 100:
            raise ValueError("Community must be 100 characters or less")
        return v

    @field_validator("about", mode="before")
    @classmethod
    def about_max_length(cls, v):
        if v is not None and len(v) > 500:
            raise ValueError("Bio must be 500 characters or less")
        return v


class LayoutUpdate(BaseModel):
    layout: Literal["classic", "minimal", "astrology"]


class ProfileResponse(ProfileBase):
    id: UUID
    user_id: UUID
    photos: List[PhotoResponse] = []
    # Read-only derived fields
    profile_completion: int = 0
    phone_verified: bool = False
    is_verified: bool = False
    photo_url: Optional[str] = None
    profession: Optional[str] = None
    # Resolved structured labels (derived from FK lookups, set by router)
    religion_label: Optional[str] = None
    education_label: Optional[str] = None
    occupation_label: Optional[str] = None
    salary_label: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# -------- Connections --------
class ConnectionResponse(BaseModel):
    id: UUID
    sender_id: UUID
    receiver_id: UUID
    status: str
    created_at: datetime
    updated_at: datetime
    
    sender: UserShort
    receiver: UserShort

    model_config = ConfigDict(from_attributes=True)


class ProfileViewResponse(BaseModel):
    id: UUID
    viewer_id: UUID
    viewed_id: UUID
    viewed_at: datetime
    viewer: UserShort

    model_config = ConfigDict(from_attributes=True)


class NotificationResponse(BaseModel):
    pending_requests: List[ConnectionResponse]
    accepted_notifications: List[ConnectionResponse]
    rejected_notifications: List[ConnectionResponse]


# -------- Chat --------
class MessageResponse(BaseModel):
    id: UUID
    connection_id: UUID
    sender_id: UUID
    message: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# -------- User Public --------
class UserPublicResponse(BaseModel):
    id: UUID
    name: Optional[str] = None
    education: Optional[str] = None
    profession: Optional[str] = None
    photo_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ConnectionUser(BaseModel):
    id: UUID
    full_name: str
    occupation: Optional[str] = None
    photo_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ConnectionWithUser(BaseModel):
    id: UUID
    status: str
    created_at: datetime
    user: ConnectionUser

    model_config = ConfigDict(from_attributes=True)


class GroupedConnectionsResponse(BaseModel):
    pending_received: List[ConnectionWithUser]
    active: List[ConnectionWithUser]
    sent_requests: List[ConnectionWithUser]


