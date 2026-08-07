"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Stethoscope,
  User,
  ShieldCheck,
  Activity,
  Pill,
  ShoppingBag,
  FileText,
  HeartPulse,
  ArrowRight,
  Sparkles,
  Lock,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  const { userProfile, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userProfile) {
      if (role === "doctor") {
        router.replace("/doctor/dashboard");
      } else if (role === "patient") {
        router.replace("/patient/dashboard");
      }
    }
  }, [loading, userProfile, role, router]);

  // While checking authentication state, render minimal clean loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, do not render landing page content while redirecting
  if (userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      
      {/* HEADER / NAVIGATION */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">MediPilot AI</span>
              <span className="text-[10px] uppercase font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-md tracking-wider">
                Enterprise
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/doctor/login"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Stethoscope className="w-3.5 h-3.5" /> Doctor Portal
            </Link>
            <Link
              href="/patient/login"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <User className="w-3.5 h-3.5" /> Patient Portal
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1">
        <section className="relative pt-16 pb-20 overflow-hidden">
          <div className="max-w-5xl mx-auto px-6 text-center space-y-8 relative z-10">
            
            {/* AI Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-medium shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI-Powered Clinical & Patient Health Engine</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15] max-w-3xl mx-auto">
              Intelligent Clinical Care. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-teal-300">
                Seamless Patient Outcomes.
              </span>
            </h1>

            {/* Description */}
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              MediPilot AI streamlines clinical documentation with real-time speech transcription, automated SOAP notes, medication interaction auditing, smart generic savings, and daily recovery tracking.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/doctor/login"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                <span>Doctor Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/patient/login"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <span>Patient Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </section>

        {/* FEATURE HIGHLIGHTS */}
        <section className="py-16 border-t border-slate-800/80 bg-slate-950">
          <div className="max-w-6xl mx-auto px-6 space-y-10">
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Core Platform Features</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Purpose-built intelligence designed for clinicians and patients.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Feature 1 */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800/80 text-blue-400 flex items-center justify-center font-bold">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Real-time Transcription & SOAP Notes</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Converts doctor-patient consultations into structured SOAP notes and clinical summaries automatically.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800/80 text-purple-400 flex items-center justify-center font-bold">
                  <Pill className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Medication Interaction Safety</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Audits prescribed drug-drug interactions and dosage limits in real time to protect patient safety.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/80 text-emerald-400 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Smart Pharmacy & Generic Savings</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Provides FDA-approved generic alternatives to help patients lower prescription costs.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-950 border border-teal-800/80 text-teal-400 flex items-center justify-center font-bold">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">AI Recovery Analytics</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Calculates daily recovery indices, symptom stabilization trends, and adherence scores.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800/80 text-amber-400 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Automated Discharge Summaries</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Generates ready-to-print discharge summaries, instruction checklists, and invoice records.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800/80 text-indigo-400 flex items-center justify-center font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">HIPAA Compliant & Secure</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Encrypted end-to-end with secure role-based access control and persistent session storage.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* PORTAL SELECTION */}
        <section className="py-16 border-t border-slate-800/80 bg-slate-950">
          <div className="max-w-4xl mx-auto px-6 space-y-8">
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">Access Your Portal</h2>
              <p className="text-xs text-slate-400">Select the workspace customized for your role.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Doctor Portal Card */}
              <div className="bg-gradient-to-b from-blue-950/40 to-slate-900 border border-blue-900/60 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/30">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Doctor Portal</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Access clinical transcription tools, generate SOAP notes, write e-prescriptions, and manage consultations.
                  </p>

                  <ul className="space-y-1.5 text-xs text-slate-300 pt-2">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Live Speech Transcription</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" /> AI SOAP Note Generator</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Prescription & Discharge Management</li>
                  </ul>
                </div>

                <Link
                  href="/doctor/login"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  Enter Doctor Portal <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Patient Portal Card */}
              <div className="bg-gradient-to-b from-emerald-950/40 to-slate-900 border border-emerald-900/60 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/30">
                    <User className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Patient Portal</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Track your AI recovery score, view digital prescriptions, log daily medication doses, and order online.
                  </p>

                  <ul className="space-y-1.5 text-xs text-slate-300 pt-2">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Personal AI Health Index</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Smart Pharmacy Savings</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Consultation Reports & Invoicing</li>
                  </ul>
                </div>

                <Link
                  href="/patient/login"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  Enter Patient Portal <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>

          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-6 bg-slate-950 border-t border-slate-800/80 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>MediPilot AI Health Platform © 2026. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-5">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">HIPAA Compliance</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
