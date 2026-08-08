"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Activity,
  FileBox,
  BrainCircuit,
  CalendarDays,
  Plus,
  RefreshCw,
  X
} from "lucide-react";
import ReportList from "./ReportList";
import ReportViewer from "./ReportViewer";

export default function ReportsDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTimeframe, setFilterTimeframe] = useState("");
  
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    fetchStats();
    fetchReports();
  }, [filterStatus, filterTimeframe]);

  const fetchStats = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/reports/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReports = async (query?: string) => {
    setLoading(true);
    try {
      let url = "http://127.0.0.1:8000/api/reports?";
      if (query || search) url += `search=${query || search}&`;
      if (filterStatus) url += `status=${filterStatus}&`;
      if (filterTimeframe) url += `timeframe=${filterTimeframe}&`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports(search);
  };

  const seedReports = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/reports/seed", { method: "POST" });
      if (res.ok) {
        fetchStats();
        fetchReports();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Clinical Documentation Center
          </h2>
          <p className="text-xs text-slate-500 mt-1">Manage, search, and review all AI-generated consultation reports.</p>
        </div>
        <div className="flex gap-2">
          {reports.length === 0 && !loading && (
            <button onClick={seedReports} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2">
              <Plus className="w-4 h-4" /> Generate Demo Reports
            </button>
          )}
          <button onClick={() => {fetchStats(); fetchReports();}} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Reports", val: stats?.total_reports || 0, icon: FileBox, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 border-blue-200" },
          { label: "Today's Reports", val: stats?.todays_reports || 0, icon: CalendarDays, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200" },
          { label: "Pending Approval", val: stats?.pending_approval || 0, icon: Clock, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 border-amber-200" },
          { label: "Approved Reports", val: stats?.approved_reports || 0, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200" },
          { label: "Avg AI Confidence", val: (stats?.avg_ai_confidence || 0) + "%", icon: BrainCircuit, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200" },
          { label: "Reports This Month", val: stats?.reports_this_month || 0, icon: Activity, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/30 border-purple-200" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`p-4 rounded-2xl border ${stat.color} shadow-xs flex flex-col justify-between`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold opacity-80">{stat.label}</span>
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black">{stat.val}</div>
            </div>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Patient, MRN, Diagnosis..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </form>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select 
            value={filterTimeframe} 
            onChange={(e) => setFilterTimeframe(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none text-slate-700 dark:text-slate-200 shrink-0"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none text-slate-700 dark:text-slate-200 shrink-0"
          >
            <option value="">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending Review">Pending</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Report List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mb-4 text-blue-500" />
            <p className="text-sm font-medium">Loading clinical reports...</p>
          </div>
        ) : (
          <ReportList reports={reports} onViewReport={setSelectedReport} />
        )}
      </div>

      {/* Slide-over Viewer */}
      <AnimatePresence>
        {selectedReport && (
          <ReportViewer 
            report={selectedReport} 
            onClose={() => setSelectedReport(null)}
            onUpdate={() => {fetchStats(); fetchReports();}}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
