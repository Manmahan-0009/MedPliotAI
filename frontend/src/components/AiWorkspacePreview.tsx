"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope,
  Mic,
  Cpu,
  FileText,
  Pill,
  ShieldCheck,
  HeartPulse,
  CheckCircle2,
  Activity,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────
   Types
────────────────────────────────────────────────────────────── */
type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const STEP_DURATION = 1400; // ms per sub-tick
const TOTAL_STEPS: Step[] = [0, 1, 2, 3, 4, 5, 6];

/* ──────────────────────────────────────────────────────────────
   Animated waveform bars
────────────────────────────────────────────────────────────── */
function Waveform() {
  const bars = [3, 6, 4, 8, 5, 9, 4, 7, 3, 8, 6, 5, 9, 4, 7];
  return (
    <div className="flex items-center gap-[3px] h-8">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-blue-500"
          animate={{ height: [`${h * 3}px`, `${h * 3 * 1.5}px`, `${h * 3}px`] }}
          transition={{ duration: 0.6 + i * 0.04, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Typed text hook
────────────────────────────────────────────────────────────── */
function useTyping(text: string, active: boolean, speed = 28) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!active) { setDisplayed(""); return; }
    let i = 0;
    setDisplayed("");
    const t = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [active, text, speed]);
  return displayed;
}

/* ──────────────────────────────────────────────────────────────
   Circular score ring (SVG)
────────────────────────────────────────────────────────────── */
function ScoreRing({
  score,
  max = 100,
  color = "#2563eb",
  label,
}: {
  score: number;
  max?: number;
  color?: string;
  label: string;
}) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / max) * circ;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} fill="none" stroke="#e2e8f0" strokeWidth="5" />
          <motion.circle
            cx="32" cy="32" r={r}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[13px] font-black text-slate-900">{score}</span>
        </div>
      </div>
      <p className="text-[10px] font-semibold text-slate-600 text-center">{label}</p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main AiWorkspacePreview
────────────────────────────────────────────────────────────── */
export function AiWorkspacePreview({ compact = false }: { compact?: boolean }) {
  const [step, setStep] = useState<Step>(0);
  const [progress, setProgress] = useState(0);

  // Advance steps
  useEffect(() => {
    const durations: Record<Step, number> = {
      0: 2200,  // listening
      1: 3000,  // conversation
      2: 2000,  // processing
      3: 2000,  // SOAP
      4: 1800,  // prescription
      5: 1800,  // med safety
      6: 2000,  // recovery
    };
    const t = setTimeout(() => {
      setStep(s => ((s + 1) % 7) as Step);
    }, durations[step]);
    return () => clearTimeout(t);
  }, [step]);

  // Progress bar for step 2
  useEffect(() => {
    if (step !== 2) return;
    setProgress(0);
    const t = setInterval(() => {
      setProgress(p => {
        if (p >= 96) { clearInterval(t); return 96; }
        return p + 3;
      });
    }, 55);
    return () => clearInterval(t);
  }, [step]);

  const docTyped  = useTyping("Good morning. What brings you in today?", step === 1);
  const patTyped  = useTyping("I've had chest discomfort for three days.", step === 1 && docTyped.length > 30);

  const stepLabels: Record<Step, { label: string; color: string }> = {
    0: { label: "AI Listening",       color: "text-blue-600"   },
    1: { label: "Conversation",        color: "text-indigo-600" },
    2: { label: "AI Processing",       color: "text-amber-600"  },
    3: { label: "SOAP Notes",          color: "text-emerald-600"},
    4: { label: "Prescription",        color: "text-purple-600" },
    5: { label: "Medication Safety",   color: "text-rose-600"   },
    6: { label: "Recovery Score",      color: "text-teal-600"   },
  };

  const minH = compact ? "min-h-[140px]" : "min-h-[168px]";

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden ${compact ? "max-w-sm" : ""}`}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-600/25">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-900 leading-none">MediPilot AI</p>
            <p className="text-[11px] text-slate-500 mt-0.5">AI Consultation Engine</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      {/* ── Step progress ── */}
      <div className="flex gap-1 px-5 pt-3.5 pb-2">
        {TOTAL_STEPS.map(i => (
          <motion.div
            key={i}
            className="flex-1 h-1 rounded-full"
            animate={{ backgroundColor: i <= step ? "#2563eb" : "#e2e8f0" }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
      <p className={`px-5 pb-2.5 text-[10px] font-bold uppercase tracking-widest ${stepLabels[step].color}`}>
        {stepLabels[step].label}
      </p>

      {/* ── Content ── */}
      <div className={`px-5 pb-5 ${minH}`}>
        <AnimatePresence mode="wait">

          {/* Step 0: AI Listening */}
          {step === 0 && (
            <motion.div key="s0"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
                  <Mic className="w-4 h-4 text-blue-600" />
                </motion.div>
                <span className="text-[11px] font-semibold text-slate-500">Whisper — 99.4% accuracy</span>
              </div>
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                <Waveform />
                <p className="text-[10px] text-slate-500 font-medium mt-2">Recording active consultation…</p>
              </div>
            </motion.div>
          )}

          {/* Step 1: Conversation */}
          {step === 1 && (
            <motion.div key="s1"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl rounded-bl-none max-w-[90%]">
                <p className="text-[10px] font-bold text-blue-700 mb-0.5">Doctor</p>
                <p className="text-[11px] text-slate-800">
                  {docTyped}
                  {docTyped.length < 39 && <span className="inline-block w-[2px] h-[11px] bg-blue-500 ml-0.5 align-middle animate-cursor" />}
                </p>
              </div>
              {docTyped.length > 30 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl rounded-br-none max-w-[90%] ml-auto"
                >
                  <p className="text-[10px] font-bold text-slate-600 mb-0.5 text-right">Patient</p>
                  <p className="text-[11px] text-slate-800 text-right">
                    {patTyped}
                    {patTyped.length < 41 && <span className="inline-block w-[2px] h-[11px] bg-slate-500 ml-0.5 align-middle animate-cursor" />}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 2: AI Processing */}
          {step === 2 && (
            <motion.div key="s2"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                  <Cpu className="w-3.5 h-3.5 text-amber-500" />
                </motion.div>
                <span className="text-[11px] font-semibold text-slate-500">Generating Clinical Documentation…</span>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-semibold text-amber-700 mb-1">
                  <span>AI Medical Reasoning</span><span>{progress}%</span>
                </div>
                <div className="w-full bg-amber-100 rounded-full h-1.5 overflow-hidden">
                  <motion.div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {["ICD-10 Mapping", "Allergen Check", "Drug Interactions", "Dosage Audit"].map((t, i) => (
                  <motion.span key={t} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.2 }}
                    className="text-[10px] font-semibold text-amber-800 bg-white border border-amber-200 px-2 py-0.5 rounded-md">
                    ✓ {t}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: SOAP Notes */}
          {step === 3 && (
            <motion.div key="s3"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                {[
                  ["S", "Chest discomfort × 3 days, non-radiating"],
                  ["O", "HR 88 · BP 122/78 · SpO₂ 98%"],
                  ["A", "Suspected musculoskeletal — ICD-10 M54.5"],
                  ["P", "NSAIDs · Rest · ECG · F/U 48h"],
                ].map(([k, v], i) => (
                  <motion.div key={k} className="flex gap-2 text-[11px]"
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}>
                    <span className="font-extrabold text-emerald-700 w-4 shrink-0">{k}</span>
                    <span className="text-slate-800">{v}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Prescription */}
          {step === 4 && (
            <motion.div key="s4"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-[11px] space-y-2">
                <div className="flex justify-between font-bold text-purple-900">
                  <span>Ibuprofen 400 mg</span>
                  <span className="font-mono text-purple-700">1-0-1 · 5 days</span>
                </div>
                <p className="text-slate-600">Take after meals. Avoid on empty stomach.</p>
                <div className="flex justify-between items-center pt-1 border-t border-purple-100">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    💊 55% savings on generic
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">0 interactions</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 5: Medication Safety */}
          {step === 5 && (
            <motion.div key="s5"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center gap-8 py-2"
            >
              <ScoreRing score={94} color="#2563eb" label="Medication Safety" />
              <div className="space-y-1.5 text-[11px]">
                {["No allergic conflicts", "Dosage within range", "No contraindications"].map((item, i) => (
                  <motion.div key={item} className="flex items-center gap-1.5 text-slate-700"
                    initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    {item}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 6: Recovery Score */}
          {step === 6 && (
            <motion.div key="s6"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <ScoreRing score={82} color="#0d9488" label="Recovery Index" />
                <div className="flex-1 ml-4 space-y-1">
                  <p className="text-[10px] font-bold text-teal-700 uppercase tracking-wide">8-Day Trend</p>
                  <div className="flex items-end gap-0.5 h-8">
                    {[45, 52, 60, 58, 66, 72, 78, 82].map((h, i) => (
                      <motion.div key={i}
                        className={`flex-1 rounded-sm ${i === 7 ? "bg-teal-600" : "bg-teal-200"}`}
                        initial={{ height: 0 }} animate={{ height: `${(h / 82) * 32}px` }}
                        transition={{ delay: i * 0.08, duration: 0.4 }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-teal-700 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> Stabilising — on track.
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between px-5 py-2.5 border-t border-slate-100 bg-slate-50/60">
        <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
          <ShieldCheck className="w-3 h-3 text-blue-600" />
          256-bit encrypted
        </span>
        <span className="text-[10px] font-mono text-slate-400">
          step {step + 1} / 7
        </span>
      </div>
    </div>
  );
}
