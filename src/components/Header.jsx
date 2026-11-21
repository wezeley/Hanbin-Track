import { useState } from 'react';

export function Header({ currentView, onViewChange, title }) {
  const [userName, setUserName] = useState(localStorage.getItem('tracker-user') || 'KiTae');

  const handleNameChange = (e) => {
    setUserName(e.target.value);
    localStorage.setItem('tracker-user', e.target.value);
  };

  const initial = userName.trim().charAt(0).toUpperCase();

  // O id é o endereço da aba (#/collection...); "dashboard" é a Home (e as
  // categorias e grupos, que saem dela)
  const navItems = [
    { id: 'dashboard', label: 'Home' },
    { id: 'cards', label: 'Cards' },
    { id: 'collection', label: 'Collection' },
    { id: 'commands', label: 'Commands' },
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
