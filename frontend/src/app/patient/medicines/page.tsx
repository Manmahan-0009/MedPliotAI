"use client";

import React, { useState, useEffect } from "react";
import { ProtectedRoute } from "@/lib/protected-route";
import { prescriptionService, pharmacyService } from "@/lib/api-services";
import { Prescription } from "@/lib/types";
import PatientSidebar from "@/components/patient-sidebar";
import { Pill, AlertCircle, Info, RefreshCw, CheckCircle2, User, Calendar } from "lucide-react";

export default function MedicinesPage() {
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggedDoses, setLoggedDoses] = useState<Record<string, boolean>>({});

  const loadPrescription = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await prescriptionService.getPrescription();
      setPrescription(data);
    } catch (err: any) {
      console.error("Failed to load prescription:", err);
      setError(err.message || "Failed to load prescription data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrescription();
  }, []);

  const toggleDose = (itemId: string) => {
    setLoggedDoses((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  return (
    <ProtectedRoute allowedRole="patient">
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100">
        <PatientSidebar />

        <main className="flex-1 p-8 overflow-y-auto max-w-5xl space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Medication Management</h1>
              <p className="text-xs text-slate-500 mt-1">Track daily dosages, timing, adherence, and refill schedules</p>
            </div>
            <button
              onClick={loadPrescription}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* Adherence Alert Card */}
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Medication Adherence Alert</p>
              <p className="mt-0.5 text-emerald-700 dark:text-emerald-400">
                You are on track with your prescribed dosage schedule. Remember to take medicines after meals to optimize absorption.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs font-medium">
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div className="py-24 text-center text-slate-400">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-3" />
              <p className="text-sm font-medium">Loading active prescriptions...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Doctor & Date Banner */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full uppercase tracking-wider">
                    {prescription?.status || "Active Prescription"}
                  </span>
                  <h2 className="font-bold text-slate-900 dark:text-white text-base mt-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" /> Attending Doctor: {prescription?.doctor_name || "Dr. Sarah Mitchell"}
                  </h2>
                </div>
                <div className="text-right text-xs text-slate-500 space-y-1">
                  <p className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Date: {prescription?.date}</p>
                  <p>Patient ID: {prescription?.patient_id || "MP-2026-8942"}</p>
                </div>
              </div>

              {/* Medicines Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {(prescription?.items || [
                  {
                    id: "m1",
                    name: "Amoxicillin",
                    dosage: "500mg",
                    frequency: "Twice daily",
                    timing: "After meals",
                    duration: "5 days",
                    prescribed_qty: 10,
                    remaining_qty: 6,
                    status: "Active",
                  },
                  {
                    id: "m2",
                    name: "Paracetamol",
                    dosage: "650mg",
                    frequency: "As needed (max 3/day)",
                    timing: "After meals",
                    duration: "3 days",
                    prescribed_qty: 9,
                    remaining_qty: 4,
                    status: "Active",
                  },
                ]).map((item) => {
                  const isLogged = loggedDoses[item.id];
                  return (
                    <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-100 dark:border-emerald-800/50">
                              <Pill className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 dark:text-white text-base">{item.name}</h3>
                              <span className="text-xs font-semibold text-slate-500">{item.dosage}</span>
                            </div>
                          </div>
                          <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs px-2.5 py-1 rounded-full font-bold">
                            {item.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 my-4 text-xs">
                          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <p className="text-slate-400 mb-0.5">Frequency</p>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{item.frequency}</p>
                          </div>
                          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <p className="text-slate-400 mb-0.5">Duration</p>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{item.duration}</p>
                          </div>
                          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <p className="text-slate-400 mb-0.5">Quantity</p>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{item.remaining_qty} / {item.prescribed_qty} left</p>
                          </div>
                          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <p className="text-slate-400 mb-0.5">Instructions</p>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{item.timing}</p>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <Info className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Take strictly as directed. Consult doctor before discontinuing.</span>
                        </div>
                      </div>

                      <div className="pt-2 flex gap-3">
                        <button
                          onClick={() => toggleDose(item.id)}
                          className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2 ${
                            isLogged
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {isLogged ? "Dose Logged ✓" : "Log Dose Taken"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </main>
      </div>
    </ProtectedRoute>
  );
}
