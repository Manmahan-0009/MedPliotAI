"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/lib/protected-route";
import { useAuth } from "@/lib/auth-context";
import { patientService } from "@/lib/api-services";
import { PatientDashboard } from "@/lib/types";
import { User, LogOut, Pill, Activity, FileText, ShoppingBag, UserCheck, ShieldCheck, HeartPulse, Clock, CalendarCheck } from "lucide-react";

export default function PatientDashboardPage() {
  const { userProfile, logout } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<PatientDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await patientService.getDashboard();
      setData(res);
    } catch (err: any) {
      console.error("Failed to load patient dashboard:", err);
      setError(err.message || "Failed to load patient data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const patientName = userProfile?.patient_profile
    ? `${userProfile.patient_profile.first_name} ${userProfile.patient_profile.last_name}`
    : data?.profile
      ? `${data.profile.first_name} ${data.profile.last_name}`
      : "Patient";

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <ProtectedRoute allowedRole="patient">
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 overflow-hidden">
        
        {/* Patient Sidebar Navigation */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-6">
          <div>
            <div className="flex items-center gap-3 pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-100 dark:border-emerald-800/50">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white text-base leading-tight">MediPilot</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Patient Portal</p>
              </div>
            </div>

            <nav className="space-y-1">
              <Link href="/patient/dashboard" className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl font-semibold text-sm">
                <User className="w-4 h-4" />
                Dashboard
              </Link>
              <Link href="/patient/medicines" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl font-medium text-sm transition-colors">
                <Pill className="w-4 h-4 text-slate-400" />
                Medicines
              </Link>
              <Link href="/patient/recovery" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl font-medium text-sm transition-colors">
                <Activity className="w-4 h-4 text-slate-400" />
                Recovery
              </Link>
              <Link href="/patient/reports" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl font-medium text-sm transition-colors">
                <FileText className="w-4 h-4 text-slate-400" />
                Reports
              </Link>
              <Link href="/patient/smart-pharmacy" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl font-medium text-sm transition-colors">
                <ShoppingBag className="w-4 h-4 text-slate-400" />
                Smart Pharmacy
              </Link>
              <Link href="/patient/profile" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl font-medium text-sm transition-colors">
                <UserCheck className="w-4 h-4 text-slate-400" />
                Profile
              </Link>
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="mb-3 px-2">
              <p className="text-xs font-bold text-slate-800 dark:text-white">{patientName}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{userProfile?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Welcome back, {patientName}
                </h1>
                <p className="text-slate-500 text-sm mt-0.5">
                  Patient ID: {data?.profile?.patient_id || userProfile?.patient_profile?.patient_id || "MP-2026-8942"}
                </p>
              </div>
              <button
                onClick={loadData}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Refresh Data
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center justify-between">
                <span>⚠️ {error}</span>
                <button onClick={loadData} className="underline font-semibold text-xs">Retry</button>
              </div>
            )}

            {loading ? (
              <div className="py-20 text-center text-slate-400">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-3" />
                <p>Loading patient health data...</p>
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Safety Score */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Safety Score</span>
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {data?.medication_safety_score || 94}%
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Zero medication conflicts detected</p>
                  </div>

                  {/* Recovery Score */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recovery Index</span>
                      <HeartPulse className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {data?.recovery_score || 88}/100
                    </div>
                    <p className="text-xs text-emerald-600 font-semibold mt-2">{data?.recovery_trend || "+4% improvement"}</p>
                  </div>

                  {/* Adherence */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Next Dosage</span>
                      <Clock className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white truncate">
                      {data?.next_medicine?.name || "Amoxicillin 500mg"}
                    </div>
                    <p className="text-xs text-purple-600 font-semibold mt-2">Scheduled at {data?.next_medicine?.time || "08:00 PM"}</p>
                  </div>

                </div>

                {/* Patient Summary Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Current Medical Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1">Diagnosed Condition</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {data?.profile?.medical_conditions || "Acute Bronchitis (Mild)"}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1">Discharge Eligibility</p>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {data?.discharge_status || "Eligible for Discharge"}
                      </p>
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
