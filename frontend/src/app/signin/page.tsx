"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stethoscope, ArrowLeft, Mail, Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [role, setRole] = useState<"doctor" | "patient">("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const newErrors: { email?: string; password?: string; general?: string } = {};
    if (!email) {
      newErrors.email = "Please enter your email.";
    } else if (email.includes("@") && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    
    if (!password) {
      newErrors.password = "Please enter your password.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fillDemoCredentials = () => {
    if (role === "doctor") {
      setEmail("doctor@medipilot.ai");
      setPassword("Doctor@123");
    } else {
      setEmail("patient@medipilot.ai");
      setPassword("Patient@123");
    }
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitted(true);
    setErrors({});
    try {
      const profile = await login(email, password);
      if (profile?.role === "doctor" || role === "doctor") {
        router.push("/doctor/dashboard");
      } else {
        router.push("/patient/dashboard");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setErrors({ general: err.message || "Invalid email or password. Click 'Fill Demo' to auto-populate test credentials." });
    } finally {
      setIsSubmitted(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans text-slate-900 relative overflow-hidden bg-slate-50">
      
      {/* Abstract Background Shapes for Glassmorphism */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none"></div>

      {/* Left Visual Side (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:flex-1 bg-blue-600/90 backdrop-blur-md flex-col justify-between p-12 relative overflow-hidden text-white border-r border-white/10 shadow-2xl z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-400/40 via-blue-600/80 to-slate-900/90 mix-blend-overlay"></div>
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-100 hover:text-white transition-colors text-sm font-bold mb-16">
            <ArrowLeft className="w-4 h-4" /> Back to MediPilot AI
          </Link>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-lg">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div className="text-3xl font-bold tracking-tight">MediPilot AI</div>
          </div>
          <h1 className="text-5xl font-bold tracking-tight leading-[1.1] mb-6 max-w-lg">
            Intelligent Healthcare.<br/>Connected Care.
          </h1>
          <p className="text-blue-100 text-lg max-w-md leading-relaxed">
            Sign in to access your secure workspace, manage consultations, documentation, and your complete healthcare journey.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-blue-200 text-sm font-medium bg-black/10 w-max px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
          <ShieldCheck className="w-5 h-5" /> HIPAA Compliant & Secure
        </div>
      </div>

      {/* Right Form Side */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 lg:px-24 xl:px-32 relative z-10">
        <div className="lg:hidden absolute top-6 left-6">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-bold bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/60">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>

        {/* Glassmorphism Card */}
        <div className="w-full max-w-md mx-auto bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2rem] p-8 lg:p-10 relative">
          
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-600 font-medium">Sign in to continue to your workspace.</p>
          </div>

          {/* Role Selector UI */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-3 text-center lg:text-left">Sign in as:</label>
            <div className="flex p-1 bg-slate-200/50 backdrop-blur-sm rounded-2xl border border-white/60">
              <button 
                type="button"
                onClick={() => setRole("doctor")}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  role === "doctor" 
                  ? "bg-white text-blue-600 shadow-sm border border-white" 
                  : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Doctor
              </button>
              <button 
                type="button"
                onClick={() => setRole("patient")}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  role === "patient" 
                  ? "bg-white text-emerald-600 shadow-sm border border-white" 
                  : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Patient
              </button>
            </div>
          </div>

          <div className="mb-6 p-3.5 bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">Demo {role === "doctor" ? "Doctor" : "Patient"} Credentials:</span>
              <div className="text-slate-600 dark:text-slate-400 font-mono text-[11px] mt-0.5">
                {role === "doctor" ? "doctor@medipilot.ai / Doctor@123" : "patient@medipilot.ai / Patient@123"}
              </div>
            </div>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className={`px-3 py-1.5 text-white font-bold rounded-xl text-xs transition-colors shrink-0 ${
                role === "doctor" ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              Fill Demo
            </button>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              ⚠️ {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-11 pr-4 py-3.5 border ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/50' : 'border-white/60 focus:ring-blue-500 focus:border-blue-500 bg-white/50 hover:bg-white/80'} rounded-2xl text-slate-900 text-sm outline-none transition-all shadow-sm backdrop-blur-sm`}
                  placeholder="doctor@hospital.com"
                />
              </div>
              {errors.email && <p className="mt-1.5 text-sm text-red-600 font-medium px-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <label className="block text-sm font-bold text-slate-700">Password</label>
                <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-700">Forgot Password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-11 pr-4 py-3.5 border ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/50' : 'border-white/60 focus:ring-blue-500 focus:border-blue-500 bg-white/50 hover:bg-white/80'} rounded-2xl text-slate-900 text-sm outline-none transition-all shadow-sm backdrop-blur-sm`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-1.5 text-sm text-red-600 font-medium px-1">{errors.password}</p>}
            </div>

            <button 
              type="submit" 
              disabled={isSubmitted}
              className="w-full flex justify-center py-4 px-4 border border-blue-500 rounded-2xl shadow-lg shadow-blue-500/30 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 mt-6"
            >
              {isSubmitted ? "Connecting..." : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600 font-medium">
            Don't have an account?{" "}
            <Link href="/signup" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Create Account
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
