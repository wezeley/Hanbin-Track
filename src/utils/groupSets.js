// Organiza as cartas de um grupo (arquivo da planilha) em sets para o fichário.
//
// Cada set fica assim:
//   {
//     id: 1,
//     members: [{ name, initial }, ...],  só quem tem carta neste set
//     rarities: [1, 2, 3, 4, 5],          só as raridades que existem neste set
//     rows: [{ rarity: 1, cards: [carta ou null, ...] }, ...],
//                                         uma linha por raridade, uma carta por membro
//                                         (null = esse membro não tem essa carta)
//     codes: ['SKZ#BC001', ...],          todos os IDs do set
//   }

const sameMember = (card, member) => card.member === member.name && card.initial === member.initial;
const byNumber = (a, b) => a - b;

export function getGroupSets(groupData) {
  // Carta sem set ou sem raridade (aviso no npm run planilha) não tem lugar no fichário.
  const cards = groupData.cards.filter(card => card.set !== null && card.rarity !== null);
  const setIds = [...new Set(cards.map(card => card.set))].sort(byNumber);

  return setIds.map(id => {
    const setCards = cards.filter(card => card.set === id);
    const members = groupData.members.filter(member => setCards.some(card => sameMember(card, member)));
    const rarities = [...new Set(setCards.map(card => card.rarity))].sort(byNumber);
    const rows = rarities.map(rarity => ({
      rarity,
      cards: members.map(member =>
        setCards.find(card => card.rarity === rarity && sameMember(card, member)) ?? null,
      ),
    }));
    return { id, members, rarities, rows, codes: setCards.map(card => card.code) };
  });
}
