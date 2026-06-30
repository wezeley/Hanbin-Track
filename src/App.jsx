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
  
  // NOVO: Estado para controlar quais sets estão abertos
  const [expandedSets, setExpandedSets] = useState({});

  useEffect(() => localStorage.setItem('hanbin-collection', JSON.stringify(ownedCards)), [ownedCards]);

  const toggleCard = (id) => setOwnedCards(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const handleTabChange = (cat) => { setActiveTab(cat); setSelectedGroup(null); };
  const resetNavigation = () => { setActiveTab(null); setSelectedGroup(null); };

  // Função para abrir/fechar o set
  const toggleSetExpand = (setId) => {
    setExpandedSets(prev => ({
      ...prev,
      [setId]: prev[setId] === undefined ? false : !prev[setId]
    }));
  };

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
  const filteredGroups = HANBIN_DATA.groups.filter(g => g.category?.trim().toLowerCase() === activeTab?.trim().toLowerCase());

  return (
    <div className="container">
      <Header title={HANBIN_DATA.botName} onHome={resetNavigation} />
      <Tabs categories={HANBIN_DATA.categories} activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="content-area">
        {!activeTab ? (
          <Dashboard ownedCards={ownedCards} onTabChange={handleTabChange} />
        ) : !selectedGroup ? (
          <GroupGrid groups={filteredGroups} onSelectGroup={setSelectedGroup} />
        ) : (
          <div className="focused-group-view">
            <div className="focused-header-row">
              <button className="back-btn-compact" onClick={() => setSelectedGroup(null)}>← BACK</button>
              <h2 className="group-name-compact">{selectedGroup.name}</h2>
              <div style={{width: '60px'}}></div>
            </div>

            {getGroupStructure(selectedGroup).map(set => {
              const setIds = [];
              set.rarities.forEach(r => selectedGroup.members.forEach(m => {
                setIds.push(`${selectedGroup.code}#${m.code}${String(((set.id - 1) * 5) + r + (m.offset || 0)).padStart(3, '0')}`);
              }));
              const isSetComplete = setIds.every(id => ownedCards.includes(id));
              
              // Verifica se o set está aberto ou fechado (padrão é aberto)
              const isExpanded = expandedSets[set.id] !== false;

              return (
                <div key={set.id} className={`set-section ${!isExpanded ? 'collapsed' : ''}`}>
                  <div className="set-header-minimal">
                    <div className="set-controls-group">
                      <img 
                        src={`${baseUrl}symbols/S${set.id}.webp`} 
                        className="set-symbol-icon" 
                        alt="S" 
                        onClick={() => toggleSetExpand(set.id)} 
                        style={{cursor: 'pointer'}}
                      />
                      <input 
                        type="checkbox" 
                        className="set-checkbox" 
                        checked={isSetComplete} 
                        onChange={() => markSetAsOwned(selectedGroup, set)} 
                      />
                      <button className="expand-toggle-btn" onClick={() => toggleSetExpand(set.id)}>
                        {isExpanded ? '▼' : '▶'}
                      </button>
                    </div>
                  </div>
                  
                  {isExpanded && (
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
                  )}
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