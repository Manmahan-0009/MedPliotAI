"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/lib/protected-route";
import { useAuth } from "@/lib/auth-context";
import PatientSidebar from "@/components/patient-sidebar";
import { appointmentService } from "@/lib/api-services";
import {
  Search, Filter, Star, ChevronLeft, ChevronRight, Calendar, Clock,
  CheckCircle2, Stethoscope, Building2, Wallet, ArrowRight, ArrowLeft,
  Loader2, AlertCircle, X, SortAsc, Sparkles, Phone, RefreshCw, User
} from "lucide-react";

const DEPARTMENTS = [
  "All", "General Medicine", "Cardiology", "Orthopedics", "Dermatology",
  "Neurology", "Pediatrics", "Gynecology", "Ophthalmology", "Dentistry"
];

const CONSULTATION_TYPES = ["In-Person Visit", "Video Consultation", "Follow-up Visit", "Emergency Consultation"];

type Step = 1 | 2 | 3 | 4 | 5;

// ── Step Indicator ────────────────────────────────────────────────────────────
function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { n: 1, label: "Select Doctor" },
    { n: 2, label: "Choose Date" },
    { n: 3, label: "Pick Time" },
    { n: 4, label: "Details" },
    { n: 5, label: "Confirm" },
  ];
  return (
    <div className="flex items-center gap-1 sm:gap-2 w-full mb-8">
      {steps.map((s, idx) => (
        <React.Fragment key={s.n}>
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              s.n < step
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/50"
                : s.n === step
                  ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50 scale-110"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
            }`}>
              {s.n < step ? <CheckCircle2 className="w-4 h-4" /> : s.n}
            </div>
            <span className={`text-[10px] font-medium hidden sm:block ${
              s.n === step ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-400"
            }`}>
              {s.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`h-0.5 flex-1 transition-all duration-500 ${
              s.n < step ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Doctor Card ───────────────────────────────────────────────────────────────
function DoctorCard({ doctor, selected, onSelect }: { doctor: any; selected: boolean; onSelect: () => void }) {
  const initials = doctor.full_name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer rounded-2xl border p-5 transition-all duration-200 hover:shadow-lg group ${
        selected
          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-md shadow-emerald-100 dark:shadow-emerald-900/30"
          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-700"
      }`}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-white" />
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 font-bold text-lg text-white shadow-md transition-transform group-hover:scale-105 ${
          selected ? "bg-gradient-to-br from-emerald-500 to-teal-500" : "bg-gradient-to-br from-slate-500 to-slate-600"
        }`}>
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{doctor.full_name}</h3>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{doctor.specialization}</p>
          <div className="flex items-center gap-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < Math.floor(doctor.rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-slate-700"}`} />
            ))}
            <span className="text-[10px] text-slate-500 ml-1">{doctor.rating}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{doctor.hospital}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{doctor.experience}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <Wallet className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">{doctor.consultation_fee}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            doctor.availability === "Available Today"
              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
          }`}>
            {doctor.availability}
          </span>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 mt-2 font-medium">{doctor.department}</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BookAppointmentPage() {
  const router = useRouter();
  const { userProfile } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [sortBy, setSortBy] = useState("rating");
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [consultationType, setConsultationType] = useState("In-Person Visit");
  const [reason, setReason] = useState("");
  const [booking, setBooking] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [bookingError, setBookingError] = useState("");

  const patientId = userProfile?.patient_profile?.patient_id || userProfile?.id || "";

  // Min date = today
  const today = new Date().toISOString().split("T")[0];

  const fetchDoctors = useCallback(async () => {
    setLoadingDoctors(true);
    try {
      const data = await appointmentService.getAvailableDoctors({
        department: selectedDept !== "All" ? selectedDept : undefined,
        query: searchQuery || undefined,
        sort_by: sortBy,
      });
      setDoctors(data || []);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    } finally {
      setLoadingDoctors(false);
    }
  }, [selectedDept, searchQuery, sortBy]);

  useEffect(() => {
    if (step === 1) fetchDoctors();
  }, [step, fetchDoctors]);

  const fetchSlots = useCallback(async () => {
    if (!selectedDoctor || !selectedDate) return;
    setLoadingSlots(true);
    try {
      const res = await appointmentService.getDoctorSlots(selectedDoctor.id, selectedDate);
      setAvailableSlots(res.available_slots || selectedDoctor.today_slots || []);
    } catch {
      setAvailableSlots(selectedDoctor.today_slots || []);
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedDoctor, selectedDate]);

  useEffect(() => {
    if (step === 3 && selectedDate && selectedDoctor) fetchSlots();
  }, [step, selectedDate, selectedDoctor, fetchSlots]);

  const handleBook = async () => {
    if (!patientId || !selectedDoctor || !selectedDate || !selectedTime) {
      setBookingError("Please complete all steps before confirming.");
      return;
    }
    setBooking(true);
    setBookingError("");
    try {
      const result = await appointmentService.bookAppointment({
        doctor_id: selectedDoctor.id,
        patient_id: patientId,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        consultation_type: consultationType,
        reason: reason || "General Health Consultation",
        slot: selectedTime.includes("AM") ? "morning" : "afternoon",
      });
      setBookingResult(result);
      setStep(5);
    } catch (err: any) {
      setBookingError(err.message || "Failed to book appointment. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  // ── Step 1: Select Doctor ──────────────────────────────────────────────────
  const renderStep1 = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Find a Doctor</h2>
        <p className="text-xs text-slate-500 mt-0.5">Search by name, specialty, or department</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchDoctors()}
            placeholder="Search doctors, specializations..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        <select
          value={selectedDept}
          onChange={e => setSelectedDept(e.target.value)}
          className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <option value="rating">Sort: Top Rated</option>
          <option value="experience">Sort: Most Experienced</option>
          <option value="fee">Sort: Lowest Fee</option>
          <option value="name">Sort: Name A-Z</option>
        </select>
        <button
          onClick={fetchDoctors}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
        >
          {loadingDoctors ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </button>
      </div>

      {/* Doctor Grid */}
      {loadingDoctors ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-44 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="py-16 text-center text-slate-500">
          <Stethoscope className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-medium">No doctors found matching your criteria</p>
          <button onClick={fetchDoctors} className="mt-3 text-emerald-600 text-sm font-semibold hover:underline">Reset filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
          {doctors.map(doc => (
            <DoctorCard
              key={doc.id}
              doctor={doc}
              selected={selectedDoctor?.id === doc.id}
              onSelect={() => setSelectedDoctor(doc)}
            />
          ))}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button
          disabled={!selectedDoctor}
          onClick={() => setStep(2)}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
        >
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // ── Step 2: Choose Date ────────────────────────────────────────────────────
  const renderStep2 = () => (
    <div className="space-y-5 max-w-lg mx-auto">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Choose a Date</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Booking with <strong>{selectedDoctor?.full_name}</strong> · {selectedDoctor?.department}
        </p>
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Select Appointment Date</label>
        <input
          type="date"
          min={today}
          value={selectedDate}
          onChange={e => { setSelectedDate(e.target.value); setSelectedTime(""); }}
          className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        {selectedDate && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-semibold">
            ✓ {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        )}
      </div>

      <div className="flex justify-between pt-2">
        <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          disabled={!selectedDate}
          onClick={() => setStep(3)}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
        >
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // ── Step 3: Pick Time ──────────────────────────────────────────────────────
  const renderStep3 = () => (
    <div className="space-y-5 max-w-lg mx-auto">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pick a Time Slot</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {selectedDoctor?.full_name} · {selectedDate && new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
        </p>
      </div>

      {loadingSlots ? (
        <div className="py-12 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-500" />
          <p className="text-sm">Loading available slots...</p>
        </div>
      ) : availableSlots.length === 0 ? (
        <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No slots available for this date</p>
          <button onClick={() => setStep(2)} className="mt-3 text-emerald-600 text-xs font-semibold hover:underline">Choose another date</button>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {availableSlots.map(slot => (
            <button
              key={slot}
              onClick={() => setSelectedTime(slot)}
              className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all ${
                selectedTime === slot
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200 dark:shadow-emerald-900/50 scale-105"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-2">
        <button onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          disabled={!selectedTime}
          onClick={() => setStep(4)}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
        >
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // ── Step 4: Reason & Type ──────────────────────────────────────────────────
  const renderStep4 = () => (
    <div className="space-y-5 max-w-lg mx-auto">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Appointment Details</h2>
        <p className="text-xs text-slate-500 mt-0.5">Tell us why you're visiting</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Consultation Type</label>
          <div className="grid grid-cols-2 gap-2">
            {CONSULTATION_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setConsultationType(type)}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                  consultationType === type
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
            Reason for Visit <span className="text-slate-400 font-normal">(helps doctor prepare)</span>
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g., Follow-up for BP medication, chest pain for 3 days, routine checkup..."
            rows={4}
            className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
          />
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button onClick={() => setStep(3)} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={() => setStep(5)}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
        >
          Review & Confirm <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // ── Step 5: Confirm / Success ──────────────────────────────────────────────
  const renderStep5 = () => {
    if (bookingResult) {
      const apt = bookingResult.appointment;
      return (
        <div className="space-y-6 max-w-lg mx-auto text-center">
          {/* Success Animation */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto shadow-xl shadow-emerald-200 dark:shadow-emerald-900/50 animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Appointment Booked! 🎉</h2>
            <p className="text-sm text-slate-500 mt-1">Your request has been sent to the doctor.</p>
          </div>

          {/* Appointment Summary */}
          <div className="text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Appointment ID</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">{apt.appointment_id}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Status</p>
                <p className="font-bold text-amber-600 dark:text-amber-400">⏳ Pending Confirmation</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Doctor</p>
                <p className="font-bold text-slate-800 dark:text-white">{apt.doctor_name}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Department</p>
                <p className="font-bold text-slate-700 dark:text-slate-300">{apt.department}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Date</p>
                <p className="font-bold text-slate-700 dark:text-slate-300">{apt.appointment_date}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Time</p>
                <p className="font-bold text-slate-700 dark:text-slate-300">{apt.appointment_time}</p>
              </div>
            </div>
          </div>

          {/* AI Checklist */}
          {apt.ai_checklist && apt.ai_checklist.length > 0 && (
            <div className="text-left bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-300">
                <Sparkles className="w-4 h-4" />
                AI Preparation Checklist
              </div>
              {apt.ai_checklist.map((item: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <Link
              href="/patient/appointments"
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center"
            >
              View My Appointments
            </Link>
            <Link
              href="/patient/dashboard"
              className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors text-center"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      );
    }

    // Confirm screen (pre-booking)
    return (
      <div className="space-y-5 max-w-lg mx-auto">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Confirm Appointment</h2>
          <p className="text-xs text-slate-500 mt-0.5">Please review your booking details</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          {/* Doctor Summary */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
              {selectedDoctor?.full_name.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedDoctor?.full_name}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">{selectedDoctor?.specialization}</p>
              <p className="text-xs text-slate-500">{selectedDoctor?.hospital}</p>
            </div>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Date</p>
              <p className="font-bold text-slate-800 dark:text-white mt-0.5">{selectedDate}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Time</p>
              <p className="font-bold text-slate-800 dark:text-white mt-0.5">{selectedTime}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Type</p>
              <p className="font-bold text-slate-800 dark:text-white mt-0.5">{consultationType}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Fee</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{selectedDoctor?.consultation_fee}</p>
            </div>
          </div>

          {reason && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[11px] text-slate-400 font-medium mb-1">Reason</p>
              <p className="text-xs text-slate-700 dark:text-slate-300 italic">"{reason}"</p>
            </div>
          )}
        </div>

        {bookingError && (
          <div className="p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {bookingError}
          </div>
        )}

        <div className="flex justify-between pt-2">
          <button onClick={() => setStep(4)} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={handleBook}
            disabled={booking}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            {booking ? <><Loader2 className="w-4 h-4 animate-spin" /> Booking...</> : <><CheckCircle2 className="w-4 h-4" /> Confirm Booking</>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute allowedRole="patient">
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100">
        <PatientSidebar />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <Link href="/patient/appointments" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <ChevronLeft className="w-5 h-5 text-slate-500" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Book an Appointment</h1>
                <p className="text-xs text-slate-500">Step {step} of 5</p>
              </div>
            </div>

            {/* Step Indicator */}
            {!bookingResult && <StepIndicator step={step} />}

            {/* Step Content */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
              {step === 5 && renderStep5()}
            </div>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
