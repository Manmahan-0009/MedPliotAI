
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  History, 
  Pill, 
  ShoppingCart,
  CreditCard,
  FileCheck,
  LogOut
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/reports', label: 'Medical Reports', icon: FileText },
  { path: '/consultations', label: 'Consultations', icon: History },
  { path: '/medications', label: 'Medications', icon: Pill },
  { path: '/pharmacy', label: 'Smart Pharmacy', icon: ShoppingCart },
  { path: '/billing', label: 'Bills & Payments', icon: CreditCard },
  { path: '/documents', label: 'Document Vault', icon: FileCheck },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-placeholder">
          <div className="logo-icon">+</div>
          <h2>MediPilot AI</h2>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon className="nav-icon" size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
