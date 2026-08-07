"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Stethoscope, ArrowLeft, Mail, Lock, ShieldCheck, User, Phone, Calendar, Briefcase, Building } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const { signupDoctor, signupPatient } = useAuth();

  const [role, setRole] = useState<"doctor" | "patient">("patient");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dob: "",
    gender: "",
    specialization: "",
    licenseNumber: "",
    clinicName: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = "Please enter your full name.";
    if (!formData.email) {
      newErrors.email = "Please enter your email.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email.";
    }
    if (!formData.phone) newErrors.phone = "Please enter your phone number.";
    
    if (!formData.password) {
      newErrors.password = "Please enter a password.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (role === "doctor") {
      if (!formData.specialization) newErrors.specialization = "Specialization is required.";
      if (!formData.licenseNumber) newErrors.licenseNumber = "License number is required.";
      if (!formData.clinicName) newErrors.clinicName = "Hospital/Clinic name is required.";
    } else {
      if (!formData.dob) newErrors.dob = "Date of birth is required.";
      if (!formData.gender) newErrors.gender = "Gender is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitted(true);
    setErrors({});

    try {
      if (role === "doctor") {
        await signupDoctor({
          email: formData.email,
          pass: formData.password,
          full_name: formData.fullName,
          department: formData.clinicName,
          specialization: formData.specialization,
          medical_registration_number: formData.licenseNumber,
          phone: formData.phone,
        });
        router.push("/doctor/dashboard");
      } else {
        const parts = formData.fullName.trim().split(" ");
        const firstName = parts[0] || "Patient";
        const lastName = parts.slice(1).join(" ") || "User";
        await signupPatient({
          email: formData.email,
          pass: formData.password,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: formData.dob || undefined,
          gender: formData.gender || undefined,
          phone: formData.phone || undefined,
        });
        router.push("/patient/dashboard");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setErrors({ general: err.message || "Registration failed. Please check your information." });
    } finally {
      setIsSubmitted(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans text-slate-900 relative overflow-hidden bg-slate-50">
      
      {/* Abstract Background Shapes for Glassmorphism */}
      <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[10%] w-[50%] h-[50%] rounded-full bg-emerald-500/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[40%] left-[-10%] w-[30%] h-[30%] rounded-full bg-indigo-500/15 blur-[100px] pointer-events-none"></div>

      {/* Left Visual Side (Hidden on Mobile/Tablet) */}
      <div className="hidden xl:flex xl:flex-1 bg-slate-900/90 backdrop-blur-md flex-col justify-between p-12 relative overflow-hidden text-white border-r border-white/10 shadow-2xl z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/60 via-slate-900/80 to-slate-900/90 mix-blend-overlay"></div>
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-bold mb-16">
            <ArrowLeft className="w-4 h-4" /> Back to MediPilot AI
          </Link>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 backdrop-blur-md border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-lg">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div className="text-3xl font-bold tracking-tight text-white">MediPilot AI</div>
          </div>
          <h1 className="text-5xl font-bold tracking-tight leading-[1.1] mb-6 max-w-lg">
            Join the connected healthcare platform.
          </h1>
          <p className="text-slate-300 text-lg max-w-md leading-relaxed">
            Create an account to experience seamless consultations, intelligent documentation, and a unified medical journey.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-slate-300 text-sm font-medium bg-white/5 w-max px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
          <ShieldCheck className="w-5 h-5 text-emerald-400" /> End-to-End Encryption & Security
        </div>
      </div>

      {/* Right Form Side */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-12 lg:px-24 relative overflow-y-auto z-10">
        <div className="xl:hidden absolute top-6 left-6">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-bold bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/60">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>

        {/* Glassmorphism Card */}
        <div className="w-full max-w-xl mx-auto bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2rem] p-8 lg:p-10 relative mt-8 xl:mt-0">
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Your Account</h2>
            <p className="text-slate-600 font-medium">Join a connected experience designed for doctors and patients.</p>
          </div>

          {/* Role Selector UI */}
          <div className="mb-8 bg-white/40 backdrop-blur-sm p-2 rounded-2xl border border-white/60 shadow-sm flex flex-col sm:flex-row gap-2">
            <button 
              type="button"
              onClick={() => setRole("doctor")}
              className={`flex-1 p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                role === "doctor" 
                ? "border-blue-400 bg-white/90 text-blue-700 shadow-sm" 
                : "border-transparent hover:border-white/50 text-slate-600 hover:bg-white/30"
              }`}
            >
              <Briefcase className={`w-6 h-6 ${role === "doctor" ? "text-blue-600" : "text-slate-400"}`} />
              <span className="font-bold text-sm">Doctor</span>
            </button>
            
            <button 
              type="button"
              onClick={() => setRole("patient")}
              className={`flex-1 p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                role === "patient" 
                ? "border-emerald-400 bg-white/90 text-emerald-700 shadow-sm" 
                : "border-transparent hover:border-white/50 text-slate-600 hover:bg-white/30"
              }`}
            >
              <User className={`w-6 h-6 ${role === "patient" ? "text-emerald-600" : "text-slate-400"}`} />
              <span className="font-bold text-sm">Patient</span>
            </button>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              ⚠️ {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Common Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className={`block w-full pl-11 pr-4 py-3 border ${errors.fullName ? 'border-red-300 bg-red-50/50' : 'border-white/60 bg-white/50 focus:border-blue-500 hover:bg-white/80'} rounded-2xl text-sm outline-none shadow-sm backdrop-blur-sm transition-all`} placeholder={role === "doctor" ? "Dr. Jane Doe" : "John Doe"} />
                </div>
                {errors.fullName && <p className="mt-1 text-xs text-red-600 font-medium px-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={`block w-full pl-11 pr-4 py-3 border ${errors.phone ? 'border-red-300 bg-red-50/50' : 'border-white/60 bg-white/50 focus:border-blue-500 hover:bg-white/80'} rounded-2xl text-sm outline-none shadow-sm backdrop-blur-sm transition-all`} placeholder="+1 (555) 000-0000" />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-red-600 font-medium px-1">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={`block w-full pl-11 pr-4 py-3 border ${errors.email ? 'border-red-300 bg-red-50/50' : 'border-white/60 bg-white/50 focus:border-blue-500 hover:bg-white/80'} rounded-2xl text-sm outline-none shadow-sm backdrop-blur-sm transition-all`} placeholder="you@example.com" />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600 font-medium px-1">{errors.email}</p>}
            </div>

            {/* Dynamic Fields based on Role */}
            {role === "patient" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-emerald-50/40 backdrop-blur-md border border-emerald-100/60 rounded-2xl">
                <div>
                  <label className="block text-sm font-bold text-emerald-800 mb-2">Date of Birth</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-emerald-600/60" />
                    </div>
                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={`block w-full pl-11 pr-4 py-3 border ${errors.dob ? 'border-red-300' : 'border-emerald-200/60 focus:border-emerald-500 bg-white/60 hover:bg-white/90'} rounded-xl text-sm outline-none shadow-sm transition-all`} />
                  </div>
                  {errors.dob && <p className="mt-1 text-xs text-red-600 font-medium px-1">{errors.dob}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-emerald-800 mb-2">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className={`block w-full px-4 py-3 border ${errors.gender ? 'border-red-300' : 'border-emerald-200/60 focus:border-emerald-500 bg-white/60 hover:bg-white/90'} rounded-xl text-sm outline-none shadow-sm transition-all`}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                  {errors.gender && <p className="mt-1 text-xs text-red-600 font-medium px-1">{errors.gender}</p>}
                </div>
              </div>
            ) : (
              <div className="space-y-5 p-5 bg-blue-50/40 backdrop-blur-md border border-blue-100/60 rounded-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-blue-900 mb-2">Medical Specialization</label>
                    <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} className={`block w-full px-4 py-3 border ${errors.specialization ? 'border-red-300' : 'border-blue-200/60 focus:border-blue-500 bg-white/60 hover:bg-white/90'} rounded-xl text-sm outline-none shadow-sm transition-all`} placeholder="e.g. Cardiology" />
                    {errors.specialization && <p className="mt-1 text-xs text-red-600 font-medium px-1">{errors.specialization}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-900 mb-2">License Number</label>
                    <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} className={`block w-full px-4 py-3 border ${errors.licenseNumber ? 'border-red-300' : 'border-blue-200/60 focus:border-blue-500 bg-white/60 hover:bg-white/90'} rounded-xl text-sm outline-none shadow-sm transition-all`} placeholder="e.g. MED123456" />
                    {errors.licenseNumber && <p className="mt-1 text-xs text-red-600 font-medium px-1">{errors.licenseNumber}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-blue-900 mb-2">Hospital / Clinic Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Building className="h-4 w-4 text-blue-600/60" />
                    </div>
                    <input type="text" name="clinicName" value={formData.clinicName} onChange={handleChange} className={`block w-full pl-11 pr-4 py-3 border ${errors.clinicName ? 'border-red-300' : 'border-blue-200/60 focus:border-blue-500 bg-white/60 hover:bg-white/90'} rounded-xl text-sm outline-none shadow-sm transition-all`} placeholder="City General Hospital" />
                  </div>
                  {errors.clinicName && <p className="mt-1 text-xs text-red-600 font-medium px-1">{errors.clinicName}</p>}
                </div>
              </div>
            )}

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} className={`block w-full pl-11 pr-4 py-3 border ${errors.password ? 'border-red-300 bg-red-50/50' : 'border-white/60 bg-white/50 focus:border-blue-500 hover:bg-white/80'} rounded-2xl text-sm outline-none shadow-sm backdrop-blur-sm transition-all`} placeholder="••••••••" />
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600 font-medium px-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`block w-full pl-11 pr-4 py-3 border ${errors.confirmPassword ? 'border-red-300 bg-red-50/50' : 'border-white/60 bg-white/50 focus:border-blue-500 hover:bg-white/80'} rounded-2xl text-sm outline-none shadow-sm backdrop-blur-sm transition-all`} placeholder="••••••••" />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600 font-medium px-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitted}
              className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-bold text-white transition-all disabled:opacity-70 mt-6 ${
                role === "doctor" ? "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/30" : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-600/30"
              }`}
            >
              {isSubmitted ? "Creating Account..." : `Create ${role === "doctor" ? "Doctor" : "Patient"} Account`}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600 font-medium">
            Already have an account?{" "}
            <Link href="/signin" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
