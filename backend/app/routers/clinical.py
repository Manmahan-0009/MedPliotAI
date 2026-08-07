import json
import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from groq import Groq
from pydantic import BaseModel
from typing import Dict, Any

from app.database import get_db
from app.models.consultation import Consultation
from app.models.prescription import Prescription, PrescriptionItem, PrescriptionStatus
from app.models.patient import Patient

router = APIRouter(prefix="/api/clinical", tags=["Clinical Documentation"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else Groq()

class SOAPUpdateRequest(BaseModel):
    soap_notes: Dict[str, Any]

@router.post("/consultations/{consultation_id}/soap")
async def generate_soap_notes(consultation_id: str, db: Session = Depends(get_db)):
    consultation = db.query(Consultation).filter(Consultation.consultation_id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    
    if not consultation.ai_summary and not consultation.transcript:
        raise HTTPException(status_code=400, detail="No transcript or summary available to generate SOAP notes")

    source_text = consultation.ai_summary or consultation.transcript

    if not GROQ_API_KEY:
        # Dummy response
        dummy_soap = {
            "subjective": {
                "patient_complaints": "Dry cough and fever",
                "symptoms": "Cough, Fever, Fatigue",
                "duration": "3 days",
                "history": "No known allergies"
            },
            "objective": {
                "vitals": "Temp: 101F",
                "observations": "Patient looks fatigued",
                "clinical_findings": "Clear lungs on auscultation"
            },
            "assessment": {
                "possible_assessment": "Viral upper respiratory infection",
                "differential_considerations": "Flu, COVID-19",
                "ai_confidence": "High"
            },
            "plan": {
                "recommended_investigations": "CBC, Flu test",
                "lifestyle_advice": "Rest, hydration",
                "follow_up": "In 3 days if symptoms persist",
                "medication": [
                    {"name": "Paracetamol", "dosage": "500mg", "frequency": "Twice Daily", "duration": "3 Days", "food": "After Food", "purpose": "Fever"}
                ]
            }
        }
        consultation.soap_notes = dummy_soap
        db.commit()
        return dummy_soap

    prompt = f"""
    You are an expert AI clinical assistant. Generate structured SOAP Notes based on the following consultation summary.
    
    Format the response as a valid JSON object with the following structure:
    {{
        "subjective": {{
            "patient_complaints": "string",
            "symptoms": "string",
            "duration": "string",
            "history": "string"
        }},
        "objective": {{
            "vitals": "string (if available)",
            "observations": "string",
            "clinical_findings": "string"
        }},
        "assessment": {{
            "possible_assessment": "string",
            "differential_considerations": "string",
            "ai_confidence": "string (High/Medium/Low)"
        }},
        "plan": {{
            "recommended_investigations": "string",
            "lifestyle_advice": "string",
            "follow_up": "string",
            "medication": [
                {{
                    "name": "string",
                    "dosage": "string",
                    "frequency": "string",
                    "duration": "string",
                    "food": "string",
                    "purpose": "string"
                }}
            ]
        }}
    }}
    
    Consultation Summary:
    {source_text}
    """
    
    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful and precise medical assistant. You output valid JSON matching the exact schema."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.2,
            response_format={"type": "json_object"},
        )
        data = json.loads(response.choices[0].message.content)
        
        consultation.soap_notes = data
        db.commit()
        
        return data
    except Exception as e:
        print(f"SOAP API Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate SOAP Notes")


@router.put("/consultations/{consultation_id}/soap")
async def update_soap_notes(consultation_id: str, req: SOAPUpdateRequest, db: Session = Depends(get_db)):
    consultation = db.query(Consultation).filter(Consultation.consultation_id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    
    consultation.soap_notes = req.soap_notes
    db.commit()
    
    return {"status": "success", "soap_notes": consultation.soap_notes}


@router.post("/consultations/{consultation_id}/prescription/generate")
async def generate_prescription(consultation_id: str, db: Session = Depends(get_db)):
    consultation = db.query(Consultation).filter(Consultation.consultation_id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    
    if not consultation.soap_notes:
        raise HTTPException(status_code=400, detail="SOAP notes are required to generate a prescription")
    
    # Check if a prescription already exists
    if consultation.prescription:
        return {"prescription_id": consultation.prescription.id, "status": "existing"}
    
    # Create new draft prescription
    new_prescription = Prescription(
        consultation_id=consultation.id,
        patient_id=consultation.patient_id,
        status=PrescriptionStatus.DRAFT.value
    )
    db.add(new_prescription)
    db.commit()
    db.refresh(new_prescription)
    
    # Extract medications from SOAP notes plan
    plan = consultation.soap_notes.get("plan", {})
    medications = plan.get("medication", [])
    
    for med in medications:
        item = PrescriptionItem(
            prescription_id=new_prescription.id,
            medicine_name=med.get("name", "Unknown Medicine"),
            dosage=med.get("dosage", "As directed"),
            frequency=med.get("frequency", "Once daily"),
            duration=med.get("duration", "5 Days"),
            food_instruction=med.get("food", "After Food"),
            purpose=med.get("purpose", "")
        )
        db.add(item)
    
    db.commit()
    db.refresh(new_prescription)
    
    return {"prescription_id": new_prescription.id, "status": "success"}


@router.get("/consultations/{consultation_id}/prescription")
async def get_consultation_prescription(consultation_id: str, db: Session = Depends(get_db)):
    consultation = db.query(Consultation).filter(Consultation.consultation_id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
        
    prescription = db.query(Prescription).filter(Prescription.consultation_id == consultation.id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
        
    items = db.query(PrescriptionItem).filter(PrescriptionItem.prescription_id == prescription.id).all()
    
    return {
        "id": str(prescription.id),
        "status": prescription.status,
        "items": items
    }
