"""
Seed script: creates 5 demo patients in the DB.
Run with: python -m app.seed
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import date
from app.database import SessionLocal
from app.models.patient import Patient, PatientStatus

DEMO_PATIENTS = [
    {
        "patient_id": "MP-2026-0001",
        "first_name": "Arjun",
        "last_name": "Sharma",
        "gender": "Male",
        "date_of_birth": date(1985, 4, 12),
        "age": 41,
        "blood_group": "O+",
        "phone": "9876543210",
        "email": "arjun.sharma@example.com",
        "address": "12 MG Road, Bengaluru, Karnataka",
        "emergency_contact": "Priya Sharma - 9876543211",
        "allergies": "Penicillin",
        "medical_conditions": "Hypertension",
        "current_medications": "Amlodipine 5mg",
    },
    {
        "patient_id": "MP-2026-0002",
        "first_name": "Priya",
        "last_name": "Nair",
        "gender": "Female",
        "date_of_birth": date(1992, 8, 25),
        "age": 33,
        "blood_group": "A+",
        "phone": "9123456789",
        "email": "priya.nair@example.com",
        "address": "45 Indiranagar, Bengaluru",
        "emergency_contact": "Ravi Nair - 9123456790",
        "allergies": "None",
        "medical_conditions": "Asthma",
        "current_medications": "Salbutamol inhaler",
    },
    {
        "patient_id": "MP-2026-0003",
        "first_name": "Mohammed",
        "last_name": "Khan",
        "gender": "Male",
        "date_of_birth": date(1975, 11, 3),
        "age": 50,
        "blood_group": "B+",
        "phone": "9988776655",
        "email": "mo.khan@example.com",
        "address": "78 Koramangala, Bengaluru",
        "emergency_contact": "Sara Khan - 9988776656",
        "allergies": "Sulfa drugs",
        "medical_conditions": "Type 2 Diabetes",
        "current_medications": "Metformin 500mg, Glimepiride 2mg",
    },
    {
        "patient_id": "MP-2026-0004",
        "first_name": "Sneha",
        "last_name": "Patil",
        "gender": "Female",
        "date_of_birth": date(2000, 2, 14),
        "age": 26,
        "blood_group": "AB-",
        "phone": "9112233445",
        "email": "sneha.patil@example.com",
        "address": "23 Whitefield, Bengaluru",
        "emergency_contact": "Suresh Patil - 9112233446",
        "allergies": "Aspirin",
        "medical_conditions": "Migraine",
        "current_medications": "Sumatriptan 50mg (PRN)",
    },
    {
        "patient_id": "MP-2026-0005",
        "first_name": "Rajesh",
        "last_name": "Menon",
        "gender": "Male",
        "date_of_birth": date(1960, 6, 30),
        "age": 65,
        "blood_group": "O-",
        "phone": "9001122334",
        "email": "rajesh.menon@example.com",
        "address": "56 Jayanagar, Bengaluru",
        "emergency_contact": "Kavitha Menon - 9001122335",
        "allergies": "Latex",
        "medical_conditions": "Coronary Artery Disease, Hypertension",
        "current_medications": "Aspirin 75mg, Atorvastatin 40mg, Bisoprolol 5mg",
    },
]


def seed():
    db = SessionLocal()
    try:
        seeded = 0
        for data in DEMO_PATIENTS:
            existing = db.query(Patient).filter(Patient.patient_id == data["patient_id"]).first()
            if existing:
                print(f"  SKIP: {data['patient_id']} already exists")
                continue
            patient = Patient(**data, status=PatientStatus.active)
            db.add(patient)
            seeded += 1
        db.commit()
        print(f"\nDONE: Seeded {seeded} demo patients successfully.")
    except Exception as e:
        db.rollback()
        print(f"\nFAIL: Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
