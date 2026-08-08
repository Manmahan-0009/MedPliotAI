import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")

def run_migrations():
    print(f"Connecting to {db_url}")
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    # 1. Alter patients
    try:
        cur.execute("ALTER TABLE patients ADD COLUMN recovery_score INTEGER DEFAULT 0;")
        print("Added recovery_score to patients")
    except psycopg2.errors.DuplicateColumn:
        print("recovery_score already exists")
        conn.rollback()
    
    try:
        cur.execute("ALTER TABLE patients ADD COLUMN medication_safety_score INTEGER DEFAULT 100;")
        print("Added medication_safety_score to patients")
    except psycopg2.errors.DuplicateColumn:
        print("medication_safety_score already exists")
        conn.rollback()

    try:
        cur.execute("ALTER TABLE patients ADD COLUMN profile_image_url TEXT;")
        print("Added profile_image_url to patients")
        conn.commit()
    except Exception as e:
        print("profile_image_url status:", e)
        conn.rollback()

    # 2. Alter doctors
    try:
        cur.execute("ALTER TABLE doctors ADD COLUMN qualification VARCHAR(255) DEFAULT 'MBBS, MD';")
        print("Added qualification to doctors")
        conn.commit()
    except Exception as e:
        print("qualification status:", e)
        conn.rollback()

    try:
        cur.execute("ALTER TABLE doctors ADD COLUMN verification_status VARCHAR(50) DEFAULT 'Approved';")
        print("Added verification_status to doctors")
        conn.commit()
    except Exception as e:
        print("verification_status status:", e)
        conn.rollback()

    # 3. Alter prescriptions
    try:
        cur.execute("ALTER TABLE prescriptions ALTER COLUMN items DROP NOT NULL;")
        print("Dropped NOT NULL on prescriptions.items")
        conn.commit()
    except Exception as e:
        print("prescriptions.items status:", e)
        conn.rollback()

    try:
        cur.execute("ALTER TABLE prescriptions ALTER COLUMN consultation_id DROP NOT NULL;")
        print("Dropped NOT NULL on prescriptions.consultation_id")
        conn.commit()
    except Exception as e:
        print("prescriptions.consultation_id status:", e)
        conn.rollback()

    # 4. Create cost_optimization_decisions table if not exists
    try:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cost_optimization_decisions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
                original_medicine VARCHAR(250) NOT NULL,
                generic_alternative VARCHAR(250) NOT NULL,
                active_ingredient VARCHAR(250),
                brand_cost DOUBLE PRECISION DEFAULT 0.0,
                generic_cost DOUBLE PRECISION DEFAULT 0.0,
                monthly_savings DOUBLE PRECISION DEFAULT 0.0,
                status VARCHAR(50) DEFAULT 'accepted',
                doctor_notes TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        """)
        print("Created cost_optimization_decisions table if not exists")
        conn.commit()
    except Exception as e:
        print("cost_optimization_decisions status:", e)
        conn.rollback()

    # 5. Create recovery_logs table if not exists
    try:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS recovery_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
                log_date TIMESTAMP DEFAULT NOW(),
                day_number INTEGER DEFAULT 1,
                recovery_percentage DOUBLE PRECISION DEFAULT 85.0,
                pain_score DOUBLE PRECISION DEFAULT 2.0,
                temperature DOUBLE PRECISION DEFAULT 98.6,
                heart_rate INTEGER DEFAULT 72,
                bp_systolic INTEGER DEFAULT 120,
                bp_diastolic INTEGER DEFAULT 80,
                spo2 DOUBLE PRECISION DEFAULT 99.0,
                weight_kg DOUBLE PRECISION DEFAULT 70.0,
                sleep_hours DOUBLE PRECISION DEFAULT 7.5,
                mood_score INTEGER DEFAULT 8,
                respiratory_rate INTEGER DEFAULT 16,
                blood_sugar_mg_dl DOUBLE PRECISION DEFAULT 100.0,
                doctor_notes TEXT,
                symptoms TEXT,
                medication_changes TEXT,
                ai_risk_score DOUBLE PRECISION DEFAULT 12.0,
                ai_summary TEXT,
                milestone_status VARCHAR(100) DEFAULT 'In Progress',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        """)
        print("Created recovery_logs table if not exists")
        conn.commit()
    except Exception as e:
        print("recovery_logs status:", e)
        conn.rollback()

    # 6. Add all missing columns to discharges table
    try:
        cur.execute("""
            ALTER TABLE discharges ADD COLUMN IF NOT EXISTS consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL;
            ALTER TABLE discharges ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL;
            ALTER TABLE discharges ADD COLUMN IF NOT EXISTS doctor_name VARCHAR(200);
            ALTER TABLE discharges ADD COLUMN IF NOT EXISTS discharge_summary TEXT;
            ALTER TABLE discharges ADD COLUMN IF NOT EXISTS patient_instructions TEXT;
            ALTER TABLE discharges ADD COLUMN IF NOT EXISTS lifestyle_advice TEXT;
            ALTER TABLE discharges ADD COLUMN IF NOT EXISTS diet_plan TEXT;
            ALTER TABLE discharges ADD COLUMN IF NOT EXISTS exercise_advice TEXT;
            ALTER TABLE discharges ADD COLUMN IF NOT EXISTS follow_up VARCHAR(200);
            ALTER TABLE discharges ADD COLUMN IF NOT EXISTS readiness_score DOUBLE PRECISION DEFAULT 92.0;
            ALTER TABLE discharges ADD COLUMN IF NOT EXISTS readiness_checklist JSONB;
            ALTER TABLE discharges ADD COLUMN IF NOT EXISTS admission_summary JSONB;
            ALTER TABLE discharges ADD COLUMN IF NOT EXISTS hospital_course JSONB;
            ALTER TABLE discharges ADD COLUMN IF NOT EXISTS final_diagnosis JSONB;
            ALTER TABLE discharges ADD COLUMN IF NOT EXISTS procedures_performed JSONB;
            ALTER TABLE discharges ADD COLUMN IF NOT EXISTS treatment_summary JSONB;
            ALTER TABLE discharges ADD COLUMN IF NOT EXISTS discharge_medications JSONB;
            ALTER TABLE discharges ADD COLUMN IF NOT EXISTS followup_plan JSONB;
            ALTER TABLE discharges ADD COLUMN IF NOT EXISTS ai_recommendations JSONB;
            ALTER TABLE discharges ADD COLUMN IF NOT EXISTS billing_breakdown JSONB;
            ALTER TABLE discharges ADD COLUMN IF NOT EXISTS billing_total VARCHAR(50);
            ALTER TABLE discharges ADD COLUMN IF NOT EXISTS receipt_url VARCHAR(500);
            ALTER TABLE discharges ADD COLUMN IF NOT EXISTS discharge_pdf_url VARCHAR(500);
            ALTER TABLE discharges ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Pending';
            ALTER TABLE discharges ADD COLUMN IF NOT EXISTS approved_by VARCHAR(200);
            ALTER TABLE discharges ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
            ALTER TABLE discharges ADD COLUMN IF NOT EXISTS audit_log JSONB;
        """)
        print("Discharges table columns verified and updated")
        conn.commit()
    except Exception as e:
        print("Discharges column update status:", e)
        conn.rollback()

    cur.close()
    conn.close()
    print("Migrations complete.")

if __name__ == "__main__":
    run_migrations()
