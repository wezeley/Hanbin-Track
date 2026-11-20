export const HANBIN_DATA = {
  botName: "HANBIN BOT TRACKER",
  // Nova lista de categorias
  categories: [
    "Boy Group",
    "Girl Group",
    "Soloists",
    "Co-Ed",
    "Duos",
    "Survival Shows",
    "Radiant",
    "Events",
    "Limiteds"
  ],
  rarities: [1, 2, 3, 4, 5],
  // Cores de cada set: spine = lombada, back = página de trás,
  // edge = bordas e argolas, strong = barra de progresso.
  // Quando sair um set novo, adicione a cor dele aqui e o símbolo
  // em public/symbols/S<numero>.webp.
  setColors: {
    1: { spine: "#CFF3F8", back: "#E6F9FB", edge: "#9ADDE8", strong: "#12A4BC" },
    2: { spine: "#E6DDFF", back: "#F1ECFF", edge: "#C3B2FA", strong: "#7C4DFF" },
    3: { spine: "#FFDCEB", back: "#FFEEF5", edge: "#F7A9C9", strong: "#E5468A" },
  },

  upcoming: [
    { group: "STRAY KIDS", info: "next release" },
    { group: "AESPA", info: "next release" },
    { group: "NCT DREAM", info: "next release" }
  ],

  // Categoria de cada grupo, pelo código da planilha.
  // Os grupos, membros, cartas e links vêm de src/data/sheet/ (npm run planilha).
  // Só aparecem no site os grupos que estão aqui; a parte 3 preenche o resto.
  groupCategories: {
    SKZ: "Boy Group",
    TWC: "Girl Group",
    ZB1: "Boy Group",
  },
};
