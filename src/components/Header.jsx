import { useState } from 'react';

// Topo único do site: logo, links das páginas e o colecionador.
// "activeLink" é o id do link sublinhado (ou null); quem decide é o App.
export function Header({ activeLink, onNavigate, onLogoClick }) {
  const [userName, setUserName] = useState(localStorage.getItem('tracker-user') || 'KiTae');

  const handleNameChange = (e) => {
    setUserName(e.target.value);
    localStorage.setItem('tracker-user', e.target.value);
  };

  const initial = userName.trim().charAt(0).toUpperCase();

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'groups', label: 'Groups' },
    { id: 'cards', label: 'Cards' },
    { id: 'collection', label: 'Collection' },
    { id: 'commands', label: 'Commands' },
  ];

  return (
    <header className="header">
      <div className="header-inner">
        <button type="button" className="header-logo" onClick={onLogoClick}>
          <span className="logo-mark" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </span>
          <span className="logo-text">Hanbin Tracker</span>
        </button>

        <nav className="header-nav" aria-label="Main">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`header-link ${activeLink === item.id ? 'active' : ''}`}
              aria-current={activeLink === item.id ? 'page' : undefined}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

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
      </div>
    </header>
  );
}
