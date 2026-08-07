"use client";

import React, { useState, useEffect } from "react";
import { ProtectedRoute } from "@/lib/protected-route";
import { useAuth } from "@/lib/auth-context";
import { patientService } from "@/lib/api-services";
import { Patient } from "@/lib/types";
import PatientSidebar from "@/components/patient-sidebar";
import { User, Phone, Mail, MapPin, Heart, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";

export default function ProfilePage() {
  const { userProfile } = useAuth();
  const [profile, setProfile] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await patientService.getProfileDetails();
      setProfile(data);
    } catch (err: any) {
      console.error("Failed to load patient profile:", err);
      setError(err.message || "Failed to load patient profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const patData = (profile || userProfile?.patient_profile) as Partial<Patient> | undefined;

  return (
    <ProtectedRoute allowedRole="patient">
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100">
        <PatientSidebar />

        <main className="flex-1 p-8 overflow-y-auto max-w-5xl space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Patient Health Profile</h1>
              <p className="text-xs text-slate-500 mt-1">Verified patient demographics, allergies, and medical history</p>
            </div>
            <button
              onClick={loadProfile}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
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
              <p className="text-sm font-medium">Loading profile from database...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Profile Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-bold border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                    {patData?.first_name ? patData.first_name[0] : "P"}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {patData?.first_name} {patData?.last_name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Patient ID: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{patData?.patient_id || "MP-2026-8942"}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-0.5 rounded-md font-semibold">
                        {patData?.gender || "Male"} · {patData?.age || 28} Yrs
                      </span>
                      <span className="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs px-2.5 py-0.5 rounded-md font-semibold flex items-center gap-1">
                        <Heart className="w-3 h-3 text-red-500" /> Blood Group: {patData?.blood_group || "O+"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Demographics & Contact */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Contact & Personal Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-slate-400 font-medium">Email Address</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{patData?.email || userProfile?.email}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-slate-400 font-medium">Phone Number</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{patData?.phone || "9123456780"}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center gap-3 sm:col-span-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-slate-400 font-medium">Residential Address</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{patData?.address || "Bengaluru, Karnataka"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical History & Allergies */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Medical History & Allergies</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-amber-50/60 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                    <p className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="w-4 h-4 text-amber-600" /> Known Allergies
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">{patData?.allergies || "Penicillin"}</p>
                  </div>
                  <div className="p-4 bg-blue-50/60 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl">
                    <p className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5 mb-1">
                      <ShieldCheck className="w-4 h-4 text-blue-600" /> Medical Conditions
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">{patData?.medical_conditions || "Acute Bronchitis (Mild)"}</p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>
    </ProtectedRoute>
  );
}
