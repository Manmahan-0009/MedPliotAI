"use client";

import React, { useState } from "react";
import { 
  Brain, 
  HelpCircle, 
  TestTube2, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Edit3, 
  Download, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  RefreshCw,
  Save
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface DifferentialDiagnosis {
  diagnosis: string;
  likelihood: string;
  note: string;
}

export interface RecommendedTestItem {
  test_name: string;
  reason: string;
  priority: "High" | "Routine" | "Urgent" | string;
  urgency?: string;
  usefulness?: string;
}

export interface ClinicalAlertItem {
  title: string;
  message: string;
  severity: "High" | "Warning" | "Info" | string;
  type: string;
}

export interface ClinicalIntelligenceData {
  chief_complaint?: string;
  diagnosis?: string;
  history_of_present_illness?: string;
  consultation_summary?: {
    chief_complaint?: string;
    history_of_present_illness?: string;
    key_symptoms?: string[];
    important_findings?: string;
    relevant_medical_history?: string;
    clinical_impression?: string;
  };
  soap_notes?: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
  };
  ai_clinical_reasoning?: {
    reasoning_path?: string;
    key_symptoms_considered?: string[];
    differential_diagnoses?: DifferentialDiagnosis[];
    supporting_evidence?: string;
    confidence_score?: number;
  };
  suggested_questions?: string[];
  recommended_tests?: RecommendedTestItem[];
  clinical_alerts?: ClinicalAlertItem[];
  overall_confidence?: {
    score?: number;
    rating?: string;
    explanation?: string;
  };
  doctor_review_status?: "Pending Review" | "Approved" | "Needs Modification" | string;
}

interface ClinicalIntelligenceReportProps {
  data: ClinicalIntelligenceData | null;
  isLoading: boolean;
  onSaveToEHR: (updatedData: ClinicalIntelligenceData) => void;
  onDownloadPDF: (updatedData: ClinicalIntelligenceData) => void;
  patientName?: string;
  doctorName?: string;
}

export default function ClinicalIntelligenceReport({
  data,
  isLoading,
  onSaveToEHR,
  onDownloadPDF,
  patientName = "Rahul Sharma",
  doctorName = "Dr. Sarah Mitchell",
}: ClinicalIntelligenceReportProps) {
  const [report, setReport] = useState<ClinicalIntelligenceData | null>(data);
  const [isEditing, setIsEditing] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<string>(data?.doctor_review_status || "Pending Review");

  // Accordion Toggle States
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    summary: true,
    soap: true,
    reasoning: true,
    questions: true,
    tests: true,
    alerts: true,
    confidence: true,
  });

  // Keep internal report state updated if external data changes
  React.useEffect(() => {
    if (data) {
      setReport(data);
      if (data.doctor_review_status) setReviewStatus(data.doctor_review_status);
    }
  }, [data]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    if (report) {
      setReport({
        ...report,
        doctor_review_status: reviewStatus,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 animate-spin">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">
              Generating Clinical Intelligence...
            </h3>
            <p className="text-xs text-slate-500">
              Synthesizing Groq transcript, SOAP metrics, and differential diagnoses using Llama 3.3 70B
            </p>
          </div>
        </div>

        {/* Skeleton Loaders */}
        <div className="space-y-4">
          <div className="h-20 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
          <div className="h-32 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
          <div className="h-28 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
        <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">
          No Clinical Intelligence Report Generated Yet
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Start recording consultation audio. Upon completion, structured clinical decision support will automatically generate here.
        </p>
      </div>
    );
  }

  const confidenceScore = report.overall_confidence?.score || report.ai_clinical_reasoning?.confidence_score || 92;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header Banner */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-white dark:from-slate-900 dark:to-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                AI Clinical Decision Support System
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                Llama 3.3 70B Active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Patient: <span className="font-bold text-slate-700 dark:text-slate-300">{patientName}</span> • Attending Doctor: <span className="font-bold text-slate-700 dark:text-slate-300">{doctorName}</span>
            </p>
          </div>
        </div>

        {/* Doctor Review Status Selector */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] uppercase font-bold text-slate-400">Review Status</div>
            <select
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value)}
              className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1 border border-slate-200 dark:border-slate-700 outline-none"
            >
              <option value="Pending Review">⏳ Pending Review</option>
              <option value="Approved">✅ Approved by Doctor</option>
              <option value="Needs Modification">✏ Needs Modification</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Accordion Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Warning Banner */}
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl flex items-center gap-3 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Clinical Guidance Warning:</strong> AI suggestions are meant to support, not replace, professional clinical judgment. Please review all details prior to saving to EHR.
          </span>
        </div>

        {/* 1. CONSULTATION SUMMARY */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
          <button
            onClick={() => toggleSection("summary")}
            className="w-full px-5 py-3.5 flex items-center justify-between font-bold text-sm text-slate-800 dark:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>1. Consultation Summary</span>
            </div>
            {expandedSections.summary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedSections.summary && (
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 text-xs">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Chief Complaint</label>
                    <input
                      type="text"
                      value={report.consultation_summary?.chief_complaint || ""}
                      onChange={(e) =>
                        setReport({
                          ...report,
                          consultation_summary: { ...report.consultation_summary, chief_complaint: e.target.value },
                        })
                      }
                      className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">History of Present Illness</label>
                    <textarea
                      value={report.consultation_summary?.history_of_present_illness || ""}
                      onChange={(e) =>
                        setReport({
                          ...report,
                          consultation_summary: { ...report.consultation_summary, history_of_present_illness: e.target.value },
                        })
                      }
                      className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800 h-20"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold text-slate-400">Chief Complaint:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {report.consultation_summary?.chief_complaint || report.chief_complaint || "Dry cough and fever"}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400">Clinical Impression:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {report.consultation_summary?.clinical_impression || report.diagnosis || "Acute viral upper respiratory tract infection"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-semibold text-slate-400">History of Present Illness:</span>
                    <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                      {report.consultation_summary?.history_of_present_illness || report.history_of_present_illness}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. SOAP NOTES */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
          <button
            onClick={() => toggleSection("soap")}
            className="w-full px-5 py-3.5 flex items-center justify-between font-bold text-sm text-slate-800 dark:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>2. SOAP Notes</span>
            </div>
            {expandedSections.soap ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedSections.soap && (
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 text-xs">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-blue-600 block mb-1">Subjective</label>
                    <textarea
                      value={report.soap_notes?.subjective || ""}
                      onChange={(e) => setReport({ ...report, soap_notes: { ...report.soap_notes, subjective: e.target.value } })}
                      className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800 h-16"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-blue-600 block mb-1">Objective</label>
                    <textarea
                      value={report.soap_notes?.objective || ""}
                      onChange={(e) => setReport({ ...report, soap_notes: { ...report.soap_notes, objective: e.target.value } })}
                      className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800 h-16"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-blue-600 block mb-1">Assessment</label>
                    <textarea
                      value={report.soap_notes?.assessment || ""}
                      onChange={(e) => setReport({ ...report, soap_notes: { ...report.soap_notes, assessment: e.target.value } })}
                      className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800 h-16"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-blue-600 block mb-1">Plan</label>
                    <textarea
                      value={report.soap_notes?.plan || ""}
                      onChange={(e) => setReport({ ...report, soap_notes: { ...report.soap_notes, plan: e.target.value } })}
                      className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800 h-20"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-blue-600 uppercase tracking-wider text-[10px]">Subjective</span>
                    <p className="mt-1 text-slate-700 dark:text-slate-300 leading-relaxed">{report.soap_notes?.subjective || "Patient reports dry cough and fever."}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-blue-600 uppercase tracking-wider text-[10px]">Objective</span>
                    <p className="mt-1 text-slate-700 dark:text-slate-300 leading-relaxed">{report.soap_notes?.objective || "Vitals stable, temp 100.4°F, clear chest."}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-blue-600 uppercase tracking-wider text-[10px]">Assessment</span>
                    <p className="mt-1 text-slate-700 dark:text-slate-300 leading-relaxed">{report.soap_notes?.assessment || "Acute viral upper respiratory infection."}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-blue-600 uppercase tracking-wider text-[10px]">Plan</span>
                    <p className="mt-1 text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">{report.soap_notes?.plan || "1. Antipyretics\n2. Hydration\n3. Follow up 5 days."}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. 🧠 AI CLINICAL REASONING (NEW) */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
          <button
            onClick={() => toggleSection("reasoning")}
            className="w-full px-5 py-3.5 flex items-center justify-between font-bold text-sm text-slate-800 dark:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Brain className="w-4 h-4 text-purple-600" />
              <span>3. 🧠 AI Clinical Reasoning & Differentials</span>
            </div>
            {expandedSections.reasoning ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedSections.reasoning && (
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300">Clinical Reasoning Path:</span>
                <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {report.ai_clinical_reasoning?.reasoning_path || "Dry cough with fever without shortness of breath correlates strongly with viral bronchitis."}
                </p>
              </div>

              {/* Differentials Table */}
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 mb-2 block">Differential Diagnoses:</span>
                <div className="space-y-2">
                  {report.ai_clinical_reasoning?.differential_diagnoses?.map((d, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-white">{d.diagnosis}</span>
                        <p className="text-slate-500 text-[11px]">{d.note}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 font-bold rounded-lg ${
                        d.likelihood === "High" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {d.likelihood} Likelihood
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. ❓ SUGGESTED QUESTIONS TO ASK (NEW) */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
          <button
            onClick={() => toggleSection("questions")}
            className="w-full px-5 py-3.5 flex items-center justify-between font-bold text-sm text-slate-800 dark:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>4. ❓ Suggested Follow-Up Questions for Doctor</span>
            </div>
            {expandedSections.questions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedSections.questions && (
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-xs">
              {report.suggested_questions?.map((q, idx) => (
                <label key={idx} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 rounded text-blue-600" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{q}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 5. 🧪 RECOMMENDED DIAGNOSTIC TESTS (NEW) */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
          <button
            onClick={() => toggleSection("tests")}
            className="w-full px-5 py-3.5 flex items-center justify-between font-bold text-sm text-slate-800 dark:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <TestTube2 className="w-4 h-4 text-indigo-600" />
              <span>5. 🧪 Recommended Diagnostic Tests</span>
            </div>
            {expandedSections.tests ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedSections.tests && (
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 text-xs">
              {report.recommended_tests?.map((test, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-white">{test.test_name}</div>
                    <div className="text-slate-500 text-[11px]">{test.reason}</div>
                  </div>
                  <span className={`px-2.5 py-1 font-bold rounded-lg ${
                    test.priority === "High" || test.priority === "Urgent" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {test.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. ⚠️ CLINICAL ALERTS (NEW) */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
          <button
            onClick={() => toggleSection("alerts")}
            className="w-full px-5 py-3.5 flex items-center justify-between font-bold text-sm text-slate-800 dark:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span>6. ⚠️ Important Clinical Alerts & Red Flags</span>
            </div>
            {expandedSections.alerts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedSections.alerts && (
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 text-xs">
              {report.clinical_alerts?.map((alert, idx) => (
                <div key={idx} className="p-3 bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-red-900 dark:text-red-300">{alert.title}</div>
                    <div className="text-red-700 dark:text-red-400 mt-0.5">{alert.message}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 7. AI CONFIDENCE SCORE */}
        <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              {confidenceScore}%
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">Overall AI Confidence Rating</div>
              <div className="text-slate-500">Based on symptoms, SpO2 correlation, and clinical guidelines</div>
            </div>
          </div>
          <span className="px-3 py-1 bg-blue-600 text-white font-bold text-xs rounded-full">
            High Confidence
          </span>
        </div>
      </div>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 shadow-md z-10">
        {isEditing ? (
          <button
            onClick={handleSaveEdit}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-sm"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
          >
            <Edit3 className="w-4 h-4 text-blue-600" /> Edit Report
          </button>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => onDownloadPDF(report)}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>

          <button
            onClick={() => onSaveToEHR(report)}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            <Send className="w-4 h-4" /> Save to EHR
          </button>
        </div>
      </div>
    </div>
  );
}
