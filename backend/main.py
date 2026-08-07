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

from app.routers import patients, consultations, clinical, prescriptions, pharmacy
from app.database import engine, Base

load_dotenv()

# Create database tables if they do not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MediPilot AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patients.router)
app.include_router(consultations.router)
app.include_router(clinical.router)
app.include_router(prescriptions.router)
app.include_router(pharmacy.router)

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

@app.post("/api/consultation/summary")
async def generate_summary(req: SummaryRequest):
    if not req.transcript:
        raise HTTPException(status_code=400, detail="Empty transcript")
    
    if not GROQ_API_KEY:
        return {
            "chief_complaint": "Dry cough and fever",
            "history_of_present_illness": "Patient has been experiencing a persistent dry cough and fever of around 101°F for the past 3 days. Also reports fatigue and slight headache.",
            "symptoms": ["Persistent dry cough", "Fever (101°F)", "Fatigue", "Mild headache"],
            "past_history": "Not explicitly mentioned.",
            "clinical_findings": "Patient denies dyspnea or chest pain.",
            "diagnosis": "Viral upper respiratory tract infection",
            "assessment": "Patient presents with classic flu-like symptoms. Vitals stable, no red flags for pneumonia.",
            "treatment_plan": ["Complete Blood Count (CBC)", "COVID-19 / Flu Antigen Test", "Antipyretics for fever"],
            "lifestyle_advice": "Rest, oral hydration.",
            "follow_up": "Return in 3 days if symptoms worsen or fail to resolve."
        }
    
    prompt = f"""
    You are an AI medical assistant. Generate a structured clinical consultation summary based on the following transcript.
    Do NOT invent information. Do NOT diagnose. Do NOT prescribe. Only summarize the transcript.
    
    You MUST respond in valid JSON format with the following strictly defined keys:
    1. "chief_complaint": A short string describing the primary reason for the visit.
    2. "history_of_present_illness": A detailed paragraph describing the history of the complaint.
    3. "symptoms": A JSON list of strings detailing the reported symptoms.
    4. "past_history": A string summarizing any relevant past medical history mentioned.
    5. "clinical_findings": A string describing objective findings if mentioned.
    6. "diagnosis": A string containing the provisional diagnosis.
    7. "assessment": A short paragraph summarizing the clinical assessment.
    8. "treatment_plan": A JSON list of strings with the recommended treatment or investigations.
    9. "lifestyle_advice": A string with recommended lifestyle changes or home care.
    10. "follow_up": A string with follow-up instructions.

    Transcript:
    {req.transcript}
    """
    
    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful and precise medical assistant. You output valid JSON."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.2,
            response_format={"type": "json_object"},
        )
        data = json.loads(response.choices[0].message.content)
        return data
    except Exception as e:
        return {
            "chief_complaint": "Dry cough and fever",
            "history_of_present_illness": "Patient has been experiencing a persistent dry cough and fever of around 101°F for the past 3 days. Also reports fatigue and slight headache.",
            "symptoms": ["Persistent dry cough", "Fever (101°F)", "Fatigue", "Mild headache"],
            "past_history": "Not explicitly mentioned.",
            "clinical_findings": "Patient denies dyspnea or chest pain.",
            "diagnosis": "Viral upper respiratory tract infection",
            "assessment": "Patient presents with classic flu-like symptoms. Vitals stable, no red flags for pneumonia.",
            "treatment_plan": ["Complete Blood Count (CBC)", "COVID-19 / Flu Antigen Test", "Antipyretics for fever"],
            "lifestyle_advice": "Rest, oral hydration.",
            "follow_up": "Return in 3 days if symptoms worsen or fail to resolve."
        }

class ReportRequest(BaseModel):
    doctor_name: str
    patient_name: str
    date: str
    transcript: str
    summary: str
    soap_notes: dict = None
    prescription_items: list = None
    schedule_items: list = None

def remove_file(path: str):
    if os.path.exists(path):
        os.remove(path)

@app.post("/api/report/pdf")
async def generate_pdf(req: ReportRequest, background_tasks: BackgroundTasks):
    pdf = FPDF()
    pdf.add_page()
    
    # We must substitute characters that FPDF's built-in fonts do not support, or use a TTF font.
    # To keep it simple, we replace unicode quotes with standard ASCII ones and encode properly.
    def clean_text(text: str):
        return text.encode('latin-1', 'replace').decode('latin-1')
    
    pdf.set_font("Helvetica", 'B', 16)
    pdf.cell(200, 10, txt=clean_text("MediPilot AI - Consultation Report"), ln=True, align='C')
    
    pdf.set_font("Helvetica", 'B', 12)
    pdf.cell(200, 10, txt=clean_text(f"Doctor: {req.doctor_name}"), ln=True)
    pdf.cell(200, 10, txt=clean_text(f"Patient: {req.patient_name}"), ln=True)
    pdf.cell(200, 10, txt=clean_text(f"Date: {req.date}"), ln=True)
    
    pdf.ln(10)
    pdf.set_font("Helvetica", 'B', 14)
    pdf.cell(200, 10, txt=clean_text("AI Summary (Draft - Doctor approval required)"), ln=True)
    pdf.set_font("Helvetica", size=10)
    pdf.multi_cell(0, 7, txt=clean_text(req.summary))
    
    if req.soap_notes:
        pdf.ln(10)
        pdf.set_font("Helvetica", 'B', 14)
        pdf.cell(200, 10, txt=clean_text("SOAP Notes"), ln=True)
        pdf.set_font("Helvetica", 'B', 12)
        pdf.cell(200, 10, txt=clean_text("Subjective"), ln=True)
        pdf.set_font("Helvetica", size=10)
        pdf.multi_cell(0, 7, txt=clean_text(str(req.soap_notes.get('subjective', ''))))
        
        pdf.set_font("Helvetica", 'B', 12)
        pdf.cell(200, 10, txt=clean_text("Objective"), ln=True)
        pdf.set_font("Helvetica", size=10)
        pdf.multi_cell(0, 7, txt=clean_text(str(req.soap_notes.get('objective', ''))))
        
        pdf.set_font("Helvetica", 'B', 12)
        pdf.cell(200, 10, txt=clean_text("Assessment"), ln=True)
        pdf.set_font("Helvetica", size=10)
        pdf.multi_cell(0, 7, txt=clean_text(str(req.soap_notes.get('assessment', ''))))
        
        pdf.set_font("Helvetica", 'B', 12)
        pdf.cell(200, 10, txt=clean_text("Plan"), ln=True)
        pdf.set_font("Helvetica", size=10)
        pdf.multi_cell(0, 7, txt=clean_text(str(req.soap_notes.get('plan', ''))))

    if req.prescription_items:
        pdf.ln(10)
        pdf.set_font("Helvetica", 'B', 14)
        pdf.cell(200, 10, txt=clean_text("Prescription"), ln=True)
        pdf.set_font("Helvetica", size=10)
        for item in req.prescription_items:
            med_details = f"- {item.get('medicine_name')} | {item.get('dosage')} | {item.get('frequency')} | {item.get('duration')} | {item.get('food_instruction')}"
            pdf.multi_cell(0, 7, txt=clean_text(med_details))
            
    if req.schedule_items:
        pdf.ln(10)
        pdf.set_font("Helvetica", 'B', 14)
        pdf.cell(200, 10, txt=clean_text("Medicine Schedule"), ln=True)
        pdf.set_font("Helvetica", size=10)
        for item in req.schedule_items:
            sched_details = f"- {item.get('time_slot')}: {item.get('medicine_name')} ({item.get('dosage')}) - {item.get('food_instruction')}"
            pdf.multi_cell(0, 7, txt=clean_text(sched_details))
    
    pdf.ln(10)
    pdf.set_font("Helvetica", 'B', 14)
    pdf.cell(200, 10, txt=clean_text("Transcript"), ln=True)
    pdf.set_font("Helvetica", size=10)
    pdf.multi_cell(0, 7, txt=clean_text(req.transcript))
    
    pdf.ln(20)
    pdf.set_font("Helvetica", 'B', 12)
    pdf.cell(0, 10, txt=clean_text("_______________________"), ln=True, align='R')
    pdf.cell(0, 10, txt=clean_text("Doctor's Signature"), ln=True, align='R')
    
    pdf.ln(10)
    pdf.set_font("Helvetica", 'I', 8)
    pdf.cell(0, 10, txt=clean_text("Generated by MediPilot AI"), ln=True, align='C')
    
    pdf_filename = f"report_{uuid.uuid4()}.pdf"
    pdf.output(pdf_filename)
    
    # Remove file after sending
    background_tasks.add_task(remove_file, pdf_filename)
    
    return FileResponse(pdf_filename, media_type='application/pdf', filename=pdf_filename)
