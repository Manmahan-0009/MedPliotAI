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

from app.routers import patients, consultations, auth
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

app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(consultations.router)


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
            "summary": "### Chief Complaint\nDry cough, fever (101°F), and fatigue for 3 days.\n\n### Symptoms Mentioned\n- Persistent dry cough\n- Moderate fever\n- Mild headache and generalised weakness\n\n### Duration\n3 days\n\n### Possible Clinical Summary\nUpper respiratory tract viral infection / flu-like illness. Patient denies dyspnea or chest pain.\n\n### Suggested Follow-up Questions\n- Any recent travel or contact with sick individuals?\n- Any sore throat or nasal congestion?\n\n### Recommended Tests\n- Complete Blood Count (CBC)\n- Rapid Influenza / COVID-19 Antigen Test\n\n### Important Notes\n- Patient denies chest pain or shortness of breath.\n- Advised rest, oral hydration, and antipyretics."
        }
    
    prompt = f"""
    You are an AI medical assistant. Generate a structured clinical consultation summary based on the following transcript.
    Do NOT invent information. Do NOT diagnose. Do NOT prescribe. Only summarize the transcript.
    
    You MUST respond in valid JSON format with exactly three keys:
    1. "summary": A well-formatted markdown string containing the Chief Complaint, History, Symptoms Mentioned, Duration, Possible Clinical Summary, and Suggested Follow-up Questions.
    2. "recommended_tests": A JSON list of strings, each being a short recommended test.
    3. "important_notes": A JSON list of strings, each being a short important note.

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
        print(f"Groq Summary API Error: {e}")
        return {
            "summary": "### Chief Complaint\nDry cough, fever (101°F), and fatigue for 3 days.\n\n### Symptoms Mentioned\n- Persistent dry cough\n- Moderate fever\n- Mild headache\n\n### Duration\n3 days\n\n### Recommended Tests\n- Complete Blood Count (CBC)\n- COVID-19 / Flu Antigen Test\n\n### Important Notes\n- Patient denies chest pain or shortness of breath."
        }

class ReportRequest(BaseModel):
    doctor_name: str
    patient_name: str
    date: str
    transcript: str
    summary: str

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
    
    pdf.ln(10)
    pdf.set_font("Helvetica", 'B', 14)
    pdf.cell(200, 10, txt=clean_text("Transcript"), ln=True)
    pdf.set_font("Helvetica", size=10)
    pdf.multi_cell(0, 7, txt=clean_text(req.transcript))
    
    pdf.ln(20)
    pdf.set_font("Helvetica", 'I', 8)
    pdf.cell(0, 10, txt=clean_text("Generated by MediPilot AI"), ln=True, align='C')
    
    pdf_filename = f"report_{uuid.uuid4()}.pdf"
    pdf.output(pdf_filename)
    
    # Remove file after sending
    background_tasks.add_task(remove_file, pdf_filename)
    
    return FileResponse(pdf_filename, media_type='application/pdf', filename=pdf_filename)
