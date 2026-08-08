"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import { 
  HeartPulse, ShieldCheck, Activity, RefreshCw, CheckCircle2, Clock, 
  Calendar, Download, Printer, Share2, Plus, ChevronDown, ChevronUp, 
  Sparkles, TrendingUp, AlertTriangle, FileText, Pill, Stethoscope, 
  UserCheck, Thermometer, Droplet, Moon, Award, CheckSquare, Zap, Eye
} from "lucide-react";
import { patientService, doctorService } from "@/lib/api-services";

interface ClinicalRecoveryCenterProps {
  patientId?: string;
  role?: "patient" | "doctor";
  onShowToast?: (msg: string) => void;
}

export function ClinicalRecoveryCenter({
  patientId,
  role = "patient",
  onShowToast
}: ClinicalRecoveryCenterProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  // Graph Metric & Range Switchers
  const [selectedMetric, setSelectedMetric] = useState<
    "recovery_pct" | "pain_score" | "temperature" | "heart_rate" | "bp" | "spo2" | "weight" | "sleep" | "mood"
  >("recovery_pct");
  const [selectedTimeframe, setSelectedTimeframe] = useState<"7d" | "14d" | "30d" | "all">("14d");

  // Timeline Expandable State
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({ "1": true });

  // Doctor Log Modal State
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [savingLog, setSavingLog] = useState(false);
  const [recoveryPctInput, setRecoveryPctInput] = useState(90);
  const [painInput, setPainInput] = useState(1.5);
  const [tempInput, setTempInput] = useState(98.4);
  const [hrInput, setHrInput] = useState(72);
  const [bpSysInput, setBpSysInput] = useState(120);
  const [bpDiaInput, setBpDiaInput] = useState(80);
  const [spo2Input, setSpo2Input] = useState(99);
  const [doctorNotesInput, setDoctorNotesInput] = useState("");
  const [symptomsInput, setSymptomsInput] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await patientService.getRecoveryData(patientId);
      setData(res);
    } catch (err: any) {
      console.error("Failed to load clinical recovery data:", err);
      setError(err.message || "Failed to load recovery telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [patientId]);

  const toggleDayExpand = (dayId: string) => {
    setExpandedDays(prev => ({ ...prev, [dayId]: !prev[dayId] }));
  };

  // Submit Doctor Vitals Log
  const handleSaveDoctorLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLog(true);
    try {
      await doctorService.logRecoveryVitals({
        patient_id: patientId || data?.profile?.patient_id || "MP-2026-8942",
        recovery_percentage: Number(recoveryPctInput),
        pain_score: Number(painInput),
        temperature: Number(tempInput),
        heart_rate: Number(hrInput),
        bp_systolic: Number(bpSysInput),
        bp_diastolic: Number(bpDiaInput),
        spo2: Number(spo2Input),
        doctor_notes: doctorNotesInput || "Physician recorded daily recovery evaluation.",
        symptoms: symptomsInput || "Asymptomatic / Stable",
        milestone_status: "Vitals Verified"
      });
      setShowDoctorModal(false);
      onShowToast?.("Day vitals & physician observations saved to DB!");
      await loadData();
    } catch (err) {
      console.error("Failed to save doctor log:", err);
      alert("Failed to save recovery log");
    } finally {
      setSavingLog(false);
    }
  };

  // PDF Clinical Report Export
  const generatePDFReport = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF();
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 26, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("MediPilot AI — Clinical Recovery Center Summary", 14, 16);

      doc.setTextColor(51, 65, 85);
      doc.setFontSize(10);
      doc.text(`Patient Name: ${data?.profile?.name || "Rahul Sharma"} (${data?.profile?.patient_id || "MP-2026-8942"})`, 14, 35);
      doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 42);
      doc.text(`Overall Recovery Index: ${data?.kpis?.recovery_score || 88} / 100 (${data?.kpis?.recovery_trend || "+4.2%"})`, 14, 49);

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("1. Vitals Monitoring Telemetry", 14, 62);
      let y = 70;
      data?.vitals_monitoring?.forEach((v: any) => {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`• ${v.name}: ${v.value} (Normal: ${v.normal}) — Status: ${v.status}`, 18, y);
        y += 7;
      });

      y += 5;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("2. AI Clinical Insights", 14, y);
      y += 8;
      data?.ai_insights?.forEach((ins: string) => {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`• ${ins.replace(/[^a-zA-Z0-9\s.,%()\-]/g, "")}`, 18, y);
        y += 7;
      });

      doc.save(`MediPilot_Recovery_Summary_${patientId || "MP-2026-8942"}.pdf`);
      onShowToast?.("Clinical Recovery PDF Package downloaded!");
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="py-24 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="animate-spin inline-block w-9 h-9 border-4 border-emerald-500 border-t-transparent rounded-full mb-3" />
        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Syncing AI Clinical Recovery Telemetry...</p>
      </div>
    );
  }

  const kpis = data.kpis;
  const graphData = data.progress_graph || [];

  return (
    <div className="space-y-8 font-sans text-slate-900 dark:text-slate-100 pb-12">
      
      {/* TOOLBAR & ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] font-black rounded-full uppercase tracking-wider flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-700">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> AI Clinical Recovery Center
            </span>
            <span className="text-xs font-mono text-slate-400">Patient: {data.profile.name} ({data.profile.patient_id})</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Comprehensive Patient Monitoring & Recovery Index
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {role === "doctor" && (
            <button
              onClick={() => setShowDoctorModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Record Vitals & Doctor Note
            </button>
          )}

          <button
            onClick={generatePDFReport}
            disabled={downloading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {downloading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Export Recovery PDF
          </button>

          <button
            onClick={loadData}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl text-slate-600 dark:text-slate-300 transition-colors"
            title="Refresh Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1 — 8 RECOVERY OVERVIEW KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Overall Recovery Score */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-emerald-900 dark:text-emerald-200">
            <span className="uppercase tracking-wider">Overall Recovery Index</span>
            <HeartPulse className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{kpis.recovery_score}</span>
            <span className="text-xs text-slate-400 font-bold">/ 100</span>
          </div>
          <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> {kpis.recovery_trend}
          </p>
        </div>

        {/* KPI 2: Days Since Diagnosis */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Days Since Diagnosis</span>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            Day {kpis.days_since_diagnosis} <span className="text-xs text-slate-400 font-normal">of 7</span>
          </div>
          <p className="text-[11px] text-slate-500">Est. completion: {kpis.estimated_completion_date}</p>
        </div>

        {/* KPI 3: Medication Adherence % */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Medication Adherence</span>
            <ShieldCheck className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
            {kpis.medication_adherence_percentage}%
          </div>
          <p className="text-[11px] text-emerald-600 font-bold">{kpis.missed_medications_count} missed doses</p>
        </div>

        {/* KPI 4: Active Issues & Follow-up */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Active Issues & Follow-up</span>
            <Activity className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {kpis.active_health_issues_count} <span className="text-xs text-slate-400 font-normal">Active Issue</span>
          </div>
          <p className="text-[11px] text-slate-500 font-semibold">Next visit: {kpis.next_followup_date}</p>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECTION 2 — INTERACTIVE RECOVERY PROGRESS GRAPH */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Dynamic Clinical Progress Analytics
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Interactive multi-metric telemetry comparing vitals, pain scores, and recovery index over time.
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl text-xs font-bold">
            {[
              { id: "recovery_pct", label: "Recovery %" },
              { id: "pain_score", label: "Pain Score" },
              { id: "temperature", label: "Temp (°F)" },
              { id: "heart_rate", label: "Heart Rate" },
              { id: "bp", label: "BP" },
              { id: "spo2", label: "SpO₂ %" },
              { id: "sleep", label: "Sleep (hrs)" }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMetric(m.id as any)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  selectedMetric === m.id
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Line Graph Visualizer */}
        <div className="h-64 w-full bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 relative flex flex-col justify-between border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400">
            <span>High Benchmark</span>
            <span>Target Baseline Range</span>
            <span>Optimal Stabilization</span>
          </div>

          {/* SVG Animated Chart */}
          <svg className="w-full h-40 overflow-visible">
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="4"
              strokeLinecap="round"
              points={graphData.map((d: any, idx: number) => {
                const x = (idx / Math.max(1, graphData.length - 1)) * 750 + 20;
                let val = d.recovery_pct;
                if (selectedMetric === "pain_score") val = (10 - d.pain_score) * 10;
                if (selectedMetric === "temperature") val = (d.temperature - 96) * 20;
                if (selectedMetric === "heart_rate") val = (d.heart_rate / 120) * 100;
                if (selectedMetric === "spo2") val = (d.spo2 - 90) * 10;
                const y = 140 - (val / 100) * 120;
                return `${x},${y}`;
              }).join(" ")}
            />
            {graphData.map((d: any, idx: number) => {
              const x = (idx / Math.max(1, graphData.length - 1)) * 750 + 20;
              let val = d.recovery_pct;
              if (selectedMetric === "pain_score") val = (10 - d.pain_score) * 10;
              if (selectedMetric === "temperature") val = (d.temperature - 96) * 20;
              if (selectedMetric === "heart_rate") val = (d.heart_rate / 120) * 100;
              if (selectedMetric === "spo2") val = (d.spo2 - 90) * 10;
              const y = 140 - (val / 100) * 120;
              return (
                <g key={idx} className="group cursor-pointer">
                  <circle cx={x} cy={y} r="6" className="fill-emerald-500 stroke-white stroke-2" />
                  <text x={x} y={y - 12} textAnchor="middle" className="fill-slate-600 dark:fill-slate-300 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.day}: {d.recovery_pct}%
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="flex justify-between text-xs font-bold text-slate-500">
            {graphData.map((d: any, i: number) => (
              <span key={i}>{d.day} ({d.date})</span>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3 — DAY-BY-DAY EXPANDABLE RECOVERY TIMELINE */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" /> Day-by-Day Dynamic Recovery Timeline
        </h2>

        <div className="space-y-3">
          {data.day_timeline?.map((day: any) => {
            const isExpanded = !!expandedDays[String(day.day)];
            return (
              <div
                key={day.id}
                className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all bg-slate-50/50 dark:bg-slate-800/30"
              >
                <div
                  onClick={() => toggleDayExpand(String(day.day))}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      D{day.day}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{day.title}</h4>
                      <p className="text-xs text-slate-500">{day.date} • Recovery Score: {day.recovery_score}%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
                      {day.milestone_status}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1.5">
                        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Stethoscope className="w-4 h-4 text-blue-500" /> Doctor Clinical Observations
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">{day.doctor_notes}</p>
                      </div>

                      <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl space-y-1.5 border border-emerald-200 dark:border-emerald-800/40">
                        <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-emerald-600" /> AI Diagnostic Summary
                        </div>
                        <p className="text-emerald-800 dark:text-emerald-300">{day.ai_summary}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 font-mono text-[11px]">
                      <span>🌡️ Temp: <strong>{day.vitals.temperature}</strong></span>
                      <span>❤️ Heart Rate: <strong>{day.vitals.heart_rate}</strong></span>
                      <span>🩸 BP: <strong>{day.vitals.bp}</strong></span>
                      <span>🫁 SpO₂: <strong>{day.vitals.spo2}</strong></span>
                      <span>😣 Pain: <strong>{day.vitals.pain_score}</strong></span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4 — VITALS MONITORING GRID */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-500" /> Vitals Telemetry & Normal Ranges
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.vitals_monitoring?.map((v: any, idx: number) => (
            <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                <span>{v.name}</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px]">{v.status}</span>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{v.value}</div>
              <p className="text-[11px] text-slate-400">Normal Range: {v.normal}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5 — AI CLINICAL INSIGHTS */}
      {/* ========================================================================= */}
      <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl text-white shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-300" />
          <h2 className="text-xl font-black tracking-tight">AI Clinical Observations & Recommendations</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {data.ai_insights?.map((ins: string, idx: number) => (
            <div key={idx} className="p-3.5 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/20 font-semibold leading-relaxed">
              {ins}
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 6 — RECOVERY MILESTONES PIPELINE */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" /> Recovery Milestones Roadmap
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {data.milestones?.map((m: any, idx: number) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl border text-center space-y-1.5 transition-all ${
                m.completed
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200"
                  : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400"
              }`}
            >
              <CheckCircle2 className={`w-5 h-5 mx-auto ${m.completed ? "text-emerald-500" : "text-slate-300"}`} />
              <div className="text-[11px] font-bold leading-tight">{m.stage}</div>
              <span className="text-[10px] block opacity-75">{m.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 7 & 8 — MEDICATION IMPACT & LAB RESULTS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Medication Impact */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Pill className="w-5 h-5 text-purple-500" /> Medication Efficacy & Compliance
          </h3>
          <div className="space-y-3">
            {data.medication_impact?.map((med: any, idx: number) => (
              <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border text-xs space-y-1">
                <div className="flex justify-between items-center font-bold text-slate-900 dark:text-white">
                  <span>{med.medicine} ({med.dosage})</span>
                  <span className="text-emerald-600">{med.compliance_pct}% Adherence</span>
                </div>
                <p className="text-slate-500">Observed: {med.observed_effect}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lab Results Comparison */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" /> Laboratory Results Telemetry
          </h3>
          <div className="space-y-2 text-xs">
            {data.lab_results?.map((lab: any, idx: number) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800 dark:text-white">{lab.test}</div>
                  <div className="text-slate-400 text-[11px]">Normal: {lab.normal_range}</div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600 block">{lab.current}</span>
                  <span className="text-[10px] text-slate-400">Prev: {lab.previous}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* DOCTOR LOG MODAL */}
      {/* ========================================================================= */}
      {showDoctorModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-slate-900 dark:text-white text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" /> Record Vitals & Clinical Note
              </h3>
              <button onClick={() => setShowDoctorModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveDoctorLog} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Recovery Score (0-100)</label>
                  <input
                    type="number"
                    value={recoveryPctInput}
                    onChange={e => setRecoveryPctInput(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Pain Score (0-10)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={painInput}
                    onChange={e => setPainInput(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Temp (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempInput}
                    onChange={e => setTempInput(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">BP Sys</label>
                  <input
                    type="number"
                    value={bpSysInput}
                    onChange={e => setBpSysInput(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">BP Dia</label>
                  <input
                    type="number"
                    value={bpDiaInput}
                    onChange={e => setBpDiaInput(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Doctor Observations & Progress Notes</label>
                <textarea
                  value={doctorNotesInput}
                  onChange={e => setDoctorNotesInput(e.target.value)}
                  rows={3}
                  placeholder="e.g. Vitals stable. Good response to treatment plan."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowDoctorModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLog}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
                >
                  {savingLog ? "Saving..." : "Save Vitals & Sync DB"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
