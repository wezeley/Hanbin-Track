import { useState, useEffect } from 'react'
import { HANBIN_DATA } from './data/hanbinData'
import { Header } from './components/Header'
import { Tabs } from './components/Tabs'
import { Dashboard } from './components/Dashboard'
import { GroupGrid } from './components/GroupGrid'
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

  // FUNÇÃO: Marcar/Desmarcar SET Inteiro
  const markSetAsOwned = (group, set) => {
    const ids = [];
    HANBIN_DATA.rarities.forEach(r => group.members.forEach(m => {
      const seq = ((set.id - 1) * 5) + r + (m.offset || 0);
      ids.push(`${group.code}#${m.code}${String(seq).padStart(3, '0')}`);
    }));
    const isComplete = ids.every(id => ownedCards.includes(id));
    setOwnedCards(prev => isComplete ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])]);
  };

  // NOVA FUNÇÃO: Marcar/Desmarcar RARIDADE (Linha)
  const markRarityAsOwned = (group, set, rarity) => {
    const ids = group.members.map(m => {
      const seq = ((set.id - 1) * 5) + rarity + (m.offset || 0);
      return `${group.code}#${m.code}${String(seq).padStart(3, '0')}`;
    });
    const isComplete = ids.every(id => ownedCards.includes(id));
    setOwnedCards(prev => isComplete ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])]);
  };

  const baseUrl = import.meta.env.BASE_URL;
  const totalAvailable = HANBIN_DATA.groups.reduce((acc, g) => acc + (g.members.length * g.sets.length * 5), 0);
  
  const statsByCategory = HANBIN_DATA.categories.map(cat => {
    const groupsInCat = HANBIN_DATA.groups.filter(g => g.category?.trim() === cat.trim());
    const ownedInCat = ownedCards.filter(id => groupsInCat.some(g => g.code === id.split('#')[0])).length;
    const totalInCat = groupsInCat.reduce((acc, g) => acc + (g.members.length * g.sets.length * 5), 0);
    return { name: cat, count: ownedInCat, total: totalInCat };
  });

  const filteredGroups = HANBIN_DATA.groups.filter(g => g.category?.trim().toLowerCase() === activeTab?.trim().toLowerCase());

  return (
    <div className="container">
      <Header title={HANBIN_DATA.botName} onHome={resetNavigation} />
      <Tabs categories={HANBIN_DATA.categories} activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="content-area">
        {!activeTab ? (
          <Dashboard ownedCount={ownedCards.length} totalAvailable={totalAvailable} stats={statsByCategory} onTabChange={handleTabChange} />
        ) : !selectedGroup ? (
          <div className="group-tiles-grid">
            {filteredGroups.map(group => (
              <div key={group.code} className="group-tile" onClick={() => setSelectedGroup(group)}>
                {group.name}
              </div>
            ))}
          </div>
        ) : (
          <div className="focused-group-view">
            <button className="back-button" onClick={() => setSelectedGroup(null)}>← BACK</button>
            <h2 className="focused-group-name">{selectedGroup.name}</h2>
            
            {selectedGroup.sets.map(set => {
              const setIds = [];
              HANBIN_DATA.rarities.forEach(r => selectedGroup.members.forEach(m => {
                setIds.push(`${selectedGroup.code}#${m.code}${String(((set.id - 1) * 5) + r + (m.offset || 0)).padStart(3, '0')}`);
              }));
              const isSetComplete = setIds.every(id => ownedCards.includes(id));

              return (
                <div key={set.id} className="set-section">
                  <div className="set-symbol-container">
                    <img src={`${baseUrl}symbols/S${set.id}.webp`} className="set-symbol-icon" alt="S" />
                    <input type="checkbox" className="set-checkbox" checked={isSetComplete} onChange={() => markSetAsOwned(selectedGroup, set)} />
                  </div>

                  <div className="rarities-container">
                    {HANBIN_DATA.rarities.map(rarity => {
                      const rarityIds = selectedGroup.members.map(m => `${selectedGroup.code}#${m.code}${String(((set.id - 1) * 5) + rarity + (m.offset || 0)).padStart(3, '0')}`);
                      const isRarityComplete = rarityIds.every(id => ownedCards.includes(id));

                      return (
                        <div key={rarity} className="rarity-row">
                          {/* BOTÃO DE RARIDADE (Coraçãozinho lateral) */}
                          <button 
                            className={`rarity-toggle ${isRarityComplete ? 'active' : ''}`}
                            onClick={() => markRarityAsOwned(selectedGroup, set, rarity)}
                            title={`Mark all ${rarity}H`}
                          >
                            ❤
                          </button>

                          <div className="grid">
                            {selectedGroup.members.map(member => {
                              const seq = ((set.id - 1) * 5) + rarity + (member.offset || 0);
                              const botId = `${selectedGroup.code}#${member.code}${String(seq).padStart(3, '0')}`;
                              const folder = (selectedGroup.folder || selectedGroup.code).toUpperCase();
                              const fileName = encodeURIComponent(botId).toUpperCase();
                              const imgPath = `${baseUrl}cards/${folder}/${encodeURIComponent(botId).toUpperCase()}.png`;
                              
                              return (
                                <Card key={botId} botId={botId} imagePath={imgPath} isOwned={ownedCards.includes(botId)} onToggle={toggleCard} />
                              );
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default App;