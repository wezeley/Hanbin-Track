import { useState, useEffect } from 'react'
import './App.css'
import { HANBIN_DATA } from './data/hanbinData'

function App() {
  // Estado para salvar as cartas que você possui no navegador
  const [ownedCards, setOwnedCards] = useState(() => {
    const saved = localStorage.getItem('hanbin-collection');
    return saved ? JSON.parse(saved) : [];
  });

  // Salva no localStorage sempre que mudar a coleção
  useEffect(() => {
    localStorage.setItem('hanbin-collection', JSON.stringify(ownedCards));
  }, [ownedCards]);

  // Função para marcar/desmarcar carta
  const toggleCard = (cardId) => {
    setOwnedCards(prev => 
      prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
    );
  };

  // Caminho base para as imagens (ajusta automaticamente para GitHub Pages ou Local)
  const baseUrl = import.meta.env.BASE_URL;

  return (
    <div className="container">
      <header>
        <h1 className="title">{HANBIN_DATA.botName}</h1>
        <p className="subtitle">COLLECTED: {ownedCards.length}</p>
      </header>

      {/* LOOP 1: GRUPOS (AESPA, IVE, BLACKPINK...) */}
      {HANBIN_DATA.groups.map((group) => (
        /* Removido o 'open' para que os grupos comecem FECHADOS */
        <details key={group.code} className="group-accordion">
          <summary className="group-header">
            {group.name}
          </summary>
          
          <div className="group-content">
            {/* LOOP 2: SETS (v1, v2, got the beat...) */}
            {group.sets.map((set) => (
              <div key={set.id} className="set-section">
                {/* Nome do Set opcional aqui - Se quiser remover, apague a linha abaixo */}
                <h2 className="set-title-display">{set.name}</h2>
                
                {/* LOOP 3: RARIDADES (1 a 5 Hearts) */}
                {HANBIN_DATA.rarities.map((rarityLevel) => (
                  <div key={rarityLevel} className="rarity-row">
                    
                    {/* AQUI ESTAVA O TEXTO "1 Hearts" - ELE FOI REMOVIDO PARA FICAR LIMPO */}
                    
                    <div className="grid">
                      {/* LOOP 4: MEMBROS DO GRUPO */}
                      {group.members.map((member) => {
                        // Lógica para gerar o ID igual ao do bot do Discord
                        const sequenceNumber = ((set.id - 1) * 5) + rarityLevel;
                        const formattedNumber = String(sequenceNumber).padStart(3, '0');
                        const botId = `${group.code}#${member.code}${formattedNumber}`;
                        
                        // Caminho da imagem (forçando maiúsculas para não dar erro no GitHub)
                        const imagePath = `${baseUrl}cards/${encodeURIComponent(botId).toUpperCase()}.png`;
                        const isOwned = ownedCards.includes(botId);

                        return (
                          <div 
                            key={botId} 
                            className={`card ${isOwned ? 'owned' : ''}`}
                            onClick={() => toggleCard(botId)}
                          >
                            <div className="card-inner">
                              <img 
                                src={imagePath} 
                                alt={botId}
                                className="card-image"
                                loading="lazy"
                                onError={(e) => { 
                                  // Caso a imagem não exista na pasta, mostra um placeholder
                                  e.target.onerror = null; 
                                  e.target.src = 'https://via.placeholder.com/110x165?text=?'; 
                                }}
                              />
                            </div>
                            {/* Opcional: ID da carta - O CSS que te mandei antes esconde isso para ficar limpo */}
                            <p className="card-id-label">{botId}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

export default App;