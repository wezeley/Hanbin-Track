// Tamanho da fonte do nome do grupo no card, pela MAIOR palavra do nome.
// O nome quebra entre palavras (até 2 linhas), nunca no meio de uma:
//   "Tomorrow X Together" (maior palavra 8)  -> 18px, "Tomorrow X / Together"
//   "TripleS Lovelution"  (maior palavra 10) -> 15px
//   "Hearts2Hearts"       (maior palavra 13) -> 13px
export const getNameSize = (name) => {
  const longestWord = Math.max(...name.split(' ').map(word => word.length));
  if (longestWord <= 9) return '18px';
  if (longestWord <= 12) return '15px';
  return '13px';
};
