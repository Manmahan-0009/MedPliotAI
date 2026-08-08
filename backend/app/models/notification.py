import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    patient_id = Column(UUID(as_uuid=True), nullable=True)
    doctor_id = Column(UUID(as_uuid=True), nullable=True)
    
    recipient_role = Column(String(50), default="patient") # "doctor", "patient"
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False) # "appointment_booked", "appointment_accepted", "appointment_rejected", "appointment_rescheduled", "consultation_completed"
    reference_id = Column(String(100), nullable=True)
    
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="notifications")
