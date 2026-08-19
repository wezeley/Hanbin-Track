import { useState } from 'react';
import { HANBIN_DATA } from '../data/hanbinData';

export function Dashboard({ ownedCards, onGroupSelect }) {
  const [query, setQuery] = useState('');
  const totalBotCards = 864; // O valor que você definiu

  const results = HANBIN_DATA.groups.filter(g => 
    g.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="dashboard-container">
      <div className="dashboard-top-row">
        {/* LADO ESQUERDO: TOTAL PROGRESS */}
        <div className="dash-box">
          <label className="dash-label">📊 GLOBAL PROGRESS</label>
          <div className="dash-stats">
            <span className="current">{ownedCards.length}</span>
            <span className="total">/ {totalBotCards} Cards Added</span>
          </div>
        </div>

        {/* LADO DIREITO: UPCOMING */}
        <div className="dash-box">
          <label className="dash-label">🚀 UPCOMING RELEASES</label>
          <div className="upcoming-mini-list">
            {HANBIN_DATA.upcoming?.map((item, i) => (
              <div key={i} className="upcoming-row-small">
                <b>{item.group}</b> <span>{item.info}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EMBAIXO: BARRA DE PESQUISA */}
      <div className="dash-search-box">
        <label className="dash-label">🔍 QUICK SEARCH</label>
        <input 
          type="text" 
          placeholder="Search for a group..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <div className="search-dropdown">
            {results.map(g => (
              <div key={g.code} className="search-item" onClick={() => onGroupSelect(g)}>
                {g.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}