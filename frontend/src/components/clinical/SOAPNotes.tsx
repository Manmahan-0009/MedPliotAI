import React, { useState, useEffect } from 'react';
import { Activity, Edit3, Save, CheckCircle2 } from 'lucide-react';

interface SOAPData {
  subjective: any;
  objective: any;
  assessment: any;
  plan: any;
}

interface SOAPNotesProps {
  consultationId: string;
  onPrescriptionReady: () => void;
}

export default function SOAPNotes({ consultationId, onPrescriptionReady }: SOAPNotesProps) {
  const [soap, setSoap] = useState<SOAPData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editSoap, setEditSoap] = useState<SOAPData | null>(null);

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`http://localhost:8000/api/consultations/${consultationId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.soap_notes) {
            setSoap(data.soap_notes);
            setEditSoap(data.soap_notes);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExisting();
  }, [consultationId]);

  const generateSOAP = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/clinical/consultations/${consultationId}/soap`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setSoap(data);
        setEditSoap(data);
      }
    } catch (e) {
      console.error("Failed to generate SOAP", e);
    }
    setIsLoading(false);
  };

  const saveSOAP = async () => {
    if (!editSoap) return;
    try {
      const res = await fetch(`http://localhost:8000/api/clinical/consultations/${consultationId}/soap`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soap_notes: editSoap })
      });
      if (res.ok) {
        setSoap(editSoap);
        setIsEditing(false);
      }
    } catch (e) {
      alert("Failed to save changes");
    }
  };

  const updateEditSoap = (section: keyof SOAPData, field: string, value: string) => {
    if (!editSoap) return;
    setEditSoap({
      ...editSoap,
      [section]: {
        ...editSoap[section],
        [field]: value
      }
    });
  };

  if (!soap && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-950/50">
        <Activity className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm text-center mb-6">
          Generate structured clinical documentation (SOAP Notes) from the AI Summary.
        </p>
        <button onClick={generateSOAP} className="px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors">
          Generate SOAP Notes
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/50">
        <span className="flex items-center gap-2 text-slate-500 animate-pulse font-medium">
          <Activity className="w-5 h-5" /> Generating Clinical Documentation...
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/30 dark:bg-emerald-900/10">
        <div className="text-emerald-700 dark:text-emerald-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> SOAP Notes (Auto-Generated)
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <button onClick={saveSOAP} className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-blue-700">
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className="px-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-700">
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={onPrescriptionReady} className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-indigo-700">
                Draft Prescription
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="flex-1 p-5">
        {isEditing && editSoap ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Subjective</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Complaints</label>
                  <textarea value={editSoap.subjective?.patient_complaints || ''} onChange={(e) => updateEditSoap('subjective', 'patient_complaints', e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500" rows={2} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Symptoms</label>
                  <input type="text" value={editSoap.subjective?.symptoms || ''} onChange={(e) => updateEditSoap('subjective', 'symptoms', e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Duration</label>
                  <input type="text" value={editSoap.subjective?.duration || ''} onChange={(e) => updateEditSoap('subjective', 'duration', e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Objective</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Vitals</label>
                  <input type="text" value={editSoap.objective?.vitals || ''} onChange={(e) => updateEditSoap('objective', 'vitals', e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Clinical Findings</label>
                  <textarea value={editSoap.objective?.clinical_findings || ''} onChange={(e) => updateEditSoap('objective', 'clinical_findings', e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500" rows={2} />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Assessment</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Primary Assessment</label>
                  <textarea value={editSoap.assessment?.possible_assessment || ''} onChange={(e) => updateEditSoap('assessment', 'possible_assessment', e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500" rows={2} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Differential Considerations</label>
                  <textarea value={editSoap.assessment?.differential_considerations || ''} onChange={(e) => updateEditSoap('assessment', 'differential_considerations', e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500" rows={2} />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Plan</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Investigations</label>
                  <textarea value={editSoap.plan?.recommended_investigations || ''} onChange={(e) => updateEditSoap('plan', 'recommended_investigations', e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500" rows={2} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Advice</label>
                  <textarea value={editSoap.plan?.lifestyle_advice || ''} onChange={(e) => updateEditSoap('plan', 'lifestyle_advice', e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500" rows={2} />
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium">
                  Note: Medications are managed in the Prescription tab.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">Subjective</h3>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <p><span className="font-medium text-slate-700 dark:text-slate-300">Complaints:</span> {soap?.subjective?.patient_complaints}</p>
                <p><span className="font-medium text-slate-700 dark:text-slate-300">Symptoms:</span> {soap?.subjective?.symptoms}</p>
                <p><span className="font-medium text-slate-700 dark:text-slate-300">Duration:</span> {soap?.subjective?.duration}</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">Objective</h3>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <p><span className="font-medium text-slate-700 dark:text-slate-300">Vitals:</span> {soap?.objective?.vitals}</p>
                <p><span className="font-medium text-slate-700 dark:text-slate-300">Findings:</span> {soap?.objective?.clinical_findings}</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">Assessment</h3>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <p><span className="font-medium text-slate-700 dark:text-slate-300">Primary:</span> {soap?.assessment?.possible_assessment}</p>
                <p><span className="font-medium text-slate-700 dark:text-slate-300">Differential:</span> {soap?.assessment?.differential_considerations}</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">Plan</h3>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <p><span className="font-medium text-slate-700 dark:text-slate-300">Investigations:</span> {soap?.plan?.recommended_investigations}</p>
                <p><span className="font-medium text-slate-700 dark:text-slate-300">Advice:</span> {soap?.plan?.lifestyle_advice}</p>
                <div className="mt-4">
                  <span className="font-medium text-slate-700 dark:text-slate-300 mb-2 block">Medications:</span>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                    {soap?.plan?.medication?.map((med: any, idx: number) => (
                      <div key={idx} className="flex gap-4 py-2 border-b border-slate-200 dark:border-slate-700 last:border-0 last:pb-0">
                        <div className="font-bold text-slate-700 dark:text-slate-300">{med.name}</div>
                        <div>{med.dosage}</div>
                        <div>{med.frequency}</div>
                        <div>{med.duration}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
