"use client";

import React, { useState, useEffect } from "react";
import { Search, Bell, Plus, Mic, UserPlus, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface DoctorTopbarProps {
  onSearch?: (query: string) => void;
  onNewConsultation: () => void;
  onAddPatient: () => void;
  onOpenNotifications: () => void;
  unreadCount?: number;
}

export default function DoctorTopbar({
  onSearch,
  onNewConsultation,
  onAddPatient,
  onOpenNotifications,
  unreadCount = 3
}: DoctorTopbarProps) {
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState<string>("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateTime(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (onSearch) onSearch(val);
  };

  const doctorName = userProfile?.doctor_profile?.full_name || "Dr. Sarah Mitchell";
  const doctorSpecialty = userProfile?.doctor_profile?.specialization || "Internal Medicine";

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 transition-colors z-10 shadow-xs">
      {/* Left: Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search patients, consultations, MRNs..."
            className="w-full bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 placeholder-slate-400 text-xs rounded-xl pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Right: Date/Time, Quick Actions, Notifications, Profile */}
      <div className="flex items-center gap-4">
        {/* Live Date / Time Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>{currentDateTime}</span>
        </div>

        {/* Quick Action: Start Consultation */}
        <button
          onClick={onNewConsultation}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
        >
          <Mic className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Start Consultation</span>
        </button>

        {/* Quick Action: Add Patient */}
        <button
          onClick={onAddPatient}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all"
        >
          <UserPlus className="w-3.5 h-3.5 text-slate-500" />
          <span>Add Patient</span>
        </button>

        {/* Notifications Icon Button */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
          )}
        </button>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block" />

        {/* Doctor Info */}
        <div className="hidden md:flex items-center gap-2.5">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-800 dark:text-white">{doctorName}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{doctorSpecialty}</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {doctorName.split(" ").map(n => n[0]).join("").substring(0, 2)}
          </div>
        </div>
      </div>
    </header>
  );
}
