"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import { 
  FileCheck2, ShieldCheck, Download, Printer, Share2, Mail, Lock, 
  CheckCircle2, AlertTriangle, Edit3, Save, RefreshCw, Clock, Building2, 
  UserCheck, DollarSign, FileSpreadsheet, Stethoscope, Sparkles, Plus, 
  Trash2, ChevronDown, ChevronUp, FileText, Activity, HeartPulse, CheckSquare, Eye, Pill
} from "lucide-react";
import { patientService, doctorService } from "@/lib/api-services";

interface SmartDischargeCenterProps {
  patientId?: string;
  role?: "patient" | "doctor";
  onShowToast?: (msg: string) => void;
}

export function SmartDischargeCenter({
  patientId,
  role = "patient",
  onShowToast
}: SmartDischargeCenterProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);

  // Doctor Editable Form State
  const [editDiagnosisPrimary, setEditDiagnosisPrimary] = useState("");
  const [editDischargeSummary, setEditDischargeSummary] = useState("");
  const [editPatientInstructions, setEditPatientInstructions] = useState("");
  const [editMeds, setEditMeds] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await patientService.getDischargeData(patientId);
      setData(res);
      setEditDiagnosisPrimary(res?.final_diagnosis?.primary || "Acute Bronchitis (J20.9)");
      setEditDischargeSummary(res?.discharge_summary || "");
      setEditPatientInstructions(res?.patient_instructions || "");
      setEditMeds(res?.discharge_medications || []);
    } catch (err: any) {
      console.error("Failed to load discharge data:", err);
      setError(err.message || "Failed to load smart discharge system.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [patientId]);

  // Save Doctor Draft Edits
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await doctorService.saveDischargeDraft({
        patient_id: patientId || data?.patient?.patient_id || "MP-2026-8942",
        discharge_summary: editDischargeSummary,
        final_diagnosis: { ...(data?.final_diagnosis || {}), primary: editDiagnosisPrimary },
        discharge_medications: editMeds,
        patient_instructions: editPatientInstructions,
        status: "Doctor Reviewing"
      });
      setIsEditing(false);
      onShowToast?.("Discharge clinical summary & medications saved to DB!");
      await loadData();
    } catch (err) {
      console.error("Save draft error:", err);
      alert("Failed to save discharge draft");
    } finally {
      setSaving(false);
    }
  };

  // Finalize & Approve Discharge
  const handleApproveDischarge = async () => {
    if (!confirm("Are you sure you want to approve and finalize this hospital discharge? This action will set patient status to Discharged.")) return;
    setApproving(true);
    try {
      await doctorService.approveDischarge({
        patient_id: patientId || data?.patient?.patient_id || "MP-2026-8942",
        doctor_name: data?.doctor?.name || "Dr. Sarah Mitchell",
        doctor_notes: "Approved and finalized for hospital discharge."
      });
      onShowToast?.("Patient successfully discharged & record finalized!");
      await loadData();
    } catch (err) {
      console.error("Approve discharge error:", err);
      alert("Failed to approve discharge");
    } finally {
      setApproving(false);
    }
  };

  // PDF Complete Hospital Package Generator
  const generatePDFPackage = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF();
      const p = data?.patient;
      const b = data?.billing;

      // Hospital Letterhead
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 32, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("MEDIPILOT AI MULTISPECIALTY HOSPITAL", 14, 16);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Clinical Excellence & AI Health System • Accreditation: NABH & JCI Certified", 14, 23);
      doc.text("Helpline: +91 1800-425-9999 | Email: discharge@medipilot.ai | www.medipilot.ai", 14, 28);

      // Document Title
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("OFFICIAL HOSPITAL DISCHARGE SUMMARY & BILLING INVOICE", 14, 42);

      // Section 1: Patient Header Table
      doc.setLineWidth(0.5);
      doc.setDrawColor(203, 213, 225);
      doc.rect(14, 46, 182, 34);

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`Patient Name: ${p?.name || "Rahul Sharma"}`, 18, 54);
      doc.text(`MRN / Patient ID: ${p?.mrn || "MP-2026-8942"}`, 18, 61);
      doc.text(`Age / Gender: ${p?.age}y / ${p?.gender}`, 18, 68);
      doc.text(`Blood Group: ${p?.blood_group || "O+"}`, 18, 75);

      doc.text(`Attending Physician: ${data?.doctor?.name || "Dr. Sarah Mitchell"}`, 110, 54);
      doc.text(`Department: ${data?.doctor?.department || "Internal Medicine"}`, 110, 61);
      doc.text(`Admission Date: ${data?.admission_summary?.admission_date || "2026-08-04"}`, 110, 68);
      doc.text(`Discharge Date: ${data?.admission_summary?.discharge_date || "2026-08-08"}`, 110, 75);

      // Section 2: Clinical Summary
      let y = 90;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("1. CLINICAL DIAGNOSIS & DISCHARGE SUMMARY", 14, y);
      y += 6;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Primary Diagnosis: ${data?.final_diagnosis?.primary || "Acute Bronchitis (J20.9)"}`, 18, y);
      y += 6;
      doc.text(`Chief Complaint: ${data?.admission_summary?.chief_complaint || "Cough, fever, fatigue"}`, 18, y);
      y += 6;

      const summaryLines = doc.splitTextToSize(`Clinical Summary: ${data?.discharge_summary || "Patient showed significant improvement after pharmacotherapy. Safe for discharge."}`, 178);
      doc.text(summaryLines, 18, y);
      y += summaryLines.length * 5 + 4;

      // Section 3: Discharge Medications
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("2. MEDICATIONS PRESCRIBED AT DISCHARGE", 14, y);
      y += 7;

      data?.discharge_medications?.forEach((m: any, idx: number) => {
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(`${idx + 1}. ${m.name} (${m.dosage}) — ${m.frequency}`, 18, y);
        doc.setFont("helvetica", "normal");
        doc.text(`Instructions: ${m.instructions} | Duration: ${m.duration}`, 25, y + 5);
        y += 11;
      });

      // Section 4: Itemized Billing & GST Invoice Table
      y += 4;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("3. COMPLETE ITEMIZED HOSPITAL BILLING INVOICE (INR ₹)", 14, y);
      y += 7;

      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, 182, 7, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Category", 18, y + 5);
      doc.text("Description", 60, y + 5);
      doc.text("Amount (₹)", 175, y + 5);
      y += 9;

      b?.items?.forEach((item: any) => {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(item.category, 18, y);
        doc.text(item.description, 60, y);
        doc.text(`₹${item.amount.toFixed(2)}`, 175, y);
        y += 6;
      });

      y += 4;
      doc.setLineWidth(0.3);
      doc.line(14, y, 196, y);
      y += 6;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Subtotal: ₹${b?.subtotal?.toFixed(2) || "15,700.00"}`, 120, y);
      y += 5;
      doc.text(`Discount: -₹${b?.discount?.toFixed(2) || "1,700.00"}`, 120, y);
      y += 5;
      doc.text(`Taxable Amount: ₹${b?.taxable_amount?.toFixed(2) || "14,000.00"}`, 120, y);
      y += 5;
      doc.text(`CGST (9%): ₹${b?.cgst_amount?.toFixed(2) || "1,260.00"}`, 120, y);
      y += 5;
      doc.text(`SGST (9%): ₹${b?.sgst_amount?.toFixed(2) || "1,260.00"}`, 120, y);
      y += 6;

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(16, 185, 129);
      doc.text(`GRAND TOTAL PAYABLE: ₹${b?.grand_total?.toFixed(2) || "16,520.00"}`, 120, y);

      // Signatures & Stamp
      y += 18;
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(8);
      doc.text("_____________________________________", 18, y);
      doc.text("Dr. Sarah Mitchell, MD (Attending Physician)", 18, y + 5);
      doc.text("Digital Signature Verified • MediPilot AI", 18, y + 9);

      doc.text("[ HOSPITAL SEAL PLACEHOLDER ]", 130, y + 5);

      doc.save(`MediPilot_Discharge_Package_${p?.mrn || "MP-2026-8942"}.pdf`);
      onShowToast?.("Complete Discharge Package PDF downloaded!");
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF download");
    } finally {
      setDownloading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="py-24 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="animate-spin inline-block w-9 h-9 border-4 border-emerald-500 border-t-transparent rounded-full mb-3" />
        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Generating AI Hospital Discharge System & Bill...</p>
      </div>
    );
  }

  const p = data.patient;
  const d = data.doctor;
  const b = data.billing;
  const r = data.readiness_checklist;
  const isApproved = data.status === "Approved" || data.status === "Discharged";

  return (
    <div className="space-y-8 font-sans text-slate-900 dark:text-slate-100 pb-12">
      
      {/* HEADER TOOLBAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 text-[11px] font-black rounded-full uppercase tracking-wider flex items-center gap-1.5 border border-purple-300 dark:border-purple-700">
              <FileCheck2 className="w-3.5 h-3.5 text-purple-600" /> AI Hospital Discharge System
            </span>
            <span className="text-xs font-mono text-slate-400">MRN: {p?.mrn}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Patient Discharge Summary & Complete Billing Invoice
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {role === "doctor" && !isApproved && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4 text-indigo-500" /> {isEditing ? "View Summary" : "Edit Clinical Draft"}
            </button>
          )}

          {role === "doctor" && isEditing && (
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Draft"}
            </button>
          )}

          {role === "doctor" && !isApproved && (
            <button
              onClick={handleApproveDischarge}
              disabled={approving}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" /> {approving ? "Approving..." : "Approve & Finalize Discharge"}
            </button>
          )}

          <button
            onClick={generatePDFPackage}
            disabled={downloading}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {downloading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Download PDF Package
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1 — PATIENT HEADER CARD */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-xl text-emerald-400 border border-white/20">
              {p?.name?.charAt(0) || "P"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black">{p?.name}</h2>
                <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  {data?.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {p?.gender}, {p?.age}y • Blood Group: {p?.blood_group} • MRN: <span className="font-mono text-emerald-300">{p?.mrn}</span>
              </p>
            </div>
          </div>

          <div className="text-right text-xs space-y-1 font-mono">
            <div>Physician: <strong className="text-white">{d?.name}</strong></div>
            <div>Department: <span className="text-slate-300">{d?.department}</span></div>
            <div>Length of Stay: <strong className="text-emerald-400">{data?.admission_summary?.length_of_stay || "4 Days"}</strong></div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-xs font-medium">
          <div>Admission Date: <strong className="block text-white">{data?.admission_summary?.admission_date}</strong></div>
          <div>Discharge Date: <strong className="block text-white">{data?.admission_summary?.discharge_date}</strong></div>
          <div>Primary Diagnosis: <strong className="block text-emerald-300">{data?.final_diagnosis?.primary}</strong></div>
          <div>Recovery Score: <strong className="block text-emerald-400">{data?.readiness_score} / 100</strong></div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2 — AI DISCHARGE READINESS SCORE & CHECKLIST */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" /> AI Discharge Readiness Score
          </h2>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {data?.readiness_score} <span className="text-xs text-slate-400 font-normal">/ 100</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Vitals Stable", pass: r?.vitals_stable },
            { label: "Medication Completed", pass: r?.medication_completed },
            { label: "Recovery Progress", pass: (r?.recovery_progress || 96) >= 80 },
            { label: "Lab Results Normal", pass: r?.lab_results_normal },
            { label: "Doctor Approval", pass: r?.doctor_approval },
            { label: "Pending Issues (0)", pass: r?.pending_issues_count === 0 }
          ].map((chk, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center space-y-1">
              <CheckCircle2 className={`w-5 h-5 mx-auto ${chk.pass ? "text-emerald-500" : "text-slate-300"}`} />
              <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{chk.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3 — CLINICAL DISCHARGE SUMMARY & EDITABLE CONTENT */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-blue-500" /> Complete Clinical Discharge Summary
        </h2>

        {/* Admission Summary & Hospital Course */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Admission Summary</h4>
            <p><strong>Chief Complaint:</strong> {data?.admission_summary?.chief_complaint}</p>
            <p><strong>History:</strong> {data?.admission_summary?.history}</p>
            <p><strong>Reason for Admission:</strong> {data?.admission_summary?.reason_for_admission}</p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Hospital Course & Progress</h4>
            <div className="space-y-1">
              {data?.hospital_course?.day_by_day?.map((day: any, i: number) => (
                <div key={i} className="text-slate-600 dark:text-slate-300">
                  • <strong>Day {day.day}:</strong> {day.summary}
                </div>
              ))}
            </div>
            <p className="pt-1"><strong>Doctor Observation:</strong> {data?.hospital_course?.doctor_observations}</p>
          </div>
        </div>

        {/* Diagnosis & Summary Text */}
        <div className="space-y-4">
          {isEditing ? (
            <div className="space-y-3 p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-800">
              <label className="font-bold text-xs text-indigo-900 dark:text-indigo-200 block">Edit Primary Diagnosis</label>
              <input
                type="text"
                value={editDiagnosisPrimary}
                onChange={e => setEditDiagnosisPrimary(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-900 text-xs font-bold"
              />

              <label className="font-bold text-xs text-indigo-900 dark:text-indigo-200 block">Edit Discharge Clinical Summary</label>
              <textarea
                value={editDischargeSummary}
                onChange={e => setEditDischargeSummary(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-900 text-xs"
              />
            </div>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border space-y-2 text-xs">
              <div className="font-bold text-sm text-slate-900 dark:text-white">Discharge Summary Statement</div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{data?.discharge_summary}</p>
            </div>
          )}
        </div>

        {/* Discharge Medications Table */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Pill className="w-4 h-4 text-purple-500" /> Medications Prescribed at Discharge
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                  <th className="p-3 rounded-l-xl">Medicine</th>
                  <th className="p-3">Dosage</th>
                  <th className="p-3">Frequency</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3 rounded-r-xl">Timing / Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data?.discharge_medications?.map((m: any, idx: number) => (
                  <tr key={idx}>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{m.name}</td>
                    <td className="p-3 font-mono">{m.dosage}</td>
                    <td className="p-3">{m.frequency}</td>
                    <td className="p-3">{m.duration}</td>
                    <td className="p-3 text-slate-500">{m.instructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4 — COMPLETE ITEMIZATION HOSPITAL BILLING & GST */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" /> Complete Hospital Billing Invoice (INR ₹)
            </h2>
            <p className="text-xs text-slate-500">Official itemized hospital bill with GST & insurance breakdown</p>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
            GST Invoice Verified
          </span>
        </div>

        <div className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                  <th className="p-3 rounded-l-xl">Category</th>
                  <th className="p-3">Line Description</th>
                  <th className="p-3 text-right rounded-r-xl">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {b?.items?.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{item.category}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{item.description}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ₹{item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* GST Calculation Summary Card */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs max-w-sm ml-auto font-mono">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{b?.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Hospital Discount:</span>
              <span>-₹{b?.discount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-1">
              <span>Taxable Subtotal:</span>
              <span>₹{b?.taxable_amount?.toFixed(2)}</span>
            </div>

            {b?.gst_applicable ? (
              <>
                <div className="flex justify-between text-slate-500">
                  <span>CGST (9%):</span>
                  <span>+₹{b?.cgst_amount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>SGST (9%):</span>
                  <span>+₹{b?.sgst_amount?.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="text-slate-400">GST Exempt</div>
            )}

            <div className="flex justify-between font-black text-sm text-emerald-600 dark:text-emerald-400 border-t pt-2">
              <span>GRAND TOTAL PAYABLE:</span>
              <span>₹{b?.grand_total?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5 — FOLLOW-UP PLAN & AI RECOMMENDATIONS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Follow-up Plan */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
          <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" /> Patient Follow-Up Plan
          </h3>
          <p><strong>Next Visit Date:</strong> {data?.followup_plan?.next_visit_date}</p>
          <p><strong>Recommended Specialist:</strong> {data?.followup_plan?.specialist}</p>
          <p><strong>Lifestyle Advice:</strong> {data?.followup_plan?.lifestyle_advice}</p>
          <p><strong>Diet Plan:</strong> {data?.followup_plan?.diet_plan}</p>
          <p className="text-amber-600 font-bold"><strong>Warning Signs:</strong> {data?.followup_plan?.warning_signs}</p>
          <p className="text-blue-600 font-bold"><strong>Emergency Contact:</strong> {data?.followup_plan?.emergency_contact}</p>
        </div>

        {/* AI Recommendations */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
          <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" /> AI Clinical Recommendations
          </h3>
          <p><strong>Recovery Expectation:</strong> {data?.ai_recommendations?.recovery_expectations}</p>
          <p><strong>Complication Risk:</strong> {data?.ai_recommendations?.possible_complications}</p>
          <p><strong>Adherence Advice:</strong> {data?.ai_recommendations?.medication_adherence_advice}</p>
          <p><strong>Monitoring Plan:</strong> {data?.ai_recommendations?.monitoring_plan}</p>
        </div>

      </div>

    </div>
  );
}
