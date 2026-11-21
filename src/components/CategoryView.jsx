import { useState } from 'react';
import { getGroupProgress } from '../utils/groupProgress';
import { plural } from '../utils/plural';
import { getNameSize } from '../utils/groupCard';
import BANNERS from '../data/banners.json';

// Evento: sorteia uma das cartas dele cada vez que a categoria aparece.
const pickPhoto = (group) => group.photos?.length
  ? group.photos[Math.floor(Math.random() * group.photos.length)]
  : BANNERS[group.code];

function GroupPhoto({ group }) {
  const [failed, setFailed] = useState(false);
  const [src] = useState(() => pickPhoto(group));
  if (!src || failed) return null;

  const url = src.startsWith('http') ? src : `${import.meta.env.BASE_URL}${src}`;
  return <img src={url} alt="" loading="lazy" onError={() => setFailed(true)} />;
}

export function CategoryView({ category, groups, query, onQueryChange, ownedCards, onGroupSelect }) {
  // ===== Cálculos =====
  // Busca pelo nome ou pela etiqueta (SKZ acha o Stray Kids), sem diferenciar maiúsculas.
  const search = query.trim().toLowerCase();
  const visibleGroups = search
    ? groups.filter(g => g.name.toLowerCase().includes(search) || g.tag.toLowerCase().includes(search))
    : groups;
  // Soloists conta "artists"; Events, Limiteds e Radiant, "events"; o resto, "groups"
  const NOUNS = { soloist: 'artist', event: 'event' };
  const types = [...new Set(groups.map(g => g.type))];
  const noun = types.length === 1 ? (NOUNS[types[0]] ?? 'group') : 'group';
  const groupCountLabel = search
    ? `${visibleGroups.length} of ${plural(groups.length, noun)}`
    : plural(groups.length, noun);

  // ===== Tela =====
  return (
    <div className="category">
      <div className="category-header">
        <h1 className="category-title">{category}</h1>
        <span className="text-muted">{groupCountLabel}</span>
      </div>

      <div className="search-field category-search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          type="search"
          placeholder={`Search in ${category}...`}
          aria-label={`Search in ${category}`}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      {visibleGroups.length === 0 && <p className="text-muted">No {noun}s found.</p>}

      <div className="group-grid">
        {visibleGroups.map(g => {
          const { owned, total, pct } = getGroupProgress(g, ownedCards);
          // Solista não tem "Members" (seria sempre 1); evento só mostra "Sets"
          // se tiver mais de uma página (Hanbin Comics)
          const stats = [
            ['Cards', total],
            g.type === 'group' && ['Members', g.members],
            (g.type !== 'event' || g.sets > 1) && ['Sets', g.sets],
          ].filter(Boolean);

          return (
            <button key={g.code} type="button" className="group-card" onClick={() => onGroupSelect(g)}>
              <span className="group-card-info">
                <span className="group-card-name" style={{ fontSize: getNameSize(g.name) }}>{g.name}</span>
                <span className="group-card-stats">
                  {stats.map(([label, value]) => (
                    <span key={label} className="group-card-stat">
                      <span className="group-card-label">{label}</span>
                      <b>{value}</b>
                    </span>
                  ))}
                </span>
                <span className="group-card-progress">
                  <span className="progress group-card-bar">
                    <span className="progress-fill" style={{ width: `${pct}%` }} />
                  </span>
                  <span className="group-card-count">{owned} / {total}</span>
                </span>
              </span>
              <span className="group-card-photo">
                <span className="group-card-photo-img">
                  <GroupPhoto group={g} />
                </span>
                <span className="group-card-code">{g.tag}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
