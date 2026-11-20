// ID da carta no bot: CODIGO#MEMBRO + número de 3 dígitos (SKZ#BC007)
export const getCardId = (group, member, setId, rarity) => {
  const seq = (setId - 1) * 5 + rarity + (member.offset || 0);
  return `${group.code}#${member.code}${String(seq).padStart(3, '0')}`;
};

// Imagem: link da planilha (member.links.s1h1) ou a pasta public/cards/
export const getCardImage = (group, member, setId, rarity) => {
  const link = member.links?.[`s${setId}h${rarity}`];
  if (link) return link;

  const folder = (group.folder || group.code).toUpperCase();
  const fileName = encodeURIComponent(getCardId(group, member, setId, rarity)).toUpperCase();
  return `${import.meta.env.BASE_URL}cards/${folder}/${fileName}.png`;
};
