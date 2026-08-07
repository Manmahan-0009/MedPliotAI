"use client";

import { ShieldCheck } from "lucide-react";

export default function Topbar({ 
  title, 
  isRecording, 
  statusText 
}: { 
  title: string; 
  isRecording?: boolean; 
  statusText?: string;
}) {
  return (
    <header className="h-24 bg-transparent border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-10 shrink-0 transition-colors z-10">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">{title}</h1>
        {statusText && (
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mt-0.5">
            {isRecording !== undefined && (
              <div className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
            )}
            {statusText}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-blue-500 dark:text-blue-400 stroke-1" />
          <div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">HIPAA Compliant</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Secure & Encrypted</div>
          </div>
        </div>
        <div className="w-px h-10 bg-slate-200/60 dark:bg-slate-800/60"></div>
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-1.5 pr-4 rounded-full border border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-sm">
          <div className="w-9 h-9 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-bold shadow-inner">
            DR
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Dr. Roberts</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">General Practice</div>
          </div>
        </div>
      </div>
    </header>
  );
}
