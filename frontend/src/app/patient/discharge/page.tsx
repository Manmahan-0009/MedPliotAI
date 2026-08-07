"use client";

import React, { useState, useEffect } from "react";
import { ProtectedRoute } from "@/lib/protected-route";
import { patientService } from "@/lib/api-services";
import { DischargeData } from "@/lib/types";
import PatientSidebar from "@/components/patient-sidebar";
import { PaymentModal } from "@/components/payment-modal";
import { CreditCard, CalendarCheck, AlertCircle, RefreshCw, FileText, CheckCircle2, Download } from "lucide-react";

export default function DischargeBillingPage() {
  const [data, setData] = useState<DischargeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentTitle, setPaymentTitle] = useState("");
  const [paidInvoices, setPaidInvoices] = useState<Record<string, boolean>>({});

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await patientService.getDischargeData();
      setData(res);
    } catch (err: any) {
      console.error("Failed to load discharge data:", err);
      setError(err.message || "Failed to load discharge billing data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePayBill = (invoiceId: string, amount: number, type: string) => {
    setPaymentAmount(amount);
    setPaymentTitle(`Bill Payment: ${type} (${invoiceId})`);
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = () => {
    if (paymentTitle.includes("(")) {
      const invId = paymentTitle.split("(")[1].replace(")", "");
      setPaidInvoices((prev) => ({ ...prev, [invId]: true }));
    }
    alert("Invoice payment completed successfully!");
  };

  return (
    <ProtectedRoute allowedRole="patient">
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100">
        <PatientSidebar />

        <main className="flex-1 p-8 overflow-y-auto max-w-5xl space-y-6">
          
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Discharge Summary & Invoices</h1>
              <p className="text-xs text-slate-500 mt-1">Review discharge instructions, billing status, and pay outstanding invoices online</p>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs font-medium">
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div className="py-24 text-center text-slate-400">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-3" />
              <p className="text-sm font-medium">Loading discharge status and billing history...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Discharge Summary Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full uppercase tracking-wider">
                      {data?.status || "Ready for Discharge"}
                    </span>
                    <h2 className="font-bold text-slate-900 dark:text-white text-base mt-2 flex items-center gap-2">
                      <CalendarCheck className="w-5 h-5 text-emerald-500" />
                      Discharge Instructions & Summary
                    </h2>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p>Discharge Date: <strong>{data?.discharge_date || "2026-08-08"}</strong></p>
                    <p>Doctor: <strong>{data?.doctor_name || "Dr. Sarah Mitchell"}</strong></p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {data?.discharge_summary || "Patient showed significant improvement after antibiotic therapy. Safe for discharge with home oral medication continuation."}
                </div>
              </div>

              {/* Invoices & Payment History */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                    Invoices & Payment History
                  </h2>
                  <div className="text-xs text-slate-500">
                    Total Outstanding: <span className="font-bold text-red-600">₹{data?.total_outstanding || 35.00}</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                        <th className="py-3 px-2">Invoice ID</th>
                        <th className="py-3 px-2">Date</th>
                        <th className="py-3 px-2">Type / Description</th>
                        <th className="py-3 px-2">Amount</th>
                        <th className="py-3 px-2">Status</th>
                        <th className="py-3 px-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(data?.invoices || [
                        { id: "inv-1001", date: "2026-08-05", type: "AI Consultation & Assessment", amount: 75.0, status: "Paid" },
                        { id: "inv-1002", date: "2026-08-05", type: "Pharmacy - Prescribed Medicines", amount: 24.5, status: "Paid" },
                        { id: "inv-1003", date: "2026-08-07", type: "Smart Clinical Summary & Discharge", amount: 35.0, status: "Pending" },
                      ]).map((inv) => {
                        const isPaid = inv.status === "Paid" || paidInvoices[inv.id];
                        return (
                          <tr key={inv.id}>
                            <td className="py-3.5 px-2 font-bold text-slate-900 dark:text-white">{inv.id}</td>
                            <td className="py-3.5 px-2 text-slate-500">{inv.date}</td>
                            <td className="py-3.5 px-2 text-slate-700 dark:text-slate-300 font-medium">{inv.type}</td>
                            <td className="py-3.5 px-2 font-bold text-slate-900 dark:text-white">₹{inv.amount.toFixed(2)}</td>
                            <td className="py-3.5 px-2">
                              <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                                isPaid ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              }`}>
                                {isPaid ? "Paid" : "Pending"}
                              </span>
                            </td>
                            <td className="py-3.5 px-2 text-right">
                              {isPaid ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-end gap-1">
                                  <CheckCircle2 className="w-4 h-4" /> Paid
                                </span>
                              ) : (
                                <button
                                  onClick={() => handlePayBill(inv.id, inv.amount, inv.type)}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm"
                                >
                                  Pay Now
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          <PaymentModal
            isOpen={isPaymentOpen}
            onClose={() => setIsPaymentOpen(false)}
            onSuccess={handlePaymentSuccess}
            amount={paymentAmount}
            title={paymentTitle}
          />

        </main>
      </div>
    </ProtectedRoute>
  );
}
