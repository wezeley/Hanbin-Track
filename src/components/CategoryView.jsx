import { useState } from 'react';
import { getGroupProgress } from '../utils/groupProgress';
import { plural } from '../utils/plural';
import { getNameSize } from '../utils/groupCard';
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
          const stats = [['Cards', total], ['Members', g.members], ['Sets', g.sets]];

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
                <span className="group-card-code">{g.code}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
