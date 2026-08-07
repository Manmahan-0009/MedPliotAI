import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    consultation_id = Column(String(50), unique=True, nullable=False, index=True)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_name = Column(String(200), nullable=True)
    consultation_date = Column(DateTime, default=datetime.utcnow)
    transcript = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    soap_notes = Column(JSON, nullable=True)
    clinical_notes = Column(JSON, nullable=True)
    pdf_path = Column(String(500), nullable=True)
    status = Column(String(50), default="Pending", nullable=False) # Pending, Documented, Discharged
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    patient = relationship("Patient", back_populates="consultations")
    prescription = relationship("Prescription", back_populates="consultation", uselist=False, cascade="all, delete-orphan")
    discharge = relationship("Discharge", back_populates="consultation", uselist=False, cascade="all, delete-orphan")
