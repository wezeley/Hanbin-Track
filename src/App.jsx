import { useState, useEffect } from 'react'
import { HANBIN_DATA } from './data/hanbinData'
import { Header } from './components/Header'
import { Dashboard } from './components/Dashboard'
import { Card } from './components/Card'
import './App.css'

function App() {
  const [ownedCards, setOwnedCards] = useState(() => JSON.parse(localStorage.getItem('hanbin-collection')) || []);
  const [currentView, setCurrentView] = useState('dashboard'); // Tabs principais
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  // Estados de Filtro da Coleção
  const [colCategory, setColCategory] = useState('Groups'); // Groups, Soloists, Specials
  const [colSubCategory, setColSubCategory] = useState('ALL');
  const [searchTerm, setSearchString] = useState('');
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

  // --- FILTROS DE COLEÇÃO ---
  const filteredGroups = HANBIN_DATA.groups.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (colCategory === 'Groups') {
      const isGroup = ["Boygroups", "Girlgroups", "Co-Ed"].includes(g.category);
      if (!isGroup) return false;
      if (colSubCategory !== 'ALL' && g.category !== colSubCategory) return false;
    } 
    else if (colCategory === 'Soloists') {
      if (g.category !== 'Soloists') return false;
    } 
    else if (colCategory === 'Specials') {
      const isSpecial = ["Events", "Radiant", "Special", "Limiteds"].includes(g.category);
      if (!isSpecial) return false;
      if (colSubCategory !== 'ALL' && g.category !== colSubCategory) return false;
    }

    return matchesSearch;
  });

  return (
    <div className="container">
      {/* 1. NAVBAR PRINCIPAL (TOP) */}
      <nav className="main-navbar">
        <div className="nav-logo" onClick={() => setCurrentView('dashboard')}>HANBIN</div>
        <div className="nav-main-links">
          {['dashboard', 'cards', 'coleção', 'commands', 'status'].map(view => (
            <button key={view} className={currentView === view ? 'active' : ''} onClick={() => {setCurrentView(view); setSelectedGroup(null)}}>
              {view}
            </button>
          ))}
        </div>
        <Header title="" /> {/* User editável aqui */}
      </nav>

      <main className="view-container">
        
        {/* VIEW: DASHBOARD */}
        {currentView === 'dashboard' && (
          <Dashboard ownedCards={ownedCards} />
        )}

        {/* VIEW: CARDS (MOSTRAR TODAS) */}
        {currentView === 'cards' && (
          <div className="all-cards-view">
             <h2>All Cards Archive</h2>
             <p>Em breve: Lista de todas as {864} cartas do bot</p>
          </div>
        )}

        {/* VIEW: COLEÇÃO (DIRETÓRIO) */}
        {currentView === 'coleção' && !selectedGroup && (
          <div className="collection-layout">
            <div className="collection-sidebar">
              <input 
                type="text" 
                placeholder="Search groups..." 
                className="search-input" 
                onChange={(e) => setSearchString(e.target.value)}
              />
              
              <div className="filter-section">
                <button className={colCategory === 'Groups' ? 'active' : ''} onClick={() => {setColCategory('Groups'); setColSubCategory('ALL')}}>GROUPS</button>
                {colCategory === 'Groups' && (
                  <div className="sub-filters">
                    {['ALL', 'Girlgroups', 'Boygroups', 'Co-Ed'].map(s => (
                      <span key={s} className={colSubCategory === s ? 'active' : ''} onClick={() => setColSubCategory(s)}>{s}</span>
                    ))}
                  </div>
                )}
                
                <button className={colCategory === 'Soloists' ? 'active' : ''} onClick={() => setColCategory('Soloists')}>SOLOISTS</button>
                
                <button className={colCategory === 'Specials' ? 'active' : ''} onClick={() => {setColCategory('Specials'); setColSubCategory('ALL')}}>SPECIALS</button>
                {colCategory === 'Specials' && (
                  <div className="sub-filters">
                    {['ALL', 'Events', 'Radiant', 'Special'].map(s => (
                      <span key={s} className={colSubCategory === s ? 'active' : ''} onClick={() => setColSubCategory(s)}>{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="collection-content">
              <div className="directory-grid">
                {filteredGroups.map(group => (
                  <div key={group.code} className="directory-card-new" onClick={() => setSelectedGroup(group)}>
                    <img src={group.banner} alt="" className="card-bg-blur" />
                    <div className="card-front">
                      <h3>{group.name}</h3>
                      <span>{group.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: DENTRO DO GRUPO (EXPANSÃO) */}
        {currentView === 'coleção' && selectedGroup && (
           <div className="group-detail-view">
             <button className="btn-back" onClick={() => setSelectedGroup(null)}>← BACK TO COLLECTIONS</button>
             {/* ... lógica de sets e modal que já temos ... */}
             <h1 style={{fontSize: '3rem', margin: '20px 0'}}>{selectedGroup.name}</h1>
             {/* (Aqui entra o loop de sets que fizemos antes) */}
           </div>
        )}

      </main>
    </div>
  )
}
export default App;