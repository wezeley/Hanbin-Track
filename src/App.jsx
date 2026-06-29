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

  // Função para marcar/desmarcar cartas
  const toggleCard = (id) => setOwnedCards(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  
  // Função para voltar para a Home clicando no Título
  const resetNavigation = () => { setActiveTab(null); setSelectedGroup(null); };

  // CORREÇÃO AQUI: Função que muda a aba e fecha qualquer grupo aberto
  const handleTabChange = (cat) => {  
    setActiveTab(cat);  
    setSelectedGroup(null); 
  };

  const baseUrl = import.meta.env.BASE_URL;

  // Lógica de Estatísticas para o Dashboard
  const totalAvailable = HANBIN_DATA.groups.reduce((acc, g) => acc + (g.members.length * g.sets.length * 5), 0);
  
  const statsByCategory = HANBIN_DATA.categories.map(cat => {
    const groupsInCat = HANBIN_DATA.groups.filter(g => g.category?.trim() === cat.trim());
    const ownedInCat = ownedCards.filter(id => {
        const groupCode = id.split('#')[0];
        return groupsInCat.some(g => g.code === groupCode);
    }).length;
    const totalInCat = groupsInCat.reduce((acc, g) => acc + (g.members.length * g.sets.length * 5), 0);
    return { name: cat, count: ownedInCat, total: totalInCat };
  });

  const filteredGroups = HANBIN_DATA.groups.filter(g => g.category?.trim().toLowerCase() === activeTab?.trim().toLowerCase());

  return (
    <div className="container">
      {/* Header e Tabs agora usam as funções de reset/mudança corretamente */}
      <Header title={HANBIN_DATA.botName} onHome={resetNavigation} />
      
      <Tabs 
        categories={HANBIN_DATA.categories} 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />

      <main className="content-area">
        {!activeTab ? (
          /* Dashboard agora também reseta o grupo se clicar numa categoria */
          <Dashboard 
            ownedCount={ownedCards.length} 
            totalAvailable={totalAvailable} 
            stats={statsByCategory} 
            onTabChange={handleTabChange} 
          />
        ) : !selectedGroup ? (
          <GroupGrid groups={filteredGroups} onSelectGroup={setSelectedGroup} />
        ) : (
          <div className="focused-group-view">
            <button className="back-button" onClick={() => setSelectedGroup(null)}>← BACK</button>
            <h2 className="focused-group-name">{selectedGroup.name}</h2>
            
            {selectedGroup.sets.map(set => (
              <div key={set.id} className="set-section">
                <div className="set-symbol-container">
                  <img 
                    src={`${baseUrl}symbols/S${set.id}.png`} // Ajuste para .webp se necessário
                    alt="S" 
                    className="set-symbol-icon" 
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>

                {/* CONTAINER PARA RARIDADES LADO A LADO */}
                <div className="rarities-container">
                  {HANBIN_DATA.rarities.map(rarity => (
                    <div key={rarity} className="rarity-row">
                      <div className="grid">
                        {selectedGroup.members.map(member => {
                          const rarityOffset = member.offset || 0;
                          const seq = ((set.id - 1) * 5) + rarity + rarityOffset;
                          const botId = `${selectedGroup.code}#${member.code}${String(seq).padStart(3, '0')}`;
                          const folder = (selectedGroup.folder || selectedGroup.code).toUpperCase();
                          
                          // Verifique se no seu GitHub é .png ou .webp
                          const imgPath = `${baseUrl}cards/${folder}/${encodeURIComponent(botId).toUpperCase()}.png`;
                          
                          return (
                            <Card 
                                key={botId} 
                                botId={botId} 
                                imagePath={imgPath} 
                                isOwned={ownedCards.includes(botId)} 
                                onToggle={toggleCard} 
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
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