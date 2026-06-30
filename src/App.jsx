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
  const [expandedSets, setExpandedSets] = useState({});
  const [showOnlyMissing, setShowOnlyMissing] = useState(false);

  useEffect(() => localStorage.setItem('hanbin-collection', JSON.stringify(ownedCards)), [ownedCards]);

  const toggleCard = (id) => setOwnedCards(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const handleTabChange = (cat) => { setActiveTab(cat); setSelectedGroup(null); };
  const toggleSetExpand = (setId) => setExpandedSets(prev => ({ ...prev, [setId]: prev[setId] === undefined ? false : !prev[setId] }));

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

  const markSet = (group, set) => {
    const ids = [];
    set.rarities.forEach(r => group.members.forEach(m => {
      ids.push(`${group.code}#${m.code}${String(((set.id - 1) * 5) + r + (m.offset || 0)).padStart(3, '0')}`);
    }));
    const hasAll = ids.every(id => ownedCards.includes(id));
    setOwnedCards(prev => hasAll ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])]);
  };

  const baseUrl = import.meta.env.BASE_URL;
  const filteredGroups = HANBIN_DATA.groups.filter(g => g.category?.toLowerCase() === activeTab?.toLowerCase());

  return (
    <div className="app-layout">
      {/* SIDEBAR FIXA */}
      <aside className="sidebar">
        <h1 className="title" onClick={() => {setActiveTab(null); setSelectedGroup(null);}} style={{color: 'white', marginBottom: '30px', fontSize: '0.9rem'}}>HANBIN TRACKER</h1>
        {HANBIN_DATA.categories.map(cat => (
          <div key={cat} className={`side-item ${activeTab === cat ? 'active' : ''}`} onClick={() => handleTabChange(cat)}>{cat}</div>
        ))}
      </aside>

      <main className="main-content">
        {/* Passamos HANBIN_DATA e ownedCards para o Header funcionar */}
        <Header title={HANBIN_DATA.botName} onHome={() => {setActiveTab(null); setSelectedGroup(null);}} ownedCards={ownedCards} baseUrl={baseUrl} hanbinData={HANBIN_DATA} />

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
            <div className="focused-header-premium">
              <h2 style={{fontSize: '1.5rem', fontWeight: 800}}>{selectedGroup.name}</h2>
              <div style={{display: 'flex', gap: '10px'}}>
                <button className={`tab-button ${!showOnlyMissing ? 'active' : ''}`} onClick={() => setShowOnlyMissing(false)}>ALL</button>
                <button className={`tab-button ${showOnlyMissing ? 'active' : ''}`} onClick={() => setShowOnlyMissing(true)}>MISSING</button>
                <button className="close-btn" onClick={() => setSelectedGroup(null)}>CLOSE</button>
              </div>
            </div>

            {getGroupStructure(selectedGroup).map(set => {
              const isExp = expandedSets[set.id] !== false;
              const setIds = [];
              set.rarities.forEach(r => selectedGroup.members.forEach(m => setIds.push(`${selectedGroup.code}#${m.code}${String(((set.id - 1) * 5) + r + (m.offset || 0)).padStart(3, '0')}`)));
              const isSetComplete = setIds.every(id => ownedCards.includes(id));

              return (
                <div key={set.id} className="set-section">
                  <div className="set-controls-pro">
                    <img src={`${baseUrl}symbols/S${set.id}.webp`} className="set-symbol-icon" onClick={() => toggleSetExpand(set.id)} />
                    <input type="checkbox" className="set-checkbox" checked={isSetComplete} onChange={() => markSet(selectedGroup, set)} />
                    <button className="rarity-toggle" onClick={() => toggleSetExpand(set.id)}>{isExp ? '▼' : '▶'}</button>
                  </div>
                  
                  {isExp && (
                    <div className="rarities-container">
                      {set.rarities.map(r => {
                        const rIds = selectedGroup.members.map(m => `${selectedGroup.code}#${m.code}${String(((set.id - 1) * 5) + r + (m.offset || 0)).padStart(3, '0')}`);
                        const isRarityComplete = rIds.every(id => ownedCards.includes(id));
                        
                        // Filtro de Missing
                        if (showOnlyMissing && isRarityComplete) return null;

                        return (
                          <div key={r} className="rarity-row">
                            <button className={`rarity-toggle ${isRarityComplete ? 'active' : ''}`} onClick={() => markRarity(selectedGroup, set, r)}>❤</button>
                            <div className="grid">
                              {selectedGroup.members.map(m => {
                                const botId = `${selectedGroup.code}#${m.code}${String(((set.id - 1) * 5) + r + (m.offset || 0)).padStart(3, '0')}`;
                                const isCardOwned = ownedCards.includes(botId);
                                
                                if (showOnlyMissing && isCardOwned) return null;

                                const folder = (selectedGroup.folder || selectedGroup.code).toUpperCase();
                                const fileName = encodeURIComponent(botId).toUpperCase();
                                const path = `${baseUrl}cards/${folder}/${fileName}.png`;
                                
                                return <Card key={botId} botId={botId} imagePath={path} isOwned={isCardOwned} onToggle={toggleCard} />;
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
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