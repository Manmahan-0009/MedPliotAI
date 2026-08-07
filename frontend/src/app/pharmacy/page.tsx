"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { Store, Search, Filter, ShoppingCart, Plus, CheckCircle2 } from 'lucide-react';

interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  brand: string;
  price: number;
  category: string;
  description: string;
}

export default function PharmacyMarketplace() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{med: Medicine, qty: number}[]>([]);
  const [isCheckout, setIsCheckout] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async (q: string = "") => {
    setLoading(true);
    try {
      const url = q ? `http://localhost:8000/api/pharmacy/medicines/search?q=${q}` : 'http://localhost:8000/api/pharmacy/medicines';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMedicines(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (e.target.value.length > 2 || e.target.value.length === 0) {
      fetchMedicines(e.target.value);
    }
  };

  const addToCart = (med: Medicine) => {
    const existing = cart.find(c => c.med.id === med.id);
    if (existing) {
      setCart(cart.map(c => c.med.id === med.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { med, qty: 1 }]);
    }
  };

  const handleCheckout = async () => {
    try {
      const items = cart.map(c => ({ medicine_id: c.med.id, quantity: c.qty }));
      const res = await fetch("http://localhost:8000/api/pharmacy/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: "MP-2026-0001",
          address: "123 Main St, New York, NY",
          payment_info: "Card ending in 1234",
          items: items
        })
      });
      if (res.ok) {
        setIsCheckout(true);
        setCart([]);
      }
    } catch (e) {
      alert("Error checking out");
    }
  };

  return (
    <DashboardLayout title="Medicine Marketplace">
      <div className="flex-1 flex gap-6 h-full">
        
        {/* Left Column: Catalogue */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col h-[calc(100vh-120px)] overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Marketplace
            </h2>
            <div className="relative w-72">
              <input 
                type="text" 
                placeholder="Search medicines..."
                value={search}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full text-slate-400 animate-pulse">Loading catalogue...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {medicines.map((med) => (
                  <div key={med.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 p-5 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors flex flex-col h-full">
                    <div className="flex-1">
                      <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">{med.category}</div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">{med.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{med.description}</p>
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-4">
                      <div className="font-bold text-lg text-slate-800 dark:text-white">${med.price.toFixed(2)}</div>
                      <button 
                        onClick={() => addToCart(med)}
                        className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:bg-indigo-200 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Cart */}
        <div className="w-[350px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col h-[calc(100vh-120px)] shrink-0">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
            <ShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Your Cart
          </h2>
          
          {isCheckout ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Order Confirmed!</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your medicines will be delivered in 2 days.</p>
              <button onClick={() => setIsCheckout(false)} className="mt-6 text-sm font-bold text-indigo-600 hover:underline">
                Continue Shopping
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              Your cart is empty
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{item.med.name}</div>
                      <div className="text-xs text-slate-500">Qty: {item.qty}</div>
                    </div>
                    <div className="font-bold text-sm text-slate-800 dark:text-white">
                      ${(item.med.price * item.qty).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="flex justify-between items-center mb-6">
                  <div className="font-bold text-slate-600 dark:text-slate-400">Total</div>
                  <div className="font-bold text-xl text-slate-800 dark:text-white">
                    ${cart.reduce((acc, curr) => acc + (curr.med.price * curr.qty), 0).toFixed(2)}
                  </div>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
