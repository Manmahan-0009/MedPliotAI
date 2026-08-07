"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronRight,
  MoreVertical,
  Mic,
  User,
  CheckCircle2,
  XCircle,
  CalendarDays,
  GripVertical
} from "lucide-react";
import { doctorService } from "@/lib/api-services";

export interface AppointmentItem {
  id: string;
  patient_name: string;
  patient_id: string;
  time: string;
  slot?: "morning" | "afternoon" | "evening";
  type: string;
  status: string;
  priority?: string;
  duration?: string;
  date?: string;
}

interface UpcomingAppointmentsWidgetProps {
  appointments: AppointmentItem[];
  onRefresh: () => void;
  onSelectPatient: (patientId: string) => void;
  onStartConsultation: () => void;
  onShowToast: (msg: string) => void;
}

export default function UpcomingAppointmentsWidget({
  appointments: initialAppointments,
  onRefresh,
  onSelectPatient,
  onStartConsultation,
  onShowToast
}: UpcomingAppointmentsWidgetProps) {
  const [filterRange, setFilterRange] = useState<"today" | "upcoming" | "weekly" | "monthly">("today");
  const [appointments, setAppointments] = useState<AppointmentItem[]>(initialAppointments);
  const [selectedApp, setSelectedApp] = useState<AppointmentItem | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarView, setCalendarView] = useState<"day" | "week" | "month">("week");

  // Drag and Drop state
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("appointment_id", id);
    setDraggedAppId(id);
  };

  const handleDropSlot = async (e: React.DragEvent, slot: "morning" | "afternoon" | "evening") => {
    e.preventDefault();
    const app_id = e.dataTransfer.getData("appointment_id") || draggedAppId;
    if (!app_id) return;

    const defaultTimes = {
      morning: "10:30 AM",
      afternoon: "02:30 PM",
      evening: "05:45 PM"
    };

    try {
      // Optimistic UI update
      setAppointments(prev =>
        prev.map(a => (a.id === app_id ? { ...a, slot, time: defaultTimes[slot] } : a))
      );
      await doctorService.rescheduleAppointment(app_id, slot, defaultTimes[slot]);
      onShowToast("Appointment Rescheduled Successfully");
      onRefresh();
    } catch (err) {
      console.error(err);
      onShowToast("Failed to reschedule appointment");
    } finally {
      setDraggedAppId(null);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: string) => {
    setAppointments(prev => prev.map(a => (a.id === appId ? { ...a, status: newStatus } : a)));
    onShowToast(`Appointment status updated to ${newStatus}`);
    setSelectedApp(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-full">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-blue-600" /> Upcoming Appointments
          </h3>
          <p className="text-xs text-slate-500">Drag to reschedule or click for quick clinical actions</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Calendar View Button */}
          <button
            onClick={() => setShowCalendarModal(true)}
            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <CalendarDays className="w-3.5 h-3.5 text-blue-600" /> Calendar
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl mb-4 text-xs font-bold">
        {(["today", "upcoming", "weekly", "monthly"] as const).map(range => (
          <button
            key={range}
            onClick={() => setFilterRange(range)}
            className={`flex-1 py-1.5 rounded-lg capitalize transition-all ${
              filterRange === range
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Drag & Drop Time Slot Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 flex-1">
        {(["morning", "afternoon", "evening"] as const).map(slot => (
          <div
            key={slot}
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDropSlot(e, slot)}
            className="bg-slate-50/70 dark:bg-slate-800/30 rounded-xl p-3 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col min-h-[140px]"
          >
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>{slot} Slot</span>
              <span className="font-mono">
                {slot === "morning" ? "9AM-12PM" : slot === "afternoon" ? "12PM-4PM" : "4PM-8PM"}
              </span>
            </div>

            <div className="space-y-2 flex-1">
              {appointments
                .filter(a => (a.slot || "morning") === slot)
                .map(app => (
                  <div
                    key={app.id}
                    draggable
                    onDragStart={e => handleDragStart(e, app.id)}
                    className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-grab active:cursor-grabbing group relative"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs">{app.patient_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {app.patient_id} • {app.type}
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-bold text-[10px] rounded-md">
                        {app.time}
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span className={`px-2 py-0.5 font-bold rounded ${
                        app.status === "In Consultation" ? "bg-emerald-100 text-emerald-800" :
                        app.status === "Checked In" ? "bg-purple-100 text-purple-800" : "bg-slate-100 text-slate-700"
                      }`}>
                        {app.status}
                      </span>
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-700"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 max-w-sm w-full shadow-xl">
            <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">
              Appointment: {selectedApp.patient_name}
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              MRN: {selectedApp.patient_id} • {selectedApp.time} ({selectedApp.type})
            </p>

            <div className="space-y-2 text-xs font-semibold">
              <button
                onClick={() => {
                  setSelectedApp(null);
                  onStartConsultation();
                }}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <Mic className="w-4 h-4" /> Start AI Consultation
              </button>

              <button
                onClick={() => {
                  setSelectedApp(null);
                  onSelectPatient(selectedApp.patient_id);
                }}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
              >
                <User className="w-4 h-4" /> View Patient Chart
              </button>

              <button
                onClick={() => handleStatusChange(selectedApp.id, "Completed")}
                className="w-full py-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark Completed
              </button>

              <button
                onClick={() => handleStatusChange(selectedApp.id, "Cancelled")}
                className="w-full py-2.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
              >
                <XCircle className="w-4 h-4" /> Cancel Appointment
              </button>
            </div>

            <button
              onClick={() => setSelectedApp(null)}
              className="mt-4 w-full py-2 text-slate-400 font-bold text-xs hover:text-slate-600"
            >
              Close Menu
            </button>
          </div>
        </div>
      )}

      {/* Full Calendar View Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 max-w-2xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" /> Interactive Schedule Calendar
              </h4>
              <div className="flex items-center gap-2">
                {(["day", "week", "month"] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setCalendarView(v)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize ${
                      calendarView === v ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {v} View
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-3 min-h-[250px]">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {calendarView.toUpperCase()} SCHEDULE OVERVIEW ({new Date().toLocaleDateString()})
              </div>
              <div className="space-y-2">
                {appointments.map(app => (
                  <div key={app.id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-white">{app.patient_name}</div>
                      <div className="text-slate-400 font-mono">{app.patient_id} • {app.type}</div>
                    </div>
                    <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                      {app.time} ({app.slot})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowCalendarModal(false)}
                className="px-5 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Close Calendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
