import { useState } from 'react';

export function Header({ title, onHome }) {
  const [userName, setUserName] = useState(localStorage.getItem('tracker-user') || 'WESLEY LIMA');

  const handleNameChange = (e) => {
    setUserName(e.target.value);
    localStorage.setItem('tracker-user', e.target.value);
  };

  return (
    <div className="top-nav-container">
      <div className="nav-upper">
        <h1 className="title" onClick={onHome} style={{fontSize: '1.2rem', fontWeight: 800, cursor: 'pointer'}}>
          {title}
        </h1>
        <div className="user-info">
          <input 
            className="username-input" 
            value={userName} 
            onChange={handleNameChange} 
            title="Clique para editar seu nome"
          />
          <div style={{width: '32px', height: '32px', background: '#22c55e', borderRadius: '50%'}}></div>
        </div>
      </div>
    </div>
  );
}