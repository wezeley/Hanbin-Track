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

  useEffect(() => localStorage.setItem('hanbin-collection', JSON.stringify(ownedCards)), [ownedCards]);

  const toggleCard = (id) => setOwnedCards(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const handleTabChange = (cat) => { setActiveTab(cat); setSelectedGroup(null); };
  const toggleSet = (id) => setExpandedSets(p => ({ ...p, [id]: p[id] === undefined ? false : !p[id] }));

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
    <div className="container">
      <Header title={HANBIN_DATA.botName} onHome={() => {setActiveTab(null); setSelectedGroup(null);}} ownedCards={ownedCards} baseUrl={baseUrl} hanbinData={HANBIN_DATA} />
      
      <div className="nav-tabs">
        {HANBIN_DATA.categories.map(cat => (
          <button key={cat} className={`tab-button ${activeTab === cat ? 'active' : ''}`} onClick={() => handleTabChange(cat)}>{cat}</button>
        ))}
      </div>

      <main>
        {!activeTab ? <Dashboard ownedCards={ownedCards} onTabChange={handleTabChange} /> : 
        !selectedGroup ? (
          <div className="expansion-grid">
            {filteredGroups.map(g => {
              const owned = ownedCards.filter(id => id.split('#')[0] === g.code).length;
              const total = getGroupStructure(g).reduce((s, set) => s + (g.members.length * set.rarities.length), 0);
              const p = ((owned / total) * 100).toFixed(0);
              return (
                <div key={g.code} className="expansion-card" onClick={() => setSelectedGroup(g)}>
                  <span className="exp-name">{g.name}</span>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontWeight: 700, marginBottom: '5px'}}><span>{owned}/{total}</span><span>{p}%</span></div>
                  <div className="exp-progress-bar"><div className="exp-progress-fill" style={{width: `${p}%`}}></div></div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="focused-group-view">
            <div className="focused-header">
              <h2 style={{fontSize: '1.5rem', fontWeight: 800}}>{selectedGroup.name}</h2>
              <button className="close-btn" onClick={() => setSelectedGroup(null)}>CLOSE</button>
            </div>

            {getGroupStructure(selectedGroup).map(set => {
              const isExp = expandedSets[set.id] !== false;
              const setIds = [];
              set.rarities.forEach(r => selectedGroup.members.forEach(m => setIds.push(`${selectedGroup.code}#${m.code}${String(((set.id - 1) * 5) + r + (m.offset || 0)).padStart(3, '0')}`)));
              return (
                <div key={set.id} className="set-section">
                  <div className="set-controls-pill">
                    <img src={`${baseUrl}symbols/S${set.id}.webp`} className="set-symbol-icon" onClick={() => toggleSet(set.id)} />
                    <input type="checkbox" className="set-checkbox" checked={setIds.every(id => ownedCards.includes(id))} onChange={() => markSet(selectedGroup, set)} />
                    <button className="expand-toggle-btn" onClick={() => toggleSet(set.id)}>{isExp ? '▼' : '▶'}</button>
                  </div>
                  
                  {isExp && (
                    <div className="rarities-container">
                      {set.rarities.map(r => {
                        const rIds = selectedGroup.members.map(m => `${selectedGroup.code}#${m.code}${String(((set.id - 1) * 5) + r + (m.offset || 0)).padStart(3, '0')}`);
                        return (
                          <div key={r} className="rarity-row">
                            <button className={`rarity-toggle ${rIds.every(id => ownedCards.includes(id)) ? 'active' : ''}`} onClick={() => markRarity(selectedGroup, set, r)}>❤</button>
                            <div className="grid">
                              {selectedGroup.members.map(m => {
                                const botId = `${selectedGroup.code}#${m.code}${String(((set.id - 1) * 5) + r + (m.offset || 0)).padStart(3, '0')}`;
                                const path = `${baseUrl}cards/${(selectedGroup.folder || selectedGroup.code).toUpperCase()}/${encodeURIComponent(botId).toUpperCase()}.png`;
                                return <Card key={botId} botId={botId} imagePath={path} isOwned={ownedCards.includes(botId)} onToggle={toggleCard} />;
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