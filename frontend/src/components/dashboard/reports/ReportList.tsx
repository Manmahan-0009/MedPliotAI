import React from "react";
import { format } from "date-fns";
import { Eye, Download, FileText, Printer, Stethoscope, ChevronRight, Activity, Share2 } from "lucide-react";

export default function ReportList({ reports, onViewReport }: { reports: any[], onViewReport: (r: any) => void }) {
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Reports Found</h3>
        <p className="text-sm text-slate-500 mt-2 max-w-sm">
          There are no clinical documentation reports matching your current search or filters.
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30";
      case "Pending Review": return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30";
      case "Draft": return "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 border-slate-200 dark:border-slate-500/30";
      default: return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30";
    }
  };

  const getDiagnosisText = (report: any) => {
    if (report.soap_notes?.assessment) {
      return typeof report.soap_notes.assessment === 'string' 
        ? report.soap_notes.assessment 
        : JSON.stringify(report.soap_notes.assessment);
    }
    if (report.ai_summary) {
      if (typeof report.ai_summary === 'string') {
        try {
          const parsed = JSON.parse(report.ai_summary);
          if (parsed.diagnosis) return parsed.diagnosis;
          if (parsed.assessment) return parsed.assessment;
          if (parsed.chief_complaint) return parsed.chief_complaint;
          if (parsed.consultation_summary?.chief_complaint) return parsed.consultation_summary.chief_complaint;
          const vals = Object.values(parsed).filter(v => typeof v === 'string') as string[];
          if (vals.length > 0) return vals.join(', ').substring(0, 150) + '...';
        } catch (e) {
          return report.ai_summary;
        }
      }
      return String(report.ai_summary);
    }
    return "No diagnosis recorded.";
  };

  const handleDownloadPDF = async (report: any) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/report/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_name: report.doctor_name || "Dr. Sarah Mitchell",
          patient_name: report.patient_name,
          patient_id: report.patient_mrn,
          age: report.age,
          gender: report.gender,
          date: new Date(report.consultation_date).toLocaleDateString(),
          transcript: report.transcript,
          summary: report.ai_summary,
          soap_notes: report.soap_notes,
          consultation_summary: report.clinical_notes,
          ai_clinical_reasoning: report.clinical_notes,
          doctor_review_status: report.status,
          recovery_score: report.clinical_notes?.recovery_score,
          medication_safety_score: report.clinical_notes?.medication_safety_score,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Consultation_Report_${report.patient_name.replace(/ /g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert("Failed to download PDF.");
    }
  };

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
      {reports.map((report) => (
        <div key={report.id} className="p-5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Left side: Patient & Report Info */}
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800">
                <Stethoscope className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">
                    {report.patient_name}
                  </h3>
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {report.patient_mrn}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-2 flex-wrap">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {format(new Date(report.consultation_date), "MMM d, yyyy • h:mm a")}
                  </span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span>{report.clinical_notes?.department || "General"}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span>{report.doctor_name}</span>
                </div>
                
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Diagnosis: </span>
                  {getDiagnosisText(report)}
                </p>
              </div>
            </div>

            {/* Right side: AI Confidence & Actions */}
            <div className="flex flex-col items-end gap-3 shrink-0">
              {report.clinical_notes?.ai_confidence && (
                <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                  <Activity className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">{report.clinical_notes.ai_confidence}% AI Match</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onViewReport(report)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> View Details
                </button>
                <div className="flex items-center gap-1 border-l pl-2 ml-1 border-slate-200 dark:border-slate-700">
                  <button onClick={() => handleDownloadPDF(report)} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors" title="Download PDF">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors" title="Print">
                    <Printer className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors" title="Share">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      ))}
    </div>
  );
}
