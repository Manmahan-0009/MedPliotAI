"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { Clock, CheckCircle2, Pill, Store, Calendar, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface ScheduleItem {
  id: string;
  medicine_name: string;
  dosage: string;
  time_slot: string;
  food_instruction: string;
  status: string;
}

export default function PatientDashboard() {
  const patientId = "MP-2026-0001"; // Hardcoded for demo
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/pharmacy/schedule/${patientId}`);
        if (res.ok) {
          const data = await res.json();
          setSchedules(data);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchSchedule();
  }, []);

  const timeSlots = ["Morning", "Afternoon", "Evening", "Night"];

  return (
    <DashboardLayout title="Patient Dashboard">
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Welcome back, Rahul!</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Here is your daily health overview.</p>
          </div>
          <Link href="/pharmacy" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-blue-200 dark:shadow-none flex items-center gap-2">
            <Store className="w-5 h-5" /> Order Medicines
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Left Column: Today's Schedule */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Today's Medicine Schedule
                </h2>
                <div className="text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-lg">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-48 text-slate-400 animate-pulse">Loading schedule...</div>
              ) : schedules.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  <Pill className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm">No medicines scheduled for today.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {timeSlots.map(slot => {
                    const slotItems = schedules.filter(s => s.time_slot.toLowerCase() === slot.toLowerCase());
                    if (slotItems.length === 0) return null;
                    return (
                      <div key={slot} className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800">
                        <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1.5 border-4 border-white dark:border-slate-900 shadow-sm"></div>
                        <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-3">{slot}</h3>
                        <div className="grid gap-3">
                          {slotItems.map((item, idx) => (
                            <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
                                  <Pill className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="font-bold text-slate-800 dark:text-slate-200">{item.medicine_name}</div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    <span>{item.dosage}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span>{item.food_instruction}</span>
                                  </div>
                                </div>
                              </div>
                              <button className="px-4 py-1.5 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-emerald-100 transition-colors">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Taken
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Recent Documents */}
          <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex-1">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Recent Documents
              </h2>
              
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:border-indigo-200 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-800 dark:text-slate-200">Consultation Summary</div>
                      <div className="text-xs text-slate-500">Today</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                </div>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:border-emerald-200 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-800 dark:text-slate-200">Active Prescription</div>
                      <div className="text-xs text-slate-500">Today</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
