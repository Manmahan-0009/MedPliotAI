"use client";

import React, { useEffect, useState } from "react";
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
  Zap,
  Clock,
  Database,
  Cpu,
  Layers,
  Award,
  TrendingUp,
  ChevronRight,
  Server,
  Key,
  Cloud,
  Check,
  Building2,
  MessageSquare,
  FileCheck,
  LineChart
} from "lucide-react";

export default function LandingPage() {
  const { userProfile, role, loading } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!loading && userProfile) {
      if (role === "doctor") {
        router.replace("/doctor/dashboard");
      } else if (role === "patient") {
        router.replace("/patient/dashboard");
      }
    }
  }, [loading, userProfile, role, router]);

  // While checking authentication state, render clean loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-800 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, do not render landing page content while redirecting
  if (userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      
      {/* 1. STICKY NAVIGATION */}
      <header
        className={`sticky top-0 z-50 transition-all duration-200 border-b ${
          scrolled
            ? "bg-white/85 backdrop-blur-md border-slate-200/80 shadow-xs py-3.5"
            : "bg-white border-transparent py-5"
        } px-6 sm:px-12`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/20 group-hover:bg-blue-700 transition-colors">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl text-slate-900 tracking-tight">MediPilot AI</span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full tracking-wider uppercase">
                Enterprise
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">
              How It Works
            </a>
            <a href="#why-medipilot" className="hover:text-blue-600 transition-colors">
              Why MediPilot
            </a>
            <a href="#security" className="hover:text-blue-600 transition-colors">
              Security
            </a>
            <a href="#stats" className="hover:text-blue-600 transition-colors">
              Impact
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors hidden sm:block"
            >
              Sign In
            </Link>
            <Link
              href="/doctor/login"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm shadow-blue-600/20 flex items-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5" /> Doctor Login
            </Link>
            <Link
              href="/patient/login"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 hidden lg:flex"
            >
              <User className="w-3.5 h-3.5" /> Patient Login
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. HERO SECTION */}
        <section className="relative pt-12 sm:pt-20 pb-20 overflow-hidden bg-gradient-to-b from-slate-50/70 via-white to-white border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-6 sm:px-12 text-center space-y-8 relative z-10">
            
            {/* AI Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Enterprise Clinical & Patient Health Engine</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.12] max-w-4xl mx-auto">
              Intelligent Clinical Care. <br className="hidden sm:block" />
              <span className="text-blue-600">Seamless Patient Outcomes.</span>
            </h1>

            {/* Subtitle / Description */}
            <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed font-normal">
              MediPilot AI streamlines clinical documentation with real-time speech transcription, automated SOAP notes, medication interaction auditing, smart generic savings, and daily recovery tracking.
            </p>

            {/* Action Buttons & CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link
                href="/doctor/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 hover:scale-[1.01]"
              >
                <span>Start Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/doctor/login"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200 transition-all flex items-center justify-center gap-2 shadow-xs hover:border-slate-300"
              >
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <span>Doctor Portal</span>
              </Link>
              <Link
                href="/patient/login"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200 transition-all flex items-center justify-center gap-2 shadow-xs hover:border-slate-300"
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span>Patient Portal</span>
              </Link>
            </div>

            {/* Dashboard Mockup Visual Banner */}
            <div className="pt-10 max-w-5xl mx-auto">
              <div className="p-3 bg-slate-900/5 rounded-3xl border border-slate-200/80 shadow-2xl backdrop-blur-xs">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 text-left space-y-6 shadow-sm">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                      <span className="text-xs font-mono text-slate-400 ml-2">medipilot-ai-clinical-workspace v2.4</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Consultation Active
                      </span>
                    </div>
                  </div>

                  {/* Dashboard Preview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Speech Transcription</span>
                        <Zap className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-xs text-slate-700 font-medium italic">"Patient reports mild headache and 101F fever for 2 days..."</p>
                      <div className="text-[11px] text-blue-600 font-semibold pt-1">Processing Whisper Model • 99.4% Accuracy</div>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Auto SOAP Note</span>
                        <FileText className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-xs text-slate-800 font-semibold">Subjective: Acute Pyrexia with Cephalgia</p>
                      <div className="text-[11px] text-emerald-600 font-semibold pt-1">SOAP Structured • ICD-10 Mapped</div>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Safety & Generic Audit</span>
                        <Pill className="w-4 h-4 text-purple-600" />
                      </div>
                      <p className="text-xs text-slate-800 font-semibold">Paracetamol 500mg • No Interaction Alerts</p>
                      <div className="text-[11px] text-purple-600 font-semibold pt-1">Save 60% with Generic Alternative</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 3. TRUSTED BY / TECH STACK SECTION */}
        <section className="py-10 border-b border-slate-100 bg-white">
          <div className="max-w-6xl mx-auto px-6 text-center space-y-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Powered By Next-Gen AI & Modern Healthcare Infrastructure
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              {[
                { name: "Hackathon Demo", icon: Award },
                { name: "AI Powered", icon: Sparkles },
                { name: "FastAPI", icon: Server },
                { name: "Next.js 15", icon: Cpu },
                { name: "Firebase Auth", icon: Key },
                { name: "Supabase DB", icon: Database },
                { name: "Gemini AI", icon: Zap },
                { name: "Whisper Speech", icon: Activity },
              ].map((tech, idx) => {
                const IconComponent = tech.icon;
                return (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-medium hover:bg-slate-100/80 transition-colors"
                  >
                    <IconComponent className="w-3.5 h-3.5 text-blue-600" />
                    <span>{tech.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. FEATURES SECTION */}
        <section id="features" className="py-20 bg-slate-50/50 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-12">
            
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider">
                Enterprise Features
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Comprehensive Clinical Intelligence
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Built specifically for healthcare organizations, providers, and patients to streamline documentation and improve clinical accuracy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Stethoscope,
                  color: "bg-blue-50 text-blue-600 border-blue-200",
                  title: "AI Consultation Workspace",
                  desc: "Live interactive clinical consultation workspace for capturing diagnostic insights and patient histories accurately.",
                },
                {
                  icon: Zap,
                  color: "bg-amber-50 text-amber-600 border-amber-200",
                  title: "Speech-to-Text (Whisper)",
                  desc: "High-precision voice transcription converting spoken physician and patient dialogue into text with medical term support.",
                },
                {
                  icon: FileText,
                  color: "bg-emerald-50 text-emerald-600 border-emerald-200",
                  title: "Automated SOAP Notes",
                  desc: "Instantly structures consultation dialogue into Subjective, Objective, Assessment, and Plan documentation in seconds.",
                },
                {
                  icon: Pill,
                  color: "bg-purple-50 text-purple-600 border-purple-200",
                  title: "AI Prescriptions & Checks",
                  desc: "Smart e-prescribing tool that automatically verifies dosage guidelines, contraindications, and allergen flags.",
                },
                {
                  icon: ShieldCheck,
                  color: "bg-rose-50 text-rose-600 border-rose-200",
                  title: "Medication Safety Audit",
                  desc: "Real-time auditing of drug-drug interactions and patient-specific medical history to prevent adverse events.",
                },
                {
                  icon: HeartPulse,
                  color: "bg-teal-50 text-teal-600 border-teal-200",
                  title: "Recovery & Vitals Tracking",
                  desc: "Patient self-assessment portal for monitoring recovery indexes, symptom logs, and vitals trend lines.",
                },
                {
                  icon: ShoppingBag,
                  color: "bg-indigo-50 text-indigo-600 border-indigo-200",
                  title: "Smart Pharmacy Catalog",
                  desc: "Browse generic alternatives, compare medicine prices, and calculate immediate out-of-pocket savings.",
                },
                {
                  icon: FileCheck,
                  color: "bg-cyan-50 text-cyan-600 border-cyan-200",
                  title: "One-Click Discharge Summary",
                  desc: "Generates comprehensive, ready-to-print patient discharge summaries, instructions, and follow-up schedules.",
                },
                {
                  icon: LineChart,
                  color: "bg-sky-50 text-sky-600 border-sky-200",
                  title: "Clinical Analytics",
                  desc: "Operational insights into consultation volume, time savings per encounter, and patient recovery progression.",
                },
              ].map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={i}
                    className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 hover:scale-[1.02] flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${feat.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{feat.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center text-xs font-semibold text-blue-600 gap-1 hover:gap-2 transition-all">
                      <span>Learn more</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* 5. HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-20 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-14">
            
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider">
                Workflow Overview
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                How MediPilot AI Works
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                A seamless 7-step clinical workflow designed for speed, safety, and thorough patient documentation.
              </p>
            </div>

            {/* Timeline Horizontal Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 relative">
              {[
                { step: "01", title: "Doctor Login", desc: "Secure authentication into clinical portal.", icon: User },
                { step: "02", title: "Patient Select", desc: "Choose active patient from registry.", icon: Stethoscope },
                { step: "03", title: "AI Consult", desc: "Record or input clinical notes live.", icon: Zap },
                { step: "04", title: "SOAP Gen", desc: "Instant automated SOAP note creation.", icon: FileText },
                { step: "05", title: "Prescription", desc: "E-prescribe with interaction checks.", icon: Pill },
                { step: "06", title: "Recovery", desc: "Patient tracks recovery index online.", icon: HeartPulse },
                { step: "07", title: "Discharge", desc: "Generate discharge & pharmacy invoice.", icon: FileCheck },
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 text-center space-y-3 flex flex-col justify-between hover:bg-slate-100/60 transition-all hover:scale-[1.02] shadow-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-mono font-bold">
                        <span>{item.step}</span>
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                    </div>
                    {idx < 6 && (
                      <div className="hidden lg:block text-slate-300 font-bold text-xs pt-1">
                        →
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* 6. WHY MEDIPILOT AI SECTION */}
        <section id="why-medipilot" className="py-20 bg-slate-50/60 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-12">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Dashboard Preview Graphic */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Clinical Efficiency Metrics</h3>
                      <p className="text-xs text-slate-500">Real-time encounter performance</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    +40% Saved
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>SOAP Note Auto-Generation</span>
                      <span className="text-blue-600">30 seconds vs 10 mins</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-blue-600 h-2.5 rounded-full w-[95%]" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Drug Interaction Accuracy</span>
                      <span className="text-emerald-600">99.8% Verifiable</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-emerald-600 h-2.5 rounded-full w-[98%]" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Generic Prescription Savings</span>
                      <span className="text-purple-600">Up to 60% Patient Savings</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-purple-600 h-2.5 rounded-full w-[90%]" />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-900 leading-relaxed font-medium flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>Clinicians save over 2 hours of repetitive documentation per shift with MediPilot AI.</span>
                </div>
              </div>

              {/* Right Benefits List */}
              <div className="space-y-6">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider">
                  Enterprise Benefits
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Designed to Elevate Healthcare Delivery
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  MediPilot AI bridges the gap between physician workloads and patient experience by automating documentation overhead.
                </p>

                <div className="space-y-4 pt-2">
                  {[
                    { title: "Saves Valuable Clinical Time", desc: "Reduces chart prep and post-consultation documentation time by up to 40%." },
                    { title: "AI-Powered Precision & Safety", desc: "Automated drug interaction checks and standardized SOAP notes minimize clinical errors." },
                    { title: "Standardized & Compliant Documentation", desc: "Generates structured, audit-ready clinical notes conforming to modern EHR standards." },
                    { title: "Improved Patient Outcomes & Transparency", desc: "Empowers patients with clear recovery indexes, digital prescriptions, and price-optimized generic choices." },
                    { title: "Accelerated Consultation & Discharge Workflow", desc: "Streamlines patient check-in to final discharge summary in one unified web portal." },
                  ].map((b, i) => (
                    <div key={i} className="flex gap-3 text-left">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{b.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 7. SECURITY & COMPLIANCE SECTION */}
        <section id="security" className="py-20 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-12">
            
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider">
                Security & Governance
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Enterprise-Grade Security Architecture
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Protecting sensitive health data with multi-layered encryption, robust authorization, and cloud infrastructure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {[
                { title: "Firebase Auth", desc: "Secure token authentication & token verification.", icon: Key },
                { title: "Encrypted Storage", desc: "AES-256 encrypted database & media records.", icon: Lock },
                { title: "Role Based Access", desc: "Strict separation between Doctor & Patient portals.", icon: ShieldCheck },
                { title: "Cloud Ready", desc: "Scalable API architecture hosted on resilient servers.", icon: Cloud },
                { title: "Secure APIs", desc: "JWT & bearer token protection across all backend routes.", icon: Server },
              ].map((s, idx) => {
                const IconComp = s.icon;
                return (
                  <div
                    key={idx}
                    className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 space-y-3 text-left hover:bg-slate-100/60 transition-all hover:scale-[1.02] shadow-xs"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{s.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* 8. STATISTICS / IMPACT SECTION */}
        <section id="stats" className="py-20 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-12">
            
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-blue-400 bg-blue-950/80 border border-blue-800 px-3 py-1 rounded-full uppercase tracking-wider">
                Proven Impact
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Quantifiable Platform Outcomes
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Measurable clinical performance improvements delivered to health practitioners.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { stat: "100+", label: "Demo Patients Managed", desc: "Active clinical test profiles" },
                { stat: "500+", label: "AI Reports Generated", desc: "SOAP & discharge summaries" },
                { stat: "98%", label: "Documentation Accuracy", desc: "Speech & note precision" },
                { stat: "40%", label: "Doctor Time Saved", desc: "Reduction in charting overhead" },
              ].map((st, i) => (
                <div key={i} className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 text-center space-y-2 backdrop-blur-xs">
                  <div className="text-4xl sm:text-5xl font-black text-blue-400 tracking-tight">{st.stat}</div>
                  <div className="text-sm font-bold text-slate-100">{st.label}</div>
                  <div className="text-xs text-slate-400">{st.desc}</div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* 9. TESTIMONIALS SECTION */}
        <section className="py-20 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-12">
            
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider">
                Testimonials
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Trusted by Clinical Practitioners
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Hear how MediPilot AI is improving documentation efficiency and patient satisfaction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  quote: "MediPilot AI has dramatically reduced the time I spend writing SOAP notes between consultations. The real-time speech transcription is incredibly accurate.",
                  name: "Dr. Sarah Mitchell",
                  role: "Chief of Internal Medicine",
                  tag: "Clinician Perspective",
                  icon: Stethoscope,
                },
                {
                  quote: "The drug interaction safety checks and generic savings features have made our clinic operations far more reliable while cutting patient prescription costs.",
                  name: "Dr. Rajesh Sharma",
                  role: "Hospital Medical Director",
                  tag: "Hospital Administrator",
                  icon: Building2,
                },
                {
                  quote: "Being able to view my daily recovery score, symptom log, and recommended generic medicines from home gives me complete confidence in my recovery plan.",
                  name: "Priya Nair",
                  role: "Recovering Outpatient",
                  tag: "Patient Experience",
                  icon: User,
                },
              ].map((t, idx) => {
                const IconComponent = t.icon;
                return (
                  <div
                    key={idx}
                    className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 space-y-4 flex flex-col justify-between hover:bg-slate-100/60 transition-all hover:scale-[1.02] shadow-xs"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                          {t.tag}
                        </span>
                        <IconComponent className="w-4 h-4 text-slate-400" />
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed italic">"{t.quote}"</p>
                    </div>

                    <div className="pt-3 border-t border-slate-200/80">
                      <div className="font-bold text-slate-900 text-sm">{t.name}</div>
                      <div className="text-[11px] text-slate-500">{t.role}</div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* BOTTOM CTA CALLOUT BANNER */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Modernize Your Clinical Documentation?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Experience the power of AI-assisted consultations, automated SOAP notes, and intelligent patient recovery tracking today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/doctor/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Doctor Portal Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/patient/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm border border-blue-500 transition-all flex items-center justify-center gap-2"
              >
                <span>Patient Portal Login</span>
                <User className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 10. FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Brand */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <span className="font-bold text-white text-base tracking-tight">MediPilot AI</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-xs">
                Intelligent Clinical & Patient Health Management Platform powered by Google Gemini AI & Whisper Speech Recognition.
              </p>
              <div className="text-[11px] text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-md w-max flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> HIPAA Compliant Architecture
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Product Navigation</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Enterprise Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#why-medipilot" className="hover:text-white transition-colors">Why MediPilot</a></li>
                <li><a href="#security" className="hover:text-white transition-colors">Security Architecture</a></li>
                <li><a href="#stats" className="hover:text-white transition-colors">Quantifiable Impact</a></li>
              </ul>
            </div>

            {/* Column 3: Technology */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Tech Stack</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li><span>FastAPI (Python 3.11)</span></li>
                <li><span>Next.js 15 & React</span></li>
                <li><span>Google Gemini AI Engine</span></li>
                <li><span>Whisper Speech-to-Text</span></li>
                <li><span>Firebase & Supabase DB</span></li>
              </ul>
            </div>

            {/* Column 4: Access Portals */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Access Portals</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/doctor/login" className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5" /> Doctor Workspace Login →
                  </Link>
                </li>
                <li>
                  <Link href="/patient/login" className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> Patient Portal Login →
                  </Link>
                </li>
                <li>
                  <Link href="/signin" className="text-slate-300 hover:text-white flex items-center gap-1">
                    General Sign In →
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-3">
            <div>
              © {new Date().getFullYear()} MediPilot AI. All rights reserved. Hackathon Enterprise Healthcare Demonstration.
            </div>
            <div className="flex gap-4">
              <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Security Overview</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
