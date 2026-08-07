import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    doctor = "doctor"
    patient = "patient"


class User(Base):
    """Maps a Firebase UID to a role. Passwords are never stored here."""
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    firebase_uid = Column(String(128), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False)
    role = Column(SAEnum(UserRole), nullable=False, default=UserRole.doctor)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
