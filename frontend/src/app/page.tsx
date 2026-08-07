"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  motion,
  useInView,
  useAnimation,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  Stethoscope,
  ArrowRight,
  Sparkles,
  FileText,
  Pill,
  HeartPulse,
  ShieldCheck,
  Activity,
  Mic,
} from "lucide-react";
import { AiWorkspacePreview } from "@/components/AiWorkspacePreview";

/* ──────────────────────────────────────────────────────────────
   Animation Variants
────────────────────────────────────────────────────────────── */
const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0  },
};

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

/* ──────────────────────────────────────────────────────────────
   Animated counter (once, on InView)
────────────────────────────────────────────────────────────── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.max(1, Math.floor(target / 55));
    const t = setInterval(() => {
      start = Math.min(start + step, target);
      setValue(start);
      if (start >= target) clearInterval(t);
    }, 18);
    return () => clearInterval(t);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {value.toLocaleString()}{suffix}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────
   Mouse-tilt card wrapper
────────────────────────────────────────────────────────────── */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-4, 4]);

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top)  / rect.height - 0.5);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Features section
────────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: Mic,         title: "AI Consultation",   desc: "Real-time voice transcription & clinical dialogue capture powered by Whisper." },
  { icon: FileText,    title: "SOAP Notes",        desc: "Automated Subjective, Objective, Assessment & Plan documentation in seconds." },
  { icon: Pill,        title: "Smart Pharmacy",    desc: "Generic medication alternatives with FDA-verified safety and 40–60% cost savings." },
  { icon: HeartPulse,  title: "Recovery Tracking", desc: "Daily recovery index, symptom logs, and trend charts for every patient." },
];

function FeaturesSection() {
  const ref   = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const controls = useAnimation();

  useEffect(() => { if (inView) controls.start("visible"); }, [inView, controls]);

  return (
    <section id="features" className="py-20 bg-slate-50/60 border-b border-slate-100">
      <div ref={ref} className="max-w-6xl mx-auto px-6 sm:px-12 space-y-12">

        <motion.div
          variants={stagger} initial="hidden" animate={controls}
          className="text-center space-y-2 max-w-xl mx-auto"
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Core Features
          </motion.h2>
          <motion.p variants={fadeUp} className="text-sm text-slate-500">
            Essential clinical automation — built for modern healthcare.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger} initial="hidden" animate={controls}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i} variants={fadeUp}
                whileHover={{ y: -5, boxShadow: "0 16px 40px -8px rgb(37 99 235 / 0.13)" }}
                className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs cursor-default"
              >
                <motion.div
                  whileHover={{ rotate: 8, scale: 1.1 }}
                  className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center"
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-slate-900 text-[15px] mb-1">{f.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   How It Works section
────────────────────────────────────────────────────────────── */
const STEPS = [
  { step: "01", title: "Consult",       icon: Stethoscope },
  { step: "02", title: "Document",      icon: FileText    },
  { step: "03", title: "Prescribe",     icon: Pill        },
  { step: "04", title: "Track",         icon: HeartPulse  },
];

function HowItWorksSection() {
  const ref    = useRef(null);
  const inView  = useInView(ref, { once: true, margin: "-80px" });
  const controls = useAnimation();

  useEffect(() => { if (inView) controls.start("visible"); }, [inView, controls]);

  return (
    <section id="how-it-works" className="py-20 bg-white border-b border-slate-100">
      <div ref={ref} className="max-w-6xl mx-auto px-6 sm:px-12 space-y-12">

        <motion.div variants={stagger} initial="hidden" animate={controls} className="text-center space-y-2 max-w-xl mx-auto">
          <motion.h2 variants={fadeUp} className="text-3xl font-extrabold text-slate-900 tracking-tight">How It Works</motion.h2>
          <motion.p variants={fadeUp} className="text-sm text-slate-500">Four steps from consultation to recovery — fully automated.</motion.p>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" animate={controls}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isLast = i === STEPS.length - 1;
            return (
              <motion.div key={i} variants={fadeUp}
                whileHover={{ y: -4, backgroundColor: "#ffffff", boxShadow: "0 8px 24px -4px rgb(0 0 0 / 0.07)" }}
                className="relative bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-3 transition-colors cursor-default"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-sm mx-auto flex items-center justify-center shadow-sm shadow-blue-600/20">
                  {s.step}
                </div>
                <div className="flex items-center justify-center gap-2 font-bold text-slate-900 text-[15px]">
                  <Icon className="w-4 h-4 text-blue-600" />
                  <span>{s.title}</span>
                </div>
                {!isLast && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 text-slate-300 font-bold text-xl z-10">›</div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   Live Metrics floating card
────────────────────────────────────────────────────────────── */
function MetricsSection() {
  const ref    = useRef(null);
  const inView  = useInView(ref, { once: true, margin: "-80px" });
  const controls = useAnimation();

  useEffect(() => { if (inView) controls.start("visible"); }, [inView, controls]);

  const metrics = [
    { val: 12500, suffix: "+", label: "AI Reports Generated" },
    { val: 98,    suffix: "%", label: "Documentation Accuracy" },
    { val: 40,    suffix: "%", label: "Doctor Time Saved" },
  ];

  return (
    <section className="py-16 bg-slate-50/40 border-b border-slate-100">
      <div ref={ref} className="max-w-6xl mx-auto px-6 sm:px-12">
        <motion.div
          variants={stagger} initial="hidden" animate={controls}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 grid grid-cols-1 sm:grid-cols-3 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100"
        >
          {metrics.map((m, i) => (
            <motion.div key={i} variants={fadeUp} className="flex flex-col items-center gap-2 py-4 sm:py-0">
              <p className="text-4xl font-black text-slate-900 leading-none">
                <Counter target={m.val} suffix={m.suffix} />
              </p>
              <p className="text-sm text-slate-500 font-medium">{m.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main Landing Page
────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const { userProfile, role, loading } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (!loading && userProfile) {
      router.replace(role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard");
    }
  }, [loading, userProfile, role, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Verifying session…</p>
        </div>
      </div>
    );
  }

  if (userProfile) return null;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">

      {/* ── NAV ─────────────────────────────────────────────── */}
      <motion.header
        className="sticky top-0 z-50 border-b px-6 sm:px-12"
        animate={{
          backgroundColor: scrolled ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,1)",
          backdropFilter:  scrolled ? "blur(14px)"             : "blur(0px)",
          borderColor:     scrolled ? "rgba(226,232,240,0.8)"  : "transparent",
          paddingTop:      scrolled ? "14px"                   : "20px",
          paddingBottom:   scrolled ? "14px"                   : "20px",
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm"
            >
              <Stethoscope className="w-5 h-5" />
            </motion.div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">MediPilot AI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            {["Features", "How It Works"].map(label => (
              <motion.a
                key={label}
                href={`#${label.toLowerCase().replace(" ", "-")}`}
                whileHover={{ color: "#2563eb" }}
                transition={{ duration: 0.15 }}
              >
                {label}
              </motion.a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/signin" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
              Login
            </Link>
            <motion.div whileHover={{ y: -1, boxShadow: "0 8px 20px -4px rgb(37 99 235 / 0.35)" }} whileTap={{ scale: 0.97 }}>
              <Link href="/doctor/login" className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 text-white transition-colors">
                Start Demo
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <main className="flex-1">

        {/* ── HERO ────────────────────────────────────────────── */}
        <section className="relative py-16 sm:py-24 overflow-hidden bg-white border-b border-slate-100">

          {/* Animated background blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="animate-blob-drift  absolute -top-40 -left-40  w-[560px] h-[560px] rounded-full bg-blue-100/40  blur-[100px]" />
            <div className="animate-blob-drift2 absolute -bottom-40 -right-40 w-[480px] h-[480px] rounded-full bg-sky-100/50   blur-[90px]" />
            <div className="animate-blob-drift  absolute top-1/3 left-1/3  w-[340px] h-[340px] rounded-full bg-indigo-100/30 blur-[110px]" style={{ animationDelay: "4s" }} />
          </div>

          {/* Floating icons */}
          {[
            { icon: Activity,   top: "14%",  right: "10%", delay: 0,   size: "w-7 h-7" },
            { icon: HeartPulse, bottom: "18%", left: "7%",  delay: 1.5, size: "w-6 h-6" },
            { icon: Sparkles,   top: "28%",  left: "13%", delay: 3,   size: "w-5 h-5" },
            { icon: ShieldCheck,bottom: "28%", right: "14%", delay: 2,  size: "w-5 h-5" },
          ].map(({ icon: Icon, delay, size, ...pos }, i) => (
            <motion.div
              key={i}
              className={`pointer-events-none hidden lg:block absolute ${size} text-blue-200 opacity-50`}
              style={pos as React.CSSProperties}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay }}
            >
              <Icon className="w-full h-full" />
            </motion.div>
          ))}

          <div className="max-w-6xl mx-auto px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">

            {/* Left text */}
            <motion.div
              className="lg:col-span-6 space-y-7"
              variants={stagger} initial="hidden" animate="visible"
            >
              <motion.div variants={fadeUp}>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Enterprise Clinical AI Platform
                </div>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold text-slate-900 tracking-tight leading-[1.1]"
              >
                AI That Lets Doctors<br className="hidden sm:block" />
                <span className="text-blue-600"> Focus on Patients.</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-lg">
                Record consultations, generate clinical documentation, prescribe medicines,
                and track recovery — all in one intelligent healthcare platform.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
                <motion.div whileHover={{ y: -2, boxShadow: "0 10px 28px -4px rgb(37 99 235 / 0.38)" }} whileTap={{ scale: 0.97 }}>
                  <Link href="/doctor/login"
                    className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700">
                    <span>Start Demo</span>
                    <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
                      <ArrowRight className="w-4 h-4" />
                    </motion.span>
                  </Link>
                </motion.div>
                <Link href="/signin"
                  className="px-7 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-colors">
                  Sign In
                </Link>
              </motion.div>

              {/* Metrics strip */}
              <motion.div variants={fadeUp} className="flex flex-wrap gap-7 pt-1">
                {[
                  { val: 12500, suffix: "+", label: "AI Reports" },
                  { val: 98,    suffix: "%", label: "Accuracy"   },
                  { val: 40,    suffix: "%", label: "Time Saved" },
                ].map(m => (
                  <div key={m.label}>
                    <p className="text-2xl font-black text-slate-900 leading-none">
                      <Counter target={m.val} suffix={m.suffix} />
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{m.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: AI Workspace */}
            <motion.div
              className="lg:col-span-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            >
              <TiltCard>
                <AiWorkspacePreview />
              </TiltCard>
            </motion.div>
          </div>
        </section>

        {/* ── METRICS ─────────────────────────────────────── */}
        <MetricsSection />

        {/* ── FEATURES ────────────────────────────────────── */}
        <FeaturesSection />

        {/* ── HOW IT WORKS ────────────────────────────────── */}
        <HowItWorksSection />

      </main>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Stethoscope className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm">MediPilot AI</span>
          </div>
          <div className="flex items-center gap-6 font-medium">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">GitHub</a>
            <a href="mailto:support@medipilot.ai" className="hover:text-slate-900 transition-colors">Contact</a>
          </div>
          <div>© {new Date().getFullYear()} MediPilot AI. All rights reserved.</div>
        </div>
      </footer>

    </div>
  );
}
