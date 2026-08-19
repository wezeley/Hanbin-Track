import { useState, useEffect } from 'react'
import { HANBIN_DATA } from './data/hanbinData'
import { Header } from './components/Header'
import { Dashboard } from './components/Dashboard'
import { Card } from './components/Card'
import './App.css'

function App() {
  const [ownedCards, setOwnedCards] = useState(() => JSON.parse(localStorage.getItem('hanbin-collection')) || []);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  // Estados de Filtro da Coleção
  const [colCategory, setColCategory] = useState('Groups'); 
  const [colSubCategory, setColSubCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredGroups = HANBIN_DATA.groups.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (colCategory === 'Groups') {
      if (!["Boygroups", "Girlgroups", "Co-Ed"].includes(g.category)) return false;
      if (colSubCategory !== 'ALL' && g.category !== colSubCategory) return false;
    } else if (colCategory === 'Soloists') {
      if (g.category !== 'Soloists') return false;
    } else if (colCategory === 'Specials') {
      if (!["Events", "Radiant", "Special", "Limiteds"].includes(g.category)) return false;
      if (colSubCategory !== 'ALL' && g.category !== colSubCategory) return false;
    }
    return matchesSearch;
  });

  return (
    <div className="container">
      <Header currentView={currentView} onViewChange={(v) => { setCurrentView(v); setSelectedGroup(null); }} />

      <main style={{marginTop: '30px'}}>
        
        {currentView === 'dashboard' && <Dashboard ownedCards={ownedCards} />}

        {currentView === 'coleção' && !selectedGroup && (
          <div className="collection-container">
            <div className="col-sidebar">
              <input type="text" placeholder="Search groups..." className="search-bar" onChange={(e) => setSearchTerm(e.target.value)} />
              
              <button className={`filter-group-btn ${colCategory === 'Groups' ? 'active' : ''}`} onClick={() => {setColCategory('Groups'); setColSubCategory('ALL')}}>GROUPS</button>
              {colCategory === 'Groups' && (
                <div style={{display: 'flex', flexDirection: 'column'}}>
                  {['ALL', 'Girlgroups', 'Boygroups', 'Co-Ed'].map(s => (
                    <span key={s} className={`sub-filter-item ${colSubCategory === s ? 'active' : ''}`} onClick={() => setColSubCategory(s)}>{s}</span>
                  ))}
                </div>
              )}
              <button className={`filter-group-btn ${colCategory === 'Soloists' ? 'active' : ''}`} onClick={() => setColCategory('Soloists')}>SOLOISTS</button>
              <button className={`filter-group-btn ${colCategory === 'Specials' ? 'active' : ''}`} onClick={() => {setColCategory('Specials'); setColSubCategory('ALL')}}>SPECIALS</button>
              {colCategory === 'Specials' && (
                <div style={{display: 'flex', flexDirection: 'column'}}>
                  {['ALL', 'Events', 'Radiant', 'Special'].map(s => (
                    <span key={s} className={`sub-filter-item ${colSubCategory === s ? 'active' : ''}`} onClick={() => setColSubCategory(s)}>{s}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="directory-grid">
              {filteredGroups.map(group => (
                <div key={group.code} className="artist-card" onClick={() => setSelectedGroup(group)}>
                  <div className="artist-banner"><img src={group.banner || 'https://via.placeholder.com/300x150'} /></div>
                  <div className="artist-info">
                    <h3 style={{fontSize: '0.9rem'}}>{group.name}</h3>
                    <span style={{fontSize: '0.65rem', color: '#94a3b8'}}>{group.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'coleção' && selectedGroup && (
          <div>
            <button className="nav-link" onClick={() => setSelectedGroup(null)}>← Back</button>
            <h1 style={{fontSize: '2.5rem', margin: '20px 0'}}>{selectedGroup.name}</h1>
            <div className="directory-grid">
                {getGroupStructure(selectedGroup).map(set => (
                    <div key={set.id} className="artist-card" onClick={() => setOpenSet(set)} style={{padding: '20px', textAlign: 'center'}}>
                        <div style={{display: 'flex', gap: '5px', marginBottom: '15px', justifyContent: 'center'}}>
                            {selectedGroup.members.slice(0, 3).map((m, i) => (
                                <img key={i} src={m.links?.[`s${set.id}h1`]} style={{width: '40px', height: '60px', borderRadius: '4px', objectFit: 'cover'}} />
                            ))}
                        </div>
                        <b>Set {set.id}</b>
                    </div>
                ))}
            </div>
          </div>
        )}
      </main>

      {openSet && (
        <div className="modal-overlay" onClick={() => setOpenSet(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{selectedGroup.name} - Set {openSet.id}</h2>
            {openSet.rarities.map(r => (
              <div key={r} style={{marginTop: '30px'}}>
                <p style={{fontWeight: 800, color: 'red', marginBottom: '15px'}}>{r} Hearts</p>
                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                  {selectedGroup.members.map(m => {
                    const seq = ((openSet.id - 1) * 5) + r + (m.offset || 0);
                    const botId = `${selectedGroup.code}#${m.code}${String(seq).padStart(3, '0')}`;
                    const img = m.links?.[`s${openSet.id}h${r}`];
                    return (
                      <div key={botId} className={`card-box ${ownedCards.includes(botId) ? 'owned' : ''}`} onClick={() => toggleCard(botId)}>
                        <img src={img} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
export default App;