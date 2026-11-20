const MIN_CARD_WIDTH = 80;
const GAP = 10;

// Quantas colunas de cartas usar para que as linhas fiquem equilibradas:
// todo mundo numa linha se couber; senão 2 linhas iguais (9 → 5/4),
// senão 3, e assim por diante.
export const getCardColumns = (memberCount, width) => {
  if (!width) return memberCount;

  const fit = Math.max(1, Math.floor((width + GAP) / (MIN_CARD_WIDTH + GAP)));
  const rows = Math.ceil(memberCount / fit);
  return Math.ceil(memberCount / rows);
};
