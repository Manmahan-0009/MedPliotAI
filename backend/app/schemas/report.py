from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel
import uuid

class ReportStats(BaseModel):
    total_reports: int
    todays_reports: int
    pending_approval: int
    approved_reports: int
    avg_ai_confidence: int
    reports_this_month: int

class ReportUpdate(BaseModel):
    status: Optional[str] = None
    soap_notes: Optional[Dict[str, Any]] = None
    clinical_notes: Optional[Dict[str, Any]] = None

class ReportActivity(BaseModel):
    id: str
    action: str
    timestamp: datetime
    user: str

class ReportOut(BaseModel):
    id: uuid.UUID
    consultation_id: str
    patient_id: uuid.UUID
    patient_name: Optional[str] = None
    patient_mrn: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    doctor_name: Optional[str] = None
    consultation_date: datetime
    transcript: Optional[str] = None
    ai_summary: Optional[str] = None
    soap_notes: Optional[Dict[str, Any]] = None
    clinical_notes: Optional[Dict[str, Any]] = None
    pdf_path: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
