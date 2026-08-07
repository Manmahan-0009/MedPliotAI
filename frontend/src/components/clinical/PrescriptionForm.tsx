import React, { useState, useEffect } from 'react';
import { Pill, CheckCircle2, Save, Trash2, Plus } from 'lucide-react';

interface PrescriptionItem {
  id?: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  food_instruction: string;
}

interface PrescriptionFormProps {
  consultationId: string;
}

export default function PrescriptionForm({ consultationId }: PrescriptionFormProps) {
  const [prescriptionId, setPrescriptionId] = useState<string | null>(null);
  const [items, setItems] = useState<PrescriptionItem[]>([]);
  const [status, setStatus] = useState("Draft");
  const [isLoading, setIsLoading] = useState(false);

  const generatePrescription = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/clinical/consultations/${consultationId}/prescription/generate`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setPrescriptionId(data.prescription_id);
        fetchPrescription(data.prescription_id);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`http://localhost:8000/api/clinical/consultations/${consultationId}/prescription`);
        if (res.ok) {
          const data = await res.json();
          setPrescriptionId(data.id);
          setStatus(data.status || "Draft");
          setItems(data.items || []);
        }
      } catch (e) {
        console.error("Failed to fetch prescription", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExisting();
  }, [consultationId]);

  const fetchPrescription = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/clinical/consultations/${consultationId}/prescription`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status || "Draft");
        setItems(data.items || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { medicine_name: "", dosage: "", frequency: "", duration: "", food_instruction: "After Food" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const approvePrescription = async () => {
    if (!prescriptionId) return;
    try {
      const res = await fetch(`http://localhost:8000/api/prescriptions/${prescriptionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Approved", items })
      });
      if (res.ok) {
        setStatus("Approved");
        alert("Prescription Approved & Added to Schedule!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!prescriptionId && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-950/50">
        <Pill className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm text-center mb-6">
          Generate a structured prescription directly from the SOAP notes plan.
        </p>
        <button onClick={generatePrescription} className="px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors">
          Draft Prescription
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-blue-50/30 dark:bg-blue-900/10">
        <div className="text-blue-700 dark:text-blue-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
          <Pill className="w-4 h-4" /> Prescription Draft
        </div>
        <div className="flex gap-2 items-center">
          <span className={`text-xs font-bold px-2 py-1 rounded ${status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {status}
          </span>
          {status !== 'Approved' && (
            <button onClick={approvePrescription} className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Sign
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 p-5">
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex flex-wrap gap-4 items-end bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Medicine Name</label>
                <input 
                  type="text" 
                  value={item.medicine_name} 
                  onChange={(e) => handleUpdate(index, "medicine_name", e.target.value)}
                  disabled={status === 'Approved'}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white"
                />
              </div>
              <div className="w-24">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Dosage</label>
                <input 
                  type="text" 
                  value={item.dosage} 
                  onChange={(e) => handleUpdate(index, "dosage", e.target.value)}
                  disabled={status === 'Approved'}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white"
                />
              </div>
              <div className="w-32">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Frequency</label>
                <input 
                  type="text" 
                  value={item.frequency} 
                  onChange={(e) => handleUpdate(index, "frequency", e.target.value)}
                  disabled={status === 'Approved'}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white"
                />
              </div>
              <div className="w-24">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Duration</label>
                <input 
                  type="text" 
                  value={item.duration} 
                  onChange={(e) => handleUpdate(index, "duration", e.target.value)}
                  disabled={status === 'Approved'}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white"
                />
              </div>
              {status !== 'Approved' && (
                <button onClick={() => removeItem(index)} className="p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          
          {status !== 'Approved' && (
            <button onClick={addItem} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 w-full p-4 border-2 border-dashed border-blue-200 rounded-xl justify-center">
              <Plus className="w-4 h-4" /> Add Medicine
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
