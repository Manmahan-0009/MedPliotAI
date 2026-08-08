import React, { useState } from "react";
import { X, Save, FileSignature } from "lucide-react";

export default function ReportEditor({ report, onClose, onSave }: { report: any, onClose: () => void, onSave: () => void }) {
  const [soap, setSoap] = useState(report.soap_notes || { subjective: "", objective: "", assessment: "", plan: "" });
  const [status, setStatus] = useState(report.status || "Pending Review");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/reports/${report.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          soap_notes: soap
        })
      });
      if (res.ok) {
        onSave();
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20 rounded-t-2xl">
          <h3 className="font-bold flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-blue-600" /> 
            Edit Clinical Report
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"><X className="w-5 h-5"/></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Review Status</label>
            <select 
              value={status} 
              onChange={e => setStatus(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Draft">Draft</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Approved">Approved</option>
            </select>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">SOAP Notes</h4>
            
            {(["subjective", "objective", "assessment", "plan"] as const).map(key => (
              <div key={key}>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{key}</label>
                <textarea 
                  value={soap[key]}
                  onChange={e => setSoap({...soap, [key]: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                />
              </div>
            ))}
          </div>

        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 rounded-b-2xl bg-white dark:bg-slate-900">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
