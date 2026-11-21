// Monta src/data/sheet/collections.json: as coleções da aba Collection.
// Uso: npm run colecoes (só lê os arquivos de src/data/sheet/, não baixa nada).
// O npm run planilha também roda isto no final.
//
// Ordem: as mais novas primeiro, pelo history.json (o fim da planilha primeiro).
// Coleção = as cartas de um grupo (ou solista) com a mesma Description da
// planilha: o comeback, o Season's Greetings, o photoshoot ("ATE - Concept
// Photos"). Carta sem Description fica numa coleção pelo set e raridade (name
// null; o site mostra "Set 1 · 1H"). Evento, Limited e radiante não têm
// Description: cada bloco é uma coleção, com o nome do bloco.
//
// Formato, uma coleção por linha:
//   { id: "SKZ-1", owner: "SKZ", name: "ATE - Concept Photos", set: 1, rarity: 2, covers: [...], codes: [...] }
// covers: a imagem de cada carta (na mesma ordem de codes); o site sorteia
// algumas para o leque do card na aba Collection. Link do Imgur fica só com o
// nome do arquivo ("qlY9f5o.png"), para o arquivo ficar menor; sem link: null.
// owner é o code do grupo no site (SKZ, SOLO-LS001, SS24). set e rarity ficam
// null se as cartas da coleção forem de sets ou raridades diferentes.

import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const SHEET_DIR = new URL('../src/data/sheet/', import.meta.url);
const readJson = async name => JSON.parse(await readFile(new URL(name, SHEET_DIR), 'utf8'));

// Posição de cada carta, da mais nova (0) para a mais antiga, pelo history.json
// (npm run historico): os dias mais recentes primeiro e, dentro de cada dia (e
// no baseline, o que já existia), na ordem em que estão lá, que já é das mais
// novas para as mais antigas. Sem histórico: mapa vazio.
async function newestRanks() {
  const rank = new Map();
  try {
    const history = await readJson('history.json');
    for (const entry of [...history].reverse()) {
      for (const code of entry.codes) if (!rank.has(code)) rank.set(code, rank.size);
    }
  } catch {
    // ainda não existe
  }
  return rank;
}

// Valor comum a todas as cartas, ou null se for diferente em alguma
const common = (cards, field) => cards.every(card => card[field] === cards[0][field]) ? cards[0][field] : null;

// Imagens do leque: todas as cartas (Limiteds ainda não têm link: null)
const IMGUR = /^https:\/\/i\.imgur\.com\/([\w]+\.\w+)$/;
const shortLink = link => link?.match(IMGUR)?.[1] ?? link ?? null;
const coversOf = cards => cards.map(card => shortLink(card.link));

// Agrupa as cartas de um dono pela Description (ou pelo set e raridade, se não tiver),
// na ordem em que aparecem na planilha.
function collectionsOf(owner, cards) {
  const byKey = new Map();
  for (const card of cards) {
    const key = card.description ?? `sem descrição|${card.set}|${card.rarity}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(card);
  }
  return [...byKey.values()].map((list, i) => ({
    id: `${owner}-${i + 1}`,
    owner,
    name: list[0].description ?? null,
    set: common(list, 'set'),
    rarity: common(list, 'rarity'),
    covers: coversOf(list),
    codes: list.map(card => card.code),
  }));
}

export async function buildCollections() {
  const index = await readJson('index.json');
  const collections = [];

  for (const group of index.groups.filter(g => g.type === 'group')) {
    const data = await readJson(`groups/${group.code}.json`);
    collections.push(...collectionsOf(group.code, data.cards));
  }

  // Solistas: o dono é o id do solista (SOLO-LS001), pelas cartas dele
  const solo = await readJson('groups/SOLO.json');
  for (const soloist of index.soloists ?? []) {
    const codes = new Set(soloist.codes);
    collectionsOf(soloist.id, solo.cards.filter(card => codes.has(card.code)))
      .forEach(collection => collections.push(collection));
  }

  // Eventos e radiantes: cada bloco é uma coleção (Hanbin Comics tem 3: DC, Marvel, Invincible)
  const events = await readJson('events.json');
  const radiants = await readJson('radiants.json');
  const blockCount = new Map();
  for (const block of [...events.blocks, ...radiants.blocks]) {
    const n = (blockCount.get(block.code) ?? 0) + 1;
    blockCount.set(block.code, n);
    collections.push({
      id: `${block.code}-${n}`,
      owner: block.code,
      name: block.name,
      set: null,
      rarity: null,
      covers: coversOf(block.cards),
      codes: block.cards.map(card => card.code),
    });
  }

  // Mais novas primeiro, pelo history.json: cada coleção vai na posição da
  // sua carta mais nova (sem histórico, fica na ordem da planilha)
  const rank = await newestRanks();
  const rankOf = collection => Math.min(...collection.codes.map(code => rank.get(code) ?? Infinity));
  collections.sort((a, b) => rankOf(a) - rankOf(b));

  await writeFile(
    new URL('collections.json', SHEET_DIR),
    `[\n${collections.map(c => JSON.stringify(c)).join(',\n')}\n]\n`,
  );
  return collections.length;
}

// Rodado direto (npm run colecoes), e não importado pelo npm run planilha
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(`collections.json: ${await buildCollections()} coleções`);
}
