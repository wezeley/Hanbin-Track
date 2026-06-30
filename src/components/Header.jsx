import { useState } from 'react';

export function Header({ title, onHome }) {
  // Mantive apenas o nome editável, sem fotos
  const [userName, setUserName] = useState(localStorage.getItem('tracker-user') || 'USER');

  const handleNameChange = (e) => {
    setUserName(e.target.value);
    localStorage.setItem('tracker-user', e.target.value);
  };

  return (
    <div className="skeleton-header-row">
      <h1 className="title" onClick={onHome} style={{ cursor: 'pointer' }}>
        {title}
      </h1>
      
      <div className="user-section">
        <input 
          className="username-minimal" 
          value={userName} 
          onChange={handleNameChange} 
          title="Clique para editar"
        />
      </div>
    </div>
  );
}