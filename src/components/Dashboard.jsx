import { useEffect, useState } from 'react';
import { GROUPS } from '../data/groups';
import { getGroupProgress } from '../utils/groupProgress';
import { pickUpcoming } from '../utils/upcoming';
import { quickSearch } from '../utils/quickSearch';
import TODO from '../data/sheet/todo.json';

// Caixinhas do Global progress: as 5 raridades e os 3 tipos especiais
const RARITY_BOXES = [
  { key: 1, label: '1H' },
  { key: 2, label: '2H' },
  { key: 3, label: '3H' },
  { key: 4, label: '4H' },
  { key: 5, label: '5H' },
  { key: 'event', label: 'EV' },
  { key: 'limited', label: 'LTD' },
  { key: 'radiant', label: 'RAD' },
];
// Código do evento (SS24) -> tipo (event, limited ou radiant)
const EVENT_KINDS = new Map(GROUPS.filter(g => g.type === 'event').map(g => [g.code, g.kind]));
const UPCOMING_COUNT = 5;
const SEARCH_LIMIT = 8;

export function Dashboard({ ownedCards, onGroupSelect }) {
  const [query, setQuery] = useState('');
  // Sorteia uma vez cada vez que a Home aparece (não a cada tecla na busca).
  const [upcoming] = useState(() => pickUpcoming(TODO, UPCOMING_COUNT));

  // Lista de pessoas da busca (people.json): só é baixada quando começo a digitar
  const [people, setPeople] = useState(null);
  useEffect(() => {
    if (!query || people) return;
    import('../data/sheet/people.json').then(module => setPeople(module.default));
  }, [query, people]);

  // ===== Cálculos =====
  // Specials (Limiteds) ficam fora da contagem total, como no bot:
  // não entram no total nem nas cartas que tenho (só na caixinha delas).
  const isSpecial = id => EVENT_KINDS.get(id.split('#')[0]) === 'limited';
  const totalCards = GROUPS
    .filter(g => g.kind !== 'limited')
    .reduce((sum, g) => sum + g.cards, 0);
  const ownedCount = ownedCards.filter(id => !isSpecial(id)).length;
  const progressPct = totalCards ? Math.round(ownedCount / totalCards * 100) : 0;

  // Carta de evento, Limited ou radiante conta na caixinha do tipo (pelo código
  // antes do #). As outras, pelo número do ID (001 = 1H, 007 = 2H...): vale
  // para todos os grupos e solistas da planilha.
  const rarityCounts = Object.fromEntries(RARITY_BOXES.map(box => [box.key, 0]));
  ownedCards.forEach(id => {
    const kind = EVENT_KINDS.get(id.split('#')[0]);
    const seq = Number(id.slice(-3));
    rarityCounts[kind ?? ((seq - 1) % 5) + 1] += 1;
  });

  // "Your groups": só os grupos em que tenho pelo menos uma carta
  const yourGroups = GROUPS.filter(g => getGroupProgress(g, ownedCards).owned > 0);

  // Grupos e pessoas (enquanto people.json não chega, só grupos)
  const results = quickSearch(query, GROUPS, people, SEARCH_LIMIT);

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
            {RARITY_BOXES.map(box => (
              <div key={box.key} className="rarity-box">
                <div className="rarity-label">{box.label}</div>
                <div className="rarity-count">{rarityCounts[box.key]}</div>
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
            placeholder="Search for a group or member..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {query && results.length > 0 && (
          <div className="search-results">
            {results.map(({ key, group, person, origin }) => {
              const { owned, total } = getGroupProgress(group, ownedCards);
              // Grupo: "Stray Kids · Boy Group". Pessoa: "Juyeon · Pool Party (The Boyz)"
              const where = person
                ? `${group.name}${origin ? ` (${origin})` : ''}`
                : group.category;
              return (
                <button key={key} type="button" className="search-result" onClick={() => onGroupSelect(group)}>
                  <span><b>{person ?? group.name}</b> <span className="text-muted">· {where}</span></span>
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
