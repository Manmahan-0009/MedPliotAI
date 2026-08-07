"use client";

import React, { useState, useEffect } from "react";
import { ProtectedRoute } from "@/lib/protected-route";
import { pharmacyService } from "@/lib/api-services";
import { PharmacyData } from "@/lib/types";
import PatientSidebar from "@/components/patient-sidebar";
import { PaymentModal } from "@/components/payment-modal";
import { ShoppingBag, TrendingDown, AlertCircle, ShoppingCart, RefreshCw, CheckCircle } from "lucide-react";

export default function SmartPharmacyPage() {
  const [data, setData] = useState<PharmacyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentTitle, setPaymentTitle] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await pharmacyService.getPharmacyData();
      setData(res);
    } catch (err: any) {
      console.error("Failed to load pharmacy data:", err);
      setError(err.message || "Failed to load smart pharmacy catalogue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePayOnline = (amount: number, title: string) => {
    setPaymentAmount(amount);
    setPaymentTitle(title);
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = () => {
    alert("Medicine order placed successfully! Order notification sent to pharmacy.");
  };

  return (
    <ProtectedRoute allowedRole="patient">
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100">
        <PatientSidebar />

        <main className="flex-1 p-8 overflow-y-auto max-w-5xl space-y-6">
          
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Smart Pharmacy & Generic Alternatives</h1>
              <p className="text-xs text-slate-500 mt-1">Order your prescribed medicines safely with automated generic savings</p>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Catalogue
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
              <p className="text-sm font-medium">Loading Smart Pharmacy catalog & generic alternatives...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Prescribed Medicines Section */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-500" />
                  Prescribed Medicines
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {(data?.prescribed_medicines || [
                    {
                      id: "m1",
                      name: "Amoxicillin",
                      dosage: "500mg",
                      frequency: "Twice daily",
                      timing: "After meals",
                      remaining_qty: 6,
                      generic_alternative: { name: "Moxipen 500mg", savings: 35 },
                      interaction_warnings: ["Take with food to prevent mild stomach upset"],
                    },
                    {
                      id: "m2",
                      name: "Paracetamol",
                      dosage: "650mg",
                      frequency: "As needed (max 3/day)",
                      timing: "After meals",
                      remaining_qty: 4,
                      generic_alternative: { name: "Calpol 650mg", savings: 20 },
                      interaction_warnings: ["Do not exceed 3000mg per 24 hours"],
                    },
                  ]).map((med) => (
                    <div key={med.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                          <h3 className="font-bold text-slate-900 dark:text-white text-base">{med.name}</h3>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40 px-2.5 py-0.5 rounded-full">
                            {med.dosage}
                          </span>
                        </div>

                        <div className="my-3 text-xs space-y-1 text-slate-600 dark:text-slate-300">
                          <p>Schedule: <strong>{med.frequency}</strong> ({med.timing})</p>
                          <p>Remaining Stock: <strong>{med.remaining_qty} doses left</strong></p>
                        </div>

                        {med.generic_alternative && (
                          <div className="p-3 bg-emerald-50/80 dark:bg-emerald-900/30 rounded-xl border border-emerald-200 dark:border-emerald-800/50 text-xs space-y-1">
                            <p className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                              <TrendingDown className="w-4 h-4" /> Generic Alternative: {med.generic_alternative.name}
                            </p>
                            <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              Save up to ₹{med.generic_alternative.savings} on refill!
                            </p>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handlePayOnline(35, `Refill Order: ${med.name} (${med.dosage})`)}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" /> Order Refill Online (₹35)
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medicine Catalogue Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-bold text-slate-900 dark:text-white text-base">Full Medicine Catalogue</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                        <th className="py-3 px-2">Medicine Name</th>
                        <th className="py-3 px-2">Generic Formula</th>
                        <th className="py-3 px-2">Price</th>
                        <th className="py-3 px-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(data?.catalogue || [
                        { id: "cat-1", name: "Amoxicillin 500mg", generic_name: "Amoxicillin Trihydrate", price: 14.5 },
                        { id: "cat-2", name: "Moxipen 500mg", generic_name: "Amoxicillin Trihydrate", price: 9.45 },
                        { id: "cat-3", name: "Paracetamol 650mg", generic_name: "Acetaminophen", price: 4.0 },
                        { id: "cat-4", name: "Calpol 650mg", generic_name: "Acetaminophen", price: 3.2 },
                        { id: "cat-5", name: "Cetirizine 10mg", generic_name: "Cetirizine HCl", price: 5.5 },
                      ]).map((item) => (
                        <tr key={item.id}>
                          <td className="py-3 px-2 font-bold text-slate-900 dark:text-white">{item.name}</td>
                          <td className="py-3 px-2 text-slate-500">{item.generic_name}</td>
                          <td className="py-3 px-2 font-bold text-emerald-600">₹{item.price.toFixed(2)}</td>
                          <td className="py-3 px-2 text-right">
                            <button
                              onClick={() => handlePayOnline(item.price, `Buy: ${item.name}`)}
                              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold rounded-lg transition-colors"
                            >
                              Buy Online
                            </button>
                          </td>
                        </tr>
                      ))}
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
