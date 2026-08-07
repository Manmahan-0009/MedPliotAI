"use client";

import React, { useState } from "react";
import { X, CreditCard, Smartphone, CheckCircle, ShieldCheck } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  title: string;
}

export function PaymentModal({ isOpen, onClose, onSuccess, amount, title }: PaymentModalProps) {
  const [method, setMethod] = useState<"card" | "upi">("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onSuccess();
        onClose();
      }, 1800);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
        {!isSuccess ? (
          <>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Complete Payment
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Payment Details</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{title}</p>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                ₹{amount.toFixed(2)}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Payment Method</p>

              <label
                onClick={() => setMethod("upi")}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  method === "upi"
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 text-slate-900 dark:text-white font-semibold"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm">UPI (Google Pay, PhonePe, Paytm)</span>
                </div>
                <input type="radio" checked={method === "upi"} onChange={() => setMethod("upi")} className="text-emerald-600" />
              </label>

              <label
                onClick={() => setMethod("card")}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  method === "card"
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 text-slate-900 dark:text-white font-semibold"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">Credit / Debit Card</span>
                </div>
                <input type="radio" checked={method === "card"} onChange={() => setMethod("card")} className="text-emerald-600" />
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePay}
                disabled={isProcessing}
                className="flex-[2] py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-colors disabled:opacity-50"
              >
                {isProcessing ? "Processing Payment..." : `Pay ₹${amount.toFixed(2)}`}
              </button>
            </div>
          </>
        ) : (
          <div className="py-8 text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Payment Successful!</h3>
            <p className="text-sm text-slate-500">Your transaction of ₹{amount.toFixed(2)} was completed securely.</p>
          </div>
        )}
      </div>
    </div>
  );
}
