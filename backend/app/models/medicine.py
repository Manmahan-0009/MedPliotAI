import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Float, Integer, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class ScheduleStatus(str, enum.Enum):
    UPCOMING = "Upcoming"
    COMPLETED = "Completed"
    MISSED = "Missed"

class TimeSlot(str, enum.Enum):
    MORNING = "Morning"
    AFTERNOON = "Afternoon"
    EVENING = "Evening"
    NIGHT = "Night"


class MedicineCatalogue(Base):
    __tablename__ = "medicine_catalogue"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False, index=True)
    generic_name = Column(String(200), nullable=True)
    brand = Column(String(200), nullable=True)
    manufacturer = Column(String(200), nullable=True)
    
    price = Column(Float, nullable=False, default=0.0)
    availability = Column(Boolean, default=True)
    rating = Column(Float, nullable=True, default=0.0)
    
    description = Column(Text, nullable=True)
    composition = Column(Text, nullable=True)
    uses = Column(Text, nullable=True)
    side_effects = Column(Text, nullable=True)
    dosage_info = Column(Text, nullable=True)
    storage_instructions = Column(Text, nullable=True)
    alternatives = Column(Text, nullable=True)
    
    image_url = Column(String(500), nullable=True)
    category = Column(String(100), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class MedicineSchedule(Base):
    __tablename__ = "medicine_schedules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    prescription_id = Column(UUID(as_uuid=True), ForeignKey("prescriptions.id", ondelete="CASCADE"), nullable=False, index=True)
    
    medicine_name = Column(String(200), nullable=False)
    dosage = Column(String(100), nullable=False)
    time_slot = Column(String(50), nullable=False) # e.g. "Morning", "Afternoon"
    scheduled_time = Column(String(50), nullable=True) # e.g. "8:00 AM"
    
    food_instruction = Column(String(100), nullable=True)
    duration = Column(String(100), nullable=True)
    
    status = Column(String(50), default=ScheduleStatus.UPCOMING.value)
    missed_dose_information = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    patient = relationship("Patient")
    prescription = relationship("Prescription")
