import { useState, useEffect } from 'react'
import { HANBIN_DATA } from './data/hanbinData'
import { Header } from './components/Header'
import './App.css'

function App() {
  const [ownedCards, setOwnedCards] = useState(() => JSON.parse(localStorage.getItem('hanbin-collection')) || []);
  const [currentView, setCurrentView] = useState('Groups');
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => localStorage.setItem('hanbin-collection', JSON.stringify(ownedCards)), [ownedCards]);

  const toggleCard = (id) => setOwnedCards(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const filteredGroups = HANBIN_DATA.groups.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || g.category === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="app-wrapper">
      {/* HEADER IGUAL AO PRINT */}
      <nav className="main-navbar">
        <div className="nav-logo" style={{fontWeight: 900, fontSize: '1.2rem'}}>HANBIN</div>
        <div className="nav-links">
           <button onClick={() => {setCurrentView('Dashboard'); setSelectedGroup(null)}}>Cards</button>
           <button onClick={() => {setCurrentView('Dashboard'); setSelectedGroup(null)}}>Collections</button>
           <button className="active" onClick={() => {setCurrentView('Groups'); setSelectedGroup(null)}}>Groups</button>
           <button>Event</button>
           <button>Leaderboard</button>
           <button>Status</button>
        </div>
        <div className="nav-user">
           <Header /> {/* Seu componente de nome editável */}
        </div>
      </nav>

      <main className="container">
        {currentView === 'Groups' && !selectedGroup && (
          <>
            {/* HERO SECTION */}
            <section className="hero-section">
              <div className="hero-text">
                <h4>THE COMPLETE ARTIST DIRECTORY</h4>
                <h1>Find every group<br/>and soloist.</h1>
                <p>Browse every artist represented in the card archive, then open a profile to explore their members, cards, and collections.</p>
              </div>
              <div className="stats-summary">
                <div className="stat-box"><label>Groups</label><span>{HANBIN_DATA.groups.length}</span></div>
                <div className="stat-box"><label>Total Cards</label><span>864</span></div>
                <div className="stat-box" style={{borderRight: 'none'}}><label>Collections</label><span>{HANBIN_DATA.groups.length * 3}</span></div>
              </div>
            </section>

            {/* SEARCH & FILTERS */}
            <section className="search-filter-row">
              <div className="search-container">
                <input 
                  type="text" 
                  className="search-input-big" 
                  placeholder="Search groups..." 
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-pills">
                {['All', 'Girlgroups', 'Boygroups', 'Mixed'].map(cat => (
                  <button 
                    key={cat} 
                    className={`pill ${activeTab === cat ? 'active' : ''}`}
                    onClick={() => setActiveTab(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </section>

            {/* DIRECTORY GRID */}
            <h4 style={{color: '#8a3d4f', fontSize: '0.7rem', marginBottom: '20px', fontWeight: 800}}>ARTISTS ACROSS THE ARCHIVE</h4>
            <div className="group-grid">
              {filteredGroups.map(group => (
                <div key={group.code} className="group-card" onClick={() => setSelectedGroup(group)}>
                  <div className="group-banner">
                    <span className="group-tag">{group.category}</span>
                    <img src={group.banner || 'https://via.placeholder.com/400x200'} alt={group.name} />
                  </div>
                  <div className="group-card-content">
                    <h3>{group.name}</h3>
                    <div className="group-card-stats">
                      <div className="stat-item">
                        <span className="stat-mini-label">Cards</span>
                        <span className="stat-mini-val">94</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-mini-label">Members</span>
                        <span className="stat-mini-val">{group.members.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* LOGICA PARA QUANDO CLICAR NO GRUPO (ABRE OS SETS/MODAL) */}
        {selectedGroup && (
          <div style={{marginTop: '40px'}}>
             <button className="pill" onClick={() => setSelectedGroup(null)}>← Back to Directory</button>
             <h1 style={{fontFamily: 'Instrument Serif', fontSize: '4rem', marginTop: '20px'}}>{selectedGroup.name}</h1>
             {/* Aqui entra o loop de sets que fizemos antes */}
          </div>
        )}
      </main>
    </div>
  )
}
export default App;