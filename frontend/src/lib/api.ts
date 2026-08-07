// Re-export API client + legacy helpers — use service modules for new code
export { API_BASE_URL, API_URL, apiFetch, apiFetchBlob, ApiError } from "./api-client";

import { apiFetch, apiFetchBlob } from "./api-client";
import {
  Patient,
  PatientCreate,
  PatientWithConsultations,
  Consultation,
  DoctorDashboard,
  PatientDashboard,
  Prescription,
  PrescriptionUpdate,
  RecoveryData,
  PharmacyData,
  DischargeData,
  ReportDocument,
} from "./types";

// ── Patients ─────────────────────────────────────────────────────────────────

export const getPatients = (skip = 0, limit = 50): Promise<Patient[]> =>
  apiFetch(`/api/patients?skip=${skip}&limit=${limit}`);

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

export const processConsultationAudio = (file: Blob): Promise<{ transcript: string }> => {
  const formData = new FormData();
  formData.append("file", file, "consultation.webm");
  return apiFetch("/api/consultation/audio", { method: "POST", body: formData });
};

export const generateConsultationSummary = (transcript: string): Promise<{
  summary: string;
  recommended_tests?: string[];
  important_notes?: string[];
}> =>
  apiFetch("/api/consultation/summary", {
    method: "POST",
    body: JSON.stringify({ transcript }),
  });

export const downloadConsultationPdf = (data: {
  doctor_name: string;
  patient_name: string;
  date: string;
  transcript: string;
  summary: string;
}): Promise<Blob> =>
  apiFetchBlob("/api/report/pdf", {
    method: "POST",
    body: JSON.stringify(data),
  });

// ── Dashboards ────────────────────────────────────────────────────────────────

export const getDoctorDashboard = (): Promise<DoctorDashboard> =>
  apiFetch("/api/doctor/dashboard");

export const getPatientDashboard = (): Promise<PatientDashboard> =>
  apiFetch("/api/patient/dashboard");

// ── Prescriptions ─────────────────────────────────────────────────────────────

export const getPrescription = (patientId?: string): Promise<Prescription> => {
  const query = patientId ? `?patient_id=${encodeURIComponent(patientId)}` : "";
  return apiFetch(`/api/prescriptions${query}`);
};

export const updatePrescription = (
  prescriptionId: string,
  data: PrescriptionUpdate
): Promise<Prescription> =>
  apiFetch(`/api/prescriptions/${prescriptionId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// ── Recovery ─────────────────────────────────────────────────────────────────

export const getRecoveryData = (): Promise<RecoveryData> =>
  apiFetch("/api/patient/recovery");

// ── Pharmacy ─────────────────────────────────────────────────────────────────

export const getPharmacyData = (): Promise<PharmacyData> =>
  apiFetch("/api/patient/pharmacy");

// ── Discharge ─────────────────────────────────────────────────────────────────

export const getDischargeData = (): Promise<DischargeData> =>
  apiFetch("/api/patient/discharge");

// ── Reports ───────────────────────────────────────────────────────────────────

export const getPatientReports = (): Promise<ReportDocument[]> =>
  apiFetch("/api/patient/reports");

export const downloadReport = (reportId: string): Promise<Blob> =>
  apiFetchBlob(`/api/patient/reports/${reportId}/download`);

// ── Profile ───────────────────────────────────────────────────────────────────

export const getPatientProfileDetails = (): Promise<Patient> =>
  apiFetch("/api/patient/profile");
