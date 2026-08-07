"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope, ArrowLeft, Mail, Lock, Eye, EyeOff,
  ShieldCheck, User, AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { AiWorkspacePreview } from "@/components/AiWorkspacePreview";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } };

export default function SignInPage() {
  const router    = useRouter();
  const { login } = useAuth();

  const [role, setRole]         = useState<"doctor" | "patient">("patient");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors]     = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!email)   e.email    = "Please enter your email.";
    if (!password) e.password = "Please enter your password.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const fillDemo = () => {
    setEmail(role === "doctor" ? "doctor@medipilot.ai" : "patient@medipilot.ai");
    setPassword(role === "doctor" ? "Doctor@123" : "Patient@123");
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setErrors({});
    try {
      const profile = await login(email, password);
      router.push(profile?.role === "doctor" || role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard");
    } catch (err: any) {
      setErrors({ general: err.message || "Invalid email or password." });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex font-sans bg-white text-slate-900 selection:bg-blue-600 selection:text-white">

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
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Link>
          </div>

          {/* Headline */}
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3 max-w-lg">
            <motion.h1 variants={fadeUp} className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              AI That Lets Doctors<br />
              <span className="text-blue-600">Focus on Patients.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-slate-600 text-sm leading-relaxed">
              Sign in to access consultations, SOAP notes, prescriptions, and patient recovery tracking.
            </motion.p>
          </motion.div>

          {/* Animated workspace */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
            <AiWorkspacePreview compact />
          </motion.div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-500 pt-6">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" /><span>HIPAA Compliant</span>
          </div>
          <span>•</span><span>256-bit Encryption</span><span>•</span><span>Enterprise Security</span>
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

          <motion.div variants={fadeUp} className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-xs text-slate-500">Sign in to your MediPilot AI workspace.</p>
          </motion.div>

          {/* Role tabs */}
          <motion.div variants={fadeUp} className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            {(["doctor", "patient"] as const).map(r => (
              <button key={r} type="button" onClick={() => { setRole(r); setErrors({}); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  role === r
                    ? r === "doctor" ? "bg-white text-blue-600 shadow-sm" : "bg-white text-emerald-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}>
                {r === "doctor" ? <Stethoscope className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </motion.div>

          {/* Demo banner */}
          <motion.div variants={fadeUp} className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-blue-900">Demo {role === "doctor" ? "Doctor" : "Patient"}:</span>
              <div className="text-blue-700 font-mono text-[11px] mt-0.5">
                {role === "doctor" ? "doctor@medipilot.ai / Doctor@123" : "patient@medipilot.ai / Patient@123"}
              </div>
            </div>
            <motion.button type="button" onClick={fillDemo} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="px-2.5 py-1 bg-blue-600 text-white font-semibold rounded-lg text-xs transition-colors shrink-0">
              Fill Demo
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {errors.general && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /><span>{errors.general}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form variants={fadeUp} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input type="text" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder={role === "doctor" ? "doctor@medipilot.ai" : "patient@medipilot.ai"}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all" />
              </div>
              {errors.email && <p className="text-xs text-red-600 font-medium mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 focus:outline-none">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600 font-medium mt-1">{errors.password}</p>}
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
