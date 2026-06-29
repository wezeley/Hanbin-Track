import { useState, useEffect } from 'react'
import './App.css'
import { HANBIN_DATA } from './data/hanbinData'

function App() {
  const [ownedCards, setOwnedCards] = useState(() => {
    const saved = localStorage.getItem('hanbin-collection');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState(HANBIN_DATA.categories[0]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    localStorage.setItem('hanbin-collection', JSON.stringify(ownedCards));
  }, [ownedCards]);

  useEffect(() => {
    setSelectedGroup(null);
  }, [activeTab]);

  const toggleCard = (cardId) => {
    setOwnedCards(prev => 
      prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
    );
  };

  const baseUrl = import.meta.env.BASE_URL;
  const filteredGroups = HANBIN_DATA.groups.filter(group => group.category === activeTab);

  return (
    <div className="container">
      <header>
        <h1 className="title">{HANBIN_DATA.botName}</h1>
        <p className="subtitle">COLLECTED: {ownedCards.length}</p>
      </header>

      <nav className="tabs-container">
        {HANBIN_DATA.categories.map((cat) => (
          <button 
            key={cat}
            className={`tab-button ${activeTab === cat ? 'active' : ''}`}
            onClick={() => setActiveTab(cat)}
          >
            {cat}
          </button>
        ))}
      </nav>

      <main className="content-area">
        {!selectedGroup ? (
          <div className="group-tiles-grid">
            {filteredGroups.map(group => (
              <div 
                key={group.code} 
                className="group-tile"
                onClick={() => setSelectedGroup(group)}
              >
                {group.name.toUpperCase()}
              </div>
            ))}
          </div>
        ) : (
          <div className="focused-group-view">
            <button className="back-button" onClick={() => setSelectedGroup(null)}>
              ← VOLTAR PARA {activeTab.toUpperCase()}
            </button>

            <h2 className="focused-group-name">{selectedGroup.name}</h2>

            {selectedGroup.sets.map((set) => (
              <div key={set.id} className="set-section">
                <h3 className="set-title-display">{set.name}</h3>
                
                {HANBIN_DATA.rarities.map((rarityLevel) => (
                  <div key={rarityLevel} className="rarity-row">
                    <div className="grid">
                      {selectedGroup.members.map((member) => {
                        // Procure a parte onde a imagem é gerada dentro do loop e use isto:

                       const sequenceNumber = ((set.id - 1) * 5) + rarityLevel;
                       const formattedNumber = String(sequenceNumber).padStart(3, '0');

                       // botId continua usando o .code (Ex: ATM#K001)
                       const botId = `${selectedGroup.code}#${member.code}${formattedNumber}`;

                       // --- LOGICA DE CAMINHO COM PASTA PERSONALIZADA ---
                       // Se existir selectedGroup.folder, usa ele. Se não, usa o .code normal.
                       const folderName = (selectedGroup.folder || selectedGroup.code).toUpperCase();
                       const fileName = encodeURIComponent(botId).toUpperCase();

                       // O resultado será: /Hanbin-Track/cards/ANDTEAM/ATM%23K001.png
                       const imagePath = `${baseUrl}cards/${folderName}/${fileName}.png`;
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
        )}
      </main>
    </div>
  );
}

export default App;