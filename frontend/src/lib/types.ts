// Shared TypeScript types for Patient and Consultation

export interface Patient {
  id: string;
  patient_id: string;
  first_name: string;
  last_name: string;
  gender?: string;
  date_of_birth?: string;
  age?: number;
  blood_group?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergency_contact?: string;
  allergies?: string;
  medical_conditions?: string;
  current_medications?: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface Consultation {
  id: string;
  consultation_id: string;
  patient_id: string;
  doctor_name?: string;
  consultation_date: string;
  transcript?: string;
  ai_summary?: string;
  pdf_path?: string;
  created_at: string;
}

export interface PatientWithConsultations extends Patient {
  consultations: Consultation[];
}

export interface PatientCreate {
  first_name: string;
  last_name: string;
  gender?: string;
  date_of_birth?: string;
  blood_group?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergency_contact?: string;
  allergies?: string;
  medical_conditions?: string;
  current_medications?: string;
}

export interface DoctorDashboard {
  doctor_profile: {
    full_name: string;
    department?: string;
    specialization?: string;
    medical_registration_number?: string;
  };
  todays_patients: Array<{
    id: string;
    patient_id: string;
    first_name: string;
    last_name: string;
    age?: number;
    gender?: string;
    blood_group?: string;
    phone?: string;
    medical_conditions?: string;
    last_consultation?: string;
  }>;
  recent_consultations: Consultation[];
  pending_soap_notes: number;
  pending_discharges: number;
  analytics: {
    total_patients: number;
    consultations_this_week: number;
    consultations_today: number;
    pending_reports?: number;
    recovery_monitoring?: number;
    discharges_today?: number;
    ai_reports_generated?: number;
  };
  recent_activity?: Array<{
    id: string;
    time: string;
    type: string;
    title: string;
    description: string;
  }>;
  upcoming_appointments?: Array<{
    id: string;
    patient_name: string;
    patient_id: string;
    time: string;
    type: string;
    status: string;
  }>;
  todays_tasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
    priority: string;
  }>;
}

export interface PatientDashboard {
  profile: Patient;
  medication_safety_score: number;
  recovery_score: number;
  recovery_trend: string;
  adherence_percentage: number;
  next_medicine?: { time: string; name: string };
  next_follow_up?: string;
  discharge_status: string;
  recovery_journey: Array<{ day: number; title: string; status: string }>;
  current_prescription?: Prescription;
  reports_count: number;
}

export interface PrescriptionItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timing: string;
  duration: string;
  prescribed_qty: number;
  remaining_qty: number;
  status: string;
  generic_alternative?: { name: string; savings: number } | null;
}

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_name: string;
  date: string;
  status: string;
  items: PrescriptionItem[];
}

export interface PrescriptionUpdate {
  items: PrescriptionItem[];
}

export interface RecoveryData {
  recovery_score: number;
  recovery_trend: string;
  adherence_percentage: number;
  medication_safety_score: number;
  recovery_journey: Array<{ day: number; title: string; status: string }>;
  timeline_events: Array<{
    id: number;
    date: string;
    time: string;
    type: string;
    title: string;
    description: string;
    status: string;
  }>;
}

export interface PharmacyMedicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timing: string;
  remaining_qty: number;
  generic_alternative?: { name: string; savings: number } | null;
  interaction_warnings?: string[];
}

export interface PharmacyData {
  prescribed_medicines: PharmacyMedicine[];
  catalogue: Array<{ id: string; name: string; generic_name: string; price: number }>;
  reminders: Array<{ medicine: string; time: string; taken: boolean }>;
}

export interface DischargeData {
  discharge_summary?: string;
  discharge_date?: string;
  doctor_name?: string;
  status: string;
  invoices: Array<{
    id: string;
    date: string;
    type: string;
    amount: number;
    status: string;
  }>;
  payment_status: string;
  total_outstanding: number;
}

export interface ReportDocument {
  id: string;
  title: string;
  date: string;
  type: string;
  consultation_id?: string;
}
