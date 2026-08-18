import { useState, useEffect } from 'react'
import { HANBIN_DATA } from './data/hanbinData'
import { Header } from './components/Header'
import { Dashboard } from './components/Dashboard'
import './App.css'

function App() {
  const [ownedCards, setOwnedCards] = useState(() => JSON.parse(localStorage.getItem('hanbin-collection')) || []);
  const [activeTab, setActiveTab] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [openSet, setOpenSet] = useState(null);

  useEffect(() => localStorage.setItem('hanbin-collection', JSON.stringify(ownedCards)), [ownedCards]);

  const toggleCard = (id) => setOwnedCards(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const getGroupStructure = (group) => {
    const maxVal = group.maxSet || 1;
    const lastSetId = Math.floor(maxVal);
    const lastRarity = maxVal % 1 === 0 ? 5 : Math.round((maxVal % 1) * 10);
    const sets = [];
    for (let s = 1; s <= lastSetId; s++) {
      const rarities = s < lastSetId ? [1, 2, 3, 4, 5] : Array.from({ length: lastRarity }, (_, i) => i + 1);
      sets.push({ id: s, rarities });
    }
    return sets;
  };

  const baseUrl = import.meta.env.BASE_URL;
  const filteredGroups = HANBIN_DATA.groups.filter(g => !activeTab || g.category?.toLowerCase() === activeTab?.toLowerCase());

  return (
    <div className="container">
      <Header title={HANBIN_DATA.botName} onHome={() => {setActiveTab(null); setSelectedGroup(null);}} />

      {!activeTab && !selectedGroup ? (
        <Dashboard ownedCards={ownedCards} onTabChange={setActiveTab} />
      ) : null}

      <main style={{marginTop: '40px'}}>
        {/* NAVEGAÇÃO / FILTROS (Igual ao site de referência) */}
        {!selectedGroup && (
          <div className="nav-tabs" style={{marginBottom: '30px'}}>
             <button className={`tab-button ${activeTab === null ? 'active' : ''}`} onClick={() => setActiveTab(null)}>All</button>
             {HANBIN_DATA.categories.map(cat => (
               <button key={cat} className={`tab-button ${activeTab === cat ? 'active' : ''}`} onClick={() => setActiveTab(cat)}>{cat}</button>
             ))}
          </div>
        )}

        {/* 1. DIRETÓRIO (Lista de Grupos com Banner) */}
        {!selectedGroup ? (
          <div className="group-directory-grid">
            {filteredGroups.map(group => (
              <div key={group.code} className="directory-card" onClick={() => setSelectedGroup(group)}>
                <div className="card-banner">
                  <img src={group.banner || 'https://via.placeholder.com/400x200?text=NO+BANNER'} alt={group.name} />
                </div>
                <div className="card-info">
                  <h3>{group.name}</h3>
                  <div className="card-mini-stats">
                    <span>{group.members.length} Members</span> • <span>{group.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 2. SETS VIEW (Sets como coleções individuais) */
          <div className="group-detail-view">
            <div className="detail-header-nav">
                <button className="back-link-btn" onClick={() => setSelectedGroup(null)}>← Back to Directory</button>
            </div>
            
            <div className="directory-header">
              <h1 style={{textTransform: 'uppercase'}}>{selectedGroup.name}</h1>
              <p style={{color: '#999'}}>Select a collection to track cards</p>
            </div>

            <div className="sets-grid">
              {getGroupStructure(selectedGroup).map(set => {
                const previewImages = selectedGroup.members.slice(0, 4).map(m => m.links?.[`s${set.id}h1`]);
                return (
                  <div key={set.id} className="set-card" onClick={() => setOpenSet(set)}>
                    <div className="set-preview-row">
                      {previewImages.map((url, i) => <img key={i} src={url || 'https://via.placeholder.com/50x70'} className="set-preview-img" />)}
                    </div>
                    <div className="set-card-label">
                        <span className="set-tag">Set {set.id}</span>
                        <span className="set-name-text">Standard Collection</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* 3. MODAL DE RARIDADES (O CORAÇÃO DO HANBIN BOT) */}
      {openSet && (
        <div className="modal-overlay" onClick={() => setOpenSet(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-subtitle">SET {openSet.id} • {selectedGroup.name}</span>
                <h2>{selectedGroup.name} Collection</h2>
              </div>
              <button className="modal-close" onClick={() => setOpenSet(null)}>&times;</button>
            </div>

            <div className="modal-body-scroll">
              {/* LOOP DE RARIDADES (1H até 5H) */}
              {openSet.rarities.map(r => (
                <div key={r} className="modal-rarity-section">
                  <div className="rarity-indicator">
                    {Array.from({ length: r }).map((_, i) => <span key={i}>❤</span>)}
                    <span className="rarity-label">{r} Hearts</span>
                  </div>
                  
                  <div className="modal-cards-grid">
                    {selectedGroup.members.map(m => {
                      const seq = ((openSet.id - 1) * 5) + r + (m.offset || 0);
                      const botId = `${selectedGroup.code}#${m.code}${String(seq).padStart(3, '0')}`;
                      const isOwned = ownedCards.includes(botId);
                      const imgUrl = m.links?.[`s${openSet.id}h${r}`];

                      return (
                        <div key={botId} className={`card-item ${isOwned ? 'owned' : ''}`} onClick={() => toggleCard(botId)}>
                          <div className="card-img-wrapper">
                            <img src={imgUrl} alt={botId} />
                          </div>
                          <span className="card-member-name">{m.name}</span>
                          <span className="card-id-text">#{botId}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default App;