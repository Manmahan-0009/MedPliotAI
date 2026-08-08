import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_discharge_system():
    print("=== STARTING AI HOSPITAL DISCHARGE SYSTEM END-TO-END VERIFICATION ===")

    # 1. Test GET /api/patient/discharge
    print("\n[TEST 1] Fetching Dynamic Hospital Discharge Record & Bill...")
    res = requests.get(f"{BASE_URL}/api/patient/discharge?patient_id=MP-2026-8942")
    assert res.status_code == 200, f"Expected 200 OK, got {res.status_code}: {res.text}"
    data = res.json()

    print(f"  [OK] Patient Profile: {data['patient']['name']} (MRN: {data['patient']['mrn']})")
    print(f"  [OK] Attending Physician: {data['doctor']['name']} ({data['doctor']['department']})")
    print(f"  [OK] AI Readiness Score: {data['readiness_score']} / 100")
    print(f"  [OK] Discharge Status: {data['status']}")
    print(f"  [OK] Primary Diagnosis: {data['final_diagnosis']['primary']}")
    print(f"  [OK] Discharge Medications Count: {len(data['discharge_medications'])}")

    # Billing & GST Verification
    billing = data['billing']
    print(f"  [OK] Hospital Subtotal: Rs.{billing['subtotal']}")
    print(f"  [OK] Taxable Subtotal: Rs.{billing['taxable_amount']}")
    print(f"  [OK] CGST 9%: Rs.{billing['cgst_amount']} | SGST 9%: Rs.{billing['sgst_amount']}")
    print(f"  [OK] Grand Total Payable: Rs.{billing['grand_total']} ({billing['currency']})")
    assert billing['grand_total'] == 16520.0, f"Expected grand total 16520.0, got {billing['grand_total']}"

    # 2. Test POST /api/doctor/discharge/save
    print("\n[TEST 2] Physician Saving Discharge Draft Edits ('Save Draft')...")
    save_payload = {
        "patient_id": "MP-2026-8942",
        "discharge_summary": "Updated summary: Patient shows complete recovery from acute bronchitis with stable pulmonary vitals.",
        "final_diagnosis": {"primary": "Acute Bronchitis (J20.9) — Recovered", "icd_codes": ["J20.9"]},
        "patient_instructions": "Take prescribed medications on time. Drink warm fluids.",
        "status": "Doctor Reviewing"
    }

    save_res = requests.post(f"{BASE_URL}/api/doctor/discharge/save", json=save_payload)
    assert save_res.status_code == 200, f"Expected 200 OK, got {save_res.status_code}: {save_res.text}"
    print(f"  [OK] Save Draft Response: {save_res.json()['message']}")

    # 3. Test POST /api/doctor/discharge/approve
    print("\n[TEST 3] Physician Approving & Finalizing Hospital Discharge ('Approve Discharge')...")
    approve_payload = {
        "patient_id": "MP-2026-8942",
        "doctor_name": "Dr. Sarah Mitchell",
        "doctor_notes": "All clinical parameters verified. Approved for discharge."
    }

    app_res = requests.post(f"{BASE_URL}/api/doctor/discharge/approve", json=approve_payload)
    assert app_res.status_code == 200, f"Expected 200 OK, got {app_res.status_code}: {app_res.text}"
    app_data = app_res.json()
    print(f"  [OK] Discharge Approval Response: {app_data['message']}")
    print(f"  [OK] Final Status: {app_data['discharge_status']} by {app_data['approved_by']}")

    # 4. Test GET /api/doctor/discharges
    print("\n[TEST 4] Listing Hospital Discharges Registry...")
    list_res = requests.get(f"{BASE_URL}/api/doctor/discharges")
    assert list_res.status_code == 200
    list_data = list_res.json()
    print(f"  [OK] Discharges Count: {list_data['count']}")
    assert list_data['count'] > 0

    print("\nALL AI HOSPITAL DISCHARGE SYSTEM TESTS PASSED SUCCESSFULLY! [100% VERIFIED]\n")

if __name__ == "__main__":
    test_discharge_system()
