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

  return (
    <div className="container">
      <header>
        <h1 className="title">{HANBIN_DATA.botName}</h1>
        <p className="subtitle">Total de Cartas: {ownedCards.length}</p>
      </header>

      {/* LOOP 1: GRUPOS (AESPA, IVE...) */}
      {HANBIN_DATA.groups.map((group) => (
        <details key={group.code} className="group-accordion">
          {/* Onde estava o LOOP 1 dos grupos */}
          <summary className="group-header">
            {group.name} 
          </summary>
          <div className="group-content">
            {/* LOOP 2: SETS (v1, v2...) */}
            {group.sets.map((set) => (
              <details key={set.id} className="set-accordion" open>
                <summary className="set-header">{set.name}</summary>
                
                <div className="set-content">
                  {/* LOOP 3: RARIDADES */}
                  {HANBIN_DATA.rarities.map((rarityLevel) => (
                    <div key={rarityLevel} className="rarity-row">
                      <h3>{rarityLevel} Hearts</h3>
                      <div className="grid">
                        
                        {/* LOOP 4: MEMBROS */}
                        {group.members.map((member) => {
                          const sequenceNumber = ((set.id - 1) * 5) + rarityLevel;
                          const formattedNumber = String(sequenceNumber).padStart(3, '0');
                          const botId = `${group.code}#${member.code}${formattedNumber}`;
                          console.log("Tentando carregar:", `/cards/${encodeURIComponent(botId)}.png`);
                          const isOwned = ownedCards.includes(botId);
                          return (
                            <div 
                              key={botId} 
                              className={`card ${isOwned ? 'owned' : ''}`}
                              onClick={() => toggleCard(botId)}
                            >
                              <div className="card-inner">
                              <img 
                              // Mudamos de .jpg para .png aqui no final
                              src={`/cards/${encodeURIComponent(botId)}.png`} 
                              alt={botId}
                              className="card-image"
                              onError={(e) => { 
                              e.target.src = 'https://via.placeholder.com/80x120?text=FOTO+FALTANDO'; 
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
              </details>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

export default App;