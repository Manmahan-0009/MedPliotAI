
import { medications } from '../data/mockData';
import { Pill, AlertCircle, Info } from 'lucide-react';

export function Medications() {
  return (
    <div>
      <div className="flex-between mb-6">
        <div>
          <h1 className="section-title mb-0" style={{ fontSize: '1.8rem' }}>Medication Management</h1>
          <p className="text-muted mt-1">Track and manage your daily prescriptions.</p>
        </div>
      </div>

      <div className="card mb-6 bg-warning-light border-none">
        <div className="flex items-center gap-2 text-warning mb-2">
          <AlertCircle size={20} />
          <h3 className="font-medium">Medication Adherence Alert</h3>
        </div>
        <p className="text-sm">You have missed one dose of Paracetamol today. Please remember to take it if you are experiencing fever.</p>
      </div>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {medications.map(med => (
          <div key={med.id} className="card flex flex-col">
            <div className="flex-between mb-4 pb-4 border-bottom">
              <div className="flex items-center gap-3">
                {med.imageUrl ? (
                  <img src={med.imageUrl} alt={med.name} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                ) : (
                  <div className="metric-icon bg-primary-light text-primary" style={{ width: '40px', height: '40px' }}>
                    <Pill size={20} />
                  </div>
                )}
                <div>
                  <h3 className="med-name">{med.name}</h3>
                  <span className="badge badge-success mt-1">Active</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4 mb-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
                <div>
                  <p className="text-muted mb-1">Dosage</p>
                  <p className="font-medium">{med.dosage}</p>
                </div>
                <div>
                  <p className="text-muted mb-1">Frequency</p>
                  <p className="font-medium">{med.frequency}</p>
                </div>
                <div>
                  <p className="text-muted mb-1">Duration</p>
                  <p className="font-medium">{med.duration}</p>
                </div>
                <div>
                  <p className="text-muted mb-1">Remaining</p>
                  <p className="font-medium">{med.remainingQty} / {med.prescribedQty}</p>
                </div>
              </div>
              
              <div className="bg-background p-3 rounded-md flex gap-2 items-start" style={{ borderRadius: 'var(--radius-md)', background: 'var(--color-background)' }}>
                <Info size={16} className="text-primary mt-1 flex-shrink-0" />
                <p className="text-sm">{med.timing}</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="btn btn-primary flex-1">Log Dose</button>
              <button className="btn btn-outline flex-1">Refill</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
