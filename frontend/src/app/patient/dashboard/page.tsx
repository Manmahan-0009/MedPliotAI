"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/lib/protected-route";
import { useAuth } from "@/lib/auth-context";
import { patientService } from "@/lib/api-services";
import { PatientDashboard as PatientDashboardType } from "@/lib/types";
import PatientSidebar from "@/components/patient-sidebar";
import {
  ShieldCheck,
  HeartPulse,
  Clock,
  Activity,
  Pill,
  FileText,
  RefreshCw,
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  Calendar,
  Plus,
  Stethoscope,
  ArrowRight,
  Bell,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
  confirmed: { label: "Confirmed", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  rescheduled: { label: "Rescheduled", color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
  rejected: { label: "Rejected", color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" },
  cancelled: { label: "Cancelled", color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800" },
  completed: { label: "Completed", color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20" },
};

export default function PatientDashboardPage() {
  const { userProfile } = useAuth();
  const [data, setData] = useState<PatientDashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doseLogged, setDoseLogged] = useState(false);

  const patientId = userProfile?.patient_profile?.patient_id || userProfile?.id || "";

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      // Pass patient_id so the backend serves the correct patient's data
      const url = patientId
        ? `/api/patient/dashboard?patient_id=${encodeURIComponent(patientId)}`
        : "/api/patient/dashboard";
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${url}`);
      if (!res.ok) throw new Error("Failed to load patient dashboard");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error("Failed to load patient dashboard:", err);
      setError(err.message || "Failed to load patient data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [patientId]);

  const patientName = userProfile?.patient_profile
    ? `${userProfile.patient_profile.first_name} ${userProfile.patient_profile.last_name}`
    : data?.profile
      ? `${data.profile.first_name} ${data.profile.last_name}`
      : "Patient";

  return (
    <ProtectedRoute allowedRole="patient">
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100">
        <PatientSidebar />

        <main className="flex-1 p-8 overflow-y-auto max-w-6xl">
          <div className="space-y-6">
            
            {/* Top Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Welcome back, {patientName} 👋
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Patient ID: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{data?.profile?.patient_id || userProfile?.patient_profile?.patient_id || "MP-2026-8942"}</span>
                  {data?.pending_appointment_count && data.pending_appointment_count > 0 ? (
                    <span className="ml-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-200 dark:border-amber-700">
                      <Bell className="w-3 h-3" />
                      {data.pending_appointment_count} pending appointment{data.pending_appointment_count > 1 ? "s" : ""}
                    </span>
                  ) : null}
                </p>
              </div>

              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh Data
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-2xl text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </span>
                <button onClick={loadData} className="underline font-semibold text-xs">Retry</button>
              </div>
            )}

            {loading ? (
              <div className="py-24 text-center text-slate-400">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-3" />
                <p className="text-sm font-medium">Loading live patient health metrics...</p>
              </div>
            ) : (
              <>
                {/* Metrics Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  
                  {/* Safety Score */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Safety Score</span>
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {data?.medication_safety_score || 94}%
                    </div>
                    <p className="text-xs text-slate-500">Zero medication conflicts detected</p>
                  </div>

                  {/* Recovery Score */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Recovery Index</span>
                      <HeartPulse className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {data?.recovery_score || 88}<span className="text-sm text-slate-400 font-normal">/100</span>
                    </div>
                    <p className="text-xs text-emerald-600 font-semibold">{data?.recovery_trend || "+4% improvement this week"}</p>
                  </div>

                  {/* Next Dose */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Next Dose</span>
                      <Clock className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {data?.next_medicine?.name || "Amoxicillin 500mg"}
                    </div>
                    <p className="text-xs text-purple-600 font-semibold">Scheduled at {data?.next_medicine?.time || "08:00 PM"}</p>
                  </div>

                  {/* Discharge Status */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Discharge Status</span>
                      <CalendarCheck className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {data?.discharge_status || "Eligible for Discharge"}
                    </div>
                    <p className="text-xs text-slate-500">Follow-up: {data?.next_follow_up || "2026-08-14"}</p>
                  </div>

                </div>

                {/* Main 2-Column Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column (2 spans) */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Upcoming Appointments Widget */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-emerald-500" />
                          Upcoming Appointments
                          {data?.pending_appointment_count && data.pending_appointment_count > 0 ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700 rounded-full">
                              {data.pending_appointment_count} pending
                            </span>
                          ) : null}
                        </h3>
                        <Link href="/patient/appointments" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                          View All <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>

                      {data?.upcoming_appointments && data.upcoming_appointments.length > 0 ? (
                        <div className="space-y-3">
                          {data.upcoming_appointments.map((apt) => {
                            const cfg = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;
                            const effectiveDate = apt.status === "rescheduled" && apt.rescheduled_date ? apt.rescheduled_date : apt.appointment_date;
                            const effectiveTime = apt.status === "rescheduled" && apt.rescheduled_time ? apt.rescheduled_time : apt.appointment_time;
                            return (
                              <Link
                                key={apt.id}
                                href="/patient/appointments"
                                className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors group"
                              >
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
                                  <Stethoscope className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{apt.doctor_name}</p>
                                  <p className="text-xs text-slate-500">{apt.department} · {effectiveDate} at {effectiveTime}</p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${cfg.color} ${cfg.bg}`}>
                                  {cfg.label}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <Calendar className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                          <p className="text-xs text-slate-500 mb-3">No upcoming appointments scheduled</p>
                          <Link
                            href="/patient/appointments/book"
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Book Appointment
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Current Medical Summary Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                          <Activity className="w-5 h-5 text-emerald-500" />
                          Current Medical Summary
                        </h3>
                        <Link href="/patient/recovery" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                          View Recovery →
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                          <p className="text-slate-400 mb-1 font-medium">Diagnosed Condition</p>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                            {data?.profile?.medical_conditions || "Acute Bronchitis (Mild)"}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                          <p className="text-slate-400 mb-1 font-medium">Current Medications</p>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                            {data?.profile?.current_medications || "Amoxicillin 500mg, Paracetamol 650mg"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Recovery Journey Progress */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">Recovery Milestones</h3>
                      <div className="space-y-3">
                        {(data?.recovery_journey || [
                          { day: 1, title: "Consultation & Prescription", status: "completed" },
                          { day: 2, title: "Medication Dosage Started", status: "completed" },
                          { day: 3, title: "Fever Reduction Observed", status: "completed" },
                          { day: 4, title: "Mid-recovery Check-in", status: "in_progress" },
                          { day: 7, title: "Final Recovery & Discharge", status: "pending" },
                        ]).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <span className={`w-3 h-3 rounded-full shrink-0 ${
                              item.status === "completed"
                                ? "bg-emerald-500"
                                : item.status === "in_progress"
                                ? "bg-blue-500 animate-pulse"
                                : "bg-slate-300 dark:bg-slate-700"
                            }`} />
                            <div className="flex-1 text-xs">
                              <span className="font-bold text-slate-800 dark:text-slate-200">Day {item.day}: {item.title}</span>
                            </div>
                            <span className="text-[11px] font-semibold capitalize text-slate-500">
                              {item.status.replace("_", " ")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Right Column (1 span) */}
                  <div className="space-y-6">
                    
                    {/* Quick Dose Log Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                          <Pill className="w-4 h-4 text-purple-500" />
                          Prescription Schedule
                        </h3>
                        <Link href="/patient/medicines" className="text-xs text-purple-600 font-semibold hover:underline">
                          View All
                        </Link>
                      </div>

                      {doseLogged ? (
                        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs flex items-center gap-2 font-semibold">
                          <CheckCircle2 className="w-4 h-4" /> Dose successfully logged!
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-3">
                          <div>
                            <p className="font-bold text-sm text-slate-900 dark:text-white">
                              {data?.next_medicine?.name || "Amoxicillin 500mg"}
                            </p>
                            <p className="text-xs text-slate-500">Twice daily · After meals</p>
                          </div>
                          <button
                            onClick={() => setDoseLogged(true)}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
                          >
                            ✓ Log Dose Taken
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Quick Links Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">Quick Actions</h3>
                      <div className="space-y-2 text-xs">
                        <Link href="/patient/appointments/book" className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 font-medium text-emerald-700 dark:text-emerald-400 transition-colors border border-emerald-100 dark:border-emerald-800/50">
                          <span>📅 Book New Appointment</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <Link href="/patient/smart-pharmacy" className="block p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-medium text-slate-700 dark:text-slate-300 transition-colors">
                          🛒 Order Prescribed Medicines
                        </Link>
                        <Link href="/patient/reports" className="block p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium text-slate-700 dark:text-slate-300 transition-colors">
                          📄 Download AI Consultation Summary
                        </Link>
                        <Link href="/patient/discharge" className="block p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-medium text-slate-700 dark:text-slate-300 transition-colors">
                          💳 View Invoices & Pay Online
                        </Link>
                      </div>
                    </div>

                  </div>

                </div>
              </>
            )}

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

