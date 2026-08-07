"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPatient } from "@/lib/api";
import { PatientCreate } from "@/lib/types";
import DashboardLayout from "@/components/DashboardLayout";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

const Field = ({
  label, name, type = "text", required = false,
  options, textarea, form, set, max
}: {
  label: string;
  name: keyof PatientCreate;
  type?: string;
  required?: boolean;
  options?: string[];
  textarea?: boolean;
  form: PatientCreate;
  set: (key: keyof PatientCreate, value: string) => void;
  max?: string;
}) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {options ? (
      <select
        value={form[name] as string}
        onChange={e => set(name, e.target.value)}
        className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 transition-colors"
      >
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : textarea ? (
      <textarea
        value={form[name] as string}
        onChange={e => set(name, e.target.value)}
        rows={3}
        className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 transition-colors"
      />
    ) : (
      <input
        type={type}
        required={required}
        max={max}
        value={form[name] as string}
        onChange={e => set(name, e.target.value)}
        className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 transition-colors"
      />
    )}
  </div>
);

export default function NewPatientPage() {
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
      const created = await createPatient(payload);
      router.push(`/patients/${created.patient_id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Add New Patient">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">New Patient Details</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Patient ID will be auto-generated</p>
          </div>
          <button
            onClick={() => router.push("/patients")}
            className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
          >
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Info */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4 transition-colors">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First Name" name="first_name" required form={form} set={set} />
              <Field label="Last Name" name="last_name" required form={form} set={set} />
              <Field label="Gender" name="gender" options={GENDERS} form={form} set={set} />
              <Field label="Date of Birth" name="date_of_birth" type="date" form={form} set={set} max={new Date().toISOString().split('T')[0]} />
              <Field label="Blood Group" name="blood_group" options={BLOOD_GROUPS} form={form} set={set} />
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4 transition-colors">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">Contact Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Phone" name="phone" type="tel" form={form} set={set} />
              <Field label="Email" name="email" type="email" form={form} set={set} />
              <div className="sm:col-span-2">
                <Field label="Address" name="address" textarea form={form} set={set} />
              </div>
              <Field label="Emergency Contact" name="emergency_contact" form={form} set={set} />
            </div>
          </div>

          {/* Medical */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4 transition-colors">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">Medical History</h2>
            <div className="space-y-4">
              <Field label="Known Allergies" name="allergies" textarea form={form} set={set} />
              <Field label="Medical Conditions" name="medical_conditions" textarea form={form} set={set} />
              <Field label="Current Medications" name="current_medications" textarea form={form} set={set} />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl p-4 text-sm transition-colors">
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => router.push("/patients")}
              className="px-5 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? "Saving..." : "Create Patient"}
            </button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}
