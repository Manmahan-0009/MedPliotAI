// API client — all backend calls go through here
import { Patient, PatientCreate, PatientWithConsultations, Consultation } from "./types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const API_URL = API_BASE_URL;


async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "API error");
  }
  return res.json();
}

// ── Patients ─────────────────────────────────────────────────────────────────

export const getPatients = (): Promise<Patient[]> =>
  apiFetch("/api/patients");

export const searchPatients = (q: string): Promise<Patient[]> =>
  apiFetch(`/api/patients/search?q=${encodeURIComponent(q)}`);

export const getPatient = (id: string): Promise<PatientWithConsultations> =>
  apiFetch(`/api/patients/${id}`);

export const createPatient = (data: PatientCreate): Promise<Patient> =>
  apiFetch("/api/patients", { method: "POST", body: JSON.stringify(data) });

export const updatePatient = (id: string, data: Partial<PatientCreate>): Promise<Patient> =>
  apiFetch(`/api/patients/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deletePatient = (id: string): Promise<{ message: string }> =>
  apiFetch(`/api/patients/${id}`, { method: "DELETE" });

// ── Consultations ─────────────────────────────────────────────────────────────

export const saveConsultation = (data: {
  patient_id: string;
  doctor_name?: string;
  transcript: string;
  ai_summary?: string;
  pdf_path?: string;
}): Promise<Consultation> =>
  apiFetch("/api/consultations", { method: "POST", body: JSON.stringify(data) });

export const getPatientConsultations = (patientId: string): Promise<Consultation[]> =>
  apiFetch(`/api/consultations/patient/${patientId}`);
