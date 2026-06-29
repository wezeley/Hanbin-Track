import { useState, useEffect } from 'react'
import './App.css'
import { HANBIN_DATA } from './data/hanbinData'

function App() {
  const [ownedCards, setOwnedCards] = useState(() => {
    const saved = localStorage.getItem('hanbin-collection');
    return saved ? JSON.parse(saved) : [];
  });

  // Começa como null para mostrar a Home
  const [activeTab, setActiveTab] = useState(null);
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

  // Cálculo para o Dashboard
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

  return (
    <div className="container">
      <header>
        {/* Clicar no nome agora volta para a Home */}
        <h1 className="title" onClick={() => {setActiveTab(null); setSelectedGroup(null);}}>
          {HANBIN_DATA.botName}
        </h1>
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
        {/* ABA HOME (Quando activeTab é null) */}
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
        /* VISUALIZAÇÃO DE TILES (Quando aba está selecionada mas grupo não) */
        !selectedGroup ? (
          <div className="group-tiles-grid">
            {HANBIN_DATA.groups.filter(g => g.category === activeTab).map(group => (
              <div key={group.code} className="group-tile" onClick={() => setSelectedGroup(group)}>
                {group.name}
              </div>
            ))}
          </div>
        ) : (
          /* VISUALIZAÇÃO DO GRUPO FOCADO */
          <div className="focused-group-view">
            <button className="back-button" onClick={() => setSelectedGroup(null)}>
              ← BACK TO {activeTab.toUpperCase()}
            </button>
            <h2 className="focused-group-name">{selectedGroup.name}</h2>
            {selectedGroup.sets.map((set) => (
              <div key={set.id} className="set-section">
                <div className="set-symbol-container">
                  <img src={`${baseUrl}symbols/S${set.id}.webp`} alt="Set Icon" className="set-symbol-icon" onError={(e) => e.target.style.display = 'none'} />
                </div>
                {HANBIN_DATA.rarities.map((rarityLevel) => (
                  <div key={rarityLevel} className="grid">
                    {selectedGroup.members.map((member) => {
                      const sequenceNumber = ((set.id - 1) * 5) + rarityLevel + (member.offset || 0);
                      const botId = `${selectedGroup.code}#${member.code}${String(sequenceNumber).padStart(3, '0')}`;
                      const folder = (selectedGroup.folder || selectedGroup.code).toUpperCase();
                      const imagePath = `${baseUrl}cards/${folder}/${encodeURIComponent(botId).toUpperCase()}.webp`;
                      const isOwned = ownedCards.includes(botId);
                      return (
                        <div key={botId} className={`card ${isOwned ? 'owned' : ''}`} onClick={() => toggleCard(botId)}>
                          <div className="card-inner">
                            <img src={imagePath} alt={botId} className="card-image" loading="lazy" onError={(e) => { e.target.src = 'https://via.placeholder.com/110x165?text=?'; }} />
                          </div>
                        </div>
                      );
                    })}
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