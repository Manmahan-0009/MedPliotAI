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

// ── Auth Service ─────────────────────────────────────────────────────────────
export const authService = {
  getProfile: (): Promise<any> => apiFetch("/api/auth/me"),
  login: (email: string, password: string): Promise<any> =>
    apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    }),
  registerDoctor: (data: any): Promise<any> =>
    apiFetch("/api/auth/register-doctor", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    }),
  registerPatient: (data: any): Promise<any> =>
    apiFetch("/api/auth/register-patient", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    }),
};

// ── Patient Service ──────────────────────────────────────────────────────────
export const patientService = {
  getPatients: (params?: {
    skip?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    order?: string;
  }): Promise<{ items: Patient[]; total: number; page: number; totalPages: number }> => {
    const qp = new URLSearchParams();
    if (params?.skip !== undefined) qp.append("skip", String(params.skip));
    if (params?.limit !== undefined) qp.append("limit", String(params.limit));
    if (params?.search) qp.append("search", params.search);
    if (params?.status) qp.append("status", params.status);
    if (params?.sortBy) qp.append("sort_by", params.sortBy);
    if (params?.order) qp.append("order", params.order);
    return apiFetch(`/api/patients?${qp.toString()}`);
  },

  searchPatients: (q: string): Promise<Patient[]> =>
    apiFetch(`/api/patients/search?q=${encodeURIComponent(q)}`),

  getPatient: (id: string): Promise<PatientWithConsultations> =>
    apiFetch(`/api/patients/${id}`),

  createPatient: (data: PatientCreate): Promise<Patient> =>
    apiFetch("/api/patients", { method: "POST", body: JSON.stringify(data) }),

  updatePatient: (id: string, data: Partial<PatientCreate>): Promise<Patient> =>
    apiFetch(`/api/patients/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deletePatient: (id: string): Promise<{ message: string }> =>
    apiFetch(`/api/patients/${id}`, { method: "DELETE" }),

  getDashboard: (): Promise<PatientDashboard> =>
    apiFetch("/api/patient/dashboard"),

  getProfileDetails: (): Promise<Patient> =>
    apiFetch("/api/patient/profile"),

  getRecoveryData: (): Promise<RecoveryData> =>
    apiFetch("/api/patient/recovery"),

  getDischargeData: (): Promise<DischargeData> =>
    apiFetch("/api/patient/discharge"),
};

// ── Doctor Service ───────────────────────────────────────────────────────────
export const doctorService = {
  getDashboard: (): Promise<DoctorDashboard> =>
    apiFetch("/api/doctor/dashboard"),

  rescheduleAppointment: (appointment_id: string, new_slot: string, new_time?: string, new_date?: string): Promise<any> =>
    apiFetch("/api/doctor/appointments/reschedule", {
      method: "POST",
      body: JSON.stringify({ appointment_id, new_slot, new_time, new_date })
    }),

  updateTaskStatus: (task_id: string, status: string, completed?: boolean): Promise<any> =>
    apiFetch(`/api/doctor/tasks/${task_id}/status`, {
      method: "POST",
      body: JSON.stringify({ status, completed })
    }),

  getActivityFeed: (filter_type: string = "all"): Promise<any> =>
    apiFetch(`/api/doctor/activity?filter_type=${encodeURIComponent(filter_type)}`),

  reorderQueue: (queue_ids: string[]): Promise<any> =>
    apiFetch("/api/doctor/queue/reorder", {
      method: "POST",
      body: JSON.stringify({ queue_ids })
    }),

  queueAction: (queue_id: string, action: string): Promise<any> =>
    apiFetch(`/api/doctor/queue/${queue_id}/action`, {
      method: "POST",
      body: JSON.stringify({ action })
    }),

  moveToTopQueue: (queue_id: string): Promise<any> =>
    apiFetch(`/api/doctor/queue/${queue_id}/move-to-top`, {
      method: "POST"
    }),

  updateLayoutPreferences: (widgets: any[]): Promise<any> =>
    apiFetch("/api/doctor/layout-preferences", {
      method: "POST",
      body: JSON.stringify({ widgets })
    })
};

// ── Consultation Service ──────────────────────────────────────────────────────
export const consultationService = {
  saveConsultation: (data: {
    patient_id: string;
    doctor_name?: string;
    transcript: string;
    ai_summary?: string;
    pdf_path?: string;
  }): Promise<Consultation> =>
    apiFetch("/api/consultations", { method: "POST", body: JSON.stringify(data) }),

  getPatientConsultations: (patientId: string): Promise<Consultation[]> =>
    apiFetch(`/api/consultations/patient/${patientId}`),

  processAudio: (file: Blob): Promise<{ transcript: string }> => {
    const formData = new FormData();
    formData.append("file", file, "consultation.webm");
    return apiFetch("/api/consultation/audio", { method: "POST", body: formData });
  },

  generateSummary: (transcript: string): Promise<{
    summary: string;
    recommended_tests?: string[];
    important_notes?: string[];
  }> =>
    apiFetch("/api/consultation/summary", {
      method: "POST",
      body: JSON.stringify({ transcript }),
    }),
};

// ── Report Service ───────────────────────────────────────────────────────────
export const reportService = {
  getReports: (): Promise<ReportDocument[]> =>
    apiFetch("/api/patient/reports"),

  downloadReport: (reportId: string): Promise<Blob> =>
    apiFetchBlob(`/api/patient/reports/${reportId}/download`),

  generatePdf: (data: {
    doctor_name: string;
    patient_name: string;
    patient_id?: string;
    age?: number;
    gender?: string;
    date: string;
    transcript: string;
    summary: string;
    soap_notes?: any;
    consultation_summary?: any;
    ai_clinical_reasoning?: any;
    suggested_questions?: any;
    recommended_tests?: any;
    clinical_alerts?: any;
    doctor_review_status?: string;
    recovery_score?: number;
    medication_safety_score?: number;
    prescription_items?: any[];
  }): Promise<Blob> =>
    apiFetchBlob("/api/report/pdf", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ── Prescription Service ─────────────────────────────────────────────────────
export const prescriptionService = {
  getPrescription: (patientId?: string): Promise<Prescription> => {
    const query = patientId ? `?patient_id=${encodeURIComponent(patientId)}` : "";
    return apiFetch(`/api/prescriptions${query}`);
  },

  updatePrescription: (
    prescriptionId: string,
    data: PrescriptionUpdate
  ): Promise<Prescription> =>
    apiFetch(`/api/prescriptions/${prescriptionId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};


// ── Pharmacy Service ─────────────────────────────────────────────────────────
export const pharmacyService = {
  getPharmacyData: (): Promise<PharmacyData> =>
    apiFetch("/api/patient/pharmacy"),
};

// ── Analytics Service ────────────────────────────────────────────────────────
export const analyticsService = {
  getDoctorAnalytics: (): Promise<any> =>
    apiFetch("/api/doctor/dashboard"),
};
