"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Stethoscope, Mic, Users, Calendar, FileText, 
  LayoutTemplate, LineChart, Settings, Lock, Sun, Moon 
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function Sidebar() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const pathname = usePathname();

  const navItems = [
    { name: "Consultation", href: "/", icon: Mic },
    { name: "Patients", href: "/patients", icon: Users },
    { name: "Appointments", href: "#", icon: Calendar },
    { name: "Medical Records", href: "#", icon: FileText },
    { name: "Templates", href: "#", icon: LayoutTemplate },
    { name: "Analytics", href: "#", icon: LineChart },
  ];

  return (
    <aside className="w-[280px] bg-transparent border-r-0 flex flex-col justify-between shrink-0 h-full transition-colors duration-300">
      <div>
        <div className="h-20 flex items-center px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-900 dark:text-white font-extrabold text-[1.15rem] tracking-tight leading-tight">MediPilot AI</div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px] font-medium tracking-wide uppercase mt-0.5">Clinical Platform</div>
            </div>
          </div>
        </div>
        
        <nav className="px-4 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400 font-semibold" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-900/50"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "" : "text-slate-400 dark:text-slate-500"}`} />
                {item.name}
              </Link>
            );
          })}
          
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-900/50 rounded-2xl font-medium transition-all duration-200 mt-2">
            <Settings className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            Settings
          </Link>
        </nav>
      </div>
      
      <div className="p-6">
        <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 shadow-[0_2px_10px_rgb(0,0,0,0.02)] mb-6 flex gap-4 transition-colors">
          <div className="w-8 h-8 rounded-full bg-emerald-100/50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-slate-800 dark:text-slate-200 font-bold text-[13px] mb-1">Secure System</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              End-to-end encrypted medical platform.
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            © 2025 MediPilot AI<br/>All rights reserved
          </div>
          
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode}
            className="p-2.5 rounded-full bg-white dark:bg-slate-900 shadow-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
