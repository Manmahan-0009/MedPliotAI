"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/lib/protected-route";
import { patientService } from "@/lib/api-services";
import { RecoveryData } from "@/lib/types";
import { Activity, ArrowLeft, HeartPulse, ShieldCheck, CheckCircle2, Circle, Clock } from "lucide-react";

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
      console.error(err);
      setError(err.message || "Failed to load recovery data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <ProtectedRoute allowedRole="patient">
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 font-sans text-slate-800 dark:text-slate-100">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/patient/dashboard" className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Recovery Journey & Adherence</h1>
                <p className="text-xs text-slate-500">Track recovery score, timeline milestones and adherence</p>
              </div>
            </div>
            <button onClick={loadData} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              Refresh
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm">
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-3" />
              <p>Loading recovery scores & timeline...</p>
            </div>
          ) : (
            <div className="space-y-6">

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Recovery Score</span>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                    {data?.recovery_score}/100
                  </div>
                  <p className="text-xs text-emerald-600 font-semibold mt-1">{data?.recovery_trend}</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Medication Adherence</span>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                    {data?.adherence_percentage}%
                  </div>
                  <p className="text-xs text-purple-600 font-semibold mt-1">Excellent consistency</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Safety Rating</span>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                    {data?.medication_safety_score}%
                  </div>
                  <p className="text-xs text-blue-600 font-semibold mt-1">No contraindications</p>
                </div>
              </div>

              {/* Milestone Timeline */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-emerald-500" /> Recovery Journey Milestones
                </h2>

                <div className="space-y-4">
                  {data?.recovery_journey.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        Day {item.day}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-slate-800 dark:text-white">{item.title}</p>
                        <p className="text-xs text-slate-500 capitalize">{item.status.replace("_", " ")}</p>
                      </div>
                      {item.status === "completed" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : item.status === "in_progress" ? (
                        <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}
