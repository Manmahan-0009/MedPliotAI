"use client";

import Link from "next/link";
import { Stethoscope, User } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center">
        
        <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-blue-100 dark:border-blue-800/50">
          <Stethoscope className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-8">
          MediPilot AI
        </h1>

        <div className="space-y-4">
          <Link
            href="/doctor/login"
            className="flex items-center justify-center gap-3 w-full py-3.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
          >
            <Stethoscope className="w-5 h-5" />
            Doctor Portal
          </Link>

          <Link
            href="/patient/login"
            className="flex items-center justify-center gap-3 w-full py-3.5 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold rounded-xl transition-colors"
          >
            <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            Patient Portal
          </Link>
        </div>

      </div>
    </div>
  );
}
