import { useState } from 'react';
import { getGroupStructure } from '../utils/groupStructure';
import { getGroupProgress } from '../utils/groupProgress';
import { plural } from '../utils/plural';
import { SetBinder } from './SetBinder';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'owned', label: 'Owned' },
  { id: 'missing', label: 'Missing' },
];

export function GroupView({ group, ownedCards, expandedSets, onToggleSet, onToggleCard, onBack }) {
  const [filter, setFilter] = useState('all');
  const sets = getGroupStructure(group);
  const { owned, total, pct } = getGroupProgress(group, ownedCards);
  const metaLabel = `${group.code} · ${plural(group.members.length, 'member')} · ${plural(sets.length, 'set')} · ${plural(total, 'card')}`;

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

      {sets.map(set => {
        const key = `${group.code}-${set.id}`;
        return (
          <SetBinder
            key={set.id}
            group={group}
            set={set}
            ownedCards={ownedCards}
            filter={filter}
            isOpen={expandedSets[key] !== false}
            onToggleOpen={() => onToggleSet(key)}
            onToggleCard={onToggleCard}
          />
        );
      })}
    </div>
  );
}
