"use client";

import React, { useState } from "react";
import {
  Activity,
  FileText,
  Pill,
  FileCheck2,
  Stethoscope,
  Filter,
  ExternalLink
} from "lucide-react";
import { doctorService } from "@/lib/api-services";

export interface ActivityFeedItem {
  id: string;
  time: string;
  timestamp?: string;
  type: string;
  title: string;
  description: string;
  patient_name?: string;
  user?: string;
  status?: string;
}

interface ActivityFeedWidgetProps {
  activities: ActivityFeedItem[];
  onSelectPatient: (patientName: string) => void;
  onOpenConsultation: () => void;
}

export default function ActivityFeedWidget({
  activities: initialActivities,
  onSelectPatient,
  onOpenConsultation
}: ActivityFeedWidgetProps) {
  const [filterType, setFilterType] = useState<"all" | "today" | "yesterday" | "week">("all");
  const [activities, setActivities] = useState<ActivityFeedItem[]>(initialActivities);

  const handleFilterChange = async (type: "all" | "today" | "yesterday" | "week") => {
    setFilterType(type);
    try {
      const filtered = await doctorService.getActivityFeed(type);
      if (Array.isArray(filtered)) {
        setActivities(filtered);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "consultation":
        return <Stethoscope className="w-3.5 h-3.5 text-blue-600" />;
      case "prescription":
        return <Pill className="w-3.5 h-3.5 text-emerald-600" />;
      case "discharge":
        return <FileCheck2 className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-indigo-600" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-full font-sans max-h-[380px] overflow-y-auto">
      {/* Widget Header & Filters */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" /> Recent Activity Feed
          </h3>
          <p className="text-xs text-slate-500">Live clinical actions & audit timeline</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          {(["all", "today", "week"] as const).map(f => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={`px-2.5 py-1 rounded-lg capitalize transition-all ${
                filterType === f
                  ? "bg-white dark:bg-slate-900 text-blue-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-4 flex-1 overflow-y-auto pr-1">
        {activities.map(act => (
          <div
            key={act.id}
            onClick={() => {
              if (act.type === "consultation") {
                onOpenConsultation();
              } else if (act.patient_name) {
                onSelectPatient(act.patient_name);
              }
            }}
            className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-start gap-3 cursor-pointer transition-all group"
          >
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
              {getActivityIcon(act.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                  {act.title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">{act.time}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{act.description}</p>
              
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span>By: {act.user || "Dr. Sarah Mitchell"}</span>
                <span className="flex items-center gap-1 text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Open Details <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
