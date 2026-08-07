"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { patientService } from "@/lib/api-services";
import { PatientWithConsultations } from "@/lib/types";
import { ProtectedRoute } from "@/lib/protected-route";

function PatientDetailContent() {
  const router = useRouter();
  const params = useParams();
  const patientId = params?.id as string;

  const [patient, setPatient] = useState<PatientWithConsultations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"info" | "history">("info");

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    patientService.getPatient(patientId)
      .then(setPatient)
      .catch(e => setError(e.message || "Failed to load patient"))
      .finally(() => setLoading(false));
  }, [patientId]);


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-3" />
          <p>Loading patient profile...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-slate-500">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="font-semibold">{error || "Patient not found"}</p>
          <button onClick={() => router.push("/patients")} className="mt-4 text-blue-600 underline text-sm">
            Back to patients
          </button>
        </div>
      </div>
    );
  }

  const initials = `${patient.first_name[0]}${patient.last_name[0]}`.toUpperCase();
  const latestConsultation = patient.consultations?.[0];

  const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => (
    value ? (
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-slate-800 mt-0.5">{value}</p>
      </div>
    ) : null
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Back */}
        <button
          onClick={() => router.push("/patients")}
          className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
        >
          ← Back to Directory
        </button>

        {/* Patient Header Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-800">
                {patient.first_name} {patient.last_name}
              </h1>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500">
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs">{patient.patient_id}</span>
                {patient.age && <span>{patient.age} yrs</span>}
                {patient.gender && <span>{patient.gender}</span>}
                {patient.blood_group && (
                  <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-xs font-semibold">
                    {patient.blood_group}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => router.push(`/?patient=${patient.patient_id}&name=${patient.first_name}+${patient.last_name}`)}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold"
              >
                Start Consultation
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200">
          {(["info", "history"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "info" ? "Patient Info" : `Consultations (${patient.consultations?.length || 0})`}
            </button>
          ))}
        </div>

        {/* Tab: Info */}
        {activeTab === "info" && (
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="font-semibold text-slate-700 border-b border-slate-100 pb-2">Personal Details</h2>
              <InfoRow label="Date of Birth" value={patient.date_of_birth} />
              <InfoRow label="Phone" value={patient.phone} />
              <InfoRow label="Email" value={patient.email} />
              <InfoRow label="Address" value={patient.address} />
              <InfoRow label="Emergency Contact" value={patient.emergency_contact} />
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="font-semibold text-slate-700 border-b border-slate-100 pb-2">Medical Information</h2>
              <InfoRow label="Known Allergies" value={patient.allergies} />
              <InfoRow label="Medical Conditions" value={patient.medical_conditions} />
              <InfoRow label="Current Medications" value={patient.current_medications} />
            </div>
          </div>
        )}

        {/* Tab: Consultation History */}
        {activeTab === "history" && (
          <div className="space-y-4">
            {patient.consultations?.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-400">
                <p className="text-3xl mb-2">📋</p>
                <p>No consultations yet.</p>
                <button
                  onClick={() => router.push(`/?patient=${patient.patient_id}&name=${patient.first_name}+${patient.last_name}`)}
                  className="mt-4 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Start First Consultation
                </button>
              </div>
            ) : (
              patient.consultations.map(c => (
                <div key={c.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800 font-mono text-sm">{c.consultation_id}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(c.consultation_date).toLocaleString("en-IN")}
                        {c.doctor_name && ` · ${c.doctor_name}`}
                      </p>
                    </div>
                  </div>
                  {c.ai_summary && (
                    <div>
                      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">AI Summary</p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap bg-emerald-50 border border-emerald-100 rounded-lg p-3 max-h-40 overflow-y-auto">
                        {c.ai_summary}
                      </p>
                    </div>
                  )}
                  {c.transcript && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        View Transcript
                      </summary>
                      <p className="text-slate-600 whitespace-pre-wrap bg-slate-50 border border-slate-100 rounded-lg p-3 mt-2 max-h-40 overflow-y-auto">
                        {c.transcript}
                      </p>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}


export default function PatientProfilePage() {
  return (
    <ProtectedRoute allowedRole="doctor">
      <PatientDetailContent />
    </ProtectedRoute>
  );
}

