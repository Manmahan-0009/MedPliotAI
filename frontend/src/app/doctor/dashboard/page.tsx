"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { 
  Mic, Square, Download, Play, Pause, FileText, Users, Calendar, Folder, 
  LayoutTemplate, LineChart, Settings, ShieldCheck, Lock, Activity, 
  UserCircle, Stethoscope, FilePlus, ChevronRight, CheckCircle2, History,
  Send, Edit3, ClipboardList, BookOpen, User, Check, ChevronDown, Trash2,
  Moon, Sun, LogOut
} from "lucide-react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/lib/protected-route";
import { useAuth } from "@/lib/auth-context";
import { doctorService } from "@/lib/api-services";
import { DoctorDashboard } from "@/lib/types";
import { API_BASE_URL } from "@/lib/api";


function DoctorDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userProfile, logout } = useAuth();

  const [dashboardData, setDashboardData] = useState<DoctorDashboard | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    doctorService.getDashboard()
      .then((data) => {
        if (isMounted) {
          setDashboardData(data);
          setDataLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load doctor dashboard:", err);
        if (isMounted) setDataLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const doctorName = userProfile?.doctor_profile?.full_name || dashboardData?.doctor_profile?.full_name || "Dr. Sarah Mitchell";
  const doctorDept = userProfile?.doctor_profile?.department || dashboardData?.doctor_profile?.department || "General Medicine";

  const patientId = searchParams.get("patient") || "MP-2026-8942";
  const patientName = searchParams.get("name") || "Rahul Sharma";
  const patientInitials = patientName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  const [status, setStatus] = useState("Idle"); 
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(0);
  const [ehrStatus, setEhrStatus] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);


  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = handleStop;

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      setStatus("Listening...");
      
      setTimer(0);
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error(err);
      setStatus("Error: No Mic");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      setStatus("Paused");
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      setStatus("Listening...");
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsPaused(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const handleSendEHR = () => {
    setEhrStatus("Sending to EHR...");
    setTimeout(() => {
      setEhrStatus("Successfully sent!");
      setTimeout(() => setEhrStatus(""), 3000);
    }, 1500);
  };

  const clearRecording = () => {
    setTranscript("");
    setSummary("");
    setTimer(0);
    setStatus("Idle");
  };

  const handleStop = async () => {
    setStatus("Processing Audio...");
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("file", audioBlob, "consultation.webm");

    try {
      // 1. Process Audio
      const audioResponse = await fetch(`${API_BASE_URL}/api/consultation/audio`, {
        method: "POST",
        body: formData,
      });
      if (!audioResponse.ok) throw new Error("Failed to process audio");
      
      const audioData = await audioResponse.json();
      setTranscript(audioData.transcript);
      setStatus("Generating Summary...");

      // 2. Generate Summary
      const summaryResponse = await fetch(`${API_BASE_URL}/api/consultation/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: audioData.transcript }),
      });
      if (!summaryResponse.ok) throw new Error("Failed to generate summary");
      
      const summaryData = await summaryResponse.json();
      setSummary(summaryData.summary);
      setStatus("Completed");

    } catch (error) {
      console.error(error);
      setStatus("Error Processing");
    }
  };

  const downloadPDF = async () => {
    try {
      setStatus("Generating PDF...");
      const response = await fetch(`${API_BASE_URL}/api/report/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_name: doctorName,
          patient_name: patientName,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          transcript: transcript || "No transcript recorded.",
          summary: summary || "No summary generated."
        }),
      });

      if (!response.ok) throw new Error("Failed to download PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `MediPilot_Consultation_${patientId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setStatus("PDF Downloaded");
      setTimeout(() => setStatus("Completed"), 2000);
    } catch (error) {
      console.error(error);
      setStatus("PDF Error");
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className={`flex h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-200 text-slate-800 dark:text-slate-100 ${isDarkMode ? 'dark' : ''}`}>
      
      {/* Left Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-colors">
        <div>
          {/* Logo Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <div className="text-slate-900 dark:text-white font-bold text-lg tracking-tight leading-tight">MediPilot AI</div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] font-medium tracking-wide">Doctor Portal</div>
              </div>
            </div>
          </div>
          
          <nav className="px-4 py-2 space-y-1">
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl font-semibold transition-colors">
              <Mic className="w-5 h-5" />
              Consultation
            </a>
            <a onClick={() => router.push("/patients")} className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer">
              <Users className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              Patients
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl font-medium transition-colors">
              <Calendar className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              Appointments
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl font-medium transition-colors">
              <FileText className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              Medical Records
            </a>
          </nav>
        </div>

        {/* User / Doctor Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                {doctorName.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-semibold text-slate-800 dark:text-white truncate">{doctorName}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{doctorDept}</div>
              </div>
            </div>
            
            <button 
              onClick={toggleDarkMode}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header Bar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between shadow-xs transition-colors">
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">AI Clinical Documentation</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Record consultation audio to generate automated clinical notes</p>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Groq Whisper Active
            </span>

            <button
              onClick={() => router.push("/patients")}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              Patient Directory
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* Patient Header Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 mb-6 flex items-center justify-between shadow-sm transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-lg font-bold border border-blue-100 dark:border-blue-800/50">
                {patientInitials}
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800 dark:text-white mb-0.5">{patientName}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                  <span>ID: {patientId}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                  <span>Male</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                  <span>28 Yrs</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                  <span>O+</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Attending Doctor</div>
                <div className="text-sm font-bold text-slate-800 dark:text-white">{doctorName}</div>
              </div>

              <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-semibold">
                In-Consultation
              </span>
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column - Audio Recording Controls & Transcript */}
            <div className="flex flex-col gap-6">
              
              {/* Recorder Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-base">Audio Recording</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Capture voice input for real-time transcription</p>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    isRecording 
                      ? "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 animate-pulse" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}>
                    {status}
                  </span>
                </div>

                {/* Waveform / Visualizer Mock */}
                <div className="h-24 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-6 flex items-center justify-center gap-1 border border-slate-100 dark:border-slate-800">
                  {isRecording && !isPaused ? (
                    Array.from({ length: 32 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-blue-600 dark:bg-blue-400 rounded-full"
                        animate={{ height: [12, Math.floor(Math.random() * 40) + 10, 12] }}
                        transition={{ repeat: Infinity, duration: 0.5 + (i % 5) * 0.1 }}
                      />
                    ))
                  ) : (
                    <span className="text-3xl font-mono font-bold text-slate-700 dark:text-slate-300">
                      {formatTimer(timer)}
                    </span>
                  )}
                </div>

                {/* Recorder Control Buttons */}
                <div className="flex items-center justify-center gap-4">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                      <Mic className="w-5 h-5" />
                      Start Recording
                    </button>
                  ) : (
                    <>
                      {isPaused ? (
                        <button
                          onClick={resumeRecording}
                          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all"
                        >
                          <Play className="w-4 h-4" /> Resume
                        </button>
                      ) : (
                        <button
                          onClick={pauseRecording}
                          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-all"
                        >
                          <Pause className="w-4 h-4" /> Pause
                        </button>
                      )}

                      <button
                        onClick={stopRecording}
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-md active:scale-95"
                      >
                        <Square className="w-4 h-4" /> Stop & Process
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Transcript Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex-1 flex flex-col transition-colors min-h-[300px]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-bold text-slate-800 dark:text-white text-base">Transcription</h3>
                  </div>

                  {transcript && (
                    <button
                      onClick={clearRecording}
                      className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear
                    </button>
                  )}
                </div>

                <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 font-mono text-sm leading-relaxed overflow-y-auto max-h-[350px]">
                  {transcript ? (
                    <p className="whitespace-pre-line text-slate-700 dark:text-slate-300">{transcript}</p>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs italic">
                      Transcribed consultation content will appear here...
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column - Clinical Summary & Actions */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold text-slate-800 dark:text-white text-base">AI Clinical Summary</h3>
                </div>

                <span className="text-xs text-slate-400 font-medium">Powered by Llama 3.3 70B</span>
              </div>

              <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-800 text-sm leading-relaxed overflow-y-auto max-h-[480px] mb-6">
                {summary ? (
                  <div className="prose dark:prose-invert prose-sm max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-line">
                    {summary}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs italic min-h-[300px]">
                    Structured AI summary will be generated after recording...
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={downloadPDF}
                  disabled={!summary}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium rounded-xl text-xs transition-colors disabled:opacity-40"
                >
                  <Download className="w-4 h-4" /> Download PDF Report
                </button>

                <div className="flex items-center gap-3">
                  {ehrStatus && (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {ehrStatus}
                    </span>
                  )}
                  <button
                    onClick={handleSendEHR}
                    disabled={!summary}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-xs transition-colors shadow-sm disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" /> Save to EHR
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default function DoctorDashboardPage() {
  return (
    <ProtectedRoute allowedRole="doctor">
      <Suspense fallback={<div>Loading Dashboard...</div>}>
        <DoctorDashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}
