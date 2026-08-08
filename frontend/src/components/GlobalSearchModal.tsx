"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, User, Stethoscope, Calendar, FileText, Pill, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  link: string;
  badge?: string;
}

interface SearchResults {
  patients: SearchResultItem[];
  doctors: SearchResultItem[];
  appointments: SearchResultItem[];
  reports: SearchResultItem[];
  medicines: SearchResultItem[];
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export function GlobalSearchModal({ isOpen, onClose, initialQuery = "" }: GlobalSearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    patients: [],
    doctors: [],
    appointments: [],
    reports: [],
    medicines: []
  });
  const [activeTab, setActiveTab] = useState<"all" | "patients" | "doctors" | "appointments" | "reports" | "medicines">("all");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      if (initialQuery) {
        setQuery(initialQuery);
      }
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ patients: [], doctors: [], appointments: [], reports: [], medicines: [] });
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/global-search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || { patients: [], doctors: [], appointments: [], reports: [], medicines: [] });
        }
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults = 
    results.patients.length + 
    results.doctors.length + 
    results.appointments.length + 
    results.reports.length + 
    results.medicines.length;

  const renderIcon = (type: string) => {
    switch (type) {
      case "Patient": return <User className="w-4 h-4 text-blue-500" />;
      case "Doctor": return <Stethoscope className="w-4 h-4 text-purple-500" />;
      case "Appointment": return <Calendar className="w-4 h-4 text-emerald-500" />;
      case "Report": return <FileText className="w-4 h-4 text-amber-500" />;
      case "Medicine": return <Pill className="w-4 h-4 text-rose-500" />;
      default: return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  const getFilteredResults = () => {
    if (activeTab === "patients") return results.patients;
    if (activeTab === "doctors") return results.doctors;
    if (activeTab === "appointments") return results.appointments;
    if (activeTab === "reports") return results.reports;
    if (activeTab === "medicines") return results.medicines;
    return [
      ...results.patients,
      ...results.doctors,
      ...results.appointments,
      ...results.reports,
      ...results.medicines
    ];
  };

  const allList = getFilteredResults();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Header Input */}
          <div className="relative flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 ml-2" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patients, doctors, appointments, SOAP reports, medicines..."
              className="w-full pl-3 pr-10 text-sm sm:text-base bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
            />
            {loading ? (
              <Loader2 className="w-5 h-5 text-teal-500 animate-spin mr-2" />
            ) : query ? (
              <button 
                onClick={() => setQuery("")} 
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-2"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
            <button
              onClick={onClose}
              className="px-2 py-1 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700"
            >
              ESC
            </button>
          </div>

          {/* Category Tabs */}
          {query.trim() && (
            <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeTab === "all"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800"
                }`}
              >
                All ({totalResults})
              </button>
              <button
                onClick={() => setActiveTab("patients")}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeTab === "patients"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800"
                }`}
              >
                Patients ({results.patients.length})
              </button>
              <button
                onClick={() => setActiveTab("doctors")}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeTab === "doctors"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800"
                }`}
              >
                Doctors ({results.doctors.length})
              </button>
              <button
                onClick={() => setActiveTab("appointments")}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeTab === "appointments"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800"
                }`}
              >
                Appointments ({results.appointments.length})
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeTab === "reports"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800"
                }`}
              >
                Reports ({results.reports.length})
              </button>
              <button
                onClick={() => setActiveTab("medicines")}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeTab === "medicines"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800"
                }`}
              >
                Medicines ({results.medicines.length})
              </button>
            </div>
          )}

          {/* Results List */}
          <div className="overflow-y-auto p-3 space-y-1.5 flex-1 min-h-[220px]">
            {!query.trim() ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-3">
                <Sparkles className="w-10 h-10 mx-auto text-teal-500/60 animate-pulse" />
                <p className="text-sm font-medium">Type any patient name, MRN, doctor, report, or medicine</p>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-mono cursor-pointer hover:bg-slate-200" onClick={() => setQuery("Rahul Sharma")}>Rahul Sharma</span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-mono cursor-pointer hover:bg-slate-200" onClick={() => setQuery("MP-2026-8942")}>MP-2026-8942</span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-mono cursor-pointer hover:bg-slate-200" onClick={() => setQuery("Amoxicillin")}>Amoxicillin</span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-mono cursor-pointer hover:bg-slate-200" onClick={() => setQuery("Dr. Sarah")}>Dr. Sarah</span>
                </div>
              </div>
            ) : allList.length === 0 && !loading ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <p className="text-sm font-medium">No results matching &ldquo;{query}&rdquo;</p>
                <p className="text-xs mt-1 text-slate-400">Try searching by MRN (e.g. MP-2026-8942) or patient first name.</p>
              </div>
            ) : (
              allList.map((item, idx) => (
                <Link
                  key={`${item.type}-${item.id}-${idx}`}
                  href={item.link}
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                      {renderIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ml-3" />
                </Link>
              ))
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono">ESC</kbd> to exit search</span>
            <span className="font-medium">MediPilot AI Multi-Entity Search</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
