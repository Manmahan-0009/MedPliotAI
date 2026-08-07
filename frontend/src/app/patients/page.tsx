"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { patientService } from "@/lib/api-services";
import { Patient } from "@/lib/types";
import { ProtectedRoute } from "@/lib/protected-route";

function PatientsContent() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await patientService.getPatients({
        search: search.trim(),
        limit: 50,
      });
      const items = Array.isArray(res) ? res : res.items || [];
      setPatients(items);
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
      await patientService.deletePatient(patientId);
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
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Patient Directory</h1>
            <p className="text-slate-500 text-sm mt-1">
              {patients.length} patient{patients.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            >
              ← Consultation
            </button>
            <button
              onClick={() => router.push("/patients/new")}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold"
            >
              + Add Patient
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <input
            type="text"
            placeholder="Search by name, patient ID, phone, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16 text-slate-400">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-3" />
            <p>Loading patients...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && patients.length === 0 && !error && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-4xl mb-3">🏥</p>
            <p className="font-semibold">No patients found</p>
            <p className="text-sm mt-1">
              {search ? "Try a different search term" : "Add your first patient to get started"}
            </p>
          </div>
        )}

        {/* Patient Table */}
        {!loading && patients.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Patient</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Age / Gender</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Blood Group</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Phone</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Last Updated</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {initials(p)}
                          </div>
                          <span className="font-medium text-slate-800">
                            {p.first_name} {p.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{p.patient_id}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {p.age ? `${p.age} yrs` : "—"} · {p.gender || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {p.blood_group ? (
                          <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-xs font-semibold">
                            {p.blood_group}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{p.phone || "—"}</td>
                      <td className="px-4 py-3 text-slate-500">{lastVisit(p)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/patients/${p.patient_id}`)}
                            className="px-3 py-1 text-xs rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => router.push(`/?patient=${p.patient_id}&name=${p.first_name}+${p.last_name}`)}
                            className="px-3 py-1 text-xs rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-medium"
                          >
                            Consult
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.patient_id)}
                            className="px-3 py-1 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium"
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
    </div>
  );
}


export default function PatientsPage() {
  return (
    <ProtectedRoute allowedRole="doctor">
      <PatientsContent />
    </ProtectedRoute>
  );
}

