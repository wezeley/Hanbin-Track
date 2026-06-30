import { useState, useEffect } from 'react'
import { HANBIN_DATA } from './data/hanbinData'
import { Header } from './components/Header'
import { Tabs } from './components/Tabs'
import { Dashboard } from './components/Dashboard'
import { Card } from './components/Card'
import './App.css'

function App() {
  const [ownedCards, setOwnedCards] = useState(() => JSON.parse(localStorage.getItem('hanbin-collection')) || []);
  const [activeTab, setActiveTab] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => localStorage.setItem('hanbin-collection', JSON.stringify(ownedCards)), [ownedCards]);

  const toggleCard = (id) => setOwnedCards(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const handleTabChange = (cat) => { setActiveTab(cat); setSelectedGroup(null); };
  const resetNavigation = () => { setActiveTab(null); setSelectedGroup(null); };

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

  const markSetAsOwned = (group, set) => {
    const ids = [];
    set.rarities.forEach(r => group.members.forEach(m => {
      const seq = ((set.id - 1) * 5) + r + (m.offset || 0);
      ids.push(`${group.code}#${m.code}${String(seq).padStart(3, '0')}`);
    }));
    const isComplete = ids.every(id => ownedCards.includes(id));
    setOwnedCards(prev => isComplete ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])]);
  };

  const markRarityAsOwned = (group, set, rarity) => {
    const ids = group.members.map(m => `${group.code}#${m.code}${String(((set.id - 1) * 5) + rarity + (m.offset || 0)).padStart(3, '0')}`);
    const isComplete = ids.every(id => ownedCards.includes(id));
    setOwnedCards(prev => isComplete ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])]);
  };

  const baseUrl = import.meta.env.BASE_URL;
  const filteredGroups = HANBIN_DATA.groups.filter(g => g.category?.toLowerCase() === activeTab?.toLowerCase());

  return (
    <div className="container">
      <Header title={HANBIN_DATA.botName} activeTab={activeTab} onHome={resetNavigation} />
      
      <div className="tabs-container">
        {HANBIN_DATA.categories.map(cat => (
          <button key={cat} className={`tab-button ${activeTab === cat ? 'active' : ''}`} onClick={() => handleTabChange(cat)}>
            {cat}
          </button>
        ))}
      </div>

      <main>
        {!activeTab ? (
          <Dashboard ownedCards={ownedCards} onTabChange={handleTabChange} />
        ) : !selectedGroup ? (
          <div className="group-catalog-grid">
            {filteredGroups.map(group => {
              const groupOwned = ownedCards.filter(id => id.split('#')[0] === group.code).length;
              const sets = getGroupStructure(group);
              const groupTotal = sets.reduce((sum, s) => sum + (group.members.length * s.rarities.length), 0);
              const percent = ((groupOwned / groupTotal) * 100).toFixed(0);
              
              return (
                <div key={group.code} className="expansion-card" onClick={() => setSelectedGroup(group)}>
                  <span className="expansion-name">{group.name}</span>
                  <div className="stat-row">
                    <span style={{fontSize: '0.7rem', fontWeight: 700}}>{groupOwned} / {groupTotal} Cards</span>
                    <span style={{fontSize: '0.7rem', fontWeight: 700}}>{percent}%</span>
                  </div>
                  <div className="expansion-progress-bar">
                    <div className="expansion-progress-fill" style={{width: `${percent}%`}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="focused-group-view">
            <div className="focused-header">
              <h2 className="focused-title">{selectedGroup.name}</h2>
              <button className="back-btn-compact" onClick={() => setSelectedGroup(null)}>CLOSE EXPANSION</button>
            </div>

            {getGroupStructure(selectedGroup).map(set => (
              <div key={set.id} className="set-section">
                <div className="set-header-minimal">
                  <img src={`${baseUrl}symbols/S${set.id}.webp`} className="set-symbol-icon" alt="S" />
                  <input type="checkbox" className="set-checkbox" 
                         checked={ownedCards.filter(id => id.startsWith(selectedGroup.code) && id.includes(`#`)).length >= 5} // Simplificado
                         onChange={() => markSetAsOwned(selectedGroup, set)} />
                </div>
                
                <div className="rarities-container">
                  {set.rarities.map(rarity => {
                    const rarityIds = selectedGroup.members.map(m => `${selectedGroup.code}#${m.code}${String(((set.id - 1) * 5) + rarity + (m.offset || 0)).padStart(3, '0')}`);
                    const isRarityComplete = rarityIds.every(id => ownedCards.includes(id));
                    return (
                      <div key={rarity} className="rarity-row">
                        <button className={`rarity-toggle ${isRarityComplete ? 'active' : ''}`} onClick={() => markRarityAsOwned(selectedGroup, set, rarity)}>❤</button>
                        <div className="grid">
                          {selectedGroup.members.map(member => {
                            const seq = ((set.id - 1) * 5) + rarity + (member.offset || 0);
                            const botId = `${selectedGroup.code}#${member.code}${String(seq).padStart(3, '0')}`;
                            const folder = (selectedGroup.folder || selectedGroup.code).toUpperCase();
                            const fileName = encodeURIComponent(botId).toUpperCase();
                            const imgPath = `${baseUrl}cards/${folder}/${fileName}.png`;
                            return <Card key={botId} botId={botId} imagePath={imgPath} isOwned={ownedCards.includes(botId)} onToggle={toggleCard} />;
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
export default App;