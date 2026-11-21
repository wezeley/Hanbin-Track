import { getGroupProgress } from '../utils/groupProgress';
import { plural } from '../utils/plural';
import BANNERS from '../data/banners.json';
import { GroupCard } from './GroupCard';

// Foto do card: a do grupo (banners.json); evento sorteia uma das cartas dele
// cada vez que a categoria aparece.
const pickPhoto = (group) => group.photos?.length
  ? group.photos[Math.floor(Math.random() * group.photos.length)]
  : BANNERS[group.code];

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
            <GroupCard
              key={g.code}
              name={g.name}
              stats={stats}
              owned={owned}
              total={total}
              pct={pct}
              tag={g.tag}
              getPhoto={() => pickPhoto(g)}
              onClick={() => onGroupSelect(g)}
            />
          );
        })}
      </div>
    </div>
  );
}
