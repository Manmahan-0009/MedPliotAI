"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Mic, Square, Download, Play, Pause, FileText, Users, Calendar, Folder, 
  LayoutTemplate, LineChart, Settings, ShieldCheck, Lock, Activity, 
  UserCircle, Stethoscope, FilePlus, ChevronRight, CheckCircle2, History,
  Send, Edit3, ClipboardList, BookOpen, User, Check, ChevronDown, Trash2,
  Moon, Sun
} from "lucide-react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import ClinicalIntelligenceReport, { ClinicalIntelligenceData } from "@/components/clinical/ClinicalIntelligenceReport";

function ConsultationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const patientId = searchParams.get("patient") || "PT-2026-8942";
  const patientName = searchParams.get("name") || "Rahul Sharma";
  const patientInitials = patientName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  const [status, setStatus] = useState("Idle"); 
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [recommendedTests, setRecommendedTests] = useState<string[]>([]);
  const [importantNotes, setImportantNotes] = useState<string[]>([]);
  const [timer, setTimer] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [ehrStatus, setEhrStatus] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check system preference on load
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
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
    setRecommendedTests([]);
    setImportantNotes([]);
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
      const audioResponse = await fetch("http://localhost:8000/api/consultation/audio", {
        method: "POST",
        body: formData,
      });
      if (!audioResponse.ok) throw new Error("Failed to process audio");
      
      const audioData = await audioResponse.json();
      setTranscript(audioData.transcript);
      setStatus("Generating Summary...");

      // 2. Generate Summary
      const summaryResponse = await fetch("http://localhost:8000/api/consultation/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: audioData.transcript }),
      });
      if (!summaryResponse.ok) throw new Error("Failed to generate summary");
      
      const summaryData = await summaryResponse.json();
      setSummary(summaryData.summary);
      setRecommendedTests(summaryData.recommended_tests || []);
      setImportantNotes(summaryData.important_notes || []);
      setStatus("Completed");

    } catch (error) {
      console.error(error);
      setStatus("Error Processing");
    }
  };

  const downloadPDF = async () => {
    try {
      setStatus("Generating PDF...");
      const response = await fetch("http://localhost:8000/api/report/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_name: "Dr. Sarah Mitchell",
          patient_name: patientName,
          date: new Date().toLocaleDateString(),
          transcript: transcript,
          summary: summary
        }),
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Consultation_Report.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      setStatus("Completed");
    } catch (error) {
      console.error(error);
      setStatus("Error PDF");
    }
  };

  return (
    <div className={`flex h-screen bg-[#f9fafb] dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 overflow-hidden transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      
      {/* Sidebar */}
      <aside className="w-[280px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 h-full transition-colors duration-300">
        <div>
          <div className="h-20 flex items-center px-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <div className="text-slate-900 dark:text-white font-bold text-lg tracking-tight leading-tight">MediPilot AI</div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] font-medium tracking-wide">AI Clinical Documentation</div>
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
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl font-medium transition-colors">
              <LayoutTemplate className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              Templates
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl font-medium transition-colors">
              <LineChart className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              Analytics
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl font-medium transition-colors mt-4">
              <Settings className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              Settings
            </a>
          </nav>
        </div>
        
        <div className="p-6">
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm mb-6 flex gap-4 transition-colors">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-slate-800 dark:text-slate-200 font-bold text-sm mb-1">Secure System</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Your conversations and patient data are encrypted and secure.
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              © 2025 MediPilot AI<br/>All rights reserved
            </div>
            
            {/* Dark Mode Toggle */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f9fafb] dark:bg-slate-950 transition-colors">
        
        {/* Topbar */}
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0 transition-colors">
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white">AI Consultation Session</h1>
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
              {isRecording ? "Recording in progress" : "Session Idle"}
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-blue-500 dark:text-blue-400 stroke-1" />
              <div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">HIPAA Compliant</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Secure & Encrypted</div>
              </div>
            </div>
            
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
            
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-slate-400 dark:text-slate-500 stroke-1" />
              <div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">May 16, 2025</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">10:24 AM</div>
              </div>
            </div>

            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
            
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm border border-blue-100 dark:border-blue-800/50">
                DS
              </div>
              <div className="mr-2">
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Dr. Sarah Mitchell</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Cardiology</div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </div>
          </div>
        </header>

        {/* Content Area */}
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
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Attending Physician</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Dr. Sarah Mitchell (Cardiology)</div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-4 py-2 rounded-lg border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-2">
                Active Session
              </div>
            </div>
          </div>

          {/* 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start h-[calc(100%-120px)] min-h-[700px]">
            
            {/* Left Column: Voice & Transcript */}
            <div className="flex flex-col gap-6 h-full">
              
              {/* Voice Capture */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col p-6 transition-colors">
                <div className="flex items-center justify-between mb-8">
                  <div className="text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest">Voice Capture</div>
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium">
                    <Lock className="w-3.5 h-3.5" /> Secure Transcription
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="text-5xl font-light text-slate-800 dark:text-white tracking-tight tabular-nums">
                    {formatTime(timer)}
                  </div>
                  <div className="text-slate-400 dark:text-slate-500 text-xs font-medium mt-1 uppercase tracking-widest">Duration</div>
                </div>

                {/* Waveform */}
                <div className="flex items-center justify-center h-16 w-full gap-1 my-8">
                  {[...Array(24)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 bg-blue-500 dark:bg-blue-400 rounded-full opacity-80"
                      animate={
                        isRecording && !isPaused
                          ? { height: [12, Math.random() * 40 + 10, 12] }
                          : { height: 12 }
                      }
                      transition={{
                        repeat: Infinity,
                        duration: 0.4 + Math.random() * 0.4,
                        ease: "easeInOut",
                        delay: i * 0.05
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-center gap-6 mb-8">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="flex flex-col items-center gap-3 group"
                    >
                      <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none group-hover:bg-blue-700 dark:group-hover:bg-blue-400 transition-all">
                        <Mic className="w-7 h-7" />
                      </div>
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Start Recording</span>
                    </button>
                  ) : (
                    <>
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none">
                          <Mic className="w-7 h-7" />
                        </div>
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{status}</span>
                      </div>
                      <button
                        onClick={stopRecording}
                        className="px-5 py-2.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/50 rounded-lg flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all font-bold text-sm"
                      >
                        <Square className="w-4 h-4 fill-current" /> Stop Recording
                      </button>
                    </>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
                    <Mic className="w-4 h-4" /> Microphone: Built-in Microphone (Realtek) <ChevronDown className="w-3 h-3" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
                      <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
                      <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
                      <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
                      <div className="w-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                    </div>
                    Good
                  </div>
                </div>
              </div>

              {/* Live Transcript */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col flex-1 overflow-hidden transition-colors">
                <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                  <div className="text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest">Live Transcript</div>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Live
                  </div>
                </div>
                
                <div className="p-5 flex-1 overflow-y-auto space-y-6 bg-slate-50/50 dark:bg-slate-950/50">
                  {transcript ? (
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Doctor</span>
                            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">10:23:12 AM</span>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed bg-white dark:bg-slate-800 p-3 rounded-xl rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm">
                            {transcript}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 italic text-sm">
                      {status.includes("Processing") ? (
                        <span className="flex items-center gap-2 animate-pulse"><Activity className="w-4 h-4" /> Transcribing audio...</span>
                      ) : (
                        "Transcript will appear here..."
                      )}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={isPaused ? resumeRecording : pauseRecording} disabled={!isRecording} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 disabled:opacity-50">
                      {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4 fill-current" />} {isPaused ? "Resume" : "Pause"}
                    </button>
                    <button onClick={stopRecording} disabled={!isRecording} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 disabled:opacity-50">
                      <Square className="w-4 h-4 fill-red-500 text-red-500" /> Stop
                    </button>
                    <button onClick={clearRecording} disabled={!transcript && !timer} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 disabled:opacity-50 ml-2">
                      <Trash2 className="w-4 h-4" /> Clear
                    </button>
                  </div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    {timer} sec captured
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Upgraded Clinical Intelligence Report */}
            <div className="h-[750px] flex flex-col">
              <ClinicalIntelligenceReport
                data={summary ? (summary as any) : null}
                isLoading={status.includes("Generating")}
                onSaveToEHR={() => handleSendEHR()}
                onDownloadPDF={() => downloadPDF()}
                patientName={patientName}
                doctorName="Dr. Sarah Mitchell"
              />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default function AI_Consultation_V2() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#f9fafb]">Loading Consultation...</div>}>
      <ConsultationContent />
    </Suspense>
  );
}
