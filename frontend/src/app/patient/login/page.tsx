"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Stethoscope, ArrowLeft, Mail, Lock, Eye, EyeOff,
  AlertCircle, ShieldCheck, HeartPulse, CheckCircle2,
} from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } };

/* ── Patient wellness preview card (patient-themed, not doctor) ── */
function WellnessPreview() {
  const [index, setIndex] = useState(0);
  const stages = ["Recovery Tracking", "Prescriptions", "Health Summary"];
  const stageColors = ["text-teal-600", "text-purple-600", "text-blue-600"];

  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % 3), 3400);
    return () => clearInterval(t);
  }, []);

  const bars = [45, 52, 60, 58, 66, 72, 78, 82];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-900 leading-none">Patient Portal</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Personalised Health Dashboard</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Recovery Active
        </span>
      </div>

      {/* Stage bars */}
      <div className="flex gap-1 px-5 pt-3.5 pb-2">
        {stages.map((_, i) => (
          <motion.div key={i} className="flex-1 h-1 rounded-full"
            animate={{ backgroundColor: i <= index ? "#0d9488" : "#e2e8f0" }}
            transition={{ duration: 0.3 }} />
        ))}
      </div>
      <p className={`px-5 pb-2.5 text-[10px] font-bold uppercase tracking-widest ${stageColors[index]}`}>
        {stages[index]}
      </p>

      <div className="px-5 pb-5 min-h-[120px]">
        <AnimatePresence mode="wait">
          {index === 0 && (
            <motion.div key="r0" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-teal-900 leading-none">82<span className="text-sm font-bold text-teal-600">/100</span></p>
                  <p className="text-[11px] text-teal-700 font-semibold mt-0.5">Daily Recovery Index</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-sm shadow-sm">+14%</div>
              </div>
              <div className="flex items-end gap-0.5 h-8">
                {bars.map((h, i) => (
                  <motion.div key={i} className={`flex-1 rounded-sm ${i === 7 ? "bg-teal-600" : "bg-teal-200"}`}
                    initial={{ height: 0 }} animate={{ height: `${(h / 82) * 32}px` }}
                    transition={{ delay: i * 0.06, duration: 0.35 }} />
                ))}
              </div>
            </motion.div>
          )}
          {index === 1 && (
            <motion.div key="r1" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-[11px] space-y-2">
              <div className="flex justify-between font-bold text-purple-900"><span>Ibuprofen 400 mg</span><span className="font-mono">1-0-1</span></div>
              <div className="flex justify-between text-slate-600"><span>Cetirizine 10 mg</span><span className="font-mono text-slate-500">0-0-1</span></div>
              <div className="pt-1.5 border-t border-purple-100">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">💊 55% savings on generics</span>
              </div>
            </motion.div>
          )}
          {index === 2 && (
            <motion.div key="r2" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-1.5 text-[11px]">
              {[
                { label: "Last Consultation", val: "2 days ago",  color: "text-blue-600" },
                { label: "Recovery Index",    val: "82 / 100",    color: "text-teal-600" },
                { label: "Active Rx",         val: "2 meds",      color: "text-purple-600" },
                { label: "Next Follow-Up",    val: "In 3 days",   color: "text-slate-700" },
              ].map((r, i) => (
                <motion.div key={r.label} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex justify-between">
                  <span className="text-slate-700 font-medium">{r.label}</span>
                  <span className={`font-bold ${r.color}`}>{r.val}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between px-5 py-2.5 border-t border-slate-100 bg-slate-50/60">
        <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />Encrypted health records
        </span>
        <span className="text-[10px] font-mono text-slate-400">step {index + 1}/3</span>
      </div>
    </div>
  );
}

/* ── Patient Login Page ──────────────────────────────────────── */
export default function PatientLoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const { login } = useAuth();
  const router    = useRouter();

  const fillDemo = () => { setEmail("patient@medipilot.ai"); setPassword("Patient@123"); setError(""); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const profile = await login(email.trim().toLowerCase(), password);
      if (profile?.role === "doctor") {
        setError("This account is a Doctor account. Use the Doctor Portal.");
      } else {
        router.push("/patient/dashboard");
      }
    } catch (err: any) {
      const code = err.code || "";
      if (["auth/invalid-credential","auth/user-not-found","auth/wrong-password"].includes(code)) {
        setError("Invalid email or password.");
      } else if (code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else {
        setError(err.message || "Authentication failed.");
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex font-sans bg-white text-slate-900 selection:bg-emerald-600 selection:text-white">

      {/* ── LEFT PANEL ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] bg-slate-50/80 border-r border-slate-200 flex-col justify-between p-12 overflow-y-auto">
        <div className="space-y-10">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <motion.div whileHover={{ scale: 1.05 }}
                className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Stethoscope className="w-5 h-5" />
              </motion.div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">MediPilot AI</span>
            </Link>
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Link>
          </div>

          {/* Headline */}
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3 max-w-lg">
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                <User className="w-3.5 h-3.5" /> Patient Health Portal
              </div>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Empowering Your<br />
              <span className="text-emerald-600">Personal Health Journey.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-slate-600 text-sm leading-relaxed">
              Track recovery, view prescriptions, access clinical notes, and monitor your health — all in one place.
            </motion.p>
          </motion.div>

          {/* Patient wellness preview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
            <WellnessPreview />
          </motion.div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-500 pt-6">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /><span>Encrypted Records</span>
          </div>
          <span>•</span><span>HIPAA Compliant</span><span>•</span><span>Private & Secure</span>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative bg-white">

        <div className="lg:hidden absolute top-6 left-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
        </div>

        <motion.div variants={stagger} initial="hidden" animate="visible"
          className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">

          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Login</h2>
              <p className="text-xs text-slate-500">MediPilot Patient Health Portal</p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-emerald-900">Demo Account:</span>
              <div className="text-emerald-700 font-mono text-[11px] mt-0.5">patient@medipilot.ai / Patient@123</div>
            </div>
            <motion.button type="button" onClick={fillDemo} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="px-2.5 py-1 bg-emerald-600 text-white font-semibold rounded-lg text-xs transition-colors shrink-0">
              Fill Demo
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form variants={fadeUp} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input type="text" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="patient@medipilot.ai"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input type={showPw ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 focus:outline-none">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-600" />
                Remember Me
              </label>
              <a href="#" onClick={e => e.preventDefault()} className="text-emerald-600 font-medium hover:underline">Forgot Password?</a>
            </div>
            <motion.button type="submit" disabled={loading}
              whileHover={loading ? {} : { y: -1, boxShadow: "0 8px 24px -4px rgb(5 150 105 / 0.38)" }} whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-sm shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Signing In…</span></>
                : <span>Sign In</span>}
            </motion.button>
          </motion.form>

          <motion.div variants={fadeUp} className="pt-2 border-t border-slate-100 text-center">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-800 transition-colors">← Back to Home</Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
