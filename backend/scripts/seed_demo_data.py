import sys
import os
import random
import uuid
from datetime import datetime, timedelta
from sqlalchemy import text

# Append backend root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.patient import Patient, PatientStatus
from app.models.doctor import Doctor
from app.models.consultation import Consultation
from app.models.prescription import Prescription, PrescriptionItem, PrescriptionStatus
from app.models.medicine import MedicineSchedule, ScheduleStatus
from app.models.health import RecoveryMetric, Invoice
from app.models.discharge import Discharge
from app.models.timeline import PatientTimeline
from app.models.notification import Notification

db = SessionLocal()

DISEASES = [
    {
        "name": "Type 2 Diabetes Mellitus",
        "symptoms": ["Polyuria", "Polydipsia", "Fatigue", "Blurred Vision"],
        "medicines": [
            {"name": "Metformin 500mg", "generic": "Metformin Hydrochloride", "dosage": "1 tablet", "freq": "Twice daily", "time": "Morning, Night"},
            {"name": "Glimepiride 2mg", "generic": "Glimepiride", "dosage": "1 tablet", "freq": "Once daily", "time": "Morning"}
        ]
    },
    {
        "name": "Essential Hypertension",
        "symptoms": ["Headache", "Dizziness", "Palpitations", "Shortness of breath"],
        "medicines": [
            {"name": "Amlodipine 5mg", "generic": "Amlodipine Besylate", "dosage": "1 tablet", "freq": "Once daily", "time": "Morning"},
            {"name": "Lisinopril 10mg", "generic": "Lisinopril", "dosage": "1 tablet", "freq": "Once daily", "time": "Morning"}
        ]
    },
    {
        "name": "Acute Bronchitis",
        "symptoms": ["Cough", "Mild Fever", "Chest Congestion", "Fatigue"],
        "medicines": [
            {"name": "Amoxicillin 500mg", "generic": "Amoxicillin", "dosage": "1 capsule", "freq": "Thrice daily", "time": "Morning, Afternoon, Night"},
            {"name": "Dextromethorphan", "generic": "Cough Syrup", "dosage": "10 ml", "freq": "Twice daily", "time": "Morning, Night"}
        ]
    },
    {
        "name": "Gastroesophageal Reflux Disease (GERD)",
        "symptoms": ["Heartburn", "Acid regurgitation", "Chest pain", "Nausea"],
        "medicines": [
            {"name": "Omeprazole 20mg", "generic": "Omeprazole", "dosage": "1 capsule", "freq": "Once daily", "time": "Morning (Before Food)"},
            {"name": "Antacid Gel", "generic": "Magnesium Hydroxide", "dosage": "2 teaspoons", "freq": "As needed", "time": "After meals"}
        ]
    },
    {
        "name": "Osteoarthritis",
        "symptoms": ["Joint pain", "Stiffness", "Swelling", "Decreased range of motion"],
        "medicines": [
            {"name": "Ibuprofen 400mg", "generic": "Ibuprofen", "dosage": "1 tablet", "freq": "Twice daily", "time": "Morning, Night"},
            {"name": "Glucosamine Chondroitin", "generic": "Joint Supplement", "dosage": "1 tablet", "freq": "Once daily", "time": "Afternoon"}
        ]
    }
]

def random_date(start_days_ago, end_days_ago=0):
    start = datetime.utcnow() - timedelta(days=start_days_ago)
    end = datetime.utcnow() - timedelta(days=end_days_ago)
    return start + timedelta(seconds=random.randint(0, int((end - start).total_seconds())))

def seed_demo_data():
    print("Fetching existing users...")
    patients = db.query(Patient).all()
    doctors = db.query(Doctor).all()
    
    if not patients or not doctors:
        print("ERROR: Database must contain existing Patients and Doctors to run this seed.")
        return

    print(f"Found {len(patients)} Patients and {len(doctors)} Doctors.")

    for patient in patients:
        print(f"\nProcessing Patient: {patient.first_name} {patient.last_name}")
        
        # Check existing consultations
        existing_consults = db.query(Consultation).filter(Consultation.patient_id == patient.id).count()
        if existing_consults >= 3:
            print(f"Patient already has {existing_consults} consultations. Skipping...")
            continue
        
        doctor = random.choice(doctors)
        target_consults = random.randint(3, 8)
        
        disease = random.choice(DISEASES)
        
        base_date = random_date(90, 10)
        
        for i in range(target_consults):
            consult_date = base_date + timedelta(days=i*14 + random.randint(-2, 2))
            if consult_date > datetime.utcnow():
                consult_date = datetime.utcnow()
                
            status = "Approved" if i < target_consults - 1 else random.choice(["Approved", "Pending"])
            
            ai_conf = random.randint(85, 99)
            
            # 1. Consultation
            c = Consultation(
                consultation_id=f"CON-{random.randint(100000, 999999)}",
                patient_id=patient.id,
                doctor_name=doctor.full_name,
                consultation_date=consult_date,
                transcript=f"Patient complaining of {', '.join(disease['symptoms'])}. History of similar symptoms. Recommended continuing treatment.",
                ai_summary=f"The patient presents with {disease['name']}. Primary complaints include {disease['symptoms'][0]}.",
                soap_notes={
                    "subjective": f"Patient reports {disease['symptoms'][0]} and {disease['symptoms'][1]}.",
                    "objective": "Vitals stable. Mild distress noted on examination.",
                    "assessment": f"Primary assessment: {disease['name']}.",
                    "plan": "Prescribed medication. Follow up in 2 weeks."
                },
                clinical_notes={
                    "department": doctor.department,
                    "ai_confidence": ai_conf,
                    "ai_clinical_reasoning": [f"Symptom {disease['symptoms'][0]} maps strongly to {disease['name']}"],
                    "differential_diagnosis": ["Alternative Condition A", "Alternative Condition B"],
                    "suggested_questions": ["How long have symptoms persisted?", "Any family history?"],
                    "recommended_tests": ["Complete Blood Count", "Basic Metabolic Panel"],
                    "timeline": []
                },
                status=status,
                created_at=consult_date,
                updated_at=consult_date
            )
            db.add(c)
            db.commit()
            db.refresh(c)
            
            # 2. Prescription
            p_id = uuid.uuid4()
            db.execute(
                text("INSERT INTO prescriptions (id, consultation_id, patient_id, status, created_at, updated_at, items) VALUES (:id, :cid, :pid, :status, :ca, :ua, '[]'::jsonb)"),
                {"id": p_id, "cid": c.id, "pid": patient.id, "status": PrescriptionStatus.APPROVED.value, "ca": consult_date, "ua": consult_date}
            )
            
            for med in disease["medicines"]:
                pi = PrescriptionItem(
                    prescription_id=p_id,
                    medicine_name=med["name"],
                    dosage=med["dosage"],
                    frequency=med["freq"],
                    duration="14 days",
                    food_instruction="After meals",
                    purpose=f"Treat {disease['name']}",
                    created_at=consult_date,
                    updated_at=consult_date
                )
                db.add(pi)
                
                # Smart Pharmacy (MedicineSchedule)
                times = med["time"].split(", ")
                for t in times:
                    sched_status = ScheduleStatus.COMPLETED.value if consult_date < datetime.utcnow() - timedelta(days=1) else ScheduleStatus.UPCOMING.value
                    if random.random() < 0.1 and sched_status == ScheduleStatus.COMPLETED.value:
                        sched_status = ScheduleStatus.MISSED.value
                        
                    ms = MedicineSchedule(
                        patient_id=patient.id,
                        prescription_id=p_id,
                        medicine_name=med["name"],
                        dosage=med["dosage"],
                        time_slot=t,
                        scheduled_time="08:00 AM" if "Morning" in t else "08:00 PM",
                        status=sched_status,
                        created_at=consult_date,
                        updated_at=consult_date
                    )
                    db.add(ms)
            
            # Timeline Event
            te = PatientTimeline(
                patient_id=patient.id,
                event_type="Consultation",
                event_title=f"Consultation for {disease['name']}",
                event_description=f"Consultation completed with Dr. {doctor.full_name}",
                consultation_id=c.id,
                prescription_id=p_id,
                created_at=consult_date
            )
            db.add(te)
            
            # Notification
            if i == target_consults - 1 and patient.user_id: # Only recent
                notif = Notification(
                    user_id=patient.user_id, # Assume patient has user_id
                    patient_id=patient.id,
                    title="Report Approved",
                    message=f"Your consultation report for {disease['name']} is ready.",
                    type="Alert",
                    created_at=consult_date + timedelta(hours=1)
                )
                db.add(notif)
            
        db.commit()
        
        # Recovery Metric
        rm = db.query(RecoveryMetric).filter(RecoveryMetric.patient_id == patient.id).first()
        if not rm:
            rm = RecoveryMetric(patient_id=patient.id)
            db.add(rm)
            db.commit()
            db.refresh(rm)
            
        rm.recovery_score = random.randint(75, 95)
        rm.recovery_trend = f"+{random.randint(1, 5)}% this week"
        rm.adherence_percentage = random.randint(80, 100)
        rm.medication_safety_score = random.randint(90, 100)
        rm.recovery_journey = [
            {"day": 1, "title": "Initial Consultation"},
            {"day": 7, "title": "Medication Responding"},
            {"day": 14, "title": "Symptoms Reduced"}
        ]
        db.commit()
        
        # Discharge
        if random.random() > 0.7:
            d = Discharge(
                patient_id=patient.id,
                doctor_name=doctor.full_name,
                discharge_summary=f"Patient successfully treated for {disease['name']}.",
                status="Complete",
                billing_total=f"${random.randint(500, 2000)}.00",
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 5))
            )
            db.add(d)
            db.commit()
            
            inv = Invoice(
                patient_id=patient.id,
                discharge_id=d.id,
                invoice_number=f"INV-{random.randint(1000, 9999)}",
                invoice_type="Discharge Settlement",
                amount=float(d.billing_total.strip("$")),
                status="Paid",
                created_at=d.created_at
            )
            db.add(inv)
            
        db.commit()
        print(f"-> Generated {target_consults} consultations and related records.")

    print("\nDatabase Seeding Completed Successfully!")

if __name__ == "__main__":
    seed_demo_data()
