"use client";

import React from "react";
import { ProtectedRoute } from "@/lib/protected-route";
import { useAuth } from "@/lib/auth-context";
import PatientSidebar from "@/components/patient-sidebar";
import { SmartDischargeCenter } from "@/components/discharge/SmartDischargeCenter";

export default function DischargeBillingPage() {
  const { userProfile } = useAuth();
  const patientId = userProfile?.patient_profile?.patient_id || userProfile?.id || "MP-2026-8942";

  return (
    <ProtectedRoute allowedRole="patient">
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100">
        <PatientSidebar />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl">
          <SmartDischargeCenter patientId={patientId} role="patient" />
        </main>
      </div>
    </ProtectedRoute>
  );
}
