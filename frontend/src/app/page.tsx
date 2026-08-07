"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Download, Activity, Play, Pause } from "lucide-react";
import { motion } from "framer-motion";

export default function AI_Consultation_MVP() {
  const [status, setStatus] = useState("Microphone Ready"); // Ready, Listening, Recording, Processing Audio, Generating Summary, Completed
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [timer, setTimer] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
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
      setStatus("Recording");
      
      setTimer(0);
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error(err);
      setStatus("Permission denied or No microphone found");
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
      setStatus("Recording");
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

  const handleStop = async () => {
    setStatus("Processing Audio");
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
      setStatus("Generating Summary");

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
      setStatus("Error processing consultation");
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
          patient_name: "John Doe",
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
      setStatus("Error generating PDF");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-center pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 tracking-tight">MediPilot AI</h1>
            <p className="text-slate-500 font-medium mt-1">AI Consultation Module</p>
          </div>
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
            <div className={`w-3 h-3 rounded-full ${status === 'Completed' ? 'bg-emerald-500' : status.includes('Error') ? 'bg-red-500' : 'bg-blue-500 animate-pulse'}`}></div>
            <span className="text-sm font-semibold text-slate-700">{status}</span>
          </div>
        </header>

        {/* Patient Info Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
              JD
            </div>
            <div>
              <h2 className="text-xl font-bold">John Doe</h2>
              <p className="text-sm text-slate-500">ID: PT-2026-8942 • Male • 45 Yrs • O+</p>
            </div>
          </div>
          <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Attending Physician</p>
            <p className="font-semibold text-slate-800">Dr. Sarah Mitchell (Cardiology)</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Left Column: Recording & Transcript */}
          <div className="space-y-8">
            
            {/* Recording Panel */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-4 left-4 text-xs font-bold text-slate-400 tracking-widest uppercase">
                Audio Capture
              </div>
              
              <div className="mb-8 mt-4">
                <span className="text-5xl font-light tabular-nums text-slate-800">
                  {formatTime(timer)}
                </span>
              </div>

              {/* Visualizer Animation */}
              <div className="flex items-center justify-center h-16 mb-8 w-full gap-1">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 bg-blue-500 rounded-full"
                    animate={
                      isRecording && !isPaused
                        ? { height: [8, Math.random() * 40 + 10, 8] }
                        : { height: 8 }
                    }
                    transition={{
                      repeat: Infinity,
                      duration: 0.5 + Math.random() * 0.5,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center gap-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all"
                  >
                    <Mic className="w-8 h-8" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={isPaused ? resumeRecording : pauseRecording}
                      className="w-16 h-16 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center hover:bg-slate-200 transition-all"
                    >
                      {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                    </button>
                    <button
                      onClick={stopRecording}
                      className="w-20 h-20 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-200 hover:bg-red-600 hover:scale-105 transition-all"
                    >
                      <Square className="w-8 h-8 fill-current" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Live Transcript Panel */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-[300px] flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                Live Transcript
              </h3>
              <div className="flex-1 overflow-y-auto pr-2 text-slate-600 text-sm leading-relaxed space-y-4">
                {transcript ? (
                  <div className="p-3 bg-slate-50 rounded-lg whitespace-pre-wrap border border-slate-100">
                    {transcript}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 italic">
                    Transcript will appear here once processing completes...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: AI Summary */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
            <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                AI Clinical Summary
              </h3>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-100 px-2 py-1 rounded">
                Draft
              </span>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              {!summary ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm space-y-4">
                  {status === "Generating Summary" ? (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                      <p>Gemini is structuring the clinical notes...</p>
                    </>
                  ) : (
                    <p className="italic">Summary will be generated after the consultation.</p>
                  )}
                </div>
              ) : (
                <div className="prose prose-sm prose-slate max-w-none">
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
                    <p className="text-xs text-yellow-800 font-semibold uppercase tracking-wider mb-1">Notice</p>
                    <p className="text-sm text-yellow-900 m-0">AI Generated Draft. Doctor approval required. This is NOT a diagnosis.</p>
                  </div>
                  <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                    {summary}
                  </div>
                </div>
              )}
            </div>
            
            {/* Download Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50">
              <button 
                onClick={downloadPDF}
                disabled={!summary || status === "Generating PDF..."}
                className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-slate-900 text-white hover:bg-slate-800 shadow-md"
              >
                <Download className="w-5 h-5" />
                {status === "Generating PDF..." ? "Generating..." : "Download PDF Report"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
