import { useState } from 'react';
import { getGroupProgress } from '../utils/groupProgress';
import { plural } from '../utils/plural';
import BANNERS from '../data/banners.json';

function GroupPhoto({ group }) {
  const [failed, setFailed] = useState(false);
  const src = BANNERS[group.code];
  if (!src || failed) return null;

  const url = src.startsWith('http') ? src : `${import.meta.env.BASE_URL}${src}`;
  return <img src={url} alt="" loading="lazy" onError={() => setFailed(true)} />;
}

export function CategoryView({ category, groups, ownedCards, onGroupSelect }) {
  // ===== Cálculos =====
  const groupCountLabel = plural(groups.length, 'group');

  // ===== Tela =====
  return (
    <div className="category">
      <div className="category-header">
        <h1 className="category-title">{category}</h1>
        <span className="text-muted">{groupCountLabel}</span>
      </div>

      <div className="group-grid">
        {groups.map(g => {
          const { owned, total, pct } = getGroupProgress(g, ownedCards);
          const metaLabel = `${plural(g.members, 'member')} · ${plural(g.sets, 'set')} · ${plural(total, 'card')}`;

          return (
            <button key={g.code} type="button" className="group-card" onClick={() => onGroupSelect(g)}>
              <span className="group-card-photo">
                <GroupPhoto group={g} />
              </span>
              <span className="group-card-info">
                <span className="group-card-title">
                  <span className="group-card-name">{g.name}</span>
                  <span className="group-card-code">{g.code}</span>
                </span>
                <span className="group-card-meta">{metaLabel}</span>
                <span className="group-card-progress">
                  <span className="progress group-card-bar">
                    <span className="progress-fill" style={{ width: `${pct}%` }} />
                  </span>
                  <span className="group-card-count">{owned} / {total}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
