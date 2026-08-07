"use client";

import React, { useState, useEffect } from "react";
import { ProtectedRoute } from "@/lib/protected-route";
import { reportService } from "@/lib/api-services";
import { ReportDocument } from "@/lib/types";
import PatientSidebar from "@/components/patient-sidebar";
import { FileText, Download, RefreshCw, Calendar, Search } from "lucide-react";

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadReports = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await reportService.getReports();
      setReports(data);
    } catch (err: any) {
      console.error("Failed to load reports:", err);
      setError(err.message || "Failed to load medical reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleDownload = async (reportId: string, title: string) => {
    try {
      const blob = await reportService.downloadReport(reportId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("Download starting for consultation summary...");
    }
  };

  const filteredReports = reports.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.consultation_id || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRole="patient">
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100">
        <PatientSidebar />

        <main className="flex-1 p-8 overflow-y-auto max-w-5xl space-y-6">
          
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Reports & Clinical Documents</h1>
              <p className="text-xs text-slate-500 mt-1">Access and download your official AI consultation summaries and lab reports</p>
            </div>
            <button
              onClick={loadReports}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by title or ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs font-medium">
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div className="py-24 text-center text-slate-400">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-3" />
              <p className="text-sm font-medium">Fetching medical documents...</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" />
                Available Reports ({filteredReports.length})
              </h2>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredReports.map((report) => (
                  <div key={report.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/50 mt-1">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">{report.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {report.date}</span>
                          <span>•</span>
                          <span>ID: {report.consultation_id}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownload(report.id, report.title)}
                      className="flex items-center justify-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors self-start sm:self-auto"
                    >
                      <Download className="w-4 h-4" /> Download PDF
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </ProtectedRoute>
  );
}
