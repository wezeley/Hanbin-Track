import { useState } from 'react';
import { useGroupData } from '../hooks/useGroupData';
import { getGroupSets } from '../utils/groupSets';
import { getGroupProgress } from '../utils/groupProgress';
import { plural } from '../utils/plural';
import { SetBinder } from './SetBinder';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'owned', label: 'Owned' },
  { id: 'missing', label: 'Missing' },
];

export function GroupView({ group, ownedCards, expandedSets, onToggleSet, onToggleCard, onSetCardsOwned, onBack }) {
  const [filter, setFilter] = useState('all');
  const { data, error } = useGroupData(group.code);

  // ===== Cálculos =====
  // O cabeçalho usa os números do index.json (já estão na tela antes de carregar).
  // Os sets só existem depois que o arquivo do grupo chega.
  const sets = data ? getGroupSets(data) : [];
  const { owned, total, pct } = getGroupProgress(group, ownedCards);
  const isSoloist = group.type === 'soloist';
  // Solista: sem "members" (LS · 1 set · 5 cards)
  const metaLabel = [
    group.tag,
    !isSoloist && plural(group.members, 'member'),
    plural(group.sets, 'set'),
    plural(total, 'card'),
  ].filter(Boolean).join(' · ');

  return (
    <div className="group-page">
      <button type="button" className="back-link" onClick={onBack}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back to {group.category}
      </button>

      <div className="group-header">
        <div className="group-header-text">
          <h1 className="group-title">{group.name}</h1>
          <span className="text-muted">{metaLabel}</span>
        </div>
        <div className="group-header-progress">
          <div className="group-header-progress-row">
            <span className="text-muted">Group progress</span>
            <b>{owned} / {total}</b>
          </div>
          <div className="progress progress-lg group-header-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="group-toolbar">
        <div className="filter-pills" role="group" aria-label="Show">
          {FILTERS.map(f => (
            <button
              key={f.id}
              type="button"
              className={`filter-pill ${filter === f.id ? 'active' : ''}`}
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="group-toolbar-help">
          Each set is a binder page. Click a pocket to add a card; missing cards stay black and white.
        </p>
      </div>

      {error && <p className="text-muted">Could not load the cards of this group.</p>}
      {!data && !error && <p className="text-muted">Loading cards...</p>}

      {sets.map(set => {
        const key = `${group.code}-${set.id}`;
        return (
          <SetBinder
            key={set.id}
            set={set}
            ownedCards={ownedCards}
            filter={filter}
            isSoloist={isSoloist}
            isOpen={expandedSets[key] !== false}
            onToggleOpen={() => onToggleSet(key)}
            onToggleCard={onToggleCard}
            onSetCardsOwned={onSetCardsOwned}
          />
        );
      })}
    </div>
  );
}
