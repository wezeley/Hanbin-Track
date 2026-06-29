import { useState, useEffect } from 'react'
import './App.css'
import { HANBIN_DATA } from './data/hanbinData'

function App() {
  // Estado das cartas possuídas
  const [ownedCards, setOwnedCards] = useState(() => {
    const saved = localStorage.getItem('hanbin-collection');
    return saved ? JSON.parse(saved) : [];
  });

  // Estados de navegação
  const [activeTab, setActiveTab] = useState(null); // null = Home
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    localStorage.setItem('hanbin-collection', JSON.stringify(ownedCards));
  }, [ownedCards]);

  // Resetar grupo ao mudar de aba
  useEffect(() => {
    setSelectedGroup(null);
  }, [activeTab]);

  const toggleCard = (cardId) => {
    setOwnedCards(prev => 
      prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
    );
  };

  const baseUrl = import.meta.env.BASE_URL;

  // Estatísticas para o Dashboard da Home
  const totalAvailable = HANBIN_DATA.groups.reduce((acc, group) => {
    return acc + (group.members.length * group.sets.length * 5);
  }, 0);

  const statsByCategory = HANBIN_DATA.categories.map(cat => {
    const groupsInCat = HANBIN_DATA.groups.filter(g => g.category === cat);
    const ownedInCat = ownedCards.filter(id => {
      const groupCode = id.split('#')[0];
      return groupsInCat.some(g => g.code === groupCode);
    }).length;
    return { name: cat, count: ownedInCat };
  });

  const filteredGroups = HANBIN_DATA.groups.filter(group => 
    group.category?.trim().toLowerCase() === activeTab?.trim().toLowerCase()
  );

  return (
    <div className="container">
      <header>
        <h1 className="title" onClick={() => {setActiveTab(null); setSelectedGroup(null);}}>
          {HANBIN_DATA.botName}
        </h1>
      </header>

      {/* Navegação por Abas */}
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
        {/* TELA 1: HOME DASHBOARD */}
        {!activeTab ? (
          <div className="home-dashboard">
            <div className="main-stats">
              <div className="stat-card">
                <h3>TOTAL PROGRESS</h3>
                <p>{ownedCards.length} <span>/ {totalAvailable}</span></p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: `${(ownedCards.length/totalAvailable)*100}%`}}></div>
                </div>
              </div>
            </div>
            <div className="category-stats-grid">
              {statsByCategory.map(stat => (
                <div key={stat.name} className="cat-stat-tile" onClick={() => setActiveTab(stat.name)}>
                  <h4>{stat.name}</h4>
                  <p>{stat.count}</p>
                </div>
              ))}
            </div>
          </div>
        ) : 
        /* TELA 2: QUADRADINHOS (TILES) DOS GRUPOS */
        !selectedGroup ? (
          <div className="group-tiles-grid">
            {filteredGroups.map(group => (
              <div key={group.code} className="group-tile" onClick={() => setSelectedGroup(group)}>
                {group.name}
              </div>
            ))}
          </div>
        ) : (
          /* TELA 3: VISTA DO GRUPO (CARTAS) */
          <div className="focused-group-view">
            <button className="back-button" onClick={() => setSelectedGroup(null)}>
              ← BACK TO {activeTab.toUpperCase()}
            </button>

            <h2 className="focused-group-name">{selectedGroup.name}</h2>

            {selectedGroup.sets.map((set) => (
              <div key={set.id} className="set-section">
                
                {/* Símbolo S1, S2... */}
                <div className="set-symbol-container">
                  <img 
                    src={`${baseUrl}symbols/S${set.id}.webp`} 
                    alt={`S${set.id}`} 
                    className="set-symbol-icon"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>

                {/* CONTAINER PARA AS RARIDADES FICAREM LADO A LADO */}
                <div className="rarities-container">
                  {HANBIN_DATA.rarities.map((rarityLevel) => (
                    <div key={rarityLevel} className="rarity-row">
                      <div className="grid">
                        {selectedGroup.members.map((member) => {
                          // Lógica do número da carta (com offset)
                          const rarityOffset = member.offset || 0;
                          const sequenceNumber = ((set.id - 1) * 5) + rarityLevel + rarityOffset;
                          const formattedNumber = String(sequenceNumber).padStart(3, '0');
                          
                          const botId = `${selectedGroup.code}#${member.code}${formattedNumber}`;
                          const folder = (selectedGroup.folder || selectedGroup.code).toUpperCase();
                          const fileName = encodeURIComponent(botId).toUpperCase();
                          
                          // Verifique se seus arquivos são .webp ou .png
                          const imagePath = `${baseUrl}cards/${folder}/${fileName}.webp`;
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
                                    e.target.src = 'https://via.placeholder.com/110x165?text=NOT+FOUND'; 
                                  }} 
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div> {/* fim rarities-container */}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;