import { useState } from 'react';

export function Header({ currentView, onViewChange, title }) {
  const [userName, setUserName] = useState(localStorage.getItem('tracker-user') || 'KiTae');

  const handleNameChange = (e) => {
    setUserName(e.target.value);
    localStorage.setItem('tracker-user', e.target.value);
  };

  const navItems = [
    { id: 'dashboard', label: 'Cards' },
    { id: 'coleção', label: 'Collection' },
    { id: 'events', label: 'Events' },
    { id: 'commands', label: 'Commands' },
    { id: 'status', label: 'Status' }
  ];

  return (
    <nav className="main-navbar">
      <div className="nav-left">
        <input className="nav-username-input" value={userName} onChange={handleNameChange} spellCheck="false" />
      </div>

      <div className="nav-center">
        {navItems.map((item) => (
          <button key={item.id} className={`nav-link ${currentView === item.id ? 'active' : ''}`} onClick={() => onViewChange(item.id)}>
            {item.label}
          </button>
        ))}
      </div>

      <div className="nav-right">
        <span className="bot-label">{title} BOT</span>
      </div>
    </nav>
  );
}