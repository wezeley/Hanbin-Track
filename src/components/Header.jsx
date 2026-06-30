import { useState } from 'react';

export function Header({ title, onHome, ownedCards, baseUrl, hanbinData }) {
  const [userName, setUserName] = useState(localStorage.getItem('tracker-user') || 'USER');
  const [avatarId, setAvatarId] = useState(localStorage.getItem('tracker-avatar') || null);
  const [showPicker, setShowPicker] = useState(false);

  const handleNameChange = (e) => {
    setUserName(e.target.value);
    localStorage.setItem('tracker-user', e.target.value);
  };

  const selectAvatar = (id) => {
    setAvatarId(id);
    localStorage.setItem('tracker-avatar', id);
    setShowPicker(false);
  };

  // Função para pegar o path da imagem do avatar baseado no ID salvo
  const getAvatarPath = (id) => {
    if (!id) return null;
    const groupCode = id.split('#')[0];
    const group = hanbinData.groups.find(g => g.code === groupCode);
    const folder = (group?.folder || groupCode).toUpperCase();
    return `${baseUrl}cards/${folder}/${encodeURIComponent(id).toUpperCase()}.png`;
  };

  return (
    <div className="top-nav-container">
      <div className="nav-upper">
        <h1 className="title" onClick={onHome}>{title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <input className="username-input" value={userName} onChange={handleNameChange} style={{background: 'none', border: 'none', borderBottom: '1px solid #333', color: '#fff', textAlign: 'right', outline: 'none'}} />
          <div className="avatar-circle" onClick={() => setShowPicker(!showPicker)}>
            {avatarId ? <img src={getAvatarPath(avatarId)} alt="avatar" /> : <div style={{width: '100%', height: '100%', background: '#22c55e'}}></div>}
          </div>
        </div>
      </div>

      {showPicker && (
        <div className="avatar-modal">
          <p style={{fontSize: '0.7rem', marginBottom: '10px'}}>Select an owned card as avatar:</p>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px'}}>
            {ownedCards.map(id => (
              <img 
                key={id} 
                src={getAvatarPath(id)} 
                style={{width: '100%', cursor: 'pointer', borderRadius: '4px'}} 
                onClick={() => selectAvatar(id)}
              />
            ))}
          </div>
          <button onClick={() => setShowPicker(false)} style={{marginTop: '15px', width: '100%', padding: '5px', borderRadius: '5px', background: '#333', color: '#fff', border: 'none'}}>Close</button>
        </div>
      )}
    </div>
  );
}