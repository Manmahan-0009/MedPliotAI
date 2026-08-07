"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/components/ThemeProvider";
import {
  User,
  LayoutDashboard,
  Pill,
  Activity,
  FileText,
  ShoppingBag,
  CreditCard,
  Calendar,
  Bell,
  UserCheck,
  Settings,
  LogOut,
  Sun,
  Moon,
  ShieldCheck,
} from "lucide-react";

export default function PatientSidebar() {
  const { userProfile, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const navItems = [
    { name: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
    { name: "Medications", href: "/patient/medicines", icon: Pill },
    { name: "Recovery Journey", href: "/patient/recovery", icon: Activity },
    { name: "Reports & Records", href: "/patient/reports", icon: FileText },
    { name: "Smart Pharmacy", href: "/patient/smart-pharmacy", icon: ShoppingBag },
    { name: "Discharge & Bills", href: "/patient/discharge", icon: CreditCard },
    { name: "Appointments", href: "/patient/appointments", icon: Calendar },
    { name: "Notifications", href: "/patient/notifications", icon: Bell },
    { name: "My Profile", href: "/patient/profile", icon: UserCheck },
    { name: "Settings", href: "/patient/settings", icon: Settings },
  ];

  const patientName = userProfile?.patient_profile
    ? `${userProfile.patient_profile.first_name} ${userProfile.patient_profile.last_name}`
    : "Patient Account";

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-5 shrink-0 h-screen sticky top-0 transition-colors">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white text-base leading-tight">MediPilot AI</h2>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">Patient Portal</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-260px)] pr-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/patient/dashboard" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Area */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        {/* Security Badge */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="truncate">HIPAA Encrypted Patient Portal</span>
        </div>

        {/* Patient Profile & Theme */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{patientName}</p>
            <p className="text-[10px] text-slate-400 truncate">{userProfile?.email}</p>
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
