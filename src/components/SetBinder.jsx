import { useState } from 'react';
import { HANBIN_DATA } from '../data/hanbinData';
import { getCardId, getCardImage } from '../utils/cards';
import { getCardColumns } from '../utils/cardColumns';
import { plural } from '../utils/plural';
import { useElementWidth } from '../hooks/useElementWidth';
import { Card } from './Card';

// Cor usada enquanto um set novo não tiver cor em setColors
const NEUTRAL_COLORS = {
  spine: 'var(--color-divider)',
  back: 'var(--color-surface-muted)',
  edge: 'var(--color-border)',
  strong: 'var(--color-text-muted)',
};

function SetSymbol({ setId }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span>Set {setId}</span>;
  return (
    <img
      className="set-symbol"
      src={`${import.meta.env.BASE_URL}symbols/S${setId}.webp`}
      alt={`Set ${setId}`}
      onError={() => setFailed(true)}
    />
  );
}

export function SetBinder({ group, set, ownedCards, filter, isOpen, onToggleOpen, onToggleCard }) {
  const colors = HANBIN_DATA.setColors[set.id] || NEUTRAL_COLORS;
  const firstRarity = set.rarities[0];
  const lastRarity = set.rarities[set.rarities.length - 1];
  const setSize = group.members.length * set.rarities.length;

  // Mede a área das cartas da 1ª raridade (todas têm a mesma largura)
  const [cardsRef, cardsWidth] = useElementWidth();
  const columns = getCardColumns(group.members.length, cardsWidth);

  // ===== Cálculos =====
  const ownedInSet = 0; // PARTE 3
  const setPct = 0; // PARTE 3
  const isComplete = false; // PARTE 3

  return (
    <div
      className="binder"
      style={{
        '--set-spine': colors.spine,
        '--set-back': colors.back,
        '--set-edge': colors.edge,
        '--set-strong': colors.strong,
      }}
    >
      <div className="binder-back" aria-hidden="true" />
      <section className="binder-page">
        <div className="binder-spine" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <button type="button" className="set-header" onClick={onToggleOpen} aria-expanded={isOpen}>
          <span className="set-title">
            <SetSymbol setId={set.id} />
          </span>
          <span className="set-sub">
            {firstRarity}H – {lastRarity}H · {plural(setSize, 'card')}
          </span>
          <span className="set-progress">
            <span className="progress set-bar">
              <span className="progress-fill" style={{ width: `${setPct}%` }} />
            </span>
            <span className="set-count">{ownedInSet} / {setSize}</span>
          </span>
          {isComplete && <span className="set-complete">Complete</span>}
          <span className="set-chevron" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={isOpen ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="set-content">
            {set.rarities.map((r, i) => (
              <div key={r} className="rarity-row">
                <span className="rarity-row-label">{r}H</span>
                <div className="rarity-row-cards" ref={i === 0 ? cardsRef : undefined}>
                  <div className="cards-grid" style={{ '--cols': columns }}>
                    {group.members.map(m => {
                      const cardId = getCardId(group, m, set.id, r);
                      const isOwned = ownedCards.includes(cardId);
                      const isHidden = false; // PARTE 3 (filtro)

                      return (
                        <Card
                          key={cardId}
                          cardId={cardId}
                          label={`${m.name}, set ${set.id}, ${r}H, ${isOwned ? 'owned' : 'missing'}`}
                          imagePath={getCardImage(group, m, set.id, r)}
                          isOwned={isOwned}
                          isHidden={isHidden}
                          onToggle={onToggleCard}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
