"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ProtectedRoute } from "@/lib/protected-route";
import { useAuth } from "@/lib/auth-context";
import PatientSidebar from "@/components/patient-sidebar";
import { notificationService } from "@/lib/api-services";
import { Bell, Pill, CalendarCheck, ShieldCheck, Check, RefreshCw, Loader2, Calendar, Stethoscope } from "lucide-react";

export default function NotificationsPage() {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const patientId = userProfile?.patient_profile?.patient_id || userProfile?.id || "";

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await notificationService.getPatientNotifications(patientId || "demo");
      setNotifications(res.notifications || []);
      setUnreadCount(res.unread_count || 0);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchNotifications(false);
    pollingRef.current = setInterval(() => fetchNotifications(true), 15000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await notificationService.markAllPatientRead(patientId || "demo");
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return isoString;
    }
  };

  return (
    <ProtectedRoute allowedRole="patient">
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100">
        <PatientSidebar />

        <main className="flex-1 p-8 overflow-y-auto max-w-5xl space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Health Alerts & Notifications
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500 mt-1">Real-time notifications for appointment updates, status changes, and medical reminders</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchNotifications(false)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-600 dark:text-slate-300 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-500" : ""}`} />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                >
                  Mark All as Read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-500" /> Recent Alerts
            </h2>

            {loading ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-500" />
                <p className="text-xs font-medium">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-xs text-slate-500">No notifications yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.is_read && handleMarkRead(n.id)}
                    className={`py-4 flex items-start gap-4 transition-colors cursor-pointer rounded-xl px-3 ${
                      !n.is_read ? "bg-emerald-50/50 dark:bg-emerald-900/10 font-medium" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      n.type?.includes("confirmed") || n.type?.includes("accepted")
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : n.type?.includes("rejected") || n.type?.includes("cancelled")
                        ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        : n.type?.includes("rescheduled")
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                    }`}>
                      {n.type?.includes("appointment") ? (
                        <Calendar className="w-5 h-5" />
                      ) : n.type?.includes("consultation") ? (
                        <Stethoscope className="w-5 h-5" />
                      ) : (
                        <Pill className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                          {n.title}
                          {!n.is_read && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                          )}
                        </h3>
                        <span className="text-[11px] text-slate-400 shrink-0">{formatTime(n.created_at)}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </main>
      </div>
    </ProtectedRoute>
  );
}
