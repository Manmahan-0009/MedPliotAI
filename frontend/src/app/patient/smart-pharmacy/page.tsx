"use client";

import React from "react";
import { ProtectedRoute } from "@/lib/protected-route";
import PatientSidebar from "@/components/patient-sidebar";
import { SmartPharmacyPanel } from "@/components/SmartPharmacyPanel";

export default function SmartPharmacyPage() {
  return (
    <ProtectedRoute allowedRole="patient">
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100">
        <PatientSidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl">
          <SmartPharmacyPanel patientId="MP-2026-8942" role="patient" />
        </main>
      </div>
    </ProtectedRoute>
  );
}
