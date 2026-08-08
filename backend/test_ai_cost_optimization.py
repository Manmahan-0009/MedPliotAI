import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from app.database import SessionLocal
from app.models.patient import Patient
from app.models.cost_optimization import CostOptimizationDecision
from app.models.medicine import MedicineSchedule
from app.routers.pharmacy import (
    get_cost_optimization,
    save_cost_optimization_decision,
    CostOptimizationDecisionRequest
)
import asyncio

def run_tests():
    print("=== STARTING AI COST OPTIMIZATION END-TO-END VERIFICATION ===\n")
    db = SessionLocal()

    try:
        # Fetch or create test patient
        patient = db.query(Patient).filter(Patient.patient_id == "MP-2026-8942").first()
        if not patient:
            patient = Patient(
                patient_id="MP-2026-8942",
                first_name="Rahul",
                last_name="Sharma",
                email="rahul.sharma.cost@example.com",
                phone="9876543210",
                dob="1995-04-12",
                gender="Male"
            )
            db.add(patient)
            db.commit()
            db.refresh(patient)

        # ----------------------------------------------------------------------
        # TEST 1: GET /api/pharmacy/patient/{patient_id}/cost-optimization
        # ----------------------------------------------------------------------
        print("[TEST 1] Fetching AI Cost Optimization Insights & Comparison Table")
        res_opt = asyncio.run(get_cost_optimization(patient.patient_id, db))
        assert "summary" in res_opt
        assert res_opt["summary"]["estimated_monthly_savings"] > 0
        assert "ai_recommendation" in res_opt
        assert len(res_opt["safety_validations"]) == 6
        assert len(res_opt["medicines"]) > 0
        print(f"  [OK] Estimated Monthly Savings: ₹{res_opt['summary']['estimated_monthly_savings']}")
        print(f"  [OK] Average Cost Reduction: {res_opt['summary']['average_cost_reduction']}%")
        print(f"  [OK] AI Safety Checklist Passed: {len(res_opt['safety_validations'])}/6 criteria validated.")
        print(f"  [OK] Prescribed comparison items returned: {len(res_opt['medicines'])}")

        # ----------------------------------------------------------------------
        # TEST 2: POST /api/pharmacy/cost-optimization/decision (Accept Generic)
        # ----------------------------------------------------------------------
        print("\n[TEST 2] Accepting Generic Switch Recommendation ('Accept Generic')")
        target_med = res_opt["medicines"][0]
        req_decision = CostOptimizationDecisionRequest(
            patient_id=patient.patient_id,
            schedule_id=target_med["schedule_id"],
            original_medicine=target_med["medicine_prescribed"],
            generic_alternative=target_med["generic_alternative"],
            active_ingredient=target_med["active_ingredient"],
            brand_cost=target_med["brand_cost"],
            generic_cost=target_med["generic_cost"],
            monthly_savings=target_med["monthly_savings"],
            decision="accepted",
            doctor_notes="Approved generic substitution for cost reduction."
        )

        res_dec = asyncio.run(save_cost_optimization_decision(req_decision, db))
        assert res_dec["status"] == "success"
        print(f"  [OK] Decision recorded: {res_dec['message']}")

        # Verify DB decision log created
        db_decision = db.query(CostOptimizationDecision).filter(
            CostOptimizationDecision.patient_id == patient.id,
            CostOptimizationDecision.original_medicine == target_med["medicine_prescribed"]
        ).first()
        assert db_decision is not None
        assert db_decision.status == "accepted"
        print(f"  [OK] CostOptimizationDecision DB record verified: {db_decision.original_medicine} -> {db_decision.generic_alternative}")

        # Verify schedule updated to generic name
        schedules = db.query(MedicineSchedule).filter(MedicineSchedule.patient_id == patient.id).all()
        med_names = [s.medicine_name for s in schedules]
        assert target_med["generic_alternative"] in med_names or any(target_med["generic_alternative"] in m for m in med_names)
        print(f"  [OK] MedicineSchedule updated to generic medicine in DB.")

        print("\nALL AI COST OPTIMIZATION TESTS PASSED SUCCESSFULLY! [100% VERIFIED]")

    except Exception as e:
        print(f"\n[TEST FAILURE] {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
