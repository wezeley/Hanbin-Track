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

  // Lógica do maxSet (1.1, 2.5, etc)
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
  const filteredGroups = HANBIN_DATA.groups.filter(g => g.category?.toLowerCase() === activeTab?.toLowerCase());

  return (
    <div className="app-skeleton">
      {/* SIDEBAR DE NAVEGAÇÃO */}
      <aside className="skeleton-sidebar">
        <h2 onClick={() => {setActiveTab(null); setSelectedGroup(null);}}>HOME</h2>
        {HANBIN_DATA.categories.map(cat => (
          <button key={cat} onClick={() => handleTabChange(cat)} className={activeTab === cat ? 'active' : ''}>
            {cat}
          </button>
        ))}
      </aside>

// No App.jsx, dentro do <main className="skeleton-main">
<Header 
  title={HANBIN_DATA.botName} 
  onHome={resetNavigation} 
/>

        {/* 1. TELA HOME */}
        {!activeTab ? (
          <Dashboard ownedCards={ownedCards} onTabChange={handleTabChange} />
        ) : 
        /* 2. TELA LISTA DE GRUPOS */
        !selectedGroup ? (
          <div className="skeleton-group-list">
            {filteredGroups.map(g => (
              <div key={g.code} className="skeleton-group-item" onClick={() => setSelectedGroup(g)}>
                {g.name}
              </div>
            ))}
          </div>
        ) : (
          /* 3. TELA DENTRO DO GRUPO */
          <div className="skeleton-group-view">
            <button onClick={() => setSelectedGroup(null)}>VOLTAR</button>
            <h1>{selectedGroup.name}</h1>

            {getGroupStructure(selectedGroup).map(set => (
              <div key={set.id} className="skeleton-set">
                <div className="skeleton-set-header" onClick={() => toggleSet(set.id)}>
                   SET {set.id} {expandedSets[set.id] === false ? '[Abrir]' : '[Fechar]'}
                </div>
                
                {expandedSets[set.id] !== false && (
                  <div className="skeleton-rarities">
                    {set.rarities.map(r => (
                      <div key={r} className="skeleton-rarity-row">
                        <span>{r}H</span>
                        <div className="skeleton-grid">
                          {selectedGroup.members.map(m => {
                            const seq = ((set.id - 1) * 5) + r + (m.offset || 0);
                            const botId = `${selectedGroup.code}#${m.code}${String(seq).padStart(3, '0')}`;
                            const folder = (selectedGroup.folder || selectedGroup.code).toUpperCase();
                            const fileName = encodeURIComponent(botId).toUpperCase();
                            const path = `${baseUrl}cards/${folder}/${fileName}.png`;
                            return <Card key={botId} botId={botId} imagePath={path} isOwned={ownedCards.includes(botId)} onToggle={toggleCard} />;
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
export default App;