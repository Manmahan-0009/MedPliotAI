"use client";

import React from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/lib/protected-route";
import { Activity, ArrowLeft } from "lucide-react";

export default function RecoveryPage() {
  return (
    <ProtectedRoute allowedRole="patient">
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Activity className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Recovery Tracking</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">This feature is under development. Coming Soon.</p>
          <Link href="/patient/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}
