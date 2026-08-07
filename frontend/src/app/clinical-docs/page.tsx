"use client";

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import SOAPNotes from '@/components/clinical/SOAPNotes';
import PrescriptionForm from '@/components/clinical/PrescriptionForm';
import { ArrowLeft, Stethoscope, Pill } from 'lucide-react';

function ClinicalDocsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const consultationId = searchParams.get("id");

  const [activeTab, setActiveTab] = useState("soap"); // soap | prescription

  if (!consultationId) {
    return (
      <DashboardLayout title="Clinical Documentation">
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-950/50 h-full">
          <p className="text-slate-500 font-medium">No consultation ID provided.</p>
          <button onClick={() => router.push('/')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold">Go Back</button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Clinical Documentation">
      <div className="flex flex-col min-h-[calc(100vh-120px)] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
        
        {/* Header and Tabs */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10 rounded-t-2xl">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Clinical Documentation
            </h1>
          </div>
          
          <div className="flex gap-2 p-1 bg-slate-200 dark:bg-slate-800 rounded-xl">
            <button 
              onClick={() => setActiveTab("soap")} 
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'soap' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              SOAP Notes
            </button>
            <button 
              onClick={() => setActiveTab("prescription")} 
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'prescription' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Prescription
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-950/50 rounded-b-2xl">
          {activeTab === "soap" ? (
            <SOAPNotes consultationId={consultationId} onPrescriptionReady={() => setActiveTab("prescription")} />
          ) : (
            <PrescriptionForm consultationId={consultationId} />
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}

export default function ClinicalDocsPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#f9fafb]">Loading Clinical Docs...</div>}>
      <ClinicalDocsContent />
    </Suspense>
  );
}
