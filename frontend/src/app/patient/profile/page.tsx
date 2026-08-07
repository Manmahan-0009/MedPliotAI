"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/lib/protected-route";
import { patientService } from "@/lib/api-services";
import { Patient, DischargeData } from "@/lib/types";
import { UserCheck, ArrowLeft, User, Phone, Mail, MapPin, AlertCircle, FileText, Receipt, CheckCircle2 } from "lucide-react";

export default function PatientProfilePage() {
  const [profile, setProfile] = useState<Patient | null>(null);
  const [discharge, setDischarge] = useState<DischargeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [profData, dischData] = await Promise.all([
        patientService.getProfileDetails(),
        patientService.getDischargeData()
      ]);
      setProfile(profData);
      setDischarge(dischData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load patient profile details");
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
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Patient Profile & Discharge Status</h1>
                <p className="text-xs text-slate-500">Personal information, medical history, discharge summary & billing</p>
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
              <p>Loading patient profile & discharge info...</p>
            </div>
          ) : (
            <div className="space-y-6">

              {/* Personal Info Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center font-bold text-lg">
                    {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-white text-lg">
                      {profile?.first_name} {profile?.last_name}
                    </h2>
                    <p className="text-xs text-slate-500">Patient ID: {profile?.patient_id} · Blood Group: {profile?.blood_group || "O+"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Phone className="w-4 h-4 text-slate-400" /> {profile?.phone || "N/A"}
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Mail className="w-4 h-4 text-slate-400" /> {profile?.email || "N/A"}
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-slate-400" /> {profile?.address || "N/A"}
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <User className="w-4 h-4 text-slate-400" /> {profile?.age ? `${profile.age} yrs` : "N/A"} · {profile?.gender || "N/A"}
                  </div>
                </div>
              </div>

              {/* Medical History & Allergies */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" /> Medical Conditions & Allergies
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-400 mb-1">Known Allergies</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{profile?.allergies || "No known allergies"}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-xs font-semibold text-slate-500 mb-1">Diagnosed Conditions</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{profile?.medical_conditions || "None registered"}</p>
                  </div>
                </div>
              </div>

              {/* Discharge Summary & Billing */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-emerald-500" /> Discharge Status & Invoice Summary
                  </h3>
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                    {discharge?.status || "Ready for Discharge"}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                  {discharge?.discharge_summary}
                </p>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase">Billing Breakdown</p>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                    {discharge?.invoices.map((inv) => (
                      <div key={inv.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{inv.type}</p>
                          <p className="text-[11px] text-slate-500">{inv.date}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 dark:text-white">${inv.amount.toFixed(2)}</span>
                          <span className={`text-[11px] block font-semibold ${inv.status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">Total Outstanding Balance</span>
                  <span className="text-lg font-extrabold text-slate-900 dark:text-white">${discharge?.total_outstanding.toFixed(2)}</span>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}
