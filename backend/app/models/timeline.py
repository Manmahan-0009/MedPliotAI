import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class PatientTimeline(Base):
    __tablename__ = "patient_timeline"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    
    event_type = Column(String(50), nullable=False) # e.g., "Consultation", "Prescription", "Discharge", "Lab Result"
    event_title = Column(String(200), nullable=False)
    event_description = Column(Text, nullable=True)
    
    # Optional links to other tables
    consultation_id = Column(UUID(as_uuid=True), nullable=True)
    prescription_id = Column(UUID(as_uuid=True), nullable=True)
    
    metadata_json = Column(JSON, nullable=True) # Any extra data for rendering
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    patient = relationship("Patient", back_populates="timeline_events")
