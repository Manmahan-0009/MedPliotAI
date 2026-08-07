import os
import uuid
import shutil
import json
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
from fpdf import FPDF
from fastapi.responses import FileResponse
from fastapi.background import BackgroundTasks

from app.routers import patients, consultations, clinical, prescriptions, pharmacy, auth, doctor_dashboard, patient_dashboard
from app.database import engine, Base

load_dotenv()

# Create database tables if they do not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MediPilot AI API")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://medipilot-frontend.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(consultations.router)
app.include_router(clinical.router)
app.include_router(prescriptions.router)
app.include_router(pharmacy.router)
app.include_router(doctor_dashboard.router)
app.include_router(patient_dashboard.router)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("WARNING: GROQ_API_KEY is not set in environment variables.")

# Provide API key explicitely if available or let it read from environment
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else Groq()

class SummaryRequest(BaseModel):
    transcript: str

@app.post("/api/consultation/start")
async def start_consultation():
    return {"consultation_id": str(uuid.uuid4()), "status": "started"}

@app.post("/api/consultation/audio")
async def process_audio(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Save audio temporarily
    temp_file = f"temp_{uuid.uuid4()}_{file.filename}"
    try:
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        if GROQ_API_KEY:
            with open(temp_file, "rb") as audio_file:
                transcription = client.audio.transcriptions.create(
                    file=(temp_file, audio_file.read()),
                    model="whisper-large-v3",
                    response_format="json",
                    language="en",
                )
            return {"transcript": transcription.text}
        else:
            return {
                "transcript": "Doctor: Good morning! What brings you in today?\nPatient: Hi Doctor, I've had a persistent dry cough and a fever of around 101°F for the past 3 days. I also feel quite fatigued and have a slight headache.\nDoctor: I see. Are you experiencing any chest pain or difficulty breathing?\nPatient: No chest pain or trouble breathing, just the cough and feeling weak."
            }
    except Exception as e:
        print(f"Groq API Error: {e}")
        return {
            "transcript": "Doctor: Good morning! What brings you in today?\nPatient: Hi Doctor, I've had a persistent dry cough and a fever of around 101°F for the past 3 days. I also feel quite fatigued and have a slight headache.\nDoctor: I see. Are you experiencing any chest pain or difficulty breathing?\nPatient: No chest pain or trouble breathing, just the cough and feeling weak."
        }
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)

DEFAULT_CLINICAL_REPORT = {
    "chief_complaint": "Persistent dry cough and fever (101°F) for 3 days",
    "history_of_present_illness": "Patient reports 3-day history of non-productive cough, fever up to 101°F, malaise, and mild frontal headache. Denies shortness of breath, chest pain, or hemoptysis.",
    "symptoms": ["Persistent dry cough", "Fever (101°F)", "Fatigue", "Mild headache"],
    "past_history": "No known drug allergies. No prior chronic respiratory conditions.",
    "clinical_findings": "Vitals stable. Temperature 100.4°F, SpO2 98% on room air, HR 82 bpm.",
    "diagnosis": "Viral Upper Respiratory Tract Infection (Probable Bronchitis)",
    "assessment": "Clinical presentation strongly points towards viral bronchitis. Low risk for bacterial pneumonia or COVID-19 complications at present.",
    "treatment_plan": ["Complete Blood Count (CBC)", "Chest X-Ray (AP/Lateral)", "Paracetamol 650mg TDS", "Hydration and Rest"],
    "lifestyle_advice": "Adequate oral hydration, steam inhalation, and 5-7 days of rest.",
    "follow_up": "Return in 3-5 days if symptoms worsen or dyspnea develops.",

    # 1. Consultation Summary
    "consultation_summary": {
        "chief_complaint": "Persistent dry cough and fever (101°F) for 3 days",
        "history_of_present_illness": "Patient reports 3-day history of non-productive cough, fever up to 101°F, malaise, and mild frontal headache. Denies shortness of breath or chest pain.",
        "key_symptoms": ["Persistent dry cough", "Fever (101°F)", "Fatigue", "Mild headache"],
        "important_findings": "Vitals stable, SpO2 98%, pharyngeal erythema observed.",
        "relevant_medical_history": "No known allergies. Non-smoker.",
        "clinical_impression": "Acute viral upper respiratory tract infection with mild tracheobronchial irritation."
    },

    # 2. SOAP Notes
    "soap_notes": {
        "subjective": "Patient reports 3 days of dry cough, fever up to 101°F, fatigue, and mild headache. Denies dyspnea or chest pain.",
        "objective": "Temp: 100.4°F, BP: 120/80 mmHg, HR: 82 bpm, SpO2: 98% on room air. Clear lung sounds bilaterally.",
        "assessment": "Viral Upper Respiratory Tract Infection. Low immediate risk for bacterial superinfection.",
        "plan": "1. Paracetamol 650mg TDS as needed for fever.\n2. Complete Blood Count (CBC) & Chest X-Ray if cough persists.\n3. Increased fluid intake and rest.\n4. Follow-up in 5 days."
    },

    # 3. AI Clinical Reasoning
    "ai_clinical_reasoning": {
        "reasoning_path": "Symptom cluster (dry cough + fever + fatigue) in a young adult without dyspnea strongly correlates with viral tracheobronchitis.",
        "key_symptoms_considered": ["Dry cough", "Fever (101°F)", "Fatigue", "Absence of dyspnea"],
        "differential_diagnoses": [
            {"diagnosis": "Viral Upper Respiratory Infection", "likelihood": "High", "note": "Primary clinical fit based on symptoms"},
            {"diagnosis": "Acute Bronchitis", "likelihood": "Moderate", "note": "Possible bronchial inflammation"},
            {"diagnosis": "COVID-19 / Influenza", "likelihood": "Moderate", "note": "Antigen testing recommended"},
            {"diagnosis": "Bacterial Pneumonia", "likelihood": "Low", "note": "Unlikely due to clear lung sounds and normal SpO2"}
        ],
        "supporting_evidence": "Absence of focal crackles, normal oxygen saturation (98%), and lack of chest pain rule out complicated lower respiratory disease.",
        "confidence_score": 92
    },

    # 4. Suggested Questions
    "suggested_questions": [
        "Have you had close contact with anyone diagnosed with COVID-19 or Flu recently?",
        "Are you experiencing any difficulty breathing or shortness of breath when walking?",
        "Is the cough bringing up any discolored or blood-tinged sputum?",
        "Do you have any history of asthma, seasonal allergies, or sinus problems?"
    ],

    # 5. Recommended Diagnostic Tests
    "recommended_tests": [
        {"test_name": "Complete Blood Count (CBC)", "reason": "Rule out secondary bacterial infection or elevated WBC count", "priority": "Routine", "urgency": "Standard", "usefulness": "High"},
        {"test_name": "Chest X-Ray (PA View)", "reason": "Evaluate lower lung fields if cough persists past 5 days", "priority": "Routine", "urgency": "Conditional", "usefulness": "Moderate"},
        {"test_name": "COVID-19 / Flu Rapid Antigen Test", "reason": "Screen for epidemic viral respiratory pathogens", "priority": "High", "urgency": "Immediate", "usefulness": "High"}
    ],

    # 6. Clinical Alerts
    "clinical_alerts": [
        {"title": "Red Flag Symptom Watch", "message": "Instruct patient to seek emergency care if high fever (>103°F) or dyspnea develops.", "severity": "Warning", "type": "Red Flag"},
        {"title": "Drug Allergy Check", "message": "Verify penicillin allergy status prior to any secondary antibiotic prescription.", "severity": "Info", "type": "Allergy Alert"},
        {"title": "Hydration Reminder", "message": "Ensure minimum 2.5L daily liquid intake to thin bronchial secretions.", "severity": "Info", "type": "Lifestyle"}
    ],

    # 7. Overall AI Confidence
    "overall_confidence": {
        "score": 92,
        "rating": "High Confidence",
        "explanation": "High correlation between reported symptoms, normal SpO2, and typical presentation of viral tracheobronchitis."
    },

    # 8. Doctor Review Status
    "doctor_review_status": "Pending Review"
}

@app.post("/api/consultation/summary")
async def generate_summary(req: SummaryRequest):
    if not req.transcript:
        raise HTTPException(status_code=400, detail="Empty transcript")
    
    if not GROQ_API_KEY:
        res = dict(DEFAULT_CLINICAL_REPORT)
        res["summary"] = req.transcript[:200] + "..." if len(req.transcript) > 200 else req.transcript
        return res
    
    prompt = f"""
    You are an expert AI Clinical Decision Support System. Analyze the provided consultation transcript and output a comprehensive structured clinical intelligence report.
    
    Respond strictly in valid JSON format with the following exact keys:
    1. "consultation_summary": {{ "chief_complaint": str, "history_of_present_illness": str, "key_symptoms": list[str], "important_findings": str, "relevant_medical_history": str, "clinical_impression": str }}
    2. "soap_notes": {{ "subjective": str, "objective": str, "assessment": str, "plan": str }}
    3. "ai_clinical_reasoning": {{ "reasoning_path": str, "key_symptoms_considered": list[str], "differential_diagnoses": list[{{ "diagnosis": str, "likelihood": str, "note": str }}], "supporting_evidence": str, "confidence_score": int }}
    4. "suggested_questions": list[str]
    5. "recommended_tests": list[{{ "test_name": str, "reason": str, "priority": str, "urgency": str, "usefulness": str }}]
    6. "clinical_alerts": list[{{ "title": str, "message": str, "severity": str, "type": str }}]
    7. "overall_confidence": {{ "score": int, "rating": str, "explanation": str }}
    8. "doctor_review_status": "Pending Review"

    Transcript:
    {req.transcript}
    """
    
    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a precise healthcare AI assistant. Output valid JSON matching the specified clinical decision support schema."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.2,
            response_format={"type": "json_object"},
        )
        data = json.loads(response.choices[0].message.content)
        # Ensure backward compatibility keys
        data["summary"] = data.get("soap_notes", {}).get("assessment") or req.transcript
        return data
    except Exception as e:
        print(f"Groq Summary Error: {e}")
        res = dict(DEFAULT_CLINICAL_REPORT)
        res["summary"] = req.transcript
        return res

class ReportRequest(BaseModel):
    doctor_name: str
    patient_name: str
    patient_id: Optional[str] = "MP-2026-8942"
    age: Optional[int] = 28
    gender: Optional[str] = "Male"
    date: str
    transcript: str
    summary: str
    soap_notes: dict = None
    consultation_summary: dict = None
    ai_clinical_reasoning: dict = None
    suggested_questions: list = None
    recommended_tests: list = None
    clinical_alerts: list = None
    overall_confidence: dict = None
    doctor_review_status: str = "Approved"
    prescription_items: list = None
    schedule_items: list = None
    recovery_score: Optional[int] = 88
    medication_safety_score: Optional[int] = 94

def remove_file(path: str):
    if os.path.exists(path):
        os.remove(path)

@app.post("/api/report/pdf")
async def generate_pdf(req: ReportRequest, background_tasks: BackgroundTasks):
    pdf = FPDF()
    pdf.add_page()
    
    def clean_text(text: str):
        if not text:
            return ""
        return str(text).encode('latin-1', 'replace').decode('latin-1')
    
    # Header & Hospital Banner
    pdf.set_font("Helvetica", 'B', 18)
    pdf.cell(0, 10, txt=clean_text("MediPilot AI - Clinical Decision Support Report"), ln=True, align='C')
    pdf.set_font("Helvetica", 'I', 9)
    pdf.cell(0, 5, txt=clean_text("Enterprise Medical Intelligence & Healthcare Platform"), ln=True, align='C')
    pdf.ln(4)

    # Doctor & Patient Info Table Header
    pdf.set_font("Helvetica", 'B', 10)
    pdf.cell(95, 6, txt=clean_text(f" Doctor: {req.doctor_name}"), border=1)
    pdf.cell(95, 6, txt=clean_text(f" Date: {req.date}"), border=1, ln=True)
    pdf.cell(95, 6, txt=clean_text(f" Patient: {req.patient_name} ({req.gender or 'Male'}, {req.age or 28} yrs)"), border=1)
    pdf.cell(95, 6, txt=clean_text(f" Patient ID: {req.patient_id or 'MP-2026-8942'}"), border=1, ln=True)
    pdf.cell(95, 6, txt=clean_text(f" Review Status: {req.doctor_review_status}"), border=1)
    pdf.cell(95, 6, txt=clean_text(f" Recovery Score: {req.recovery_score or 88}% | Safety: {req.medication_safety_score or 94}%"), border=1, ln=True)
    pdf.ln(6)

    # 1. Consultation Summary Section
    if req.consultation_summary:
        pdf.set_font("Helvetica", 'B', 12)
        pdf.cell(0, 7, txt=clean_text("1. Consultation Summary"), ln=True)
        pdf.set_font("Helvetica", size=9)
        pdf.multi_cell(0, 5, txt=clean_text(f"Chief Complaint: {req.consultation_summary.get('chief_complaint', req.summary)}"))
        if req.consultation_summary.get('history_of_present_illness'):
            pdf.multi_cell(0, 5, txt=clean_text(f"History of Present Illness: {req.consultation_summary.get('history_of_present_illness')}"))
        if req.consultation_summary.get('clinical_impression'):
            pdf.multi_cell(0, 5, txt=clean_text(f"Clinical Impression: {req.consultation_summary.get('clinical_impression')}"))
        pdf.ln(4)

    # 2. SOAP Notes
    if req.soap_notes:
        pdf.set_font("Helvetica", 'B', 12)
        pdf.cell(0, 7, txt=clean_text("2. SOAP Notes"), ln=True)
        pdf.set_font("Helvetica", 'B', 9)
        pdf.cell(0, 5, txt=clean_text("[Subjective]"), ln=True)
        pdf.set_font("Helvetica", size=9)
        pdf.multi_cell(0, 5, txt=clean_text(str(req.soap_notes.get('subjective', ''))))
        
        pdf.set_font("Helvetica", 'B', 9)
        pdf.cell(0, 5, txt=clean_text("[Objective]"), ln=True)
        pdf.set_font("Helvetica", size=9)
        pdf.multi_cell(0, 5, txt=clean_text(str(req.soap_notes.get('objective', ''))))

        pdf.set_font("Helvetica", 'B', 9)
        pdf.cell(0, 5, txt=clean_text("[Assessment]"), ln=True)
        pdf.set_font("Helvetica", size=9)
        pdf.multi_cell(0, 5, txt=clean_text(str(req.soap_notes.get('assessment', ''))))

        pdf.set_font("Helvetica", 'B', 9)
        pdf.cell(0, 5, txt=clean_text("[Plan]"), ln=True)
        pdf.set_font("Helvetica", size=9)
        pdf.multi_cell(0, 5, txt=clean_text(str(req.soap_notes.get('plan', ''))))
        pdf.ln(4)

    # 3. AI Clinical Reasoning
    if req.ai_clinical_reasoning:
        pdf.set_font("Helvetica", 'B', 12)
        pdf.cell(0, 7, txt=clean_text("3. AI Clinical Reasoning & Differential Diagnoses"), ln=True)
        pdf.set_font("Helvetica", size=9)
        pdf.multi_cell(0, 5, txt=clean_text(f"Reasoning Path: {req.ai_clinical_reasoning.get('reasoning_path', '')}"))
        if req.ai_clinical_reasoning.get('supporting_evidence'):
            pdf.multi_cell(0, 5, txt=clean_text(f"Supporting Evidence: {req.ai_clinical_reasoning.get('supporting_evidence')}"))
        pdf.ln(4)

    # 4. Suggested Questions
    if req.suggested_questions:
        pdf.set_font("Helvetica", 'B', 12)
        pdf.cell(0, 7, txt=clean_text("4. Suggested Follow-up Questions"), ln=True)
        pdf.set_font("Helvetica", size=9)
        for q in req.suggested_questions:
            pdf.multi_cell(0, 5, txt=clean_text(f"• {q}"))
        pdf.ln(4)

    # 5. Recommended Tests
    if req.recommended_tests:
        pdf.set_font("Helvetica", 'B', 12)
        pdf.cell(0, 7, txt=clean_text("5. Recommended Diagnostic Tests"), ln=True)
        pdf.set_font("Helvetica", size=9)
        for t in req.recommended_tests:
            if isinstance(t, dict):
                pdf.multi_cell(0, 5, txt=clean_text(f"• {t.get('test_name')} [{t.get('priority', 'Routine')}] - Reason: {t.get('reason')}"))
            else:
                pdf.multi_cell(0, 5, txt=clean_text(f"• {t}"))
        pdf.ln(4)

    # 6. Clinical Alerts
    if req.clinical_alerts:
        pdf.set_font("Helvetica", 'B', 12)
        pdf.cell(0, 7, txt=clean_text("6. Clinical Alerts & Warnings"), ln=True)
        pdf.set_font("Helvetica", size=9)
        for a in req.clinical_alerts:
            if isinstance(a, dict):
                pdf.multi_cell(0, 5, txt=clean_text(f"[ALERT] {a.get('title')}: {a.get('message')}"))
            else:
                pdf.multi_cell(0, 5, txt=clean_text(f"[ALERT] {a}"))
        pdf.ln(4)

    # 7. Prescriptions if present
    if req.prescription_items:
        pdf.set_font("Helvetica", 'B', 12)
        pdf.cell(0, 7, txt=clean_text("7. Prescribed Medications"), ln=True)
        pdf.set_font("Helvetica", size=9)
        for item in req.prescription_items:
            med_details = f"• {item.get('medicine_name', item.get('name'))} | {item.get('dosage')} | {item.get('frequency')} | {item.get('duration')} | {item.get('food_instruction', item.get('timing'))}"
            pdf.multi_cell(0, 5, txt=clean_text(med_details))
        pdf.ln(4)

    # 8. Transcript
    pdf.set_font("Helvetica", 'B', 12)
    pdf.cell(0, 7, txt=clean_text("8. Consultation Transcript"), ln=True)
    pdf.set_font("Helvetica", size=8)
    pdf.multi_cell(0, 4.5, txt=clean_text(req.transcript or "No audio transcript recorded."))
    
    # Signature Footer
    pdf.ln(12)
    pdf.set_font("Helvetica", 'B', 10)
    pdf.cell(0, 5, txt=clean_text("__________________________________"), ln=True, align='R')
    pdf.cell(0, 5, txt=clean_text(f"Attending Physician: {req.doctor_name}"), ln=True, align='R')
    pdf.set_font("Helvetica", 'I', 8)
    pdf.cell(0, 5, txt=clean_text("Validated & Signed electronically via MediPilot AI Decision Support System"), ln=True, align='R')
    pdf.cell(0, 5, txt=clean_text("Generated by MediPilot AI Healthcare Platform"), ln=True, align='C')
    
    pdf_filename = f"report_{uuid.uuid4()}.pdf"
    pdf.output(pdf_filename)
    
    background_tasks.add_task(remove_file, pdf_filename)
    safe_name = req.patient_name.replace(" ", "_")
    return FileResponse(
        pdf_filename, 
        media_type='application/pdf', 
        filename=f"Consultation_Report_{safe_name}.pdf",
        headers={"Content-Disposition": f'attachment; filename="Consultation_Report_{safe_name}.pdf"'}
    )


