import { useState } from 'react';

export function Header({ currentView, onViewChange, title }) {
  const [userName, setUserName] = useState(localStorage.getItem('tracker-user') || 'KiTae');

  const handleNameChange = (e) => {
    setUserName(e.target.value);
    localStorage.setItem('tracker-user', e.target.value);
  };

  const initial = userName.trim().charAt(0).toUpperCase();

  const navItems = [
    { id: 'dashboard', label: 'Cards' },
    { id: 'coleção', label: 'Collection' },
    { id: 'events', label: 'Events' },
    { id: 'commands', label: 'Commands' },
    { id: 'status', label: 'Status' }
  ];

  return (
    <header className="header">
      <div className="header-user">
        <span className="header-avatar" aria-hidden="true">{initial}</span>
        <label className="header-collector">
          Collector
          <input
            className="header-name"
            value={userName}
            onChange={handleNameChange}
            spellCheck="false"
          />
        </label>
      </div>

      <nav className="header-nav" aria-label="Main">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`header-pill ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <span className="header-badge">{title}</span>
    </header>
  );
}
