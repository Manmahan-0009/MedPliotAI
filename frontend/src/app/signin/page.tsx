"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
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

  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail]       = useState("");
  const [forgotSent, setForgotSent]         = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("medipilot_remember_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRemember(true);
    }
  }, []);

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
      if (remember) {
        localStorage.setItem("medipilot_remember_email", email);
      } else {
        localStorage.removeItem("medipilot_remember_email");
      }
      const profile = await login(email, password);
      router.push(profile?.role === "doctor" || role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard");
    } catch (err: any) {
      setErrors({ general: err.message || "Invalid email or password." });
    } finally { setLoading(false); }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    setTimeout(() => {
      setForgotModalOpen(false);
      setForgotSent(false);
      setForgotEmail("");
    }, 2500);
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
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Clinical AI Portal</h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Enterprise EHR intelligence, real-time clinical notes, AI diagnostic reasoning, and patient management.
            </p>
          </div>

          {/* Animated workspace */}
          <AiWorkspacePreview compact />
        </div>

        <div className="pt-8 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2 text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" /> HIPAA Compliant 256-bit SSL
          </div>
          <span>MediPilot AI v2.4</span>
        </div>
      </div>

      {/* ── RIGHT PANEL: FORM ──────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-white overflow-y-auto">
        <div className="max-w-md w-full mx-auto space-y-6">

          {/* Role Toggle */}
          <div className="flex items-center justify-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => { setRole("patient"); setErrors({}); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                role === "patient" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <User className="w-4 h-4" /> Patient Sign In
            </button>
            <button
              onClick={() => { setRole("doctor"); setErrors({}); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                role === "doctor" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Stethoscope className="w-4 h-4" /> Doctor Sign In
            </button>
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-slate-900">
              Welcome Back, {role === "doctor" ? "Doctor" : "Patient"}
            </h2>
            <p className="text-xs text-slate-500">
              Enter your credentials to access your {role === "doctor" ? "clinical dashboard" : "health portal"}.
            </p>
          </div>

          {/* Quick Demo Fill */}
          <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center justify-between text-xs">
            <span className="text-blue-900 font-medium">Quick Demo Test Credentials:</span>
            <button type="button" onClick={fillDemo} className="font-bold text-blue-600 hover:text-blue-700 underline">
              Fill Demo ({role})
            </button>
          </div>

          <AnimatePresence>
            {errors.general && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /><span>{errors.general}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-blue-600 font-medium hover:underline focus:outline-none"
              >
                Forgot Password?
              </button>
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={loading ? {} : { y: -1, boxShadow: "0 8px 24px -4px rgb(37 99 235 / 0.38)" }} whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Signing In…</span></>
                : <span>Sign In</span>}
            </motion.button>
          </form>

          <div className="pt-3 border-t border-slate-100 flex flex-col items-center gap-2 text-xs">
            <p className="text-slate-600 font-medium">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Create Account
              </Link>
            </p>
            <Link href="/" className="text-slate-400 hover:text-slate-700 transition-colors text-[11px] mt-1">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* ── FORGOT PASSWORD MODAL ──────────────────────────── */}
      <AnimatePresence>
        {forgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 border border-slate-100 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900">Reset Password</h3>
                <button
                  onClick={() => setForgotModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              {forgotSent ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 text-center font-medium">
                  Password reset link sent to <strong>{forgotEmail}</strong>! Please check your inbox.
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-3">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Enter your email address below to receive password recovery instructions.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="user@medipilot.ai"
                      className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Send Reset Link
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
