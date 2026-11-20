import { useState } from 'react';
import { getGroupProgress } from '../utils/groupProgress';

function GroupPhoto({ src }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} />;
}

export function CategoryView({ category, groups, ownedCards, onGroupSelect }) {
  // ===== Cálculos =====
  const groupCountLabel = `${groups.length} groups`; // PARTE 2

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
          const metaLabel = `0 members · 0 sets · ${total} cards`; // PARTE 2

          return (
            <button key={g.code} type="button" className="group-card" onClick={() => onGroupSelect(g)}>
              <span className="group-card-photo">
                <GroupPhoto src={g.banner} />
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
