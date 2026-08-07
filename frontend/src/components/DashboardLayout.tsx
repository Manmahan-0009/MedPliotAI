"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useTheme } from "./ThemeProvider";

export default function DashboardLayout({ 
  children, 
  title, 
  isRecording, 
  statusText 
}: { 
  children: React.ReactNode;
  title: string;
  isRecording?: boolean;
  statusText?: string;
}) {
  const { isDarkMode } = useTheme();

  return (
    <div className={`flex h-screen bg-slate-100 dark:bg-black font-sans text-slate-800 dark:text-slate-100 overflow-hidden transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden transition-colors relative">
        <div className="absolute inset-0 bg-slate-100 dark:bg-black"></div>
        <div className="relative z-10 flex-1 flex flex-col bg-white dark:bg-slate-950 m-4 mb-4 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.01)] border border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
          <Topbar title={title} isRecording={isRecording} statusText={statusText} />
          <div className="flex-1 overflow-y-auto bg-slate-50/30 dark:bg-slate-900/10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
