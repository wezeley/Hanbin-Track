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

  // Correções de nome, pelo código do grupo na planilha. O nome vem do título
  // da aba; o que estiver aqui sempre vence.
  groupNames: {
    AADT: "&Audition",   // a aba se chama "&Audition -The Howling-"
  },

  // Correções de categoria, pelo código do grupo na planilha.
  // A categoria vem da Wikipedia (npm run categorias -> categories.json);
  // o que estiver aqui sempre vence. Exemplo: AKMU: "Duos",
  // Grupos com "?" ou não achados aparecem em "Uncategorized" até entrarem aqui.
  groupCategories: {
    XG: "Co-Ed",
    NCT3: "Boy Group",   // NCT 2023
    THER: "Boy Group",   // The Rose (banda)
    LUCY: "Boy Group",   // Lucy (banda)
    CTY: "Boy Group",    // Catch The Young (banda)
    SAJA: "Boy Group",   // Saja Boys (KPop Demon Hunters)
    HTST: "Boy Group",   // Heartsteel (virtual, League of Legends)
    WHH: "Boy Group",    // Wolf Howl Harmony (japonês)
    MILK: "Boy Group",   // M!LK (japonês)
    A2OS: "Boy Group",   // A2O Soul
    A2OM: "Girl Group",  // A2O May (chinês)
    DICE: "Boy Group",   // DICE (tailandês)
    TNXX: "Boy Group",   // TUNEXX
    LVON: "Girl Group",  // Loveone
    ADYA: "Girl Group",  // ADYA (Starting House)
    TOZ: "Boy Group",    // TOZ (YY Entertainment)
    MAKA: "Girl Group",  // Maka'Maka (BLUEMOON)
    CMS: "Girl Group",   // cosmosy (japonês, em Seul)
    XNK: "Boy Group",    // Xonik
    SMRZ: "Girl Group",  // SMORZ (Hong Kong)
    AC2N: "Boy Group",   // Asc2nt (ex-DGNA)
    CHSR: "Boy Group",   // Chaser (HOWLING)
    NNEI: "Boy Group",   // NINE.i (FirstOne)
    WDBL: "Boy Group",   // Wild Blue (japonês)
    HPPC: "Girl Group",  // H//PE Princess
    CLVR: "Boy Group",   // Clo'ver (tailandês, Riser Music)
    CBB: "Boy Group",    // can't be blue (banda, "다섯 소년")
    AWU: "Girl Group",   // AWU (ex-PIXY)
    IRSE: "Girl Group",  // IRISÉ (girl group virtual)
    MWMU: "Girl Group",  // MW:MEU (girl group virtual)
    AADT: "Survival Shows", // &Audition -The Howling- (HYBE Japan)
    VIBY: "Boy Group",   // VIBY (japonês)
    ALST: "Co-Ed",       // Alien Stage (websérie: Mizi e Sua, Ivan e Till)
  },

  // Foto dos solistas: página da Wikipedia certa, pelo nome EXATAMENTE como na
  // planilha (Lisa e LiSA são pessoas diferentes). Quem está aqui não usa o
  // Deezer (nome repetido com outro artista). null = sem foto (fundo pastel),
  // melhor que uma foto errada. Depois de mudar, rode npm run categorias e
  // npm run fotos. Foto colocada à mão em public/banners/ sempre vence.
  soloistPhotoPages: {
    Lisa: "Lisa (rapper)",                     // BLACKPINK (LiSA é a japonesa)
    Adela: "Adéla",                            // Adéla Jergová (Dream Academy)
    Bibi: "Bibi (singer)",
    BM: "BM (rapper)",                         // KARD
    Dawn: "Dawn (rapper)",
    Dino: "Dino (South Korean singer)",        // SEVENTEEN
    Evan: "Evan (singer)",
    Fourth: "Nattawat Jirochtikul",
    Gemini: "Norawit Titicharoenrak",
    Hanbin: "Hanbin (singer)",                 // TEMPEST
    Hoshi: "Hoshi (South Korean singer)",      // SEVENTEEN
    Huta: "Hui (singer)",                      // PENTAGON
    Irene: "Irene (singer)",                   // Red Velvet
    Jin: "Jin (singer)",                       // BTS
    Jisoo: "Jisoo",                            // BLACKPINK
    Kai: "Kai (entertainer, born 1994)",       // EXO
    Kino: "Kino (singer)",                     // PENTAGON
    Lay: "Lay Zhang",                          // EXO
    "Lee Hangyul": "Lee Han-gyul",
    Leo: "Lee Leo",
    Lucas: "Lucas (rapper)",                   // NCT / WayV
    Mark: "Mark Lee (singer)",                 // NCT
    Somi: "Jeon Somi",
    "T.O.P": "T.O.P",                          // BIGBANG
    Taemin: "Taemin",                          // SHINee
    Ten: "Ten (singer)",                       // NCT / WayV
    Wendy: "Wendy (singer)",                   // Red Velvet
    Wonho: "Wonho",
    Yuna: "Yuna (singer, born 2003)",          // ITZY
    Keonhee: null,                             // ONEUS, sem página
    Leedo: null,                               // ONEUS, sem página
    Xion: null,                                // ONEUS, sem página
  },
};
