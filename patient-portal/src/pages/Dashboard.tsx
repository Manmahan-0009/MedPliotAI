
import { patient, healthOverview, timelineEvents, medications } from '../data/mockData';
import { Activity, Clock, ShieldCheck, HeartPulse, FileText } from 'lucide-react';
import './Dashboard.css';

export function Dashboard() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Good morning, {patient.name.split(' ')[0]} 👋</h1>
        <p className="text-muted">Here is your health overview for today.</p>
      </div>

      {/* Top Health Overview Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon bg-primary-light text-primary">
            <HeartPulse size={24} />
          </div>
          <div className="metric-content">
            <span className="metric-label">AI Recovery Score</span>
            <div className="metric-value">
              {healthOverview.recoveryScore} <span className="metric-unit">/ 100</span>
            </div>
            <span className="metric-trend text-success">📈 {healthOverview.recoveryTrend}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon bg-success-light text-success">
            <ShieldCheck size={24} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Medication Adherence</span>
            <div className="metric-value">
              {healthOverview.adherencePercentage}%
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar bg-success" style={{ width: `${healthOverview.adherencePercentage}%` }}></div>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon bg-warning-light text-warning">
            <Clock size={24} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Next Medicine</span>
            <div className="metric-value text-sm">
              In {healthOverview.nextMedicine.time}
            </div>
            <span className="metric-trend text-muted">{healthOverview.nextMedicine.name}</span>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon bg-secondary-light text-secondary">
            <Activity size={24} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Next Follow-up</span>
            <div className="metric-value text-sm">
              {healthOverview.nextFollowUp}
            </div>
            <button className="btn btn-outline btn-sm mt-2">View Details</button>
          </div>
        </div>
      </div>

      <div className="dashboard-content-grid">
        {/* Left Column */}
        <div className="left-col">
          {/* AI Health Timeline */}
          <div className="card mb-6">
            <div className="section-title-bar">
              <h2 className="section-title mb-0">AI Health Timeline</h2>
              <span className="badge badge-primary">Demo Data</span>
            </div>
            <div className="timeline">
              {timelineEvents.map((event, index) => (
                <div key={event.id} className="timeline-item">
                  <div className={`timeline-dot ${event.status === 'completed' ? 'bg-success' : 'bg-warning'}`}></div>
                  {index < timelineEvents.length - 1 && <div className="timeline-line"></div>}
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <h4>{event.title}</h4>
                      <span className="timeline-time">{event.date} • {event.time}</span>
                    </div>
                    <p>{event.description}</p>
                    {event.type === 'prescription' && (
                      <button className="btn btn-outline btn-sm mt-2">
                        <FileText size={14} /> View Prescription
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="right-col">
          {/* AI Medication Safety Score */}
          <div className="card mb-6 highlight-card">
            <div className="flex-between">
              <h3 className="section-title mb-0">🟢 AI Medication Safety Score</h3>
              <span className="badge badge-warning">Demo Data</span>
            </div>
            <div className="safety-score-container mt-4">
              <div className="safety-score">92 <span className="text-sm font-normal">/ 100</span></div>
              <div className="safety-details">
                <p><strong>Risk Level:</strong> Low</p>
                <ul className="safety-list">
                  <li>✔ No major drug interactions detected</li>
                  <li>✔ All prescribed medicines available</li>
                  <li>✔ Generic alternatives can save ₹135 this month</li>
                </ul>
              </div>
            </div>
            <p className="disclaimer mt-4">
              Demo safety information — always confirm medication decisions with a qualified healthcare professional.
            </p>
          </div>

          {/* Current Medications */}
          <div className="card">
            <div className="section-title-bar">
              <h3 className="section-title mb-0">Current Medications</h3>
              <button className="text-primary font-medium bg-transparent border-none">View All</button>
            </div>
            <div className="medication-list mt-4">
              {medications.slice(0, 2).map(med => (
                <div key={med.id} className="med-item border-bottom pb-4 mb-4">
                  <div className="flex-between">
                    <h4 className="med-name">{med.name}</h4>
                    <span className="badge badge-success">Active</span>
                  </div>
                  <div className="med-details mt-2">
                    <p><strong>Dosage:</strong> {med.dosage} • {med.frequency}</p>
                    <p className="text-muted text-sm mt-1">{med.timing}</p>
                  </div>
                  <div className="med-actions mt-3 flex gap-2">
                    <button className="btn btn-primary btn-sm flex-1">✓ Taken</button>
                    <button className="btn btn-secondary btn-sm flex-1">Skip</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
