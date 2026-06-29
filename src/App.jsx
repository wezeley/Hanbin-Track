import { useState, useEffect } from 'react'
import './App.css'
import { HANBIN_DATA } from './data/hanbinData'

function App() {
  const [ownedCards, setOwnedCards] = useState(() => {
    const saved = localStorage.getItem('hanbin-collection');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('hanbin-collection', JSON.stringify(ownedCards));
  }, [ownedCards]);

  const toggleCard = (cardId) => {
    setOwnedCards(prev => 
      prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
    );
  };

  const baseUrl = import.meta.env.BASE_URL;

  return (
    <div className="container">
      <header>
        <h1 className="title">{HANBIN_DATA.botName}</h1>
        <p className="subtitle">Sua Coleção • {ownedCards.length} de {Object.keys(HANBIN_DATA.groups).length * 5} cartas</p>
      </header>

      {HANBIN_DATA.groups.map((group) => (
        // REMOVEMOS O 'open' DAQUI PARA COMEÇAR FECHADO
        <details key={group.code} className="group-accordion">
          <summary className="group-header">
            {group.name}
          </summary>
          <div className="group-content">
            {group.sets.map((set) => (
              <div key={set.id} className="set-section">
                <h2 className="set-header">{set.name}</h2>
                
                {HANBIN_DATA.rarities.map((rarityLevel) => (
                  <div key={rarityLevel} className="rarity-row">
                    <h3>{rarityLevel} Hearts</h3>
                    <div className="grid">
                      
                      {group.members.map((member) => {
                        const sequenceNumber = ((set.id - 1) * 5) + rarityLevel;
                        const formattedNumber = String(sequenceNumber).padStart(3, '0');
                        const botId = `${group.code}#${member.code}${formattedNumber}`;
                        const imagePath = `${baseUrl}cards/${encodeURIComponent(botId).toUpperCase()}.png`;
                        const isOwned = ownedCards.includes(botId);

                        return (
                          <div 
                            key={botId} 
                            className={`card ${isOwned ? 'owned' : ''}`}
                            onClick={() => toggleCard(botId)}
                          >
                            <div className="card-inner">
                              <img 
                                src={imagePath} 
                                alt={botId}
                                className="card-image"
                                loading="lazy"
                                onError={(e) => { 
                                  e.target.onerror = null; 
                                  e.target.src = 'https://via.placeholder.com/110x165?text=?'; 
                                }}
                              />
                            </div>
                            <p className="card-id-label">{botId}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

export default App;