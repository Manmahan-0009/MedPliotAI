
import { consultations } from '../data/mockData';
import { Video, FileText, FileSignature, Stethoscope } from 'lucide-react';

export function Consultations() {
  return (
    <div>
      <div className="flex-between mb-6">
        <div>
          <h1 className="section-title mb-0" style={{ fontSize: '1.8rem' }}>Consultation History</h1>
          <p className="text-muted mt-1">Review your past consultations and doctor notes.</p>
        </div>
      </div>

      <div className="card">
        {consultations.map(cons => (
          <div key={cons.id} className="border-bottom pb-4 mb-4">
            <div className="flex-between mb-4">
              <div className="flex items-center gap-4">
                <div className="metric-icon bg-primary-light text-primary">
                  <Stethoscope size={24} />
                </div>
                <div>
                  <h3 className="med-name">{cons.doctor}</h3>
                  <p className="text-muted text-sm">{cons.specialty}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{cons.date}</p>
                <p className="text-muted text-sm">{cons.time}</p>
              </div>
            </div>
            
            <div className="bg-background p-4 rounded-md mb-4" style={{ borderRadius: 'var(--radius-md)', background: 'var(--color-background)', padding: '1rem' }}>
              <p className="font-medium text-sm mb-1">Reason for Consultation:</p>
              <p className="text-sm">{cons.reason}</p>
            </div>

            <div className="flex gap-4">
              {cons.hasSummary && (
                <button className="btn btn-outline btn-sm">
                  <Video size={16} /> AI Summary
                </button>
              )}
              {cons.hasSoap && (
                <button className="btn btn-outline btn-sm">
                  <FileText size={16} /> SOAP Notes
                </button>
              )}
              {cons.hasPrescription && (
                <button className="btn btn-outline btn-sm">
                  <FileSignature size={16} /> Prescription
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
