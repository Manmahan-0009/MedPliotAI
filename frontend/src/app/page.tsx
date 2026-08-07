"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Stethoscope,
  User,
  ArrowRight,
  Sparkles,
  Zap,
  FileText,
  Pill,
  HeartPulse,
  ChevronRight,
  ShieldCheck,
  Activity
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

  // While checking authentication state, render minimal clean spinner
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

  // If user is authenticated, do not render landing page while redirecting
  if (userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      
      {/* 1. NAVIGATION */}
      <header
        className={`sticky top-0 z-50 transition-all duration-200 border-b ${
          scrolled ? "bg-white/90 backdrop-blur-md border-slate-200 py-3.5" : "bg-white border-transparent py-5"
        } px-6 sm:px-12`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
              <Stethoscope className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">MediPilot AI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/doctor/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. HERO SECTION */}
        <section className="py-16 sm:py-24 bg-white border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Enterprise Clinical AI Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                AI That Lets Doctors Focus on Patients.
              </h1>

              <p className="text-slate-600 text-base sm:text-lg max-w-xl leading-relaxed">
                AI-powered clinical documentation, prescriptions, and patient management in one secure platform.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/doctor/login"
                  className="px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors shadow-sm flex items-center gap-2"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/signin"
                  className="px-7 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* Right Dashboard Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Dr. Sarah Mitchell</div>
                      <div className="text-[11px] text-slate-500">General Medicine</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    Active Encounter
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <div className="flex items-center justify-between font-semibold text-slate-700">
                      <span>Speech Transcription</span>
                      <Zap className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <p className="text-slate-500 italic">"Fever for 2 days, mild cough..."</p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <div className="flex items-center justify-between font-semibold text-slate-700">
                      <span>Auto SOAP Note</span>
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <p className="text-slate-800 font-medium">Subjective: Acute Fever with Cough</p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <div className="flex items-center justify-between font-semibold text-slate-700">
                      <span>Prescription Safety</span>
                      <Pill className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                    <p className="text-slate-800 font-medium">Paracetamol 500mg • Checked</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 3. FEATURES (ONLY 4 CARDS) */}
        <section id="features" className="py-20 bg-slate-50/50 border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-6 sm:px-12 space-y-12">
            
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Core Features</h2>
              <p className="text-sm text-slate-600">Essential clinical automation tools built for modern healthcare.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Stethoscope,
                  title: "AI Consultation",
                  desc: "Real-time clinical voice transcription & dialogue capture.",
                },
                {
                  icon: FileText,
                  title: "SOAP Notes",
                  desc: "Automated structuring of Subjective, Objective, Assessment & Plan.",
                },
                {
                  icon: Pill,
                  title: "Smart Pharmacy",
                  desc: "Generic medication alternatives and pricing optimization.",
                },
                {
                  icon: HeartPulse,
                  title: "Recovery Tracking",
                  desc: "Patient symptom logs, daily recovery index & vitals trends.",
                },
              ].map((f, i) => {
                const IconComponent = f.icon;
                return (
                  <div
                    key={i}
                    className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs hover:border-slate-300 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{f.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* 4. HOW IT WORKS (SIMPLE 4-STEP TIMELINE) */}
        <section id="how-it-works" className="py-20 bg-white border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-6 sm:px-12 space-y-12">
            
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How It Works</h2>
              <p className="text-sm text-slate-600">A simple 4-step workflow from consultation to recovery.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: "1", title: "Consult", icon: Stethoscope },
                { step: "2", title: "Generate Notes", icon: FileText },
                { step: "3", title: "Prescribe", icon: Pill },
                { step: "4", title: "Track Recovery", icon: HeartPulse },
              ].map((s, idx) => {
                const StepIcon = s.icon;
                return (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center space-y-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm mx-auto flex items-center justify-center">
                      {s.step}
                    </div>
                    <div className="font-bold text-slate-900 text-base flex items-center justify-center gap-2">
                      <StepIcon className="w-4 h-4 text-blue-600" />
                      <span>{s.title}</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>
      </main>

      {/* 5. FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-600">
        <div className="max-w-6xl mx-auto px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Stethoscope className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm">MediPilot AI</span>
          </div>

          <div className="flex items-center gap-6 font-medium text-slate-600">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">
              GitHub
            </a>
            <a href="mailto:support@medipilot.ai" className="hover:text-slate-900 transition-colors">
              Contact
            </a>
          </div>

          <div className="text-slate-500">
            © {new Date().getFullYear()} MediPilot AI. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
