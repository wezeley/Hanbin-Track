// Progresso de um grupo da lista GROUPS (src/data/groups.js).
// O total vem do index.json, então não precisa carregar as cartas do grupo.
export const getGroupProgress = (group, ownedCards) => {
  const total = group.cards;
  const owned = ownedCards.filter(id => id.startsWith(`${group.code}#`)).length;
  const pct = total ? Math.round(owned / total * 100) : 0;
  return { owned, total, pct };
};
