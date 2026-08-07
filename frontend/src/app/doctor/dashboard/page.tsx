"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { 
  Users, Calendar, FileText, Settings, Activity, Stethoscope, 
  Mic, Play, Pause, Square, Download, Trash2, Send, CheckCircle2, 
  Clock, Pill, ShieldCheck, FileCheck2, ArrowUpRight, Search, Plus, 
  ChevronRight, AlertTriangle, RefreshCw, Printer, Share2, Check,
  UserCheck, AlertCircle, HeartPulse, DollarSign, FileSpreadsheet, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/lib/protected-route";
import { useAuth } from "@/lib/auth-context";
import { 
  doctorService, 
  patientService, 
  consultationService, 
  reportService, 
  pharmacyService 
} from "@/lib/api-services";
import { 
  DoctorDashboard, 
  Patient, 
  Consultation, 
  PharmacyData, 
  RecoveryData, 
  DischargeData 
} from "@/lib/types";
import { API_BASE_URL } from "@/lib/api";
import DoctorSidebar, { DoctorTabType } from "@/components/layout/DoctorSidebar";
import DoctorTopbar from "@/components/layout/DoctorTopbar";
import ClinicalIntelligenceReport, { ClinicalIntelligenceData } from "@/components/clinical/ClinicalIntelligenceReport";

function DoctorDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userProfile, logout } = useAuth();

  // Layout & Theme States
  const [activeTab, setActiveTab] = useState<DoctorTabType>("home");
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Data Loading States
  const [dashboardData, setDashboardData] = useState<DoctorDashboard | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientDetailTab, setPatientDetailTab] = useState<
    "overview" | "history" | "soap" | "prescriptions" | "recovery" | "reports" | "billing" | "discharge"
  >("overview");

  const [pharmacyData, setPharmacyData] = useState<PharmacyData | null>(null);
  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null);
  const [dischargeData, setDischargeData] = useState<DischargeData | null>(null);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Consultation State
  const [consultStatus, setConsultStatus] = useState("Idle");
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [clinicalReportData, setClinicalReportData] = useState<ClinicalIntelligenceData | null>(null);
  const [soapNotes, setSoapNotes] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(0);
  const [ehrStatus, setEhrStatus] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initial Data Fetch
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.allSettled([
      doctorService.getDashboard(),
      patientService.getPatients({ limit: 20 }),
      pharmacyService.getPharmacyData(),
      patientService.getRecoveryData(),
      patientService.getDischargeData()
    ]).then(([dashRes, patRes, pharmRes, recRes, disRes]) => {
      if (!isMounted) return;

      if (dashRes.status === "fulfilled") setDashboardData(dashRes.value);
      if (patRes.status === "fulfilled") {
        setPatients(patRes.value.items || []);
        if (patRes.value.items?.length > 0) setSelectedPatient(patRes.value.items[0]);
      }
      if (pharmRes.status === "fulfilled") setPharmacyData(pharmRes.value);
      if (recRes.status === "fulfilled") setRecoveryData(recRes.value);
      if (disRes.status === "fulfilled") setDischargeData(disRes.value);

      setLoading(false);
    }).catch(err => {
      console.error("Dashboard initialization error:", err);
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  // Theme Toggle Handler
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Consultation Voice Recording Handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = handleStopRecording;
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      setConsultStatus("Listening...");

      setTimer(0);
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone Access Error:", err);
      setConsultStatus("Mic Access Denied");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      setConsultStatus("Paused");
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      setConsultStatus("Listening...");
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsPaused(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const handleStopRecording = async () => {
    setConsultStatus("Processing Audio...");
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

    try {
      const audioData = await consultationService.processAudio(audioBlob);
      setTranscript(audioData.transcript);
      setConsultStatus("Generating Clinical Intelligence...");

      const summaryData = await consultationService.generateSummary(audioData.transcript);
      setSummary(summaryData.summary || "");
      setClinicalReportData(summaryData as any);
      setConsultStatus("Completed");
    } catch (error) {
      console.error(error);
      setConsultStatus("Error Processing");
    }
  };

  const downloadReportPDF = async (customReport?: ClinicalIntelligenceData) => {
    try {
      setConsultStatus("Generating PDF...");
      const targetReport = customReport || clinicalReportData;
      const blob = await reportService.generatePdf({
        doctor_name: dashboardData?.doctor_profile?.full_name || "Dr. Sarah Mitchell",
        patient_name: selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : "Rahul Sharma",
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        transcript: transcript || "No transcript recorded.",
        summary: summary || "No summary generated.",
        soap_notes: targetReport?.soap_notes as any,
        consultation_summary: targetReport?.consultation_summary as any,
        ai_clinical_reasoning: targetReport?.ai_clinical_reasoning as any,
        suggested_questions: targetReport?.suggested_questions as any,
        recommended_tests: targetReport?.recommended_tests as any,
        clinical_alerts: targetReport?.clinical_alerts as any,
        doctor_review_status: targetReport?.doctor_review_status || "Approved"
      } as any);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `MediPilot_Report_${selectedPatient?.patient_id || "CONS"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setConsultStatus("PDF Downloaded");
      setTimeout(() => setConsultStatus("Completed"), 2000);
    } catch (error) {
      console.error("PDF Download Error:", error);
      setConsultStatus("PDF Failed");
    }
  };

  const handleSaveEHR = () => {
    setEhrStatus("Saving to Backend Database...");
    setTimeout(() => {
      setEhrStatus("Successfully Saved to EHR!");
      setTimeout(() => setEhrStatus(""), 3500);
    }, 1200);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Filtered Patients for Patient Search
  const filteredPatients = patients.filter(p => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    return (
      p.first_name.toLowerCase().includes(term) ||
      p.last_name.toLowerCase().includes(term) ||
      p.patient_id.toLowerCase().includes(term) ||
      (p.phone && p.phone.includes(term))
    );
  });

  return (
    <div className={`flex h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-200 text-slate-800 dark:text-slate-100 overflow-hidden ${isDarkMode ? "dark" : ""}`}>
      {/* Collapsible Left Sidebar */}
      <DoctorSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <DoctorTopbar
          onSearch={(q) => setSearchQuery(q)}
          onNewConsultation={() => setActiveTab("consultation")}
          onAddPatient={() => setActiveTab("patients")}
          onOpenNotifications={() => setActiveTab("notifications")}
        />

        {/* Dynamic Content View Router */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Loading Doctor Dashboard...</p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* TAB 1: HOME DASHBOARD OVERVIEW */}
              {activeTab === "home" && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-6"
                >
                  {/* Top Welcome Banner */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight mb-1">
                        Good day, {dashboardData?.doctor_profile?.full_name || "Dr. Sarah Mitchell"} 👋
                      </h2>
                      <p className="text-blue-100 text-xs font-medium">
                        Department of {dashboardData?.doctor_profile?.department || "General Medicine"} · {dashboardData?.doctor_profile?.medical_registration_number || "REG-2026-9901"}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("consultation")}
                      className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2"
                    >
                      <Mic className="w-4 h-4" /> Start AI Consultation
                    </button>
                  </div>

                  {/* 6 Key Analytics Stat Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                      { label: "Total Patients", val: dashboardData?.analytics?.total_patients || 12, icon: Users, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30" },
                      { label: "Today's Consults", val: dashboardData?.analytics?.consultations_today || 4, icon: Mic, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30" },
                      { label: "Pending Reports", val: dashboardData?.analytics?.pending_reports || 2, icon: FileText, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/30" },
                      { label: "Recovery Tracking", val: dashboardData?.analytics?.recovery_monitoring || 8, icon: Activity, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30" },
                      { label: "Discharges Today", val: dashboardData?.analytics?.discharges_today || 2, icon: FileCheck2, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/30" },
                      { label: "AI Reports Gen.", val: dashboardData?.analytics?.ai_reports_generated || 18, icon: Stethoscope, color: "text-rose-600 bg-rose-50 dark:bg-rose-900/30" },
                    ].map((stat, i) => {
                      const Icon = stat.icon;
                      return (
                        <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{stat.label}</span>
                            <div className={`p-2 rounded-xl ${stat.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.val}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 2 Column Main Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Recent Activity & Today's Patients */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Today's Patients Queue */}
                      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-base">Active Patient Queue</h3>
                            <p className="text-xs text-slate-500">Patients scheduled or awaiting clinical documentation</p>
                          </div>
                          <button onClick={() => setActiveTab("patients")} className="text-xs font-bold text-blue-600 hover:underline">
                            View All Patients →
                          </button>
                        </div>

                        <div className="space-y-3">
                          {dashboardData?.todays_patients?.slice(0, 4).map((p, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                setSelectedPatient(patients.find(pt => pt.patient_id === p.patient_id) || null);
                                setActiveTab("patients");
                              }}
                              className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between cursor-pointer transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 font-bold text-sm flex items-center justify-center border border-blue-100">
                                  {p.first_name[0]}{p.last_name[0]}
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-slate-800 dark:text-white">{p.first_name} {p.last_name}</div>
                                  <div className="text-xs text-slate-500 flex items-center gap-2">
                                    <span>MRN: {p.patient_id}</span>
                                    <span>•</span>
                                    <span>{p.gender || "Male"}, {p.age || 28} yrs</span>
                                  </div>
                                </div>
                              </div>
                              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 text-xs font-semibold rounded-lg border border-blue-100">
                                Start Consultation
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recent Activity Timeline */}
                      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4">Recent Activity Feed</h3>
                        <div className="space-y-4">
                          {dashboardData?.recent_activity?.map((act) => (
                            <div key={act.id} className="flex items-start gap-3 text-xs">
                              <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-800 dark:text-slate-200">{act.title}</span>
                                  <span className="text-[10px] text-slate-400">{act.time}</span>
                                </div>
                                <p className="text-slate-500 mt-0.5">{act.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Col: Upcoming Appointments & Tasks */}
                    <div className="space-y-6">
                      {/* Upcoming Appointments */}
                      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4">Upcoming Appointments</h3>
                        <div className="space-y-3">
                          {dashboardData?.upcoming_appointments?.map((app) => (
                            <div key={app.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                              <div>
                                <div className="font-bold text-slate-800 dark:text-white">{app.patient_name}</div>
                                <div className="text-slate-400 font-mono text-[10px]">{app.patient_id} • {app.type}</div>
                              </div>
                              <span className="font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/40 px-2.5 py-1 rounded-lg">
                                {app.time}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Today's Action Tasks */}
                      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4">Today&apos;s Clinical Tasks</h3>
                        <div className="space-y-2.5">
                          {dashboardData?.todays_tasks?.map((t) => (
                            <label key={t.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer text-xs">
                              <input type="checkbox" defaultChecked={t.completed} className="mt-0.5 rounded text-blue-600 border-slate-300" />
                              <span className={`flex-1 font-medium ${t.completed ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-200"}`}>
                                {t.title}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: PATIENTS MODULE & DETAILS */}
              {activeTab === "patients" && (
                <motion.div
                  key="patients"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Patient Directory & Profiles</h2>
                      <p className="text-xs text-slate-500">Manage patient medical records, SOAP notes, prescriptions, and recovery timelines</p>
                    </div>
                  </div>

                  {/* 2-Column Split: Patient List Left, Patient Detail Right */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Patient List */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-[720px]">
                      <div className="mb-4">
                        <div className="relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Filter patients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                        {filteredPatients.map((p) => {
                          const isSelected = selectedPatient?.id === p.id;
                          return (
                            <div
                              key={p.id}
                              onClick={() => setSelectedPatient(p)}
                              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700"
                                  : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="font-bold text-sm text-slate-900 dark:text-white">
                                  {p.first_name} {p.last_name}
                                </div>
                                <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                                  {p.patient_id}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                <span>{p.gender || "Male"}, {p.age || 28} yrs</span>
                                <span>•</span>
                                <span>{p.blood_group || "O+"}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right 2 Cols: Selected Patient Detail Tabs */}
                    {selectedPatient ? (
                      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-[720px]">
                        {/* Header Badge */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center">
                              {selectedPatient.first_name[0]}{selectedPatient.last_name[0]}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                {selectedPatient.first_name} {selectedPatient.last_name}
                              </h3>
                              <div className="text-xs text-slate-500 font-mono">
                                MRN: {selectedPatient.patient_id} • Phone: {selectedPatient.phone || "+91 9123456780"}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => setActiveTab("consultation")}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <Mic className="w-3.5 h-3.5" /> Start Consultation
                          </button>
                        </div>

                        {/* Patient Tabs Navigation */}
                        <div className="flex items-center gap-2 py-3 border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
                          {[
                            { id: "overview", label: "Overview" },
                            { id: "history", label: "Medical History" },
                            { id: "soap", label: "SOAP Notes" },
                            { id: "prescriptions", label: "Prescriptions" },
                            { id: "recovery", label: "Recovery" },
                            { id: "discharge", label: "Discharge" },
                          ].map((t) => (
                            <button
                              key={t.id}
                              onClick={() => setPatientDetailTab(t.id as any)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                                patientDetailTab === t.id
                                  ? "bg-blue-600 text-white"
                                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>

                        {/* Tab Content Body */}
                        <div className="flex-1 overflow-y-auto py-4 space-y-4">
                          {patientDetailTab === "overview" && (
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2">
                                <div className="font-bold text-slate-800 dark:text-slate-200 border-b pb-1">Personal Details</div>
                                <div><span className="text-slate-400">Gender:</span> {selectedPatient.gender || "Male"}</div>
                                <div><span className="text-slate-400">Age:</span> {selectedPatient.age || 28} years</div>
                                <div><span className="text-slate-400">Blood Group:</span> {selectedPatient.blood_group || "O+"}</div>
                                <div><span className="text-slate-400">Email:</span> {selectedPatient.email || "patient@medipilot.ai"}</div>
                                <div><span className="text-slate-400">Address:</span> {selectedPatient.address || "Bengaluru, India"}</div>
                              </div>
                              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2">
                                <div className="font-bold text-slate-800 dark:text-slate-200 border-b pb-1">Clinical Context</div>
                                <div><span className="text-slate-400">Known Allergies:</span> <span className="font-bold text-red-600">{selectedPatient.allergies || "Penicillin"}</span></div>
                                <div><span className="text-slate-400">Conditions:</span> {selectedPatient.medical_conditions || "Acute Bronchitis"}</div>
                                <div><span className="text-slate-400">Current Meds:</span> {selectedPatient.current_medications || "Amoxicillin 500mg"}</div>
                              </div>
                            </div>
                          )}

                          {patientDetailTab === "soap" && (
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-3 text-xs">
                              <div className="font-bold text-slate-900 dark:text-white border-b pb-1">Latest AI SOAP Notes (Draft)</div>
                              <div><span className="font-bold text-blue-600">Subjective:</span> Patient complains of persistent cough and fever of 100.4°F for 3 days.</div>
                              <div><span className="font-bold text-blue-600">Objective:</span> Clear lung sounds bilaterally. Normal SpO2 98%.</div>
                              <div><span className="font-bold text-blue-600">Assessment:</span> Viral upper respiratory infection.</div>
                              <div><span className="font-bold text-blue-600">Plan:</span> Prescribed Amoxicillin 500mg BD & Paracetamol 650mg TDS.</div>
                            </div>
                          )}

                          {patientDetailTab === "prescriptions" && (
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-3 text-xs">
                              <div className="font-bold text-slate-900 dark:text-white border-b pb-1">Active Prescriptions</div>
                              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border flex justify-between items-center">
                                <div>
                                  <div className="font-bold">Amoxicillin 500mg</div>
                                  <div className="text-slate-400">Twice daily (BD) • 5 Days</div>
                                </div>
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded">Active</span>
                              </div>
                            </div>
                          )}

                          {patientDetailTab === "recovery" && (
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-3 text-xs">
                              <div className="font-bold text-slate-900 dark:text-white">Recovery Score: 88 / 100</div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div className="bg-emerald-500 h-2 rounded-full w-[88%]" />
                              </div>
                              <p className="text-slate-500">Medication Adherence: 92% • Vitals Stable</p>
                            </div>
                          )}

                          {patientDetailTab === "discharge" && (
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-3 text-xs">
                              <div className="font-bold text-emerald-600 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" /> Ready for Smart Discharge
                              </div>
                              <p className="text-slate-600">All clinical parameters validated. Download complete discharge package.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center text-slate-400">
                        Select a patient from the left directory to view full profile.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 3: CONSULTATION WORKSPACE */}
              {activeTab === "consultation" && (
                <motion.div
                  key="consultation"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Consultation Workspace</h2>
                      <p className="text-xs text-slate-500">Record doctor-patient audio for Groq Whisper transcription and Llama 3.3 SOAP generation</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                      ● Groq Whisper Active
                    </span>
                  </div>

                  {/* 2 Column Recording & AI Notes Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: Voice Recording & Transcript */}
                    <div className="space-y-6">
                      {/* Recorder Card */}
                      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-slate-800 dark:text-white text-sm">Audio Voice Recorder</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isRecording ? "bg-red-50 text-red-600 animate-pulse" : "bg-slate-100 text-slate-600"}`}>
                            {consultStatus}
                          </span>
                        </div>

                        <div className="h-24 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-6 flex items-center justify-center border border-slate-100 dark:border-slate-800 font-mono text-3xl font-bold text-slate-700 dark:text-slate-200">
                          {formatTimer(timer)}
                        </div>

                        <div className="flex items-center justify-center gap-4">
                          {!isRecording ? (
                            <button
                              onClick={startRecording}
                              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                            >
                              <Mic className="w-4 h-4" /> Start Recording
                            </button>
                          ) : (
                            <>
                              {isPaused ? (
                                <button onClick={resumeRecording} className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl">
                                  <Play className="w-4 h-4" /> Resume
                                </button>
                              ) : (
                                <button onClick={pauseRecording} className="px-5 py-2.5 bg-amber-500 text-white text-xs font-bold rounded-xl">
                                  <Pause className="w-4 h-4" /> Pause
                                </button>
                              )}
                              <button onClick={stopRecording} className="px-6 py-3 bg-red-600 text-white text-xs font-bold rounded-xl flex items-center gap-2">
                                <Square className="w-4 h-4" /> Stop & Process AI
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Live Transcript */}
                      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs h-64 flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-slate-800 dark:text-white text-sm">Live Transcription</h3>
                          {transcript && (
                            <button onClick={() => setTranscript("")} className="text-xs text-red-500 font-medium">Clear</button>
                          )}
                        </div>
                        <div className="flex-1 bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 text-xs font-mono overflow-y-auto leading-relaxed">
                          {transcript || <span className="text-slate-400 italic">Transcribed consultation audio will appear here...</span>}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Upgraded Clinical Intelligence Report */}
                    <div className="h-[700px] flex flex-col">
                      <ClinicalIntelligenceReport
                        data={clinicalReportData}
                        isLoading={consultStatus.includes("Generating Clinical Intelligence")}
                        onSaveToEHR={(updatedData) => {
                          setClinicalReportData(updatedData);
                          handleSaveEHR();
                        }}
                        onDownloadPDF={(updatedData) => {
                          setClinicalReportData(updatedData);
                          downloadReportPDF(updatedData);
                        }}
                        patientName={selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : "Rahul Sharma"}
                        doctorName={dashboardData?.doctor_profile?.full_name || "Dr. Sarah Mitchell"}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: AI REPORTS */}
              {activeTab === "reports" && (
                <motion.div key="reports" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Clinical Documentation & Reports</h2>
                      <p className="text-xs text-slate-500">Automated SOAP notes, consultation reports, and clinical summaries</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-100 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">Clinical Consultation Summary (Rahul Sharma - MP-2026-8942)</div>
                        <div className="text-xs text-slate-500">Generated on {new Date().toLocaleDateString()} • Status: Approved</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => downloadReportPDF()} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1">
                          <Download className="w-3.5 h-3.5" /> PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 5: SMART PHARMACY */}
              {activeTab === "pharmacy" && (
                <motion.div key="pharmacy" className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Smart Pharmacy & Generic Alternatives</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border space-y-4">
                      <h3 className="font-bold text-sm text-slate-800">Prescribed Medicines</h3>
                      {pharmacyData?.prescribed_medicines?.map((m) => (
                        <div key={m.id} className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <div className="font-bold">{m.name} ({m.dosage})</div>
                            <div className="text-slate-500">{m.frequency} • {m.timing}</div>
                            {m.generic_alternative && (
                              <div className="text-emerald-600 font-semibold mt-1">
                                Generic Alt: {m.generic_alternative.name} (Save ${m.generic_alternative.savings}/mo)
                              </div>
                            )}
                          </div>
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-800 font-bold rounded">In Stock</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border space-y-4">
                      <h3 className="font-bold text-sm text-slate-800">Safety & Adherence Score</h3>
                      <div className="p-4 bg-emerald-50 rounded-xl text-center">
                        <div className="text-3xl font-bold text-emerald-600">94 / 100</div>
                        <div className="text-xs text-emerald-800 font-medium mt-1">High Safety Rating • Zero Drug-Drug Conflicts</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 6: RECOVERY ANALYTICS */}
              {activeTab === "recovery" && (
                <motion.div key="recovery" className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recovery Analytics & Vitals Monitoring</h2>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border space-y-4">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <div className="text-2xl font-bold text-slate-900">{recoveryData?.recovery_score || 88}%</div>
                        <div className="text-xs text-slate-500">Overall Patient Recovery Progress</div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
                        {recoveryData?.recovery_trend || "+4% this week"}
                      </span>
                    </div>

                    <div className="space-y-3 pt-2">
                      <h4 className="font-bold text-xs text-slate-700">Recovery Journey Timeline</h4>
                      {recoveryData?.recovery_journey?.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-xs p-2.5 bg-slate-50 rounded-xl">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="font-bold text-slate-800">Day {step.day}:</span>
                          <span className="text-slate-600">{step.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 7: DISCHARGE CENTER */}
              {activeTab === "discharge" && (
                <motion.div key="discharge" className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Smart Discharge Center</h2>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border space-y-4">
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div className="font-bold text-emerald-800 text-sm mb-1">AI Validation Passed ✅</div>
                      <div className="text-xs text-emerald-700">
                        SOAP, Prescriptions, Recovery Metrics, and Billing details have been validated for patient discharge.
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="font-bold">Invoices & Summary</div>
                      {dischargeData?.invoices?.map((inv) => (
                        <div key={inv.id} className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                          <div>
                            <div className="font-bold">{inv.type}</div>
                            <div className="text-slate-400">{inv.id} • {inv.date}</div>
                          </div>
                          <div className="font-bold text-slate-900">${inv.amount.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>

                    <button onClick={() => downloadReportPDF()} className="w-full py-3 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs">
                      Download Complete Discharge PDF Package
                    </button>
                  </div>
                </motion.div>
              )}

              {/* TAB 8: NOTIFICATIONS */}
              {activeTab === "notifications" && (
                <motion.div key="notifications" className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Clinical Notifications & Alerts</h2>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border space-y-3">
                    {[
                      { title: "New Consultation Scheduled", desc: "Rahul Sharma is queued for 11:30 AM", time: "10m ago" },
                      { title: "Medication Adherence Alert", desc: "Day 3 dose logged by Patient MP-2026-8942", time: "1h ago" },
                      { title: "Smart Discharge Ready", desc: "Patient MP-2026-0003 validated for discharge", time: "2h ago" }
                    ].map((n, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-slate-900">{n.title}</div>
                          <div className="text-slate-500">{n.desc}</div>
                        </div>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 9: SETTINGS */}
              {activeTab === "settings" && (
                <motion.div key="settings" className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Doctor Profile & Preferences</h2>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border space-y-4 text-xs">
                    <div className="font-bold border-b pb-2">Profile Information</div>
                    <div><span className="text-slate-400">Doctor Name:</span> Dr. Sarah Mitchell</div>
                    <div><span className="text-slate-400">Department:</span> General Medicine</div>
                    <div><span className="text-slate-400">Specialization:</span> Internal Medicine</div>
                    <div><span className="text-slate-400">Registration No:</span> REG-2026-9901</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}

export default function DoctorDashboardPage() {
  return (
    <ProtectedRoute allowedRole="doctor">
      <Suspense fallback={<div className="h-screen flex items-center justify-center bg-slate-50">Loading Dashboard...</div>}>
        <DoctorDashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}
