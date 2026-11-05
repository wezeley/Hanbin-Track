import { useState, useEffect } from 'react'
import { HANBIN_DATA } from './data/hanbinData'
import { Header } from './components/Header'
import { Dashboard } from './components/Dashboard'
import { Card } from './components/Card'
import { getGroupStructure } from './utils/groupStructure'
import './App.css'

function App() {
  const [ownedCards, setOwnedCards] = useState(() => JSON.parse(localStorage.getItem('hanbin-collection')) || []);
  const [activeTab, setActiveTab] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [expandedSets, setExpandedSets] = useState({});
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => localStorage.setItem('hanbin-collection', JSON.stringify(ownedCards)), [ownedCards]);

  // --- FUNÇÕES DE NAVEGAÇÃO ---
  const toggleCard = (id) => setOwnedCards(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  
  const handleTabChange = (cat) => { 
    setCurrentView('dashboard');
    setActiveTab(cat); 
    setSelectedGroup(null); 
  };

  const handleGroupSelect = (group) => {
    setActiveTab(group.category);
    setSelectedGroup(group);
  };

  const resetNavigation = () => { 
    setCurrentView('dashboard');
    setActiveTab(null); 
    setSelectedGroup(null); 
  };

  const handleViewChange = (view) => {
    if (view === 'dashboard') {
      resetNavigation();
    } else {
      setCurrentView(view);
    }
  };

  const toggleSet = (id) => setExpandedSets(p => ({ ...p, [id]: p[id] === undefined ? false : !p[id] }));


  const baseUrl = import.meta.env.BASE_URL;
  const filteredGroups = HANBIN_DATA.groups.filter(g => g.category?.toLowerCase() === activeTab?.toLowerCase());

  return (
    <div className="app-skeleton">
      {/* SIDEBAR */}
      <aside className="skeleton-sidebar">
        <h2 onClick={resetNavigation} style={{cursor: 'pointer'}}>HOME</h2>
        {HANBIN_DATA.categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => handleTabChange(cat)} 
            className={activeTab === cat ? 'active' : ''}
          >
            {cat}
          </button>
        ))}
      </aside>

      <main className="skeleton-main">
        <Header
          title={HANBIN_DATA.botName}
          currentView={currentView}
          onViewChange={handleViewChange}
        />

        {currentView !== 'dashboard' ? (
          <p>Em breve.</p>
        ) : !activeTab ? (
          <Dashboard ownedCards={ownedCards} onGroupSelect={handleGroupSelect} />
        ) : !selectedGroup ? (
          <div className="skeleton-group-list">
            {filteredGroups.map(g => (
              <div key={g.code} className="skeleton-group-item" onClick={() => setSelectedGroup(g)}>
                {g.name}
              </div>
            ))}
          </div>
        ) : (
          <div className="skeleton-group-view">
            <button onClick={() => setSelectedGroup(null)}>VOLTAR</button>
            <h1>{selectedGroup.name}</h1>

            {getGroupStructure(selectedGroup).map(set => (
              <div key={set.id} className="skeleton-set">
                <div className="skeleton-set-header" onClick={() => toggleSet(`${selectedGroup.code}-${set.id}`)}>
                   SET {set.id} {expandedSets[`${selectedGroup.code}-${set.id}`] === false ? '[Abrir]' : '[Fechar]'}
                </div>
                
                {expandedSets[`${selectedGroup.code}-${set.id}`] !== false && (
                  <div className="rarities-container">
                    {set.rarities.map(r => (
                      <div key={r} className="skeleton-rarity-row">
                        <span>{r}H</span>
                        <div className="skeleton-grid">
                          {selectedGroup.members.map(m => {
                            const seq = ((set.id - 1) * 5) + r + (m.offset || 0);
                            const botId = `${selectedGroup.code}#${m.code}${String(seq).padStart(3, '0')}`;
                            
                            // --- NOVA LÓGICA DE IMAGEM (LINKS EXTERNOS) ---
                            let finalPath = "";
                            
                            // 1. Tenta pegar o link do Spreadsheet (ex: m.links.s1h1)
                            if (m.links && m.links[`s${set.id}h${r}`]) {
                              finalPath = m.links[`s${set.id}h${r}`];
                            } else {
                              // 2. Fallback: Se não tiver link, usa a pasta local
                              const folder = (selectedGroup.folder || selectedGroup.code).toUpperCase();
                              const fileName = encodeURIComponent(botId).toUpperCase();
                              finalPath = `${baseUrl}cards/${folder}/${fileName}.png`;
                            }

                            return (
                              <Card 
                                key={botId} 
                                botId={botId} 
                                imagePath={finalPath} 
                                isOwned={ownedCards.includes(botId)} 
                                onToggle={toggleCard} 
                              />
                            );
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