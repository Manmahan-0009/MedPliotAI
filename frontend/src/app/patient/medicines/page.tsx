"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/lib/protected-route";
import { prescriptionService } from "@/lib/api-services";
import { Prescription } from "@/lib/types";
import { Pill, ArrowLeft, Calendar, User, Clock, CheckCircle2 } from "lucide-react";

export default function MedicinesPage() {
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPrescription = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await prescriptionService.getPrescription();
      setPrescription(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load prescription data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrescription();
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
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Current Prescriptions</h1>
                <p className="text-xs text-slate-500">Active medications, dosage instructions, and schedules</p>
              </div>
            </div>
            <button onClick={loadPrescription} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
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
              <p>Loading prescription schedule...</p>
            </div>
          ) : (
            <div className="space-y-6">

              {/* Prescription Header Info */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {prescription?.status || "Active Prescription"}
                  </span>
                  <h2 className="font-bold text-slate-900 dark:text-white text-lg mt-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" /> Prescribed by {prescription?.doctor_name || "Dr. Sarah Mitchell"}
                  </h2>
                </div>
                <div className="text-right text-xs text-slate-500 space-y-1">
                  <p className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Date: {prescription?.date}</p>
                  <p>Patient ID: {prescription?.patient_id}</p>
                </div>
              </div>

              {/* Medicines List */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Pill className="w-5 h-5 text-emerald-500" /> Prescribed Items
                </h3>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {prescription?.items.map((item) => (
                    <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-base">{item.name}</span>
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2 py-0.5 rounded font-semibold">{item.dosage}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{item.frequency} · {item.timing} · Duration: {item.duration}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Quantity</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{item.remaining_qty} / {item.prescribed_qty} left</p>
                        </div>
                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl text-xs font-bold">
                          {item.status}
                        </span>
                      </div>
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
