import { useEffect, useState } from 'react';
import { GROUPS } from '../data/groups';
import { getGroupProgress } from '../utils/groupProgress';
import { pickUpcoming } from '../utils/upcoming';
import { quickSearch } from '../utils/quickSearch';
import { pickPhoto } from '../utils/groupPhoto';
import { GroupCard } from './GroupCard';
import TODO from '../data/sheet/todo.json';

// Caixinhas do Global progress: as 5 raridades numa fileira e, embaixo, os
// 3 tipos especiais com os símbolos do bot (public/symbols/).
const REGULAR_BOXES = [1, 2, 3, 4, 5].map(key => ({ key, label: `${key}H` }));
const SPECIAL_BOXES = [
  { key: 'event', label: 'Events', symbol: 'E' },
  { key: 'limited', label: 'Limiteds', symbol: 'S' },
  { key: 'radiant', label: 'Radiant', symbol: 'R' },
];
// Código do evento (SS24) -> tipo (event, limited ou radiant)
const EVENT_KINDS = new Map(GROUPS.filter(g => g.type === 'event').map(g => [g.code, g.kind]));
const UPCOMING_COUNT = 5;
const SEARCH_LIMIT = 8;

// Dono de cada carta: solista pela lista de IDs dele (SOLO#LS001 é de um
// solista só); o resto pelo começo do ID (SKZ#BC001 é do SKZ).
const SOLOIST_BY_CARD = new Map(GROUPS.filter(g => g.codes).flatMap(g => g.codes.map(code => [code, g])));
const GROUP_BY_CODE = new Map(GROUPS.filter(g => !g.codes).map(g => [g.code, g]));
const ownerOf = id => SOLOIST_BY_CARD.get(id) ?? GROUP_BY_CODE.get(id.split('#')[0]);

// Colunas da Home: quantos grupos aparecem antes do "Show all"
const COLUMN_SIZE = 5;

export function Dashboard({ ownedCards, onGroupSelect }) {
  const [query, setQuery] = useState('');
  // Sorteia uma vez cada vez que a Home aparece (não a cada tecla na busca).
  const [upcoming] = useState(() => pickUpcoming(TODO, UPCOMING_COUNT));
  // Celular: qual das 3 colunas aparece (no computador aparecem as 3)
  const [activeColumn, setActiveColumn] = useState('recent');
  // Colunas abertas pelo "Show all": { recent: true }
  const [expanded, setExpanded] = useState({});

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
  const rarityCounts = Object.fromEntries([...REGULAR_BOXES, ...SPECIAL_BOXES].map(box => [box.key, 0]));
  ownedCards.forEach(id => {
    const kind = EVENT_KINDS.get(id.split('#')[0]);
    const seq = Number(id.slice(-3));
    rarityCounts[kind ?? ((seq - 1) % 5) + 1] += 1;
  });

  // Grupos em que tenho carta, do mais recente para o mais antigo: a coleção
  // guarda os IDs na ordem em que foram marcados, então lendo do fim para o
  // começo, o primeiro dono que aparece é o do grupo mexido por último.
  const recentGroups = [];
  for (let i = ownedCards.length - 1; i >= 0; i--) {
    const group = ownerOf(ownedCards[i]);
    if (group && !recentGroups.includes(group)) recentGroups.push(group);
  }
  const progress = new Map(recentGroups.map(g => [g.code, getGroupProgress(g, ownedCards)]));
  const missing = g => progress.get(g.code).total - progress.get(g.code).owned;

  // As 3 colunas. Almost there: os incompletos, primeiro os que faltam menos
  // cartas (4/5 falta 1 e vem antes de 110/120, que falta 10).
  const columns = [
    {
      id: 'recent', label: 'Recent', tab: 'Recent', hint: 'last added first',
      groups: recentGroups,
      note: g => `${progress.get(g.code).pct}%`,
      empty: 'Add a card to a group to see it here.',
    },
    {
      id: 'almost', label: 'Almost there', tab: 'Almost', hint: 'fewest missing first',
      groups: recentGroups.filter(g => missing(g) > 0).sort((a, b) => missing(a) - missing(b)),
      note: g => `${missing(g)} to go`,
      empty: 'No groups in progress.',
    },
    {
      id: 'completed', label: 'Completed', tab: 'Completed', hint: 'every card added',
      groups: recentGroups.filter(g => missing(g) === 0),
      note: () => 'complete',
      empty: 'No completed groups yet.',
    },
  ];

  const toggleExpanded = id => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

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
            {REGULAR_BOXES.map(box => (
              <div key={box.key} className="rarity-box">
                <div className="rarity-label">{box.label}</div>
                <div className="rarity-count">{rarityCounts[box.key]}</div>
              </div>
            ))}
          </div>
          <div className="rarity-grid rarity-grid-specials">
            {SPECIAL_BOXES.map(box => (
              <div key={box.key} className="rarity-box rarity-box-special" title={box.label}>
                <img
                  className="rarity-symbol"
                  src={`${import.meta.env.BASE_URL}symbols/${box.symbol}.webp`}
                  alt={box.label}
                />
                <span className="rarity-count">{rarityCounts[box.key]}</span>
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
      </div>

      {/* Seus grupos em 3 colunas. No celular viram abas: as abas trocam
          activeColumn e o CSS mostra só a coluna ativa. */}
      <div className="your-groups">
        <div className="your-groups-tabs" role="tablist" aria-label="Your groups">
          {columns.map(column => (
            <button
              key={column.id}
              type="button"
              role="tab"
              aria-selected={activeColumn === column.id}
              className={`your-groups-tab ${activeColumn === column.id ? 'active' : ''}`}
              onClick={() => setActiveColumn(column.id)}
            >
              {column.tab} <span className="your-groups-tab-count">{column.groups.length}</span>
            </button>
          ))}
        </div>

        <div className="your-groups-columns">
          {columns.map(column => {
            const isExpanded = expanded[column.id];
            const shown = isExpanded ? column.groups : column.groups.slice(0, COLUMN_SIZE);
            return (
              <section
                key={column.id}
                className={`your-column your-column-${column.id} ${activeColumn === column.id ? 'active' : ''}`}
              >
                <header className="your-column-header">
                  <h2 className="your-column-title">{column.label}</h2>
                  <span className="your-column-count">{column.groups.length}</span>
                  <span className="your-column-hint">{column.hint}</span>
                </header>

                {column.groups.length === 0 && <p className="your-column-empty">{column.empty}</p>}

                {shown.map(g => {
                  const { owned, total, pct } = progress.get(g.code);
                  return (
                    <GroupCard
                      key={g.code}
                      compact
                      name={g.name}
                      owned={owned}
                      total={total}
                      pct={pct}
                      note={column.note(g)}
                      tag={g.tag}
                      getPhoto={() => pickPhoto(g)}
                      onClick={() => onGroupSelect(g)}
                    />
                  );
                })}

                {column.groups.length > COLUMN_SIZE && (
                  <button type="button" className="your-column-more" onClick={() => toggleExpanded(column.id)}>
                    {isExpanded ? 'Show less' : `Show all ${column.groups.length} →`}
                  </button>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
