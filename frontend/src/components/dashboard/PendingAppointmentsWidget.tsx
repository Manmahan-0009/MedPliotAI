"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Calendar, Clock, CheckCircle2, XCircle, RotateCcw, User, Bell, Loader2, RefreshCw, ChevronDown } from "lucide-react";
import { appointmentService } from "@/lib/api-services";

interface PendingRequest {
  id: string;
  appointment_id: string;
  patient_name: string;
  patient_id: string;
  department: string;
  appointment_date: string;
  appointment_time: string;
  consultation_type: string;
  reason?: string;
  status: string;
  created_at: string;
  patient_age?: number;
  patient_gender?: string;
  patient_blood_group?: string;
  patient_phone?: string;
  patient_conditions?: string;
}

interface RescheduleModal {
  open: boolean;
  appointmentId: string;
  patientName: string;
}

interface PendingAppointmentsWidgetProps {
  onRefresh?: () => void;
  onShowToast?: (msg: string) => void;
}

export default function PendingAppointmentsWidget({ onRefresh, onShowToast }: PendingAppointmentsWidgetProps) {
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rescheduleModal, setRescheduleModal] = useState<RescheduleModal>({ open: false, appointmentId: "", patientName: "" });
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleNotes, setRescheduleNotes] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const TIME_SLOTS = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
  ];

  const fetchPending = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await appointmentService.getDoctorPendingFromDashboard();
      setPending(res.pending || []);
    } catch (err) {
      console.error("Failed to fetch pending appointments:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending(false);
    pollingRef.current = setInterval(() => fetchPending(true), 30000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchPending]);

  const handleAccept = async (appointmentId: string) => {
    setActionLoading(appointmentId);
    try {
      await appointmentService.acceptAppointment(appointmentId);
      await fetchPending(true);
      onShowToast?.("Appointment confirmed successfully ✅");
      onRefresh?.();
    } catch (err: any) {
      onShowToast?.(err.message || "Failed to confirm appointment");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (appointmentId: string) => {
    setActionLoading(`reject-${appointmentId}`);
    try {
      await appointmentService.rejectAppointment(appointmentId, "Not available for this slot");
      await fetchPending(true);
      onShowToast?.("Appointment rejected. Patient has been notified.");
      onRefresh?.();
    } catch (err: any) {
      onShowToast?.(err.message || "Failed to reject appointment");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      onShowToast?.("Please select a new date and time");
      return;
    }
    setActionLoading(`reschedule-${rescheduleModal.appointmentId}`);
    try {
      await appointmentService.rescheduleAppointment(
        rescheduleModal.appointmentId,
        rescheduleDate,
        rescheduleTime,
        rescheduleNotes || undefined
      );
      setRescheduleModal({ open: false, appointmentId: "", patientName: "" });
      setRescheduleDate("");
      setRescheduleTime("");
      setRescheduleNotes("");
      await fetchPending(true);
      onShowToast?.("Appointment rescheduled. Patient has been notified 📅");
      onRefresh?.();
    } catch (err: any) {
      onShowToast?.(err.message || "Failed to reschedule appointment");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
            <Bell className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Appointment Requests
              {pending.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700 rounded-full">
                  {pending.length} pending
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-500">Auto-refreshes every 30s</p>
          </div>
        </div>
        <button
          onClick={() => fetchPending(false)}
          disabled={loading}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-500" : ""}`} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar max-h-[380px]">
        {loading ? (
          <div className="py-10 flex flex-col items-center gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            <p className="text-xs">Loading requests...</p>
          </div>
        ) : pending.length === 0 ? (
          <div className="py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No pending requests</p>
            <p className="text-[10px] text-slate-400 mt-1">All appointments are up to date</p>
          </div>
        ) : (
          pending.map((req) => (
            <div
              key={req.id}
              className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
            >
              {/* Card Top */}
              <div
                className="p-3.5 bg-white dark:bg-slate-900 cursor-pointer"
                onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-xs">
                        {req.patient_name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-xs">{req.patient_name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {req.department} · {req.consultation_type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 justify-end">
                      <Calendar className="w-3 h-3" />
                      {req.appointment_date}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 justify-end mt-0.5">
                      <Clock className="w-3 h-3" />
                      {req.appointment_time}
                    </div>
                  </div>
                </div>

                {req.reason && (
                  <p className="text-[10px] text-slate-400 mt-2 italic pl-11">"{req.reason}"</p>
                )}

                {/* Expand toggle */}
                <div className="flex items-center justify-between mt-2 pl-11">
                  <span className="text-[10px] text-slate-400">
                    {req.patient_age && `${req.patient_age}y`}
                    {req.patient_gender && ` · ${req.patient_gender}`}
                    {req.patient_blood_group && ` · ${req.patient_blood_group}`}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${expandedId === req.id ? "rotate-180" : ""}`} />
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === req.id && (
                <div className="px-4 pb-3 pt-0 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  {req.patient_conditions && (
                    <p className="text-[10px] text-slate-500">
                      <span className="font-semibold">Conditions:</span> {req.patient_conditions}
                    </p>
                  )}
                  {req.patient_phone && (
                    <p className="text-[10px] text-slate-500">
                      <span className="font-semibold">Phone:</span> {req.patient_phone}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleAccept(req.id)}
                  disabled={actionLoading === req.id}
                  className="flex-1 py-2 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {actionLoading === req.id
                    ? <Loader2 className="w-3 h-3 animate-spin" />
                    : <CheckCircle2 className="w-3 h-3" />}
                  Accept
                </button>

                <button
                  onClick={() => setRescheduleModal({ open: true, appointmentId: req.id, patientName: req.patient_name })}
                  disabled={!!actionLoading}
                  className="flex-1 py-2 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reschedule
                </button>

                <button
                  onClick={() => handleReject(req.id)}
                  disabled={actionLoading === `reject-${req.id}`}
                  className="flex-1 py-2 text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {actionLoading === `reject-${req.id}`
                    ? <Loader2 className="w-3 h-3 animate-spin" />
                    : <XCircle className="w-3 h-3" />}
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Reschedule Appointment</h4>
              <p className="text-xs text-slate-500 mt-1">Patient: <strong>{rescheduleModal.patientName}</strong></p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">New Date</label>
                <input
                  type="date"
                  min={today}
                  value={rescheduleDate}
                  onChange={e => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">New Time</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {TIME_SLOTS.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setRescheduleTime(slot)}
                      className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                        rescheduleTime === slot
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Notes (optional)</label>
                <textarea
                  value={rescheduleNotes}
                  onChange={e => setRescheduleNotes(e.target.value)}
                  placeholder="Reason for rescheduling..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  setRescheduleModal({ open: false, appointmentId: "", patientName: "" });
                  setRescheduleDate("");
                  setRescheduleTime("");
                  setRescheduleNotes("");
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={!rescheduleDate || !rescheduleTime || !!actionLoading}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
