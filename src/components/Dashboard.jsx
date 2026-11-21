import { useState } from 'react';
import { GROUPS } from '../data/groups';
import { getGroupProgress } from '../utils/groupProgress';
import { pickUpcoming } from '../utils/upcoming';
import TODO from '../data/sheet/todo.json';

const RARITIES = [1, 2, 3, 4, 5];
const UPCOMING_COUNT = 5;

export function Dashboard({ ownedCards, onGroupSelect }) {
  const [query, setQuery] = useState('');
  // Sorteia uma vez cada vez que a Home aparece (não a cada tecla na busca).
  const [upcoming] = useState(() => pickUpcoming(TODO, UPCOMING_COUNT));

  // ===== Cálculos =====
  const totalCards = GROUPS.reduce((sum, g) => sum + g.cards, 0);
  const ownedCount = ownedCards.length;
  const progressPct = totalCards ? Math.round(ownedCount / totalCards * 100) : 0;

  // Raridade pelo número do ID (001 = 1H, 007 = 2H...): vale para todos os
  // grupos e solistas da planilha. Eventos (parte 6) vão precisar de outra conta.
  const rarityCounts = [0, 0, 0, 0, 0];
  ownedCards.forEach(id => {
    const seq = Number(id.slice(-3));
    const rarity = ((seq - 1) % 5) + 1;
    rarityCounts[rarity - 1] += 1;
  });

  // "Your groups": só os grupos em que tenho pelo menos uma carta
  const yourGroups = GROUPS.filter(g => getGroupProgress(g, ownedCards).owned > 0);

  const results = GROUPS
    .filter(g => g.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  // ===== Tela =====
  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Dashboard</h1>

      <div className="dashboard-row">
        <section className="dash-box dash-progress">
          <h2 className="dash-label">Global progress</h2>
          <div className="dash-stats">
            <span className="dash-stats-number">{ownedCount}</span>
            <span className="dash-stats-total">/ {totalCards} cards added</span>
          </div>
          <div className="progress progress-lg" role="img" aria-label={`${progressPct}% of all cards`}>
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="rarity-grid">
            {RARITIES.map((r, i) => (
              <div key={r} className="rarity-box">
                <div className="rarity-label">{r}H</div>
                <div className="rarity-count">{rarityCounts[i]}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="dash-box dash-upcoming">
          <h2 className="dash-label">Upcoming releases</h2>
          {upcoming.map((item, i) => (
            <div key={i} className="upcoming-row">
              <b>{item.name}</b>
              <span className="upcoming-info">{item.info}</span>
            </div>
          ))}
        </section>
      </div>

      <section className="dash-box dash-search">
        <label htmlFor="quick-search" className="dash-label">Quick search</label>
        <div className="search-field">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            id="quick-search"
            type="search"
            placeholder="Search for a group..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {query && results.length > 0 && (
          <div className="search-results">
            {results.map(g => {
              const { owned, total } = getGroupProgress(g, ownedCards);
              return (
                <button key={g.code} type="button" className="search-result" onClick={() => onGroupSelect(g)}>
                  <span><b>{g.name}</b> <span className="text-muted">· {g.category}</span></span>
                  <span className="search-result-progress">{owned} / {total}</span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="dash-box dash-groups">
        <h2 className="dash-label">Your groups</h2>
        {yourGroups.map(g => {
          const { owned, total, pct } = getGroupProgress(g, ownedCards);
          return (
            <button key={g.code} type="button" className="group-row" onClick={() => onGroupSelect(g)}>
              <span className="group-row-name">{g.name}</span>
              <span className="progress progress-sm">
                <span className="progress-fill" style={{ width: `${pct}%` }} />
              </span>
              <span className="group-row-progress">{owned} / {total}</span>
            </button>
          );
        })}
      </section>
    </div>
  );
}
