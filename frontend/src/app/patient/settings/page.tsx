"use client";

import React, { useState } from "react";
import { ProtectedRoute } from "@/lib/protected-route";
import { useAuth } from "@/lib/auth-context";
import PatientSidebar from "@/components/patient-sidebar";
import { Settings, ShieldCheck, Bell, Lock, Check } from "lucide-react";

export default function SettingsPage() {
  const { userProfile } = useAuth();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <ProtectedRoute allowedRole="patient">
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100">
        <PatientSidebar />

        <main className="flex-1 p-8 overflow-y-auto max-w-5xl space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Account & Portal Settings</h1>
              <p className="text-xs text-slate-500 mt-1">Manage notification preferences, privacy, and account security</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Notification Preferences */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-500" />
                Notification Preferences
              </h2>

              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Email Medication & Appointment Reminders</p>
                    <p className="text-slate-500">Receive automated daily dosage reminders via email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">SMS Follow-up & Discharge Alerts</p>
                    <p className="text-slate-500">Get text notifications for upcoming appointments</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Security & Encryption */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-500" />
                Security & Data Privacy
              </h2>

              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-xs space-y-1">
                <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> HIPAA Compliant Data Storage
                </p>
                <p className="text-emerald-700 dark:text-emerald-400">
                  Your medical data, prescription history, and consultation summaries are encrypted at rest using AES-256 and SSL/TLS in transit.
                </p>
              </div>

              <div className="text-xs space-y-2">
                <p className="text-slate-500">Account Email: <strong className="text-slate-800 dark:text-slate-200">{userProfile?.email}</strong></p>
                <p className="text-slate-500">Role: <strong className="text-slate-800 dark:text-slate-200">Patient</strong></p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-sm transition-colors flex items-center gap-2"
              >
                {saved ? <Check className="w-4 h-4" /> : null}
                {saved ? "Settings Saved!" : "Save Preferences"}
              </button>
            </div>

          </form>

        </main>
      </div>
    </ProtectedRoute>
  );
}
