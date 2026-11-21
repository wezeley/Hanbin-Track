// Progresso de um grupo da lista GROUPS (src/data/groups.js).
// O total vem do index.json, então não precisa carregar as cartas do grupo.
export const getGroupProgress = (group, ownedCards) => {
  const total = group.cards;
  // Solista tem a lista dos IDs (codes); grupo conta pelo começo do ID (SKZ#...).
  const owned = group.codes
    ? group.codes.filter(code => ownedCards.includes(code)).length
    : ownedCards.filter(id => id.startsWith(`${group.code}#`)).length;
  const pct = total ? Math.round(owned / total * 100) : 0;
  return { owned, total, pct };
};
