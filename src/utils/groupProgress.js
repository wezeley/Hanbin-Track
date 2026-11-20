import { getGroupStructure } from './groupStructure';

export const getGroupProgress = (group, ownedCards) => {
  const cardsPerMember = getGroupStructure(group)
    .reduce((sum, set) => sum + set.rarities.length, 0);
  const total = group.members.length * cardsPerMember;
  const owned = ownedCards.filter(id => id.startsWith(`${group.code}#`)).length;
  const pct = total ? Math.round(owned / total * 100) : 0;
  return { owned, total, pct };
};
