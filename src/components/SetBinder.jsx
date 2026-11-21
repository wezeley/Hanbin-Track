import { useState } from 'react';
import { HANBIN_DATA } from '../data/hanbinData';
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

// set vem de getGroupSets ou getEventSets (src/utils/groupSets.js)
// layout (o tipo do grupo):
//   'group'   cada raridade é uma linha, com uma carta por membro
//   'soloist' UMA faixa com as raridades lado a lado e a raridade embaixo de cada carta
//   'event'   UMA faixa com todas as cartas e o grupo de origem embaixo de cada uma
export function SetBinder({ set, ownedCards, filter, layout, isOpen, onToggleOpen, onToggleCard, onSetCardsOwned }) {
  const colors = HANBIN_DATA.setColors[set.id] || NEUTRAL_COLORS;
  const firstRarity = set.rarities[0];
  const lastRarity = set.rarities[set.rarities.length - 1];
  const setSize = set.codes.length;

  // Faixa (solista e evento): cada carta com o rótulo que vai embaixo dela.
  // Solista: só as raridades que existem no set (a que ainda não saiu não aparece).
  const isStrip = layout !== 'group';
  const stripSlots = layout === 'event'
    ? set.cards.map(card => ({ card, label: card.group }))
    : set.rows.map(row => ({ card: row.cards[0], label: `${row.rarity}H` }));

  // Mede a área das cartas da 1ª linha visível (todas têm a mesma largura)
  const [cardsRef, cardsWidth] = useElementWidth();
  const columns = getCardColumns(isStrip ? stripSlots.length : set.members.length, cardsWidth);

  // ===== Cálculos =====
  const ownedInSet = set.codes.filter(code => ownedCards.includes(code)).length;
  const setPct = setSize ? Math.round(ownedInSet / setSize * 100) : 0;
  const isComplete = setSize > 0 && ownedInSet === setSize;

  // Filtro: Owned esconde o que falta, Missing esconde o que tenho
  const isCardHidden = (isOwned) =>
    (filter === 'owned' && !isOwned) || (filter === 'missing' && isOwned);

  // Só mostra a raridade se pelo menos uma carta dela estiver visível
  const visibleRows = set.rows.filter(row =>
    row.cards.some(card => card && !isCardHidden(ownedCards.includes(card.code)))
  );
  // Faixa: só aparece se pelo menos uma carta estiver visível
  const hasVisibleSlot = stripSlots.some(({ card }) => !isCardHidden(ownedCards.includes(card.code)));

  // Clique no rótulo da raridade (1H, 2H...): se falta alguma carta da linha,
  // marca todas; se já tenho todas, desmarca todas. Bolso vazio (null) não conta.
  const rowCodes = (row) => row.cards.filter(Boolean).map(card => card.code);
  const isRowComplete = (row) => rowCodes(row).every(code => ownedCards.includes(code));
  const toggleRow = (row) => onSetCardsOwned(rowCodes(row), !isRowComplete(row));

  // Uma carta do fichário (igual para grupo, solista e evento)
  const renderCard = (card) => {
    const isOwned = ownedCards.includes(card.code);
    const where = layout === 'event' ? `${card.group}, ${set.title}` : `set ${set.id}, ${card.rarity}H`;
    return (
      <Card
        key={card.code}
        cardId={card.code}
        label={`${card.member}, ${where}, ${isOwned ? 'owned' : 'missing'}`}
        imagePath={card.link}
        isOwned={isOwned}
        isHidden={isCardHidden(isOwned)}
        onToggle={onToggleCard}
      />
    );
  };

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
            {/* Evento: o nome do bloco (DC, Marvel...) no lugar do símbolo S1 */}
            {set.title ? <span className="set-name">{set.title}</span> : <SetSymbol setId={set.id} />}
          </span>
          <span className="set-sub">
            {set.rarities.length > 0 && `${firstRarity}H – ${lastRarity}H · `}{plural(setSize, 'card')}
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

        {isOpen && isStrip && hasVisibleSlot && (
          <div className="set-content">
            <div ref={cardsRef}>
              <div className="cards-grid" style={{ '--cols': columns }}>
                {stripSlots.map(({ card, label }) => (
                  <div key={card.code} className="strip-slot">
                    {renderCard(card)}
                    <span className={`strip-slot-label ${layout === 'event' ? 'is-group' : ''}`} title={label}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {isOpen && !isStrip && visibleRows.length > 0 && (
          <div className="set-content">
            {visibleRows.map((row, i) => (
              <div key={row.rarity} className="rarity-row">
                <button
                  type="button"
                  className="rarity-row-label"
                  onClick={() => toggleRow(row)}
                  title={`${isRowComplete(row) ? 'Remove' : 'Mark'} all ${row.rarity}H`}
                >
                  {row.rarity}H
                </button>
                <div className="rarity-row-cards" ref={i === 0 ? cardsRef : undefined}>
                  <div className="cards-grid" style={{ '--cols': columns }}>
                    {row.cards.map((card, col) =>
                      // Membro sem essa carta: bolso vazio, para as colunas não andarem
                      card ? renderCard(card) : <div key={`empty-${col}`} className="card-slot-empty" aria-hidden="true" />
                    )}
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
