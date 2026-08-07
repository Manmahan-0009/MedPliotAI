"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/lib/protected-route";
import { useAuth } from "@/lib/auth-context";
import { User, LogOut, Pill, Activity, FileText, ShoppingBag, UserCheck } from "lucide-react";

export default function PatientDashboardPage() {
  const { userProfile, logout } = useAuth();
  const router = useRouter();

  const patientName = userProfile?.patient_profile
    ? `${userProfile.patient_profile.first_name} ${userProfile.patient_profile.last_name}`
    : "Patient";

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <ProtectedRoute allowedRole="patient">
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100">
        
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
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-950">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-800/50">
              <User className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Patient Dashboard
            </h1>

            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6">
              This dashboard is under development. Coming Soon
            </p>

            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </main>

      </div>
    </ProtectedRoute>
  );
}
