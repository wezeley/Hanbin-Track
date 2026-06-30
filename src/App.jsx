import { useState, useEffect } from 'react'
import { HANBIN_DATA } from './data/hanbinData'
import { Header } from './components/Header'
import { Dashboard } from './components/Dashboard'
import { Card } from './components/Card'
import './App.css'

function App() {
  const [ownedCards, setOwnedCards] = useState(() => JSON.parse(localStorage.getItem('hanbin-collection')) || []);
  const [activeTab, setActiveTab] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  // NOVO: Estado para esconder cartas que você já tem
  const [showOnlyMissing, setShowOnlyMissing] = useState(false);

  useEffect(() => localStorage.setItem('hanbin-collection', JSON.stringify(ownedCards)), [ownedCards]);

  const toggleCard = (id) => setOwnedCards(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const handleTabChange = (cat) => { setActiveTab(cat); setSelectedGroup(null); };

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

  const markRarity = (group, set, rarity) => {
    const ids = group.members.map(m => `${group.code}#${m.code}${String(((set.id - 1) * 5) + rarity + (m.offset || 0)).padStart(3, '0')}`);
    const hasAll = ids.every(id => ownedCards.includes(id));
    setOwnedCards(prev => hasAll ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])]);
  };

  const baseUrl = import.meta.env.BASE_URL;
  const filteredGroups = HANBIN_DATA.groups.filter(g => g.category?.toLowerCase() === activeTab?.toLowerCase());

  return (
    <div className="app-layout">
      {/* SIDEBAR NAVEGAÇÃO (Inspirada no Yujin Bot) */}
      <aside className="sidebar">
        <div className="title" onClick={() => {setActiveTab(null); setSelectedGroup(null);}} 
             style={{fontSize: '0.9rem', fontWeight: 800, marginBottom: '20px', color: 'white', cursor: 'pointer'}}>
          HANBIN TRACKER
        </div>
        {HANBIN_DATA.categories.map(cat => (
          <div key={cat} className={`side-item ${activeTab === cat ? 'active' : ''}`} onClick={() => handleTabChange(cat)}>
            {cat}
          </div>
        ))}
      </aside>

      <main className="main-content">
        <Header ownedCards={ownedCards} baseUrl={baseUrl} hanbinData={HANBIN_DATA} />

        {!activeTab ? (
          <Dashboard ownedCards={ownedCards} onTabChange={handleTabChange} />
        ) : !selectedGroup ? (
          <div className="expansion-grid">
            {filteredGroups.map(g => {
              const owned = ownedCards.filter(id => id.split('#')[0] === g.code).length;
              const total = getGroupStructure(g).reduce((s, set) => s + (g.members.length * set.rarities.length), 0);
              const p = ((owned / total) * 100).toFixed(0);
              return (
                <div key={g.code} className="expansion-card" onClick={() => setSelectedGroup(g)}>
                  <span className="exp-name">{g.name}</span>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '8px'}}>
                    <span style={{color: '#71717a'}}>{owned} / {total} Cards</span>
                    <span style={{color: 'white'}}>{p}%</span>
                  </div>
                  <div className="exp-progress-bar"><div className="exp-progress-fill" style={{width: `${p}%`}}></div></div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="focused-group-view">
            <div className="group-header-premium">
              <div className="group-info-left">
                <h2>{selectedGroup.name}</h2>
              </div>
              <div className="view-controls">
                <button className={`control-btn ${!showOnlyMissing ? 'active' : ''}`} onClick={() => setShowOnlyMissing(false)}>ALL</button>
                <button className={`control-btn ${showOnlyMissing ? 'active' : ''}`} onClick={() => setShowOnlyMissing(true)}>MISSING</button>
                <button className="control-btn" style={{marginLeft: '10px'}} onClick={() => setSelectedGroup(null)}>CLOSE</button>
              </div>
            </div>

            {getGroupStructure(selectedGroup).map(set => {
              const setCards = [];
              set.rarities.forEach(r => selectedGroup.members.forEach(m => {
                 setCards.push(`${selectedGroup.code}#${m.code}${String(((set.id - 1) * 5) + r + (m.offset || 0)).padStart(3, '0')}`);
              }));
              const ownedInSet = setCards.filter(id => ownedCards.includes(id)).length;

              return (
                <div key={set.id} className="set-section">
                  <div className="set-pill-header">
                    <img src={`${baseUrl}symbols/S${set.id}.webp`} style={{height: '18px'}} />
                    <span className="set-count-tag">{ownedInSet} / {setCards.length} collected</span>
                  </div>
                  
                  <div className="rarities-container">
                    {set.rarities.map(r => {
                      const rIds = selectedGroup.members.map(m => `${selectedGroup.code}#${m.code}${String(((set.id - 1) * 5) + r + (m.offset || 0)).padStart(3, '0')}`);
                      
                      // FILTRO: Se "Show Missing" estiver ligado, a gente só mostra a linha se faltar algo nela
                      const missingInLine = rIds.filter(id => !ownedCards.includes(id));
                      if (showOnlyMissing && missingInLine.length === 0) return null;

                      return (
                        <div key={r} className="rarity-row">
                          <button className={`rarity-toggle ${rIds.every(id => ownedCards.includes(id)) ? 'active' : ''}`} onClick={() => markRarity(selectedGroup, set, r)}>❤</button>
                          <div className="grid">
                            {selectedGroup.members.map(m => {
                              const botId = `${selectedGroup.code}#${m.code}${String(((set.id - 1) * 5) + r + (m.offset || 0)).padStart(3, '0')}`;
                              const isOwned = ownedCards.includes(botId);
                              
                              // FILTRO: Se "Show Missing" estiver ligado, pula as cartas que você já tem
                              if (showOnlyMissing && isOwned) return null;

                              const path = `${baseUrl}cards/${(selectedGroup.folder || selectedGroup.code).toUpperCase()}/${encodeURIComponent(botId).toUpperCase()}.png`;
                              return <Card key={botId} botId={botId} imagePath={path} isOwned={isOwned} onToggle={toggleCard} />;
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  )
}
export default App;