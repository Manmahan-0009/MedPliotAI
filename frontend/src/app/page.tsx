"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Mic, Square, Download, Play, Pause, FileText, Users, Calendar, Folder, 
  LayoutTemplate, LineChart, Settings, ShieldCheck, Lock, Activity, 
  UserCircle, Stethoscope, FilePlus, ChevronRight, CheckCircle2, History,
  Send, Edit3, ClipboardList, BookOpen, User, Check, ChevronDown, Trash2
} from "lucide-react";
import { motion } from "framer-motion";

export default function AI_Consultation_V2() {
  const [status, setStatus] = useState("Idle"); 
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [timer, setTimer] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [ehrStatus, setEhrStatus] = useState("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
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
          patient_name: "Rahul Sharma",
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
    <div className="flex h-screen bg-[#f9fafb] font-sans text-slate-800 overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-[280px] bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-full">
        <div>
          <div className="h-20 flex items-center px-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <div className="text-slate-900 font-bold text-lg tracking-tight leading-tight">MediPilot AI</div>
                <div className="text-slate-500 text-[11px] font-medium tracking-wide">AI Clinical Documentation</div>
              </div>
            </div>
          </div>
          
          <nav className="px-4 py-2 space-y-1">
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-semibold transition-colors">
              <Mic className="w-5 h-5" />
              Consultation
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
              <Users className="w-5 h-5 text-slate-400" />
              Patients
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
              <Calendar className="w-5 h-5 text-slate-400" />
              Appointments
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
              <FileText className="w-5 h-5 text-slate-400" />
              Medical Records
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
              <LayoutTemplate className="w-5 h-5 text-slate-400" />
              Templates
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
              <LineChart className="w-5 h-5 text-slate-400" />
              Analytics
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors mt-4">
              <Settings className="w-5 h-5 text-slate-400" />
              Settings
            </a>
          </nav>
        </div>
        
        <div className="p-6">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-6 flex gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-slate-800 font-bold text-sm mb-1">Secure System</div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                Your conversations and patient data are encrypted and secure.
              </p>
            </div>
          </div>
          
          <div className="text-[10px] text-slate-400 font-medium">
            © 2025 MediPilot AI<br/>All rights reserved
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f9fafb]">
        
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div>
            <h1 className="text-lg font-bold text-slate-800">AI Consultation Session</h1>
            <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
              {isRecording ? "Recording in progress" : "Session Idle"}
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-blue-500 stroke-1" />
              <div>
                <div className="text-sm font-bold text-slate-800">HIPAA Compliant</div>
                <div className="text-xs text-slate-500 font-medium">Secure & Encrypted</div>
              </div>
            </div>
            
            <div className="w-px h-8 bg-slate-200"></div>
            
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-slate-400 stroke-1" />
              <div>
                <div className="text-sm font-bold text-slate-800">May 16, 2025</div>
                <div className="text-xs text-slate-500 font-medium">10:24 AM</div>
              </div>
            </div>

            <div className="w-px h-8 bg-slate-200"></div>
            
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm border border-blue-100">
                DS
              </div>
              <div className="mr-2">
                <div className="text-sm font-bold text-slate-800">Dr. Sarah Mitchell</div>
                <div className="text-xs text-slate-500 font-medium">Cardiology</div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* Patient Header Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 mb-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-lg font-bold border border-blue-100">
                RS
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800 mb-0.5">Rahul Sharma</div>
                <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                  <span>ID: PT-2026-8942</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span>Male</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span>28 Yrs</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span>O+</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs text-slate-500 font-medium mb-0.5">Attending Physician</div>
                <div className="text-sm font-bold text-slate-800">Dr. Sarah Mitchell (Cardiology)</div>
              </div>
              <div className="bg-emerald-50 text-emerald-700 text-xs font-bold px-4 py-2 rounded-lg border border-emerald-100 flex items-center gap-2">
                Active Session
              </div>
            </div>
          </div>

          {/* 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start h-[calc(100%-120px)] min-h-[700px]">
            
            {/* Left Column: Voice & Transcript */}
            <div className="flex flex-col gap-6 h-full">
              
              {/* Voice Capture */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="text-blue-600 font-bold text-xs uppercase tracking-widest">Voice Capture</div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                    <Lock className="w-3.5 h-3.5" /> Secure Transcription
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="text-5xl font-light text-slate-800 tracking-tight tabular-nums">
                    {formatTime(timer)}
                  </div>
                  <div className="text-slate-400 text-xs font-medium mt-1 uppercase tracking-widest">Duration</div>
                </div>

                {/* Waveform */}
                <div className="flex items-center justify-center h-16 w-full gap-1 my-8">
                  {[...Array(24)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 bg-blue-500 rounded-full opacity-80"
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
                      <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200 group-hover:bg-blue-700 transition-all">
                        <Mic className="w-7 h-7" />
                      </div>
                      <span className="text-sm font-semibold text-slate-600">Start Recording</span>
                    </button>
                  ) : (
                    <>
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
                          <Mic className="w-7 h-7" />
                        </div>
                        <span className="text-sm font-semibold text-blue-600">{status}</span>
                      </div>
                      <button
                        onClick={stopRecording}
                        className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-lg flex items-center gap-2 hover:bg-red-100 transition-all font-bold text-sm"
                      >
                        <Square className="w-4 h-4 fill-current" /> Stop Recording
                      </button>
                    </>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-slate-700">
                    <Mic className="w-4 h-4" /> Microphone: Built-in Microphone (Realtek) <ChevronDown className="w-3 h-3" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
                      <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
                      <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
                      <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
                      <div className="w-1 h-3 bg-slate-200 rounded-full"></div>
                    </div>
                    Good
                  </div>
                </div>
              </div>

              {/* Live Transcript */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
                <div className="p-5 flex items-center justify-between border-b border-slate-100">
                  <div className="text-blue-600 font-bold text-xs uppercase tracking-widest">Live Transcript</div>
                  <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Live
                  </div>
                </div>
                
                <div className="p-5 flex-1 overflow-y-auto space-y-6 bg-slate-50/50">
                  {transcript ? (
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full border border-blue-200 bg-blue-50 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Doctor</span>
                            <span className="text-[10px] font-medium text-slate-400">10:23:12 AM</span>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-xl rounded-tl-none border border-slate-200 shadow-sm">
                            {transcript}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">
                      {status.includes("Processing") ? (
                        <span className="flex items-center gap-2 animate-pulse"><Activity className="w-4 h-4" /> Transcribing audio...</span>
                      ) : (
                        "Transcript will appear here..."
                      )}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={isPaused ? resumeRecording : pauseRecording} disabled={!isRecording} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 disabled:opacity-50">
                      {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4 fill-current" />} {isPaused ? "Resume" : "Pause"}
                    </button>
                    <button onClick={stopRecording} disabled={!isRecording} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 disabled:opacity-50">
                      <Square className="w-4 h-4 fill-red-500 text-red-500" /> Stop
                    </button>
                    <button onClick={clearRecording} disabled={!transcript && !timer} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 disabled:opacity-50 ml-2">
                      <Trash2 className="w-4 h-4" /> Clear
                    </button>
                  </div>
                  <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    {timer} sec captured
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: AI Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/30">
                <div className="text-emerald-700 font-bold text-sm uppercase tracking-widest">
                  AI Clinical Summary
                </div>
                <div className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-1 rounded tracking-widest uppercase">
                  Draft
                </div>
              </div>

              {!summary ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
                   <ClipboardList className="w-12 h-12 text-slate-300 mb-4" />
                   <p className="text-slate-500 font-medium max-w-sm leading-relaxed">
                     The AI Clinical Summary, recommended tests, and notes will automatically generate here after the consultation ends.
                   </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                  
                  {/* Warning */}
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
                    <div className="text-amber-500 mt-0.5">⚠️</div>
                    <p className="text-amber-800 text-sm font-medium">
                      AI Generated Draft. Doctor approval required.<br/>
                      <span className="font-normal">This is NOT a diagnosis.</span>
                    </p>
                  </div>

                  {/* Summary Text Content - 2 Column Grid */}
                  {isEditingSummary ? (
                    <textarea 
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      className="w-full h-96 p-4 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-700 font-mono shadow-inner"
                      placeholder="Edit the AI generated summary here..."
                    />
                  ) : (
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm whitespace-pre-wrap text-sm text-slate-700 leading-relaxed h-96 overflow-y-auto">
                      {summary}
                    </div>
                  )}
                  {/* Bottom Panels (Tests & Notes) */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {/* Tests */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                      <h3 className="font-bold text-blue-600 text-sm mb-4">Recommended Tests</h3>
                      <div className="space-y-3">
                        <label className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer group">
                          <input type="checkbox" className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                          <span className="group-hover:text-blue-600 transition-colors">Complete Blood Count (CBC)</span>
                        </label>
                        <label className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer group">
                          <input type="checkbox" className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                          <span className="group-hover:text-blue-600 transition-colors">Rapid Antigen Test or PCR for COVID-19</span>
                        </label>
                        <label className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer group">
                          <input type="checkbox" className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                          <span className="group-hover:text-blue-600 transition-colors">Throat Swab for Streptococcal Infection</span>
                        </label>
                        <label className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer group">
                          <input type="checkbox" className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                          <span className="group-hover:text-blue-600 transition-colors">Chest X-ray (if symptoms worsen)</span>
                        </label>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                      <h3 className="font-bold text-emerald-600 text-sm mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Important Notes
                      </h3>
                      <ul className="list-disc list-inside text-sm text-slate-600 space-y-2.5 leading-relaxed">
                        <li>The patient denies chest pain or difficulty breathing at this time.</li>
                        <li>The patient's temperature has been around 101°F.</li>
                        <li>Further evaluation and history are needed to determine the cause of the symptoms and appropriate management.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center gap-4">
                {ehrStatus && (
                  <div className="mr-auto text-emerald-600 text-sm font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> {ehrStatus}
                  </div>
                )}
                <button 
                  onClick={downloadPDF}
                  disabled={!summary || status === "Generating PDF..." || isEditingSummary}
                  className={`${ehrStatus ? '' : 'ml-auto'} px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-blue-200`}
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
                <button 
                  onClick={() => setIsEditingSummary(!isEditingSummary)}
                  disabled={!summary}
                  className={`px-6 py-3 border font-bold text-sm rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm ${isEditingSummary ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-blue-600 hover:bg-blue-50'}`}
                >
                  <Edit3 className="w-4 h-4" /> {isEditingSummary ? "Save Summary" : "Edit Summary"}
                </button>
                <button 
                  onClick={handleSendEHR}
                  disabled={!summary || isEditingSummary || ehrStatus !== ""}
                  className="px-6 py-3 bg-white border border-slate-200 text-blue-600 font-bold text-sm rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send className="w-4 h-4" /> Send to EHR
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
