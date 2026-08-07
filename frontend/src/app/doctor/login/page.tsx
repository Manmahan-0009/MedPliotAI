"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Stethoscope, Mail, Lock, AlertCircle } from "lucide-react";

export default function DoctorLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const profile = await login(cleanEmail, password);
      if (profile && profile.role === "doctor") {
        router.push("/doctor/dashboard");
      } else if (profile && profile.role === "patient") {
        setError("This account is registered as a Patient. Please use the Patient Portal.");
      } else {
        router.push("/doctor/dashboard");
      }
    } catch (err: any) {
      console.error("Doctor login error:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else {
        setError(err.message || "Failed to authenticate. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-800/50">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Doctor Login</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">MediPilot AI Clinical Portal</p>
          </div>
        </div>

        <div className="mb-6 p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-blue-800 dark:text-blue-300">Demo Doctor Account:</span>
            <div className="text-blue-700 dark:text-blue-400">doctor@medipilot.ai / Doctor@123</div>
          </div>
          <button
            type="button"
            onClick={() => {
              setEmail("doctor@medipilot.ai");
              setPassword("Doctor@123");
            }}
            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs transition-colors shrink-0"
          >
            Fill Demo
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@medipilot.ai"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
              />
              Remember Me
            </label>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); alert("Password reset link requested."); }}
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 mt-2"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have a doctor account?{" "}
          <Link href="/doctor/signup" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Sign up here
          </Link>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            ← Back to Portal Selection
          </Link>
        </div>

      </div>
    </div>
  );
}
