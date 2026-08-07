"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getPatients, searchPatients, deletePatient } from "@/lib/api";
import { Patient } from "@/lib/types";
import DashboardLayout from "@/components/DashboardLayout";

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = search.trim().length >= 1
        ? await searchPatients(search.trim())
        : await getPatients();
      setPatients(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load patients");
    } finally {
      setLoading(false);
    }
  }, [search]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const handleDelete = async (id: string, patientId: string) => {
    if (!confirm(`Deactivate patient ${patientId}? This is reversible.`)) return;
    try {
      await deletePatient(patientId);
      setPatients(prev => prev.filter(p => p.id !== id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const initials = (p: Patient) =>
    `${p.first_name[0]}${p.last_name[0]}`.toUpperCase();

  const lastVisit = (p: Patient) =>
    new Date(p.updated_at).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });

  return (
    <DashboardLayout title="Patient Directory">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Patients List</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              {patients.length} patient{patients.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/patients/new")}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold shadow-sm"
            >
              + Add Patient
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm transition-colors">
          <input
            type="text"
            placeholder="Search by name, patient ID, phone, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl p-4 text-sm transition-colors">
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16 text-slate-400 dark:text-slate-500">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-3" />
            <p>Loading patients...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && patients.length === 0 && !error && (
          <div className="text-center py-16 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <p className="text-4xl mb-3">🏥</p>
            <p className="font-semibold text-slate-600 dark:text-slate-300">No patients found</p>
            <p className="text-sm mt-1">
              {search ? "Try a different search term" : "Add your first patient to get started"}
            </p>
          </div>
        )}

        {/* Patient Table */}
        {!loading && patients.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 transition-colors">
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Patient</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Age / Gender</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Blood Group</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Phone</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Last Updated</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {patients.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-blue-200 dark:border-blue-800/50">
                            {initials(p)}
                          </div>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {p.first_name} {p.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{p.patient_id}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {p.age ? `${p.age} yrs` : "—"} · {p.gender || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {p.blood_group ? (
                          <span className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded text-xs font-semibold border border-red-200 dark:border-red-800/50">
                            {p.blood_group}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.phone || "—"}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{lastVisit(p)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/patients/${p.patient_id}`)}
                            className="px-3 py-1 text-xs rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => router.push(`/?patient=${p.patient_id}&name=${p.first_name}+${p.last_name}`)}
                            className="px-3 py-1 text-xs rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 transition-colors font-medium"
                          >
                            Consult
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.patient_id)}
                            className="px-3 py-1 text-xs rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/50 transition-colors font-medium"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
