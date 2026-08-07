"use client";

import React, { useState } from "react";
import {
  Users,
  Clock,
  Mic,
  ArrowUp,
  ArrowDown,
  GripVertical,
  CheckCircle2,
  SkipForward
} from "lucide-react";
import { doctorService } from "@/lib/api-services";

export interface PatientQueueItem {
  id: string;
  queue_number: number;
  patient_id: string;
  patient_name: string;
  waiting_time: string;
  appointment_time: string;
  priority: string;
  type: string;
  status: string;
}

interface PatientQueueWidgetProps {
  queue: PatientQueueItem[];
  onRefresh: () => void;
  onSelectPatient: (patientId: string) => void;
  onStartConsultation: () => void;
  onShowToast: (msg: string) => void;
}

export default function PatientQueueWidget({
  queue: initialQueue,
  onRefresh,
  onSelectPatient,
  onStartConsultation,
  onShowToast
}: PatientQueueWidgetProps) {
  const [queue, setQueue] = useState<PatientQueueItem[]>(initialQueue);

  const handleMove = async (index: number, direction: "up" | "down") => {
    const newQueue = [...queue];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newQueue.length) return;

    const temp = newQueue[index];
    newQueue[index] = newQueue[targetIdx];
    newQueue[targetIdx] = temp;

    // Update queue_number attributes
    newQueue.forEach((q, idx) => {
      q.queue_number = idx + 1;
    });

    setQueue(newQueue);
    try {
      await doctorService.reorderQueue(newQueue.map(q => q.id));
      onShowToast("Queue reordered successfully");
      onRefresh();
    } catch (err) {
      console.error(err);
      onShowToast("Failed to reorder queue");
    }
  };

  const handleQueueAction = async (queueId: string, action: "start" | "skip" | "complete") => {
    try {
      if (action === "start") {
        setQueue(prev => prev.map(q => (q.id === queueId ? { ...q, status: "In Consultation" } : q)));
        await doctorService.queueAction(queueId, "start");
        onStartConsultation();
      } else {
        const newStatus = action === "skip" ? "Skipped" : "Completed";
        setQueue(prev => prev.map(q => (q.id === queueId ? { ...q, status: newStatus } : q)));
        await doctorService.queueAction(queueId, action);
        onShowToast(`Patient marked ${newStatus}`);
      }
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-full">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" /> Active Patient Queue
          </h3>
          <p className="text-xs text-slate-500">Live patient triage and consultation queue ordering</p>
        </div>
        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-bold text-xs rounded-full">
          {queue.filter(q => q.status !== "Completed" && q.status !== "Skipped").length} Waiting
        </span>
      </div>

      {/* Queue List */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {queue.map((q, idx) => (
          <div
            key={q.id}
            className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
              q.status === "In Consultation"
                ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300"
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Queue Number Badge */}
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center justify-center border shrink-0">
                #{q.queue_number}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span
                    onClick={() => onSelectPatient(q.patient_id)}
                    className="font-bold text-xs text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer"
                  >
                    {q.patient_name}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    q.priority === "High" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {q.priority}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2 font-mono">
                  <span>MRN: {q.patient_id}</span>
                  <span>• Wait: {q.waiting_time}</span>
                  <span>• {q.type}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Reordering Buttons */}
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${
                q.status === "In Consultation" ? "bg-emerald-600 text-white" :
                q.status === "Checked In" ? "bg-purple-100 text-purple-800" : "bg-slate-100 text-slate-600"
              }`}>
                {q.status}
              </span>

              {/* Action Buttons */}
              {q.status !== "Completed" && (
                <button
                  onClick={() => handleQueueAction(q.id, "start")}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs"
                >
                  <Mic className="w-3.5 h-3.5" /> Start
                </button>
              )}

              {/* Reordering Controls */}
              <div className="flex flex-col gap-0.5">
                <button
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, "up")}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 rounded"
                >
                  <ArrowUp className="w-3 h-3 text-slate-500" />
                </button>
                <button
                  disabled={idx === queue.length - 1}
                  onClick={() => handleMove(idx, "down")}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 rounded"
                >
                  <ArrowDown className="w-3 h-3 text-slate-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
