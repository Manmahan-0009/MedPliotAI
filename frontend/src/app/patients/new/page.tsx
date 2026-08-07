"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { patientService } from "@/lib/api-services";
import { PatientCreate } from "@/lib/types";
import { ProtectedRoute } from "@/lib/protected-route";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

function NewPatientContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<PatientCreate>({
    first_name: "",
    last_name: "",
    gender: "",
    date_of_birth: "",
    blood_group: "",
    phone: "",
    email: "",
    address: "",
    emergency_contact: "",
    allergies: "",
    medical_conditions: "",
    current_medications: "",
  });

  const set = (key: keyof PatientCreate, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError("First name and last name are required.");
      return;
    }

    setLoading(true);
    try {
      const payload: PatientCreate = {
        ...form,
        date_of_birth: form.date_of_birth || undefined,
        gender: form.gender || undefined,
        blood_group: form.blood_group || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
        emergency_contact: form.emergency_contact || undefined,
        allergies: form.allergies || undefined,
        medical_conditions: form.medical_conditions || undefined,
        current_medications: form.current_medications || undefined,
      };
      const created = await patientService.createPatient(payload);
      router.push(`/patients/${created.patient_id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create patient");
    } finally {
      setLoading(false);
    }
  };


  const Field = ({
    label, name, type = "text", required = false,
    options, textarea,
  }: {
    label: string;
    name: keyof PatientCreate;
    type?: string;
    required?: boolean;
    options?: string[];
    textarea?: boolean;
  }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {options ? (
        <select
          value={form[name] as string}
          onChange={e => set(name, e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
        >
          <option value="">Select...</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : textarea ? (
        <textarea
          value={form[name] as string}
          onChange={e => set(name, e.target.value)}
          rows={3}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
        />
      ) : (
        <input
          type={type}
          required={required}
          value={form[name] as string}
          onChange={e => set(name, e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Add New Patient</h1>
            <p className="text-slate-500 text-sm mt-1">Patient ID will be auto-generated</p>
          </div>
          <button
            onClick={() => router.push("/patients")}
            className="px-4 py-2 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
          >
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First Name" name="first_name" required />
              <Field label="Last Name" name="last_name" required />
              <Field label="Gender" name="gender" options={GENDERS} />
              <Field label="Date of Birth" name="date_of_birth" type="date" />
              <Field label="Blood Group" name="blood_group" options={BLOOD_GROUPS} />
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">Contact Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Phone" name="phone" type="tel" />
              <Field label="Email" name="email" type="email" />
              <div className="sm:col-span-2">
                <Field label="Address" name="address" textarea />
              </div>
              <Field label="Emergency Contact" name="emergency_contact" />
            </div>
          </div>

          {/* Medical */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">Medical History</h2>
            <div className="space-y-4">
              <Field label="Known Allergies" name="allergies" textarea />
              <Field label="Medical Conditions" name="medical_conditions" textarea />
              <Field label="Current Medications" name="current_medications" textarea />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => router.push("/patients")}
              className="px-5 py-2.5 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Create Patient"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}


export default function NewPatientPage() {
  return (
    <ProtectedRoute allowedRole="doctor">
      <NewPatientContent />
    </ProtectedRoute>
  );
}

