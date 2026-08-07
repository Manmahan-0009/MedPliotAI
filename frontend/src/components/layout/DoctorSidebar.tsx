"use client";

import React from "react";
import { 
  LayoutDashboard, 
  Users, 
  Mic, 
  FileText, 
  Pill, 
  Activity, 
  FileCheck2, 
  Bell, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Stethoscope,
  Moon,
  Sun
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export type DoctorTabType = 
  | "home" 
  | "patients" 
  | "consultation" 
  | "reports" 
  | "pharmacy" 
  | "recovery" 
  | "discharge" 
  | "notifications" 
  | "settings";

interface DoctorSidebarProps {
  activeTab: DoctorTabType;
  setActiveTab: (tab: DoctorTabType) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  unreadNotificationsCount?: number;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function DoctorSidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  unreadNotificationsCount = 3,
  isDarkMode,
  toggleDarkMode
}: DoctorSidebarProps) {
  const { userProfile, logout } = useAuth();
  const router = useRouter();

  const doctorName = userProfile?.doctor_profile?.full_name || "Dr. Sarah Mitchell";
  const doctorDept = userProfile?.doctor_profile?.department || "General Medicine";
  const doctorInitials = doctorName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

  const navItems = [
    { id: "home" as DoctorTabType, label: "Dashboard", icon: LayoutDashboard },
    { id: "patients" as DoctorTabType, label: "Patients", icon: Users },
    { id: "consultation" as DoctorTabType, label: "Consultation", icon: Mic },
    { id: "reports" as DoctorTabType, label: "AI Reports", icon: FileText },
    { id: "pharmacy" as DoctorTabType, label: "Smart Pharmacy", icon: Pill },
    { id: "recovery" as DoctorTabType, label: "Recovery Analytics", icon: Activity },
    { id: "discharge" as DoctorTabType, label: "Discharge Center", icon: FileCheck2 },
    { 
      id: "notifications" as DoctorTabType, 
      label: "Notifications", 
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null
    },
    { id: "settings" as DoctorTabType, label: "Settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <aside 
      className={`relative bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 z-20 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-7 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm z-30"
        title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      <div>
        {/* Header */}
        <div className="h-16 px-4 flex items-center border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <div className="text-slate-900 dark:text-white font-bold text-base tracking-tight leading-tight">
                  MediPilot AI
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] font-medium tracking-wide">
                  Doctor Enterprise
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 relative ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}

                {/* Badge if present */}
                {item.badge && (
                  <span
                    className={`ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive
                        ? "bg-white text-blue-600"
                        : "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300"
                    } ${collapsed ? "absolute top-1 right-1" : ""}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Profile Section */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} p-1`}>
          {!collapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                {doctorInitials}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-800 dark:text-white truncate">{doctorName}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{doctorDept}</div>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center border border-blue-200 dark:border-blue-800">
              {doctorInitials}
            </div>
          )}

          {!collapsed && (
            <button
              onClick={toggleDarkMode}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${collapsed ? "justify-center" : "justify-center gap-2"} py-2 px-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors`}
          title="Logout"
        >
          <LogOut className="w-3.5 h-3.5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
