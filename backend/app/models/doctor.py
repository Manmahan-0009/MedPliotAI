import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    full_name = Column(String(255), nullable=False)
    department = Column(String(100), nullable=True)
    specialization = Column(String(100), nullable=True)
    medical_registration_number = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)

    # Extended Profile Fields (added for booking flow)
    experience_years = Column(Integer, nullable=True, default=5)
    consultation_fee = Column(String(50), nullable=True, default="₹500")
    hospital = Column(String(255), nullable=True, default="MediPilot Super Speciality Hospital")
    rating = Column(Float, nullable=True, default=4.8)
    profile_image_url = Column(Text, nullable=True)
    availability_status = Column(String(50), nullable=True, default="Available Today")
    available_slots = Column(Text, nullable=True)   # JSON string of today's slots

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="doctor_profile")
