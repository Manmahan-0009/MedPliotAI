"use client";

import React, { useState } from "react";
import { ProtectedRoute } from "@/lib/protected-route";
import PatientSidebar from "@/components/patient-sidebar";
import { Calendar, Clock, User, CheckCircle2, Stethoscope } from "lucide-react";

export default function AppointmentsPage() {
  const [appointments] = useState([
    {
      id: "apt-101",
      doctor_name: "Dr. Sarah Mitchell",
      specialization: "Internal Medicine",
      department: "General Medicine",
      date: "2026-08-14",
      time: "10:30 AM",
      type: "Follow-up Consultation",
      status: "Confirmed",
    },
    {
      id: "apt-100",
      doctor_name: "Dr. Rahul Sharma",
      specialization: "Family Practice",
      department: "General Medicine",
      date: "2026-08-05",
      time: "11:00 AM",
      type: "Initial AI Consultation",
      status: "Completed",
    },
  ]);

  return (
    <ProtectedRoute allowedRole="patient">
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100">
        <PatientSidebar />

        <main className="flex-1 p-8 overflow-y-auto max-w-5xl space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Appointments & Consultations</h1>
              <p className="text-xs text-slate-500 mt-1">View your scheduled follow-ups and past medical appointments</p>
            </div>
          </div>

          {/* Appointments Grid */}
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/50">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">{apt.doctor_name}</h3>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">
                        {apt.specialization}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-emerald-500" /> {apt.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-purple-500" /> {apt.time}</span>
                      <span>• {apt.type}</span>
                    </p>
                  </div>
                </div>

                <div className="self-start sm:self-auto">
                  <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                    apt.status === "Confirmed"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}>
                    {apt.status === "Confirmed" ? "✓ Confirmed" : "Completed"}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>
    </ProtectedRoute>
  );
}
