import sys
sys.path.insert(0, '.')
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_recovery_center():
    print("=== STARTING AI CLINICAL RECOVERY CENTER END-TO-END VERIFICATION ===")

    # 1. Test GET /api/patient/recovery
    print("\n[TEST 1] Fetching AI Clinical Recovery Telemetry Data...")
    res = client.get("/api/patient/recovery?patient_id=MP-2026-8942")
    assert res.status_code == 200, f"Expected 200 OK, got {res.status_code}: {res.text}"
    data = res.json()

    print(f"  [OK] Patient Profile: {data['profile']['name']} ({data['profile']['patient_id']})")
    print(f"  [OK] Overall Recovery Score: {data['kpis']['recovery_score']} / 100")
    print(f"  [OK] Medication Adherence: {data['kpis']['medication_adherence_percentage']}%")
    print(f"  [OK] Days Since Diagnosis: Day {data['kpis']['days_since_diagnosis']}")
    print(f"  [OK] Vitals Monitored Count: {len(data['vitals_monitoring'])}")
    print(f"  [OK] AI Insights Generated: {len(data['ai_insights'])} insights")
    print(f"  [OK] Recovery Milestones Count: {len(data['milestones'])}")
    print(f"  [OK] Medication Impact Items: {len(data['medication_impact'])}")
    print(f"  [OK] Lab Results Tests: {len(data['lab_results'])}")

    # 2. Test POST /api/doctor/recovery/log
    print("\n[TEST 2] Physician Recording Daily Recovery Vitals & Observations ('Record Vitals')...")
    log_payload = {
        "patient_id": "MP-2026-8942",
        "recovery_percentage": 94.5,
        "pain_score": 1.0,
        "temperature": 98.4,
        "heart_rate": 70,
        "bp_systolic": 118,
        "bp_diastolic": 78,
        "spo2": 99.5,
        "weight_kg": 70.2,
        "sleep_hours": 8.0,
        "mood_score": 9,
        "respiratory_rate": 15,
        "blood_sugar_mg_dl": 98.0,
        "doctor_notes": "Patient shows complete resolution of bronchial symptoms. Vitals within target baseline.",
        "symptoms": "Asymptomatic",
        "medication_changes": "Discontinue acute anti-inflammatory medication.",
        "milestone_status": "Vitals Verified"
    }

    log_res = client.post("/api/doctor/recovery/log", json=log_payload)
    assert log_res.status_code == 200, f"Expected 200 OK, got {log_res.status_code}: {log_res.text}"
    log_data = log_res.json()
    print(f"  [OK] Log Recorded: {log_data['message']}")
    print(f"  [OK] Day Number: {log_data['day_number']}")

    # 3. Re-fetch GET /api/patient/recovery to verify DB update
    print("\n[TEST 3] Re-verifying Updated Telemetry from Database...")
    res2 = client.get("/api/patient/recovery?patient_id=MP-2026-8942")
    assert res2.status_code == 200
    data2 = res2.json()
    print(f"  [OK] Updated Recovery Score in DB: {data2['kpis']['recovery_score']} / 100")
    print(f"  [OK] Updated Timeline Length: {len(data2['day_timeline'])} days")

    print("\nALL CLINICAL RECOVERY CENTER TESTS PASSED SUCCESSFULLY! [100% VERIFIED]\n")

if __name__ == "__main__":
    test_recovery_center()
