"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope, ArrowLeft, Mail, Lock, Eye, EyeOff,
  AlertCircle, ShieldCheck,
} from "lucide-react";
import { AiWorkspacePreview } from "@/components/AiWorkspacePreview";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } };

export default function DoctorLoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const { login } = useAuth();
  const router    = useRouter();

  const fillDemo = () => { setEmail("doctor@medipilot.ai"); setPassword("Doctor@123"); setError(""); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const profile = await login(email.trim().toLowerCase(), password);
      if (profile?.role === "patient") {
        setError("This account is a Patient account. Use the Patient Portal.");
      } else {
        router.push("/doctor/dashboard");
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
    <div className="min-h-screen flex font-sans bg-white text-slate-900 selection:bg-blue-600 selection:text-white">

      {/* ── LEFT PANEL ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] bg-slate-50/80 border-r border-slate-200 flex-col justify-between p-12 overflow-y-auto">
        <div className="space-y-10">
          {/* Logo + back */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <motion.div whileHover={{ scale: 1.05 }}
                className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Stethoscope className="w-5 h-5" />
              </motion.div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">MediPilot AI</span>
            </Link>
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Link>
          </div>

          {/* Headline */}
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3 max-w-lg">
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                <Stethoscope className="w-3.5 h-3.5" /> Clinical Doctor Portal
              </div>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              AI That Lets Doctors<br />
              <span className="text-blue-600">Focus on Patients.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-slate-600 text-sm leading-relaxed">
              Real-time transcription, automated SOAP notes, e-prescriptions, and seamless patient encounters.
            </motion.p>
          </motion.div>

          {/* Animated workspace — same 7-step loop as landing page */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
            <AiWorkspacePreview compact />
          </motion.div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500 pt-6">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" /><span>HIPAA Compliant</span>
          </div>
          <span>•</span><span>Role-Based Access</span><span>•</span><span>256-bit Encrypted</span>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative bg-white">

        <div className="lg:hidden absolute top-6 left-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
        </div>

        <motion.div variants={stagger} initial="hidden" animate="visible"
          className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">

          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Doctor Login</h2>
              <p className="text-xs text-slate-500">MediPilot AI Clinical Portal</p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-blue-900">Demo Account:</span>
              <div className="text-blue-700 font-mono text-[11px] mt-0.5">doctor@medipilot.ai / Doctor@123</div>
            </div>
            <motion.button type="button" onClick={fillDemo} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="px-2.5 py-1 bg-blue-600 text-white font-semibold rounded-lg text-xs transition-colors shrink-0">
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
                  placeholder="doctor@medipilot.ai"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input type={showPw ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 focus:outline-none">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                Remember Me
              </label>
              <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 font-medium hover:underline">Forgot Password?</a>
            </div>
            <motion.button type="submit" disabled={loading}
              whileHover={loading ? {} : { y: -1, boxShadow: "0 8px 24px -4px rgb(37 99 235 / 0.38)" }} whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2">
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
