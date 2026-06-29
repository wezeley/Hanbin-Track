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

  // Pega a base do site (ex: /Hanbin-Track/) definida no vite.config.js
  const baseUrl = import.meta.env.BASE_URL;

  return (
    <div className="container">
      <header>
        <h1 className="title">{HANBIN_DATA.botName}</h1>
        <p className="subtitle">Total de Cartas: {ownedCards.length}</p>
      </header>

      {HANBIN_DATA.groups.map((group) => (
        <details key={group.code} className="group-accordion" open>
          <summary className="group-header">
            {group.name} 
          </summary>
          <div className="group-content">
            {group.sets.map((set) => (
              <details key={set.id} className="set-accordion" open>
                <summary className="set-header">{set.name}</summary>
                
                <div className="set-content">
                  {HANBIN_DATA.rarities.map((rarityLevel) => (
                    <div key={rarityLevel} className="rarity-row">
                      <h3>{rarityLevel} Hearts</h3>
                      <div className="grid">
                        
                        {group.members.map((member) => {
                          const sequenceNumber = ((set.id - 1) * 5) + rarityLevel;
                          const formattedNumber = String(sequenceNumber).padStart(3, '0');
                          const botId = `${group.code}#${member.code}${formattedNumber}`;
                          
                          // EXPLICAÇÃO DO CAMINHO DA IMAGEM:
                          // 1. baseUrl: Garante que funcione no GitHub Pages (/Hanbin-Track/)
                          // 2. encodeURIComponent: Transforma o # em %23 para o navegador não bugar
                          // 3. .toUpperCase(): Garante que procure por AESPA#WINTER e não aespa#winter
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
                                    // Se a imagem falhar, mostra um placeholder
                                    e.target.onerror = null; 
                                    e.target.src = 'https://via.placeholder.com/80x120?text=NOT+FOUND'; 
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