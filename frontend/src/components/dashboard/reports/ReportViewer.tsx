import React, { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { 
  X, Download, FileText, CheckCircle2, Activity, User, 
  Pill, Clock, Stethoscope, FileSignature, HelpCircle, 
  ChevronRight, Edit3 
} from "lucide-react";
import ReportEditor from "./ReportEditor";

export default function ReportViewer({ report, onClose, onUpdate }: { report: any, onClose: () => void, onUpdate: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("clinical"); // clinical, timeline, raw

  const timeline = report.clinical_notes?.timeline || [];

  const handleDownloadPDF = async () => {
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
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ x: "100%" }} 
        animate={{ x: 0 }} 
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-4xl bg-slate-50 dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800"
      >
        {/* Header */}
        <div className="p-4 md:p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center font-bold text-xl">
              {report.patient_name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {report.patient_name}
                <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded">
                  {report.patient_mrn}
                </span>
              </h2>
              <div className="text-sm text-slate-500 flex gap-2 items-center mt-1">
                <User className="w-3.5 h-3.5" />
                <span>{report.gender}, {report.age} yrs</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span>{format(new Date(report.consultation_date), "MMM d, yyyy")}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors">
              <Edit3 className="w-4 h-4" /> Edit
            </button>
            <button onClick={handleDownloadPDF} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors shadow-xs">
              <Download className="w-4 h-4" /> PDF
            </button>
            <button onClick={onClose} className="p-1.5 ml-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          {[
            { id: "clinical", label: "Clinical Summary" },
            { id: "timeline", label: "Report Timeline" },
            { id: "raw", label: "Raw Transcript" }
          ].map(t => (
            <button 
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === t.id ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {activeTab === "clinical" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div className="text-xs font-bold text-slate-500 mb-2 flex justify-between">AI Confidence <Activity className="w-4 h-4 text-indigo-500"/></div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{report.clinical_notes?.ai_confidence || 95}%</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div className="text-xs font-bold text-slate-500 mb-2 flex justify-between">Med Safety <Pill className="w-4 h-4 text-emerald-500"/></div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{report.clinical_notes?.medication_safety_score || 100}/100</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div className="text-xs font-bold text-slate-500 mb-2 flex justify-between">Recovery Score <Activity className="w-4 h-4 text-blue-500"/></div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{report.clinical_notes?.recovery_score || 85}%</div>
                </div>
              </div>

              {/* SOAP Notes */}
              {report.soap_notes && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <FileSignature className="w-4 h-4 text-blue-600" /> SOAP Notes
                  </div>
                  <div className="p-5 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                    <div><span className="font-bold text-slate-900 dark:text-white">Subjective:</span> {report.soap_notes.subjective}</div>
                    <div><span className="font-bold text-slate-900 dark:text-white">Objective:</span> {report.soap_notes.objective}</div>
                    <div><span className="font-bold text-slate-900 dark:text-white">Assessment:</span> {report.soap_notes.assessment}</div>
                    <div><span className="font-bold text-slate-900 dark:text-white">Plan:</span> {report.soap_notes.plan}</div>
                  </div>
                </div>
              )}

              {/* Clinical AI Reasoning */}
              {report.clinical_notes?.reasoning_path && (
                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 p-5">
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 mb-2">
                    <HelpCircle className="w-4 h-4" /> AI Clinical Reasoning
                  </h4>
                  <p className="text-sm text-indigo-800/80 dark:text-indigo-200/70 leading-relaxed">
                    {report.clinical_notes.reasoning_path}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "timeline" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 p-4">
              {timeline.length > 0 ? (
                timeline.map((item: any, i: number) => (
                  <div key={i} className="flex gap-4 relative">
                    {i !== timeline.length - 1 && <div className="absolute left-3.5 top-8 bottom-[-16px] w-0.5 bg-blue-100 dark:bg-slate-800 z-0"></div>}
                    <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center shrink-0 z-10 mt-1">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.action}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3" /> {format(new Date(item.timestamp), "MMM d, yyyy • h:mm a")}
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="font-medium">By {item.user}</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-500">No timeline data available for this report.</div>
              )}
            </motion.div>
          )}

          {activeTab === "raw" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-2xl text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
              {report.transcript || "No audio transcript available."}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Editor Modal */}
      {isEditing && (
        <ReportEditor 
          report={report} 
          onClose={() => setIsEditing(false)} 
          onSave={() => {
            setIsEditing(false);
            onUpdate();
          }} 
        />
      )}
    </div>
  );
}
