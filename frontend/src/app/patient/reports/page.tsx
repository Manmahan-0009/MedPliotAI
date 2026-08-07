"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/lib/protected-route";
import { reportService } from "@/lib/api-services";
import { ReportDocument } from "@/lib/types";
import { FileText, ArrowLeft, Download, Calendar, FileCheck } from "lucide-react";

export default function PatientReportsPage() {
  const [reports, setReports] = useState<ReportDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadReports = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await reportService.getReports();
      setReports(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load clinical reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleDownload = async (report: ReportDocument) => {
    setDownloadingId(report.id);
    try {
      const blob = await reportService.generatePdf({
        doctor_name: "Dr. Sarah Mitchell",
        patient_name: "Rahul Sharma",
        date: report.date,
        transcript: "Doctor: Patient reported mild bronchitis symptoms.\nPatient: Recovering well.",
        summary: "### Clinical Consultation Summary\nPatient has responded well to prescribed treatment. Vitals normal."
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${report.consultation_id || report.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Failed to download PDF report: " + err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <ProtectedRoute allowedRole="patient">
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 font-sans text-slate-800 dark:text-slate-100">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/patient/dashboard" className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Clinical Reports</h1>
                <p className="text-xs text-slate-500">View and download your AI consultation summaries & clinical documents</p>
              </div>
            </div>
            <button onClick={loadReports} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              Refresh
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm">
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-3" />
              <p>Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-20 text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <FileCheck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No Clinical Reports Available</p>
              <p className="text-xs text-slate-400 mt-1">Reports will appear here after your clinical consultations.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {reports.map((r) => (
                  <div key={r.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center font-bold">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{r.title}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {r.date}</span>
                          <span>·</span>
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-medium">{r.type}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownload(r)}
                      disabled={downloadingId === r.id}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {downloadingId === r.id ? "Generating PDF..." : "Download PDF"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}
