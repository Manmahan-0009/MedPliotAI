"use client";

import React, { useState, useEffect } from "react";
import { ProtectedRoute } from "@/lib/protected-route";
import { prescriptionService, pharmacyService } from "@/lib/api-services";
import { Prescription } from "@/lib/types";
import PatientSidebar from "@/components/patient-sidebar";
import { Pill, AlertCircle, RefreshCw, User, Calendar } from "lucide-react";
import { SmartPharmacyPanel } from "@/components/SmartPharmacyPanel";

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
              <div className="mt-4">
                <SmartPharmacyPanel patientId={prescription?.patient_id || "MP-2026-8942"} role="patient" />
              </div>

            </div>
          )}

        </main>
      </div>
    </ProtectedRoute>
  );
}
