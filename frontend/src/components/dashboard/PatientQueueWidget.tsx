"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Clock,
  Mic,
  ArrowUp,
  ArrowDown,
  GripVertical,
  CheckCircle2,
  SkipForward,
  User,
  FileText,
  MoreVertical,
  ArrowUpCircle
} from "lucide-react";
import { doctorService } from "@/lib/api-services";

export interface PatientQueueItem {
  id: string;
  queue_number: number;
  patient_id: string;
  patient_name: string;
  age?: number;
  gender?: string;
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
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [actionMenuAppId, setActionMenuAppId] = useState<string | null>(null);

  useEffect(() => {
    setQueue(initialQueue);
  }, [initialQueue]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("queue_id", id);
    setDraggedId(id);
  };

  const handleDropStatus = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("queue_id") || draggedId;
    if (!sourceId) return;

    // Optimistic UI update
    setQueue(prev =>
      prev.map(q => (q.id === sourceId ? { ...q, status: targetStatus } : q))
    );

    try {
      await doctorService.updateQueueStatus(sourceId, targetStatus);
      onShowToast(`Patient moved to ${targetStatus}`);
      onRefresh();
    } catch (err) {
      console.error(err);
      onShowToast("Failed to update queue status");
    } finally {
      setDraggedId(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("queue_id") || draggedId;
    if (!sourceId || sourceId === targetId) return;

    const sourceIdx = queue.findIndex(q => q.id === sourceId);
    const targetIdx = queue.findIndex(q => q.id === targetId);
    if (sourceIdx < 0 || targetIdx < 0) return;

    const newQueue = [...queue];
    const [moved] = newQueue.splice(sourceIdx, 1);
    newQueue.splice(targetIdx, 0, moved);

    newQueue.forEach((q, idx) => {
      q.queue_number = idx + 1;
    });

    setQueue(newQueue);
    try {
      await doctorService.reorderQueue(newQueue.map(q => q.id));
      onShowToast("Patient queue updated successfully.");
      onRefresh();
    } catch (err) {
      console.error(err);
      onShowToast("Failed to update queue");
    } finally {
      setDraggedId(null);
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const newQueue = [...queue];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newQueue.length) return;

    const temp = newQueue[index];
    newQueue[index] = newQueue[targetIdx];
    newQueue[targetIdx] = temp;

    newQueue.forEach((q, idx) => {
      q.queue_number = idx + 1;
    });

    setQueue(newQueue);
    try {
      await doctorService.reorderQueue(newQueue.map(q => q.id));
      onShowToast("Patient queue updated successfully.");
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveToTop = async (queueId: string) => {
    try {
      const newQueue = [...queue];
      const targetIdx = newQueue.findIndex(q => q.id === queueId);
      if (targetIdx > 0) {
        const [moved] = newQueue.splice(targetIdx, 1);
        newQueue.unshift(moved);
        newQueue.forEach((q, idx) => {
          q.queue_number = idx + 1;
        });
        setQueue(newQueue);
      }
      await doctorService.moveToTopQueue(queueId);
      onShowToast("Patient queue updated successfully.");
      setActionMenuAppId(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQueueAction = async (queueId: string, action: "start" | "skip" | "complete") => {
    try {
      setActionMenuAppId(null);
      if (action === "start") {
        setQueue(prev => prev.map(q => (q.id === queueId ? { ...q, status: "In Consultation" } : q)));
        await doctorService.queueAction(queueId, "start");
        onStartConsultation();
      } else {
        const newStatus = action === "skip" ? "Skipped" : "Completed";
        setQueue(prev => prev.map(q => (q.id === queueId ? { ...q, status: newStatus } : q)));
        await doctorService.queueAction(queueId, action);
        onShowToast("Patient queue updated successfully.");
      }
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-full font-sans">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" /> Active Patient Queue
          </h3>
          <p className="text-xs text-slate-500">Drag patients to reorder priority queue</p>
        </div>
        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-bold text-xs rounded-full">
          {queue.filter(q => q.status !== "Completed" && q.status !== "Skipped").length} Active
        </span>
      </div>

      {/* Status Drag & Drop Quick Zones */}
      <div className="grid grid-cols-5 gap-1.5 mb-3 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-xl text-[10px] font-bold">
        {[
          { key: "Waiting", label: "Waiting", color: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200" },
          { key: "Ready for Consultation", label: "Ready", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200" },
          { key: "In Consultation", label: "Consulting", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200" },
          { key: "Follow-up", label: "Follow-up", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200" },
          { key: "Completed", label: "Completed", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200" }
        ].map(zone => (
          <div
            key={zone.key}
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDropStatus(e, zone.key)}
            className={`py-1.5 px-1 rounded-lg text-center border border-dashed border-slate-300 dark:border-slate-700 cursor-pointer transition-all hover:scale-102 ${zone.color}`}
            title={`Drag patient here to set status to ${zone.label}`}
          >
            {zone.label} ({queue.filter(q => q.status === zone.key || (zone.key === "Waiting" && (q.status === "Waiting" || q.status === "Scheduled")) || (zone.key === "Ready for Consultation" && q.status === "Checked In")).length})
          </div>
        ))}
      </div>

      {/* Queue List */}
      <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1 custom-scrollbar">
        {queue.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">
            No active patients in queue.
          </div>
        ) : (
          queue.map((q, idx) => (
            <div
              key={q.id}
              draggable
              onDragStart={e => handleDragStart(e, q.id)}
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(e, q.id)}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-grab active:cursor-grabbing group relative ${
                q.status === "In Consultation"
                  ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0" />

                {/* Queue Number Badge */}
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center justify-center border shrink-0">
                  #{q.queue_number}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      onClick={() => onSelectPatient(q.patient_id)}
                      className="font-bold text-xs text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer truncate"
                    >
                      {q.patient_name}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded shrink-0 ${
                      q.priority === "Emergency" ? "bg-red-600 text-white" :
                      q.priority === "High" ? "bg-red-500/20 text-red-300 border border-red-500/30" :
                      "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    }`}>
                      {q.priority}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5 font-mono">
                    <span>{q.gender || "Male"}, {q.age || 28}y</span>
                    <span>• Appt: {q.appointment_time}</span>
                    <span>• Wait: {q.waiting_time}</span>
                    <span>• {q.type}</span>
                  </div>
                </div>
              </div>

              {/* Actions & Status */}
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${
                  q.status === "In Consultation" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
                  q.status === "Checked In" ? "bg-purple-500/20 text-purple-300 border-purple-500/30" :
                  q.status === "Ready for Consultation" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" :
                  "bg-slate-800 text-slate-300 border-slate-700"
                }`}>
                  {q.status}
                </span>

                {q.status !== "Completed" && (
                  <button
                    onClick={() => handleQueueAction(q.id, "start")}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs"
                  >
                    <Mic className="w-3.5 h-3.5" /> Start
                  </button>
                )}

                {/* Quick Action Dropdown Menu */}
                <div className="relative">
                  <button
                    onClick={() => setActionMenuAppId(actionMenuAppId === q.id ? null : q.id)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {actionMenuAppId === q.id && (
                    <div className="absolute right-0 top-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 z-30 min-w-[160px] text-xs font-semibold space-y-1">
                      <button
                        onClick={() => handleMoveToTop(q.id)}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 text-blue-600"
                      >
                        <ArrowUpCircle className="w-3.5 h-3.5" /> Move to Top
                      </button>
                      <button
                        onClick={() => {
                          setActionMenuAppId(null);
                          onSelectPatient(q.patient_id);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2"
                      >
                        <User className="w-3.5 h-3.5" /> View Profile
                      </button>
                      <button
                        onClick={() => {
                          setActionMenuAppId(null);
                          onSelectPatient(q.patient_id);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2"
                      >
                        <FileText className="w-3.5 h-3.5" /> Medical History
                      </button>
                      <button
                        onClick={() => handleQueueAction(q.id, "complete")}
                        className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                      </button>
                      <button
                        onClick={() => handleQueueAction(q.id, "skip")}
                        className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 rounded-lg flex items-center gap-2"
                      >
                        <SkipForward className="w-3.5 h-3.5" /> Skip Patient
                      </button>
                    </div>
                  )}
                </div>

                {/* Move Up/Down Controls */}
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
          ))
        )}
      </div>
    </div>
  );
}
