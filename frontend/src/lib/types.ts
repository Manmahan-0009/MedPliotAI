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
