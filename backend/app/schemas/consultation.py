from typing import Optional
from datetime import datetime
from pydantic import BaseModel
import uuid


class ConsultationSave(BaseModel):
    patient_id: str
    doctor_name: Optional[str] = "Dr. Sarah Mitchell"
    transcript: str
    ai_summary: Optional[str] = None
    pdf_path: Optional[str] = None


class ConsultationOut(BaseModel):
    id: uuid.UUID
    consultation_id: str
    patient_id: uuid.UUID
    doctor_name: Optional[str]
    consultation_date: datetime
    transcript: Optional[str]
    ai_summary: Optional[str]
    pdf_path: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
