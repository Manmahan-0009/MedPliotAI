
import { documents } from '../data/mockData';
import { FileText, Download, Eye, FileArchive } from 'lucide-react';

export function Reports() {
  return (
    <div>
      <div className="flex-between mb-6">
        <div>
          <h1 className="section-title mb-0" style={{ fontSize: '1.8rem' }}>Medical Document Vault</h1>
          <p className="text-muted mt-1">Access and download all your medical records securely.</p>
        </div>
        <button className="btn btn-primary">
          <FileArchive size={18} /> Download All
        </button>
      </div>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {documents.map(doc => (
          <div key={doc.id} className="card flex flex-col justify-between" style={{ padding: '1.25rem' }}>
            <div className="flex items-start gap-4 mb-4">
              <div className="metric-icon bg-primary-light text-primary" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)' }}>
                <FileText size={24} />
              </div>
              <div>
                <h3 className="font-medium mb-1" style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}>{doc.title}</h3>
                <p className="text-muted text-sm">{doc.date}</p>
                <span className="badge badge-secondary mt-2" style={{ background: 'var(--color-background)', border: '1px solid var(--border-color)', fontSize: '0.7rem' }}>
                  {doc.type.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4 pt-4 border-bottom" style={{ borderTop: '1px solid var(--border-color)', borderBottom: 'none' }}>
              <button className="btn btn-outline flex-1 btn-sm">
                <Eye size={16} /> View
              </button>
              <button className="btn btn-secondary flex-1 btn-sm">
                <Download size={16} /> PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
