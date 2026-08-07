
import { Bell, User, Search } from 'lucide-react';
import { patient } from '../data/mockData';
import './Header.css';

export function Header() {
  return (
    <header className="header">
      <div className="header-search">
        <Search className="search-icon" size={20} />
        <input type="text" placeholder="Search medical records, medicines..." />
      </div>

      <div className="header-actions">
        <button className="icon-btn notification-btn">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>
        
        <div className="user-profile">
          <div className="user-avatar">
            <User size={20} />
          </div>
          <div className="user-info">
            <span className="user-name">{patient.name}</span>
            <span className="user-id">ID: {patient.id}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
