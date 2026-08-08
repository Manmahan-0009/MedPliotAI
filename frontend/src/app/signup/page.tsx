"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  User,
  Phone,
  Calendar,
  Briefcase,
  Building,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  Heart,
  Activity,
  ChevronRight,
  Sparkles,
} from "lucide-react";

// Password strength calculator helper
function calculatePasswordStrength(pass: string): { score: number; label: string; color: string; barColor: string } {
  if (!pass) return { score: 0, label: "", color: "text-slate-400", barColor: "bg-slate-200" };
  let score = 0;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score <= 1) return { score: 1, label: "Weak", color: "text-red-500", barColor: "bg-red-500" };
  if (score === 2) return { score: 2, label: "Fair", color: "text-amber-500", barColor: "bg-amber-500" };
  if (score === 3) return { score: 3, label: "Strong", color: "text-blue-500", barColor: "bg-blue-500" };
  return { score: 4, label: "Excellent", color: "text-emerald-500", barColor: "bg-emerald-500" };
}

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signupDoctor, signupPatient } = useAuth();

  const [role, setRole] = useState<"doctor" | "patient">("patient");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check URL query param for default role (e.g., ?role=doctor)
  useEffect(() => {
    const r = searchParams.get("role");
    if (r === "doctor" || r === "patient") {
      setRole(r);
    }
  }, [searchParams]);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    // Patient specific
    dob: "",
    gender: "",
    bloodGroup: "O+",
    address: "",
    emergencyContact: "",
    // Doctor specific
    specialization: "",
    licenseNumber: "",
    clinicName: "",
    qualification: "MBBS, MD",
    experienceYears: "5",
  });

  const pwStrength = calculatePasswordStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[e.target.name];
        return copy;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Please enter your full name.";
    
    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Please enter your phone number.";
    } else if (formData.phone.trim().length < 7) {
      newErrors.phone = "Please enter a valid contact phone number.";
    }

    if (!formData.password) {
      newErrors.password = "Please enter a password.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (role === "doctor") {
      if (!formData.specialization.trim()) newErrors.specialization = "Specialization is required.";
      if (!formData.licenseNumber.trim()) newErrors.licenseNumber = "Medical Registration Number is required.";
      if (!formData.clinicName.trim()) newErrors.clinicName = "Hospital or Clinic name is required.";
      if (!formData.qualification.trim()) newErrors.qualification = "Qualification is required.";
    } else {
      if (!formData.dob) newErrors.dob = "Date of birth is required.";
      if (!formData.gender) newErrors.gender = "Gender selection is required.";
      if (!formData.address.trim()) newErrors.address = "Address is required.";
      if (!formData.emergencyContact.trim()) newErrors.emergencyContact = "Emergency contact is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
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
          experience_years: parseInt(formData.experienceYears, 10) || 5,
          hospital: formData.clinicName,
          qualification: formData.qualification,
        });
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
          blood_group: formData.bloodGroup || undefined,
          address: formData.address || undefined,
          emergency_contact: formData.emergencyContact || undefined,
        });
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push(role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard");
      }, 1200);
    } catch (err: any) {
      console.error("Signup error:", err);
      setErrors({
        general: err.message || "Registration failed. Please verify your information and try again.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans text-slate-900 relative overflow-hidden bg-slate-50 selection:bg-blue-600 selection:text-white">
      
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute top-[-10%] left-[20%] w-[45%] h-[45%] rounded-full bg-blue-500/15 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[50%] h-[50%] rounded-full bg-emerald-500/15 blur-[130px] pointer-events-none" />
      <div className="absolute top-[35%] left-[-10%] w-[35%] h-[35%] rounded-full bg-indigo-500/10 blur-[110px] pointer-events-none" />

      {/* Left Branding Side (Desktop) */}
      <div className="hidden xl:flex xl:w-[45%] bg-slate-900/95 backdrop-blur-xl flex-col justify-between p-12 relative overflow-hidden text-white border-r border-white/10 shadow-2xl z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900/90 to-slate-950 mix-blend-overlay pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider mb-14 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Return to Home
          </Link>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-white">MediPilot AI</div>
              <p className="text-xs text-blue-400 font-semibold tracking-wide uppercase">Next-Gen Healthcare Platform</p>
            </div>
          </div>

          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-lg mt-8">
            <motion.h1 variants={fadeUp} className="text-4xl font-extrabold tracking-tight leading-tight text-white">
              Connect to Intelligent Clinical Workflow.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-slate-300 text-base leading-relaxed">
              Whether you are a healthcare provider automating SOAP documentation or a patient tracking daily recovery, MediPilot AI delivers a unified experience.
            </motion.p>
          </motion.div>

          {/* Feature Highlights */}
          <div className="mt-10 space-y-4 max-w-md">
            <div className="flex items-start gap-3 p-3.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Automated Clinical Notes</h4>
                <p className="text-[11px] text-slate-300">Whisper AI voice transcription and automatic SOAP generation.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
              <Heart className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Patient Recovery Dashboard</h4>
                <p className="text-[11px] text-slate-300">Real-time recovery metrics, symptom logs, and smart pharmacy alternatives.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="relative z-10 flex items-center gap-3 text-slate-300 text-xs font-semibold bg-white/5 px-4 py-2.5 rounded-full border border-white/10 w-max backdrop-blur-md">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>256-Bit SSL Encryption • HIPAA Architecture Ready</span>
        </div>
      </div>

      {/* Right Form Container Side */}
      <div className="flex-1 flex flex-col justify-center py-10 px-4 sm:px-10 lg:px-20 relative overflow-y-auto z-10">
        
        {/* Mobile Header Link */}
        <div className="xl:hidden absolute top-6 left-6">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-xs font-bold bg-white/70 backdrop-blur-md px-3.5 py-2 rounded-full border border-slate-200 shadow-sm">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
        </div>

        {/* Glassmorphism Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-xl border border-white shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] rounded-3xl p-6 sm:p-10 my-6"
        >
          {/* Card Header */}
          <div className="text-center sm:text-left mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Sign Up for Free
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Your Account</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">Select your role to get started with your customized portal.</p>
          </div>

          {/* Interactive Role Selection Cards */}
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button
              type="button"
              onClick={() => { setRole("doctor"); setErrors({}); }}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                role === "doctor"
                  ? "border-blue-500 bg-blue-50/70 text-blue-950 shadow-md ring-2 ring-blue-500/20"
                  : "border-slate-200 hover:border-blue-300 bg-white/50 hover:bg-white text-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  role === "doctor" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-500"
                }`}>
                  <Briefcase className="w-5 h-5" />
                </div>
                {role === "doctor" && (
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-base">Medical Doctor</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  For physicians, specialists & clinical staff. Access patient records & AI SOAP tools.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setRole("patient"); setErrors({}); }}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                role === "patient"
                  ? "border-emerald-500 bg-emerald-50/70 text-emerald-950 shadow-md ring-2 ring-emerald-500/20"
                  : "border-slate-200 hover:border-emerald-300 bg-white/50 hover:bg-white text-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  role === "patient" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-100 text-slate-500"
                }`}>
                  <User className="w-5 h-5" />
                </div>
                {role === "patient" && (
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-base">Patient</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  For individuals tracking health metrics, appointments, prescriptions & AI reports.
                </p>
              </div>
            </button>
          </div>

          {/* Success State Overlay Card */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 bg-emerald-500 text-white rounded-2xl text-center space-y-3 mb-6 shadow-xl"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 text-white mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Account Created Successfully!</h3>
                <p className="text-xs text-emerald-100 font-medium">Initializing session and redirecting to your {role} dashboard...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* General Error Banner */}
          <AnimatePresence>
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <span>{errors.general}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Common Top Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder={role === "doctor" ? "Dr. Sarah Mitchell" : "Rahul Sharma"}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-slate-50/80 text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                      errors.fullName ? "border-red-300 focus:ring-red-500 bg-red-50/30" : "border-slate-200 focus:ring-blue-600 focus:bg-white"
                    }`}
                  />
                </div>
                {errors.fullName && <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-slate-50/80 text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                      errors.phone ? "border-red-300 focus:ring-red-500 bg-red-50/30" : "border-slate-200 focus:ring-blue-600 focus:bg-white"
                    }`}
                  />
                </div>
                {errors.phone && <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={role === "doctor" ? "doctor@medipilot.ai" : "patient@medipilot.ai"}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-slate-50/80 text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                    errors.email ? "border-red-300 focus:ring-red-500 bg-red-50/30" : "border-slate-200 focus:ring-blue-600 focus:bg-white"
                  }`}
                />
              </div>
              {errors.email && <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.email}</p>}
            </div>

            {/* DYNAMIC ROLE SPECIFIC FIELDS */}
            <AnimatePresence mode="wait">
              {role === "doctor" ? (
                <motion.div
                  key="doctor-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-1"
                >
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-900 border-b border-blue-100 pb-2">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <span>Doctor Credentials & Medical Profile</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Specialization *</label>
                        <input
                          type="text"
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleChange}
                          placeholder="e.g. Cardiology / Internal Medicine"
                          className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white text-slate-900 focus:outline-none focus:ring-2 ${
                            errors.specialization ? "border-red-300 focus:ring-red-500" : "border-slate-200 focus:ring-blue-600"
                          }`}
                        />
                        {errors.specialization && <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.specialization}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Medical Registration No. *</label>
                        <input
                          type="text"
                          name="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={handleChange}
                          placeholder="e.g. REG-2026-8812"
                          className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white text-slate-900 focus:outline-none focus:ring-2 ${
                            errors.licenseNumber ? "border-red-300 focus:ring-red-500" : "border-slate-200 focus:ring-blue-600"
                          }`}
                        />
                        {errors.licenseNumber && <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.licenseNumber}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Hospital / Clinic Name *</label>
                        <div className="relative">
                          <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            name="clinicName"
                            value={formData.clinicName}
                            onChange={handleChange}
                            placeholder="MediPilot Super Speciality Hospital"
                            className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-white text-slate-900 focus:outline-none focus:ring-2 ${
                              errors.clinicName ? "border-red-300 focus:ring-red-500" : "border-slate-200 focus:ring-blue-600"
                            }`}
                          />
                        </div>
                        {errors.clinicName && <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.clinicName}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Years of Experience *</label>
                        <select
                          name="experienceYears"
                          value={formData.experienceYears}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="1">1 - 3 Years</option>
                          <option value="5">5+ Years</option>
                          <option value="10">10+ Years</option>
                          <option value="15">15+ Years</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Qualification *</label>
                      <div className="relative">
                        <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          name="qualification"
                          value={formData.qualification}
                          onChange={handleChange}
                          placeholder="e.g. MBBS, MD, FRCP"
                          className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-white text-slate-900 focus:outline-none focus:ring-2 ${
                            errors.qualification ? "border-red-300 focus:ring-red-500" : "border-slate-200 focus:ring-blue-600"
                          }`}
                        />
                      </div>
                      {errors.qualification && <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.qualification}</p>}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="patient-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-1"
                >
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 border-b border-emerald-100 pb-2">
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>Personal Health Details</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Date of Birth *</label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-white text-slate-900 focus:outline-none focus:ring-2 ${
                              errors.dob ? "border-red-300 focus:ring-red-500" : "border-slate-200 focus:ring-emerald-600"
                            }`}
                          />
                        </div>
                        {errors.dob && <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.dob}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Gender *</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white text-slate-900 focus:outline-none focus:ring-2 ${
                            errors.gender ? "border-red-300 focus:ring-red-500" : "border-slate-200 focus:ring-emerald-600"
                          }`}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                        {errors.gender && <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.gender}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Blood Group (Optional)</label>
                        <select
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        >
                          {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Emergency Contact *</label>
                        <input
                          type="text"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleChange}
                          placeholder="Name & Contact (e.g. +91 9876543210)"
                          className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white text-slate-900 focus:outline-none focus:ring-2 ${
                            errors.emergencyContact ? "border-red-300 focus:ring-red-500" : "border-slate-200 focus:ring-emerald-600"
                          }`}
                        />
                        {errors.emergencyContact && <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.emergencyContact}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Residential Address *</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Street Address, City, State"
                        className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white text-slate-900 focus:outline-none focus:ring-2 ${
                          errors.address ? "border-red-300 focus:ring-red-500" : "border-slate-200 focus:ring-emerald-600"
                        }`}
                      />
                      {errors.address && <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.address}</p>}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PASSWORD FIELDS + STRENGTH INDICATOR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border bg-slate-50/80 text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                      errors.password ? "border-red-300 focus:ring-red-500 bg-red-50/30" : "border-slate-200 focus:ring-blue-600 focus:bg-white"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.password}</p>}
                
                {/* Visual Password Strength Meter */}
                {formData.password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Strength:</span>
                      <span className={`font-bold ${pwStrength.color}`}>{pwStrength.label}</span>
                    </div>
                    <div className="flex gap-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`flex-1 transition-all duration-300 rounded-full ${
                            step <= pwStrength.score ? pwStrength.barColor : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border bg-slate-50/80 text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                      errors.confirmPassword ? "border-red-300 focus:ring-red-500 bg-red-50/30" : "border-slate-200 focus:ring-blue-600 focus:bg-white"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <motion.button
              type="submit"
              disabled={isSubmitting || isSuccess}
              whileHover={isSubmitting ? {} : { y: -1, boxShadow: role === "doctor" ? "0 8px 24px -4px rgb(37 99 235 / 0.35)" : "0 8px 24px -4px rgb(16 185 129 / 0.35)" }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3.5 px-4 rounded-xl shadow-md text-sm font-bold text-white transition-all flex items-center justify-center gap-2 mt-6 ${
                role === "doctor"
                  ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
              } disabled:opacity-50 cursor-pointer`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account & Initializing Workspace...</span>
                </>
              ) : (
                <>
                  <span>Complete {role === "doctor" ? "Doctor" : "Patient"} Registration</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* SIGN IN LINK */}
          <div className="mt-8 text-center border-t border-slate-100 pt-4 text-xs font-medium text-slate-600">
            Already registered on MediPilot AI?{" "}
            <Link href="/signin" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Sign In Here
            </Link>
          </div>

        </motion.div>
      </div>

    </div>
  );
}

export default function SignUpPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading sign up form...</p>
        </div>
      </div>
    }>
      <SignUpContent />
    </React.Suspense>
  );
}
