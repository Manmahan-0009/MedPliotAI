"use client";

import React, { useState } from "react";
import {
  Sparkles,
  AlertTriangle,
  Clock,
  HeartPulse,
  Pill,
  ChevronRight,
  RefreshCw,
  CheckCircle2
} from "lucide-react";

export interface CopilotInsight {
  id: string;
  type: "warning" | "info" | "success" | "timer";
  title: string;
  description: string;
  patient_name?: string;
  patient_id?: string;
  timestamp: string;
  action_label?: string;
}

const DEFAULT_INSIGHTS: CopilotInsight[] = [
  {
    id: "copilot-1",
    type: "warning",
    title: "High-Risk Patient Alert",
    description: "Rahul Sharma (MP-2026-8942) HbA1c elevated to 9.2%. Recommended early endocrinology review.",
    patient_name: "Rahul Sharma",
    patient_id: "MP-2026-8942",
    timestamp: "10 mins ago",
    action_label: "Review Chart"
  },
  {
    id: "copilot-2",
    type: "warning",
    title: "Medication Interaction Detected",
    description: "Potential moderate interaction between Amoxicillin and concurrent Anticoagulant therapy.",
    patient_name: "Priya Verma",
    patient_id: "MP-2026-8945",
    timestamp: "25 mins ago",
    action_label: "Adjust Dosage"
  },
  {
    id: "copilot-3",
    type: "timer",
    title: "Next Consultation Starts in 15 Mins",
    description: "Ananya Roy (MP-2026-8943) - General Checkup & CBC lab review.",
    patient_name: "Ananya Roy",
    patient_id: "MP-2026-8943",
    timestamp: "Upcoming 02:15 PM",
    action_label: "Prepare Notes"
  },
  {
    id: "copilot-4",
    type: "success",
    title: "Recovery Progress Milestone",
    description: "Post-op Recovery Ward 3 average recovery index increased to 88 (+4% improvement).",
    timestamp: "1 hour ago",
    action_label: "View Analytics"
  }
];

interface AiHealthCopilotPanelProps {
  onSelectPatient?: (patientId: string) => void;
}

export default function AiHealthCopilotPanel({ onSelectPatient }: AiHealthCopilotPanelProps) {
  const [insights, setInsights] = useState<CopilotInsight[]>(DEFAULT_INSIGHTS);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const dismissInsight = (id: string) => {
    setInsights(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-blue-800/40 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white tracking-tight flex items-center gap-2">
              AI Health Copilot <span className="px-2 py-0.5 bg-blue-500/30 text-blue-300 font-bold text-[10px] rounded-full uppercase border border-blue-400/20">Proactive Insights</span>
            </h3>
            <p className="text-[11px] text-blue-200/70">Real-time clinical intelligence alerts</p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="p-1.5 hover:bg-white/10 rounded-lg text-blue-300 transition-colors"
          title="Refresh Insights"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Insights List */}
      <div className="space-y-3 relative z-10">
        {insights.length === 0 ? (
          <div className="p-4 bg-white/5 rounded-xl text-center text-xs text-blue-200/60 font-medium italic">
            ✓ All proactive insights resolved.
          </div>
        ) : (
          insights.map(item => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-start justify-between gap-3 group"
            >
              <div className="flex gap-3 min-w-0">
                <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                  item.type === "warning" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                  item.type === "timer" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                  "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}>
                  {item.type === "warning" ? <AlertTriangle className="w-3.5 h-3.5" /> :
                   item.type === "timer" ? <Clock className="w-3.5 h-3.5" /> :
                   <HeartPulse className="w-3.5 h-3.5" />}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-white truncate">{item.title}</h4>
                    <span className="text-[10px] text-blue-300/60 font-mono shrink-0">{item.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-blue-100/80 mt-0.5 leading-snug line-clamp-2">{item.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-center">
                {item.patient_id && onSelectPatient && (
                  <button
                    onClick={() => onSelectPatient(item.patient_id!)}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <span>{item.action_label || "View"}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => dismissInsight(item.id)}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10"
                  title="Dismiss Alert"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
