"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Mic, Square, Download, Play, Pause, FileText, Users, Calendar, Folder, 
  LayoutTemplate, LineChart, Settings, ShieldCheck, Lock, Activity, 
  UserCircle, Stethoscope, FilePlus, ChevronRight, CheckCircle2, History,
  Send, Edit3, ClipboardList, BookOpen, User, Check, ChevronDown, Trash2
} from "lucide-react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import DashboardLayout from "@/components/DashboardLayout";

function ConsultationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const patientId = searchParams.get("patient") || "PT-2026-8942";
  const patientName = searchParams.get("name") || "Rahul Sharma";
  const patientInitials = patientName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  const [status, setStatus] = useState("Idle"); 
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState<any>(null);
  const [isSummaryApproved, setIsSummaryApproved] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [ehrStatus, setEhrStatus] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  
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
      
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        alert("Microphone access was denied. Please allow microphone permissions in your browser settings to use this feature.");
        setStatus("Mic Access Denied");
      } else {
        console.warn("Microphone error:", err);
        setStatus("Error: No Mic");
      }
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
    setSummary(null);
    setIsSummaryApproved(false);
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
      setSummary(summaryData);
      setIsSummaryApproved(false);

      // 3. Save to database to get consultationId
      try {
        const saveResponse = await fetch("http://localhost:8000/api/consultations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patient_id: patientId,
            doctor_name: "Dr. Sarah Mitchell",
            transcript: audioData.transcript,
            ai_summary: JSON.stringify(summaryData),
            pdf_path: ""
          }),
        });
        if (saveResponse.ok) {
          const savedConsult = await saveResponse.json();
          setConsultationId(savedConsult.consultation_id);
        }
      } catch (e) {
        console.error("Failed to save consultation", e);
      }

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
          summary: JSON.stringify(summary)
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
    <DashboardLayout 
      title="AI Consultation Session" 
      isRecording={isRecording}
    >
      <div className="flex-1">
          
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

            {/* Right Column: AI Summary */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full overflow-hidden transition-colors">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-50/30 dark:bg-emerald-900/10">
                <div className="text-emerald-700 dark:text-emerald-400 font-bold text-sm uppercase tracking-widest">
                  AI Clinical Summary
                </div>
                <div className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] px-2.5 py-1 rounded tracking-widest uppercase">
                  Draft
                </div>
              </div>

              {!summary ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-slate-950/50">
                   <ClipboardList className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                   <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm leading-relaxed">
                     The AI Clinical Summary, recommended tests, and notes will automatically generate here after the consultation ends.
                   </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                  
                  {/* Warning */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 p-4 rounded-xl flex gap-3">
                    <div className="text-amber-500 mt-0.5">⚠️</div>
                    <p className="text-amber-800 dark:text-amber-300 text-sm font-medium">
                      AI Generated Draft. Doctor approval required.<br/>
                      <span className="font-normal">This is NOT a diagnosis.</span>
                    </p>
                  </div>

                  {/* Summary Structured Form */}
                  <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Chief Complaint */}
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Chief Complaint</label>
                        {isEditingSummary ? (
                          <input type="text" value={summary.chief_complaint || ""} onChange={(e) => setSummary({...summary, chief_complaint: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm text-slate-800 dark:text-slate-200" />
                        ) : (
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{summary.chief_complaint || "N/A"}</div>
                        )}
                      </div>

                      {/* Diagnosis */}
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Provisional Diagnosis</label>
                        {isEditingSummary ? (
                          <input type="text" value={summary.diagnosis || ""} onChange={(e) => setSummary({...summary, diagnosis: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm text-slate-800 dark:text-slate-200" />
                        ) : (
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{summary.diagnosis || "N/A"}</div>
                        )}
                      </div>
                    </div>

                    {/* HPI */}
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">History of Present Illness</label>
                      {isEditingSummary ? (
                        <textarea value={summary.history_of_present_illness || ""} onChange={(e) => setSummary({...summary, history_of_present_illness: e.target.value})} className="w-full h-24 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm text-slate-800 dark:text-slate-200" />
                      ) : (
                        <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{summary.history_of_present_illness || "N/A"}</div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Symptoms */}
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Symptoms</label>
                        {isEditingSummary ? (
                          <textarea value={(summary.symptoms || []).join('\n')} onChange={(e) => setSummary({...summary, symptoms: e.target.value.split('\n')})} className="w-full h-24 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm text-slate-800 dark:text-slate-200" placeholder="One symptom per line" />
                        ) : (
                          <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 space-y-1">
                            {(summary.symptoms || []).map((s: string, i: number) => <li key={i}>{s}</li>)}
                          </ul>
                        )}
                      </div>

                      {/* Treatment Plan */}
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <label className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-2 block">Treatment Plan / Tests</label>
                        {isEditingSummary ? (
                          <textarea value={(summary.treatment_plan || []).join('\n')} onChange={(e) => setSummary({...summary, treatment_plan: e.target.value.split('\n')})} className="w-full h-24 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm text-slate-800 dark:text-slate-200" placeholder="One item per line" />
                        ) : (
                          <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 font-medium space-y-1">
                            {(summary.treatment_plan || []).map((t: string, i: number) => <li key={i}>{t}</li>)}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center gap-4">
                {ehrStatus && (
                  <div className="mr-auto text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> {ehrStatus}
                  </div>
                )}
                
                {consultationId && isSummaryApproved && (
                  <button 
                    onClick={() => router.push(`/clinical-docs?id=${consultationId}`)}
                    className="mr-auto px-6 py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ClipboardList className="w-4 h-4" /> Clinical Documentation
                  </button>
                )}

                <button 
                  onClick={downloadPDF}
                  disabled={!summary || status === "Generating PDF..." || isEditingSummary}
                  className={`${ehrStatus || isSummaryApproved ? '' : 'ml-auto'} px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm`}
                >
                  <Download className="w-4 h-4" /> PDF
                </button>
                <button 
                  onClick={() => setIsEditingSummary(!isEditingSummary)}
                  disabled={!summary || isSummaryApproved}
                  className={`px-5 py-2.5 border font-bold text-sm rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm ${isEditingSummary ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                  <Edit3 className="w-4 h-4" /> {isEditingSummary ? "Save Edits" : "Edit"}
                </button>
                {!isSummaryApproved && summary && !isEditingSummary && (
                  <button 
                    onClick={() => setIsSummaryApproved(true)}
                    className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-emerald-200 dark:shadow-none"
                  >
                    <Check className="w-4 h-4" /> Approve Summary
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
    </DashboardLayout>
  );
}

export default function AI_Consultation_V2() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#f9fafb]">Loading Consultation...</div>}>
      <ConsultationContent />
    </Suspense>
  );
}
