"use client";

import React, { useState } from "react";
import { ProtectedRoute } from "@/lib/protected-route";
import PatientSidebar from "@/components/patient-sidebar";
import { Bell, Pill, CalendarCheck, ShieldCheck, Check } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: "n1",
      title: "Evening Medication Reminder",
      message: "Scheduled dose: Amoxicillin 500mg at 08:00 PM.",
      time: "10 mins ago",
      type: "medicine",
      read: false,
    },
    {
      id: "n2",
      title: "Discharge Eligibility Confirmed",
      message: "Your attending doctor Dr. Sarah Mitchell approved discharge readiness.",
      time: "2 hours ago",
      type: "discharge",
      read: false,
    },
    {
      id: "n3",
      title: "Medication Safety Audit Passed",
      message: "AI engine verified 0 drug-drug interaction conflicts.",
      time: "Yesterday",
      type: "safety",
      read: true,
    },
  ]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <ProtectedRoute allowedRole="patient">
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100">
        <PatientSidebar />

        <main className="flex-1 p-8 overflow-y-auto max-w-5xl space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Health Alerts & Notifications</h1>
              <p className="text-xs text-slate-500 mt-1">Real-time alerts for medication schedules, appointments, and safety scores</p>
            </div>
            <button
              onClick={markAllRead}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 transition-colors"
            >
              Mark All as Read
            </button>
          </div>

          {/* Notifications List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-500" /> Recent Alerts
            </h2>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.map((n) => (
                <div key={n.id} className="py-4 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    n.type === "medicine"
                      ? "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                      : n.type === "discharge"
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  }`}>
                    {n.type === "medicine" ? <Pill className="w-5 h-5" /> : n.type === "discharge" ? <CalendarCheck className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">{n.title}</h3>
                      <span className="text-[11px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </ProtectedRoute>
  );
}
