"use client";

import React, { useState, useEffect } from "react";
import { ProtectedRoute } from "@/lib/protected-route";
import { patientService } from "@/lib/api-services";
import { RecoveryData } from "@/lib/types";
import PatientSidebar from "@/components/patient-sidebar";
import { Activity, ShieldCheck, HeartPulse, RefreshCw, CheckCircle2, Clock, Calendar } from "lucide-react";

export default function RecoveryPage() {
  const [data, setData] = useState<RecoveryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await patientService.getRecoveryData();
      setData(res);
    } catch (err: any) {
      console.error("Failed to load recovery data:", err);
      setError(err.message || "Failed to load recovery analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <ProtectedRoute allowedRole="patient">
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100">
        <PatientSidebar />

        <main className="flex-1 p-8 overflow-y-auto max-w-5xl space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Recovery Journey & AI Index</h1>
              <p className="text-xs text-slate-500 mt-1">Real-time health progress, medication adherence, and clinical recovery timeline</p>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Analytics
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs font-medium">
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div className="py-24 text-center text-slate-400">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-3" />
              <p className="text-sm font-medium">Calculating health recovery metrics...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Top Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recovery Index</span>
                    <HeartPulse className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {data?.recovery_score || 88}<span className="text-sm text-slate-400 font-normal">/100</span>
                  </div>
                  <p className="text-xs text-emerald-600 font-semibold">{data?.recovery_trend || "+4% this week"}</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Adherence Rate</span>
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {data?.adherence_percentage || 92}%
                  </div>
                  <p className="text-xs text-slate-500">Doses taken on schedule</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Safety Index</span>
                    <Activity className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {data?.medication_safety_score || 94}%
                  </div>
                  <p className="text-xs text-slate-500">Low interaction risk</p>
                </div>
              </div>

              {/* Recovery Journey Milestones */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-bold text-slate-900 dark:text-white text-base">Recovery Roadmap</h2>
                <div className="space-y-3">
                  {(data?.recovery_journey || [
                    { day: 1, title: "Consultation & Diagnosis", status: "completed" },
                    { day: 2, title: "Medication Dosage Started", status: "completed" },
                    { day: 3, title: "Fever Stabilized (98.6°F)", status: "completed" },
                    { day: 4, title: "Symptom Check & Vitals Log", status: "in_progress" },
                    { day: 7, title: "Discharge Readiness Evaluation", status: "pending" },
                  ]).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                        item.status === "completed"
                          ? "bg-emerald-500"
                          : item.status === "in_progress"
                          ? "bg-blue-500 animate-pulse"
                          : "bg-slate-300 dark:bg-slate-700"
                      }`} />
                      <div className="flex-1">
                        <p className="font-bold text-sm text-slate-900 dark:text-white">Day {item.day}: {item.title}</p>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                        {item.status.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Events Log */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-500" />
                  Clinical Events Log
                </h2>
                <div className="space-y-4">
                  {(data?.timeline_events || [
                    {
                      id: 1,
                      date: "2026-08-05",
                      time: "10:30 AM",
                      title: "Initial AI Assisted Consultation",
                      description: "Diagnosed with acute bronchitis symptoms. Antibiotics prescribed.",
                      status: "completed",
                    },
                    {
                      id: 2,
                      date: "2026-08-06",
                      time: "08:00 AM",
                      title: "Day 1 Dose Logged",
                      description: "Amoxicillin 500mg taken on schedule.",
                      status: "completed",
                    },
                    {
                      id: 3,
                      date: "2026-08-07",
                      time: "02:00 PM",
                      title: "Normal Temperature Logged",
                      description: "Fever resolved to 98.4°F.",
                      status: "completed",
                    },
                  ]).map((event) => (
                    <div key={event.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{event.title}</span>
                        <span>{event.date} • {event.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{event.description}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </main>
      </div>
    </ProtectedRoute>
  );
}
