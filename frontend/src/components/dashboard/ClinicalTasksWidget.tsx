"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Sparkles,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Plus
} from "lucide-react";
import { doctorService } from "@/lib/api-services";

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  priority: "High" | "Medium" | "Low";
  estimated_time?: string;
  patient_name?: string;
  due_time?: string;
  task_type?: string;
  status?: string;
}

export interface AITaskRecommendation {
  id: string;
  title: string;
  type: string;
  priority: string;
  patient_name: string;
}

interface ClinicalTasksWidgetProps {
  tasks: TaskItem[];
  aiRecommendations?: AITaskRecommendation[];
  onRefresh: () => void;
  onSelectPatient: (patientId: string) => void;
  onShowToast: (msg: string) => void;
}

export default function ClinicalTasksWidget({
  tasks: initialTasks,
  aiRecommendations = [],
  onRefresh,
  onSelectPatient,
  onShowToast
}: ClinicalTasksWidgetProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [activeTab, setActiveTab] = useState<"checklist" | "ai_recommendations">("checklist");

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStartTask = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("task_id", id);
    setDraggedTaskId(id);
  };

  const handleDropPriorityZone = async (e: React.DragEvent, targetPriority: "High" | "Medium" | "Low" | "Completed") => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("task_id") || draggedTaskId;
    if (!taskId) return;

    const isCompleted = targetPriority === "Completed";
    const actualPriority = isCompleted ? "Medium" : targetPriority;

    setTasks(prev =>
      prev.map(t => (t.id === taskId ? {
        ...t,
        priority: actualPriority,
        completed: isCompleted,
        status: isCompleted ? "Completed" : t.status
      } : t))
    );

    try {
      await doctorService.updateTaskPriority(taskId, targetPriority, isCompleted ? "Completed" : "Pending", isCompleted);
      onShowToast(`Task priority set to ${targetPriority}`);
      onRefresh();
    } catch (err) {
      console.error(err);
      onShowToast("Failed to update task priority");
    } finally {
      setDraggedTaskId(null);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, completed: newStatus, status: newStatus ? "Completed" : "Pending" } : t)));
    try {
      await doctorService.updateTaskStatus(taskId, newStatus ? "Completed" : "Pending", newStatus);
      onShowToast(newStatus ? "Task marked completed" : "Task marked pending");
      onRefresh();
    } catch (err) {
      console.error(err);
      onShowToast("Failed to update task status");
    }
  };

  const handleSnooze = (taskTitle: string) => {
    onShowToast(`Snoozed task "${taskTitle.slice(0, 20)}..." for 1 hour`);
  };

  const handleAddAiTask = (rec: AITaskRecommendation) => {
    const newTask: TaskItem = {
      id: `t-${Date.now()}`,
      title: rec.title,
      completed: false,
      priority: rec.priority as any,
      estimated_time: "10 mins",
      patient_name: rec.patient_name,
      due_time: "Today",
      task_type: rec.type,
      status: "Pending"
    };
    setTasks(prev => [newTask, ...prev]);
    onShowToast(`Added AI task for ${rec.patient_name}`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-full font-sans max-h-[460px] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-600" /> Today&apos;s Clinical Tasks
          </h3>
          <p className="text-xs text-slate-500">AI-generated checklist & clinical recommendations</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab("checklist")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "checklist"
                ? "bg-white dark:bg-slate-900 text-blue-600 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Tasks ({completedCount}/{totalCount})
          </button>
          <button
            onClick={() => setActiveTab("ai_recommendations")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
              activeTab === "ai_recommendations"
                ? "bg-white dark:bg-slate-900 text-purple-600 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles className="w-3 h-3 text-purple-500" /> AI Suggestions ({aiRecommendations.length})
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
          <span>Today&apos;s Progress</span>
          <span className="font-mono text-blue-600 dark:text-blue-400">
            {completedCount} / {totalCount} Tasks Completed ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Priority Drag & Drop Dropzone Bar */}
      <div className="grid grid-cols-4 gap-1.5 mb-3 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-xl text-[10px] font-bold">
        {[
          { key: "High" as const, label: "High Priority", color: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300" },
          { key: "Medium" as const, label: "Medium", color: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" },
          { key: "Low" as const, label: "Low", color: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300" },
          { key: "Completed" as const, label: "Completed", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" }
        ].map(zone => (
          <div
            key={zone.key}
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDropPriorityZone(e, zone.key)}
            className={`py-1.5 px-1 rounded-lg text-center border border-dashed border-slate-300 dark:border-slate-700 cursor-pointer transition-all hover:scale-102 ${zone.color}`}
            title={`Drag task here to set priority/status to ${zone.label}`}
          >
            {zone.label} ({zone.key === "Completed" ? tasks.filter(t => t.completed).length : tasks.filter(t => !t.completed && t.priority === zone.key).length})
          </div>
        ))}
      </div>

      {/* Checklist View */}
      {activeTab === "checklist" ? (
        <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
          {tasks.map(t => (
            <div
              key={t.id}
              draggable
              onDragStart={e => handleDragStartTask(e, t.id)}
              className={`p-3 rounded-xl border transition-all flex items-start justify-between cursor-grab active:cursor-grabbing ${
                t.completed
                  ? "bg-slate-50/60 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800/60 opacity-60"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => handleToggleTask(t.id, t.completed)}
                  className="mt-1 rounded text-blue-600 border-slate-300 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <div>
                  <div
                    className={`text-xs font-bold ${
                      t.completed ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-100"
                    }`}
                  >
                    {t.title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                    {t.priority && (
                      <span className={`font-bold ${t.priority === "High" ? "text-red-500" : "text-amber-500"}`}>
                        ● {t.priority} Priority
                      </span>
                    )}
                    {t.due_time && <span>• Due: {t.due_time}</span>}
                    {t.estimated_time && <span>• {t.estimated_time}</span>}
                  </div>
                </div>
              </div>

              {/* Task Quick Actions */}
              {!t.completed && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleSnooze(t.title)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-md text-[10px] font-semibold flex items-center gap-0.5"
                    title="Snooze for 1 hour"
                  >
                    <Clock className="w-3 h-3" /> Snooze
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* AI Task Suggestions View */
        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 rounded-xl text-xs text-purple-900 dark:text-purple-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
            <span>AI recommendation engine identified 3 clinical follow-up tasks requiring physician review.</span>
          </div>

          {aiRecommendations.map(rec => (
            <div key={rec.id} className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <span>{rec.title}</span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 font-bold text-[10px] rounded">
                    {rec.priority} Risk
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Patient: <span className="font-semibold text-slate-600 dark:text-slate-300">{rec.patient_name}</span> • Type: {rec.type}
                </div>
              </div>

              <button
                onClick={() => handleAddAiTask(rec)}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Task
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
