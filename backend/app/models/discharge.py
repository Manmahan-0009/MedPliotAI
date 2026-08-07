import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Discharge(Base):
    __tablename__ = "discharges"
    __table_args__ = {'extend_existing': True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    consultation_id = Column(UUID(as_uuid=True), ForeignKey("consultations.id", ondelete="CASCADE"), nullable=True, index=True)
    
    doctor_name = Column(String(200), nullable=True)
    discharge_summary = Column(Text, nullable=True)
    patient_instructions = Column(Text, nullable=True)
    lifestyle_advice = Column(Text, nullable=True)
    diet_plan = Column(Text, nullable=True)
    exercise_advice = Column(Text, nullable=True)
    follow_up = Column(String(200), nullable=True)
    
    status = Column(String(50), default="Pending", nullable=False) # Pending, Complete
    
    billing_total = Column(String(50), nullable=True)
    receipt_url = Column(String(500), nullable=True)
    discharge_pdf_url = Column(String(500), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="discharges")
    consultation = relationship("Consultation", back_populates="discharge")
    invoices = relationship("Invoice", back_populates="discharge", cascade="all, delete-orphan")
