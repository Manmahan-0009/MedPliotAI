
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Reports } from './pages/Reports';
import { Consultations } from './pages/Consultations';
import { Medications } from './pages/Medications';
import { Pharmacy } from './pages/Pharmacy';
import { Billing } from './pages/Billing';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Header />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/consultations" element={<Consultations />} />
              <Route path="/medications" element={<Medications />} />
              <Route path="/pharmacy" element={<Pharmacy />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/documents" element={<Reports />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
