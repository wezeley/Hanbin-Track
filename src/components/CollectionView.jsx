import { useEffect, useState } from 'react';
import { GROUPS, loadGroup } from '../data/groups';
import { plural } from '../utils/plural';
import { shortDescription } from '../utils/description';
import { SetBinder } from './SetBinder';
import { CollectionCard } from './CollectionCard';

const PAGE_SIZE = 48; // divide certinho em 3 ou 4 cards por linha
const GROUPS_BY_CODE = new Map(GROUPS.map(group => [group.code, group]));

// Nome da coleção: a Description da planilha (sem "Concept Photos"...);
// sem ela, o set e a raridade
const collectionName = (collection) =>
  collection.name ? shortDescription(collection.name) : [collection.set && `Set ${collection.set}`, collection.rarity && `${collection.rarity}H`]
    .filter(Boolean).join(' · ');

// "Set 1 · 2H · 8 cards" (set e raridade só quando todas as cartas têm o mesmo)
const collectionMeta = (collection) => [
  collection.name && collection.set && `Set ${collection.set}`,
  collection.name && collection.rarity && `${collection.rarity}H`,
  plural(collection.codes.length, 'card'),
].filter(Boolean).join(' · ');

// "Set 2 · 1H" no card (só quando a coleção tem nome; sem nome, o nome já é isso)
const collectionSetLabel = (collection) => collection.name ? [
  collection.set && `Set ${collection.set}`,
  collection.rarity && `${collection.rarity}H`,
].filter(Boolean).join(' · ') : '';

const countOwned = (collection, owned) => collection.codes.filter(code => owned.has(code)).length;

// collections.json só é baixado quando a aba Collection abre
function useCollections() {
  const [collections, setCollections] = useState(null);
  useEffect(() => {
    import('../data/sheet/collections.json').then(module => setCollections(module.default));
  }, []);
  return collections;
}

// Aba Collection: a lista (collectionId null) ou uma coleção aberta.
export function CollectionView({ collectionId, ownedCards, onOpen, onBack, onToggleCard }) {
  const collections = useCollections();
  if (!collections) return <p className="text-muted">Loading collections...</p>;

  const collection = collectionId && collections.find(c => c.id === collectionId);
  if (collection) {
    return (
      <CollectionDetail
        key={collection.id}
        collection={collection}
        ownedCards={ownedCards}
        onBack={onBack}
        onToggleCard={onToggleCard}
      />
    );
  }
  return <CollectionList collections={collections} ownedCards={ownedCards} onOpen={onOpen} />;
}

function CollectionList({ collections, ownedCards, onOpen }) {
  const [query, setQuery] = useState('');
  const [shown, setShown] = useState(PAGE_SIZE);

  // ===== Cálculos =====
  const owned = new Set(ownedCards);
  // Várias palavras: cada uma no nome da coleção, no grupo ou no código ("skz season")
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const visible = collections.filter(collection => {
    if (words.length === 0) return true;
    const group = GROUPS_BY_CODE.get(collection.owner);
    const text = `${collectionName(collection)} ${group?.name ?? ''} ${group?.tag ?? ''}`.toLowerCase();
    return words.every(word => text.includes(word));
  });
  const countLabel = words.length
    ? `${visible.length} of ${plural(collections.length, 'collection')}`
    : plural(collections.length, 'collection');

  // ===== Tela =====
  return (
    <div className="category">
      <div className="category-header">
        <h1 className="category-title">Collection</h1>
        <span className="text-muted">{countLabel}</span>
      </div>

      <div className="search-field category-search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          type="search"
          placeholder="Search a comeback, photoshoot or group..."
          aria-label="Search collections"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShown(PAGE_SIZE); // busca nova começa do topo
          }}
        />
      </div>

      {visible.length === 0 && <p className="text-muted">No collections found.</p>}

      <div className="collection-grid">
        {visible.slice(0, shown).map(collection => {
          const group = GROUPS_BY_CODE.get(collection.owner);
          const total = collection.codes.length;
          // Todas as cartas: a imagem e se eu tenho (o card sorteia quais aparecem)
          const cards = collection.codes.map((code, i) => ({ cover: collection.covers[i], owned: owned.has(code) }));
          return (
            <CollectionCard
              key={collection.id}
              name={collectionName(collection)}
              group={group?.name ?? collection.owner}
              meta={collectionSetLabel(collection)}
              tag={group?.tag ?? collection.owner}
              cards={cards}
              owned={countOwned(collection, owned)}
              total={total}
              onClick={() => onOpen(collection)}
            />
          );
        })}
      </div>

      {shown < visible.length && (
        <button type="button" className="filter-pill load-more" onClick={() => setShown(n => n + PAGE_SIZE)}>
          Load more ({visible.length - shown} left)
        </button>
      )}
    </div>
  );
}

function CollectionDetail({ collection, ownedCards, onBack, onToggleCard }) {
  const group = GROUPS_BY_CODE.get(collection.owner);
  const [cards, setCards] = useState(null);
  const [isOpen, setIsOpen] = useState(true);

  // As cartas vêm do arquivo do dono (grupo, solista ou evento), na ordem da coleção
  useEffect(() => {
    let cancelled = false;
    loadGroup(collection.owner).then(data => {
      if (cancelled) return;
      const all = data.pages ? data.pages.flatMap(page => page.cards) : data.cards;
      const byCode = new Map(all.map(card => [card.code, card]));
      setCards(collection.codes.map(code => byCode.get(code)).filter(Boolean));
    });
    return () => { cancelled = true; };
  }, [collection]);

  // ===== Cálculos =====
  const have = countOwned(collection, new Set(ownedCards));
  const total = collection.codes.length;
  const pct = total ? Math.round(have / total * 100) : 0;
  // Uma página de fichário com todas as cartas, o membro embaixo de cada uma
  const set = cards && {
    id: collection.set ?? 1,
    title: group?.name ?? collection.owner,
    cards,
    codes: cards.map(card => card.code),
    members: [],
    rarities: [],
    rows: [],
  };

  // ===== Tela =====
  return (
    <div className="group-page">
      <button type="button" className="back-link" onClick={onBack}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back to Collection
      </button>

      <div className="group-header">
        <div className="group-header-text">
          <h1 className="group-title collection-title">{collectionName(collection)}</h1>
          <span className="text-muted">{group?.name ?? collection.owner} · {collectionMeta(collection)}</span>
        </div>
        <div className="group-header-progress">
          <div className="group-header-progress-row">
            <span className="text-muted">Collection progress</span>
            <b>{have} / {total}</b>
          </div>
          <div className="progress progress-lg group-header-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {!set && <p className="text-muted">Loading cards...</p>}
      {set && (
        <SetBinder
          set={set}
          ownedCards={ownedCards}
          filter="all"
          layout="collection"
          isOpen={isOpen}
          onToggleOpen={() => setIsOpen(open => !open)}
          onToggleCard={onToggleCard}
        />
      )}
    </div>
  );
}
