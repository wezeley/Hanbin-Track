import BANNERS from '../data/banners.json';

// Foto do card de um grupo: a do grupo (banners.json); evento sorteia uma das
// cartas dele cada vez que o card aparece. Usada nas categorias e na Home.
export const pickPhoto = (group) => group.photos?.length
  ? group.photos[Math.floor(Math.random() * group.photos.length)]
  : BANNERS[group.code];
