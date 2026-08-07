"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/lib/protected-route";
import { pharmacyService } from "@/lib/api-services";
import { PharmacyData } from "@/lib/types";
import { ShoppingBag, ArrowLeft, Pill, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export default function SmartPharmacyPage() {
  const [data, setData] = useState<PharmacyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await pharmacyService.getPharmacyData();
      setData(res);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load pharmacy data");
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
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Smart Pharmacy</h1>
                <p className="text-xs text-slate-500">Prescription medicines, generic savings & dosage safety</p>
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
              <p>Loading pharmacy catalogue & medicines...</p>
            </div>
          ) : (
            <div className="space-y-6">

              {/* Prescribed Medicines Section */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Pill className="w-5 h-5 text-emerald-500" /> Prescribed Active Medications
                </h2>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data?.prescribed_medicines.map((med) => (
                    <div key={med.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-base">{med.name}</span>
                          <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs px-2 py-0.5 rounded font-semibold">{med.dosage}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{med.frequency} · {med.timing}</p>
                        
                        {med.generic_alternative && (
                          <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                            💡 Generic option available: {med.generic_alternative.name} (Save {med.generic_alternative.savings}%)
                          </p>
                        )}

                        {med.interaction_warnings?.map((warn, i) => (
                          <p key={i} className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> {warn}
                          </p>
                        ))}
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-semibold text-slate-500 block">Remaining Stock</span>
                        <span className="text-lg font-extrabold text-slate-800 dark:text-white">{med.remaining_qty} pills</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reminders Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-500" /> Today's Dosage Schedule
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {data?.reminders.map((rem, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white">{rem.medicine}</p>
                        <p className="text-[11px] text-slate-500">{rem.time}</p>
                      </div>
                      {rem.taken ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <span className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">Pending</span>
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
