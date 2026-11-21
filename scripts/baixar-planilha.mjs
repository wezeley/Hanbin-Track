// Baixa a planilha do bot e gera os dados do site em src/data/sheet/.
// Uso: npm run planilha
//
// - Tudo vem da planilha: número, nome, código, membro, inicial, raridade e
//   link. O script nunca inventa um valor; quando algo falta ou está
//   estranho, ele avisa no resumo do final. Única regra que não vem da
//   planilha: carta de evento e de radiante é sempre 5H (regra do bot).
// - Carta sem link não entra (entra quando a planilha receber o link).
//   Exceção: os Limiteds entram com "link": null.
// - Baixa uma aba por vez, com pausa entre elas, para o Google não bloquear.
//   Demora alguns minutos.
// - Só grava os arquivos se tudo foi baixado. Se der erro no meio, nada muda.
//
// Arquivos gerados:
//   index.json      lista dos grupos (número, nome, código, cartas, membros, sets)
//                   e dos solistas (id, nome, inicial, cartas, sets, IDs das cartas)
//                   e dos eventos/Limiteds/radiantes (id, nome, tipo, cartas, páginas, fotos)
//   groups/<código>.json   as cartas de um grupo
//   events.json     Event Overview (blocos de evento + legenda Event/Limited)
//   radiants.json   Radiant Overview (blocos de radiantes)
//   todo.json       To-Do Order e To-Do Order Solo ("released" = já tem carta)

import { mkdir, rm, writeFile } from 'node:fs/promises';

const SHEET = 'https://docs.google.com/spreadsheets/d/REMOVIDO';
const OUT_DIR = new URL('../src/data/sheet/', import.meta.url);
const GROUPS_DIR = new URL('groups/', OUT_DIR);
const PAUSE_MS = 1000;      // espera entre um download e outro
const RETRY_WAIT_MS = 30000; // espera antes de tentar de novo, se o Google recusar
const MAX_TRIES = 4;
const SKIPPED_TABS = ['Booster + Patreon'];

// ---------- Avisos para o resumo do final ----------

const problems = [];
function warn(kind, where, detail) {
  problems.push({ kind, where, detail });
}

// ---------- Download ----------

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function download(url) {
  for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
    const res = await fetch(url);
    await sleep(PAUSE_MS);
    if (res.ok) return res.text();
    console.log(`   resposta ${res.status}, esperando ${RETRY_WAIT_MS / 1000}s (tentativa ${attempt} de ${MAX_TRIES})`);
    await sleep(RETRY_WAIT_MS * attempt);
  }
  throw new Error(`Não consegui baixar ${url}`);
}

// Lê a lista de abas da página htmlview: { name, gid } de cada uma.
async function listTabs() {
  const html = await download(`${SHEET}/htmlview`);
  const found = html.matchAll(/\{name: "((?:[^"\\]|\\.)*)", pageUrl: "[^"]*", gid: "(\d+)"/g);
  const tabs = new Map();
  for (const [, rawName, gid] of found) {
    const name = rawName
      .replace(/\\x([0-9a-f]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/\\(.)/g, '$1');
    tabs.set(gid, { name, gid });
  }
  return [...tabs.values()];
}

async function downloadTab(tab) {
  return parseCsv(await download(`${SHEET}/export?format=csv&gid=${tab.gid}`));
}

// ---------- CSV ----------

// Transforma o texto do CSV numa lista de linhas, cada linha uma lista de células.
// Respeita aspas: "a, b" é uma célula só, e "" dentro das aspas vira ".
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(cell.trim()); cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell.trim()); rows.push(row);
      row = []; cell = '';
    } else {
      cell += ch;
    }
  }
  if (cell || row.length) { row.push(cell.trim()); rows.push(row); }
  return rows;
}

// Acha a posição de cada coluna pelo nome no cabeçalho.
// Devolve null se faltar alguma das colunas pedidas.
function findColumns(header, names) {
  const columns = {};
  for (const name of names) {
    const index = header.findIndex(cell => cell === name);
    if (index === -1) return null;
    columns[name] = index;
  }
  return columns;
}

// ---------- Valores de cada carta ----------

// "3" -> 3. Qualquer coisa que não seja 1 a 5 vira null e entra na lista `invalid`.
function readRarity(value, code, invalid) {
  if (/^[1-5]$/.test(value)) return Number(value);
  invalid.push(`${code} "${value}"`);
  return null;
}

// Um aviso só por aba/bloco, com a quantidade e alguns exemplos.
function warnList(kind, where, list) {
  if (list.length === 0) return;
  const examples = list.slice(0, 6).join(', ');
  warn(kind, where, `${list.length}: ${examples}${list.length > 6 ? ', ...' : ''}`);
}

// Set de grupo: o número do fim do Code, de 5 em 5 (001–005 = 1, 006–010 = 2...).
function setFromCode(code, where) {
  const match = code.match(/(\d+)$/);
  if (!match) {
    warn('Code sem número', where, code);
    return null;
  }
  return Math.ceil(Number(match[1]) / 5);
}

// Set de solista: cada vez que a raridade se repete para o mesmo solista,
// começa um set novo (IU 001–005 = Set 1, 006–010 = Set 2).
function addSoloSets(cards) {
  const state = new Map(); // nome -> { set, seen: raridades já vistas no set }
  for (const card of cards) {
    if (!state.has(card.member)) state.set(card.member, { set: 1, seen: new Set() });
    const member = state.get(card.member);
    if (member.seen.has(card.rarity)) {
      member.set++;
      member.seen.clear();
    }
    member.seen.add(card.rarity);
    card.set = member.set;
  }
}

function readLink(value, code, missing) {
  if (value) return value;
  missing.push(code);
  return null;
}

// ---------- Overview ----------

// Colunas A, B, C: número, nome e código de cada grupo.
// O "0 - Solo" não está nessas colunas: ele é a linha "0" das colunas D e E.
function readOverview(rows) {
  const groups = new Map();
  for (const [number, name, code, soloNumber, soloName] of rows) {
    if (/^\d+$/.test(number) && name && code) groups.set(Number(number), { name, code });
    if (soloNumber === '0' && soloName) groups.set(0, { name: soloName, code: null });
  }
  return groups;
}

// ---------- Aba de grupo ----------

const GROUP_COLUMNS = ['Group', 'Short', 'Name', 'Initial', 'Rarity', 'Code', 'Link'];

// O nome é o título da aba, sem o número ("1 - Stray Kids" -> "Stray Kids"):
// é o que quase sempre está certo (a coluna Group e o Overview têm mais erros).
function readGroupTab(tab, number, rows) {
  const where = tab.name;
  const col = findColumns(rows[0] ?? [], GROUP_COLUMNS);
  if (!col) {
    warn('Aba em formato diferente', where, `cabeçalho: ${(rows[0] ?? []).filter(Boolean).join(' | ')}`);
    return null;
  }

  const cards = [];
  const seenCodes = new Set();
  const missingLinks = [];
  const invalidRarities = [];
  const groupNames = new Set();
  const shorts = new Set();

  for (const row of rows.slice(1)) {
    const code = row[col.Code];
    if (!code) continue; // linha vazia ou anotação fora da tabela
    if (seenCodes.has(code)) {
      warn('ID repetido', where, `${code} (ficou a primeira linha)`);
      continue;
    }
    seenCodes.add(code);
    groupNames.add(row[col.Group]);
    shorts.add(row[col.Short]);
    cards.push({
      code,
      member: row[col.Name],
      initial: row[col.Initial],
      rarity: readRarity(row[col.Rarity], code, invalidRarities),
      set: null,
      link: readLink(row[col.Link], code, missingLinks),
    });
  }

  if (cards.length === 0) {
    warn('Aba sem cartas', where, '');
    return null;
  }
  warnList('Sem link (não importadas)', where, missingLinks);
  warnList('Raridade inválida', where, invalidRarities);
  if (groupNames.size > 1) warn('Coluna Group com valores diferentes', where, [...groupNames].join(' | '));
  if (shorts.size > 1) warn('Coluna Short com valores diferentes', where, [...shorts].join(' | '));

  // O set é calculado com todas as cartas, antes de tirar as sem link,
  // para a numeração não mudar quando o link for colocado na planilha.
  const isSolo = number === 0;
  if (isSolo) addSoloSets(cards);
  else for (const card of cards) card.set = setFromCode(card.code, where);

  // Carta sem link não vai para o site.
  const imported = cards.filter(card => card.link);
  if (imported.length === 0) {
    warn('Grupo sem nenhuma carta com link (não importado)', where, '');
    return null;
  }

  // Membros na ordem em que aparecem. Cada membro é o par nome + inicial:
  // no Boys II Planet há dois "Kim Dong Hyun" (DH e DN), que são pessoas diferentes.
  const members = new Map();
  for (const card of imported) {
    const key = `${card.member}|${card.initial}`;
    if (!members.has(key)) members.set(key, { name: card.member, initial: card.initial });
  }
  const names = [...members.values()].map(m => m.name);
  const sameName = names.filter((name, i) => names.indexOf(name) !== i);
  for (const name of new Set(sameName)) {
    const initials = [...members.values()].filter(m => m.name === name).map(m => m.initial);
    warn('Membros com o mesmo nome (mantidos separados)', where, `${name}: ${initials.join(', ')}`);
  }

  return {
    number,
    name: tab.name.slice(tab.name.indexOf(' - ') + 3).trim(),
    code: [...shorts][0],
    type: isSolo ? 'solo' : 'group',
    members: [...members.values()],
    cards: imported,
  };
}

// ---------- Event Overview e Radiant Overview ----------

// Regra do bot (não está na planilha): toda carta de evento e de radiante é 5H.
const EVENT_RARITY = 5;

// As duas abas são blocos: uma linha só com o nome (na coluna A), depois as cartas.
// O Radiant Overview tem coluna Rarity: ela é conferida, mas a carta fica sempre 5H.
function readBlocks(rows, where, hasRarityColumn) {
  const names = ['ID / No.', 'Group', 'Short', 'Name', 'Initial', 'Code', 'Link'];
  if (hasRarityColumn) names.push('Rarity');
  const col = findColumns(rows[0] ?? [], names);
  if (!col) {
    warn('Aba em formato diferente', where, `cabeçalho: ${(rows[0] ?? []).filter(Boolean).join(' | ')}`);
    return [];
  }

  const blocks = [];
  const seenCodes = new Set();
  const cardCells = ['Group', 'Short', 'Name', 'Initial', 'Code', 'Link'].map(name => col[name]);

  for (const row of rows.slice(1)) {
    const code = row[col.Code];
    const first = row[col['ID / No.']];

    if (!code) {
      // Linha de título: só a coluna A preenchida.
      if (first && cardCells.every(i => !row[i])) {
        blocks.push({ name: first, number: null, cards: [], invalidRarities: [] });
      }
      continue;
    }

    const block = blocks.at(-1);
    if (!block) {
      warn('Carta antes do primeiro bloco', where, code);
      continue;
    }
    const blockWhere = `${where} › ${block.name}`;
    if (seenCodes.has(code)) {
      warn('ID repetido', blockWhere, `${code} (ficou a primeira linha)`);
      continue;
    }
    seenCodes.add(code);
    if (block.number === null && /^\d+$/.test(first)) block.number = Number(first);

    // Do Pool Party em diante, o Event Overview vem com as colunas trocadas:
    // Group tem o membro, Short tem o grupo e Name tem o código do evento (PPTY).
    // Reconhece pelo conteúdo, não pela posição: se Name for o código do evento,
    // lê o membro em Group e o grupo em Short.
    const swapped = row[col.Name] === code.split('#')[0];
    const card = {
      code,
      group: swapped ? row[col.Short] : row[col.Group],
      member: swapped ? row[col.Group] : row[col.Name],
      initial: row[col.Initial],
      rarity: EVENT_RARITY,
    };
    if (hasRarityColumn && row[col.Rarity] !== String(EVENT_RARITY)) {
      block.invalidRarities.push(`${code} "${row[col.Rarity]}"`);
    }
    // Sem link fica null; o aviso sai em dropMissingLinks, que sabe se é Limited.
    card.link = row[col.Link] || null;
    block.cards.push(card);
  }

  const result = [];
  for (const { invalidRarities, ...block } of blocks) {
    const blockWhere = `${where} › ${block.name}`;
    warnList(`Coluna Rarity diferente de ${EVENT_RARITY} (usado ${EVENT_RARITY})`, blockWhere, invalidRarities);
    if (block.cards.length === 0) warn('Bloco sem cartas (ignorado)', blockWhere, '');
    else result.push({ ...block, code: block.cards[0].code.split('#')[0] });
  }
  return result;
}

// Legenda do Event Overview: a partir da célula "Event" (linha 1) e
// "Limited" (linha 2), os códigos até a coluna "since last".
function readEventLegend(rows) {
  const start = rows[0].indexOf('Event');
  const end = rows[0].findIndex(cell => cell.startsWith('since last'));
  if (start === -1 || end === -1 || rows[1][start] !== 'Limited') {
    warn('Aba em formato diferente', 'Event Overview', 'legenda Event/Limited não encontrada');
    return { event: [], limited: [] };
  }
  const pick = row => row.slice(start + 1, end).filter(Boolean);
  return { event: pick(rows[0]), limited: pick(rows[1]) };
}

// Tira dos blocos as cartas sem link (não vão para o site).
// Exceção: os Limiteds entram mesmo sem link (o site usa a imagem de reserva).
// Fica para depois de addEventKinds, que marca quem é Limited e confere as 6 cartas.
function dropMissingLinks(blocks, where) {
  const result = [];
  for (const block of blocks) {
    const blockWhere = `${where} › ${block.name}`;
    const missing = block.cards.filter(card => !card.link).map(card => card.code);
    if (block.kind === 'limited') {
      warnList('Limited sem link (importadas com imagem de reserva)', blockWhere, missing);
      result.push(block);
      continue;
    }
    warnList('Sem link (não importadas)', blockWhere, missing);
    const cards = block.cards.filter(card => card.link);
    if (cards.length) result.push({ ...block, cards });
    else warn('Bloco sem nenhuma carta com link (não importado)', blockWhere, '');
  }
  return result;
}

// Marca cada bloco como "event" ou "limited" pela legenda.
// Limited sempre tem 6 cartas; se não tiver, avisa.
const LIMITED_SIZE = 6;
function addEventKinds(blocks, legend) {
  for (const block of blocks) {
    if (legend.limited.includes(block.code)) block.kind = 'limited';
    else if (legend.event.includes(block.code)) block.kind = 'event';
    else {
      block.kind = null;
      warn('Evento fora da legenda Event/Limited', `Event Overview › ${block.name}`, block.code);
    }
    if (block.kind === 'limited' && block.cards.length !== LIMITED_SIZE) {
      warn(`Limited sem ${LIMITED_SIZE} cartas`, `Event Overview › ${block.name}`, `${block.cards.length} cartas`);
    }
  }
}

// ---------- To-Do ----------

// Cabeçalho: colunas "N Heart" agrupadas por set, separadas por uma coluna
// com o número do set seguinte ("2", "3"...). O primeiro grupo é o set 1.
function readTodo(rows, where) {
  const header = rows[0] ?? [];
  const columns = [];
  let set = 1;
  header.forEach((title, index) => {
    const names = rows.slice(1).map(row => row[index]).filter(Boolean);
    if (/^\d+$/.test(title)) {
      set = Number(title);
      if (names.length) warn('Coluna de set com nomes', where, `coluna "${title}": ${names.join(', ')}`);
      return;
    }
    const heart = title.match(/(\d) Heart/);
    if (!heart) {
      if (title || names.length) warn('Coluna desconhecida', where, `"${title}"`);
      return;
    }
    columns.push({ set, rarity: Number(heart[1]), header: title, names });
  });
  return columns;
}

// ---------- To-Do: o que já foi lançado ----------

// Nome "solto", para comparar jeitos diferentes de escrever (NCT127 e NCT 127).
const looseName = name => name.toLowerCase().replace(/[^a-z0-9]/g, '');

// Dono do nome: primeiro o nome exato (LISA e LiSA são pessoas diferentes);
// se não achar, o nome solto, mas só se der um único resultado.
function findOwners(name, owners) {
  const exact = owners.filter(owner => owner.name === name);
  if (exact.length > 0) return exact;
  const loose = owners.filter(owner => looseName(owner.name) === looseName(name));
  return loose.length === 1 ? loose : [];
}

// released = nomes da coluna que já têm carta naquele set e raridade.
// A coluna "Ideas" não é usada no site, então não é conferida.
function addReleased(columns, owners, where) {
  for (const column of columns) {
    if (/Ideas/i.test(column.header)) {
      column.released = [];
      continue;
    }
    column.released = column.names.filter(name =>
      findOwners(name, owners).some(owner =>
        owner.cards.some(card => card.set === column.set && card.rarity === column.rarity)));
    warnList('Já lançado, mas ainda na To-Do', `${where} › Set ${column.set} · ${column.rarity}H`, column.released);
  }
}

// ---------- Solistas ----------

// Cada solista da aba "0 - Solo" vira um "grupo" no site. O id é o código da
// 1ª carta (SOLO#LS001 -> SOLO-LS001): Lisa e LiSA têm a mesma inicial (LS),
// mas nunca a mesma carta. "codes" serve para contar o progresso de cada um.
function soloSummary(solo) {
  return solo.members.map(member => {
    const cards = solo.cards.filter(card => card.member === member.name && card.initial === member.initial);
    return {
      id: cards[0].code.replace('#', '-'),
      name: member.name,
      initial: member.initial,
      cards: cards.length,
      sets: Math.max(0, ...cards.map(card => card.set ?? 0)),
      codes: cards.map(card => card.code),
    };
  });
}

// ---------- Eventos, Limiteds e Radiantes ----------

// Cada evento, Limited e radiante vira um "grupo" no site, com o código do
// bloco como id (SS24, CHLV...). Blocos com o mesmo código viram um só, com
// uma página por bloco (Hanbin Comics: DC, Marvel e Invincible); o nome vem
// do Overview. "photos" são os links das cartas: o site sorteia um para o card.
function eventSummary(blocks) {
  const byCode = new Map();
  for (const block of blocks) {
    if (!byCode.has(block.code)) byCode.set(block.code, []);
    byCode.get(block.code).push(block);
  }
  return [...byCode].map(([code, parts]) => {
    const cards = parts.flatMap(part => part.cards);
    return {
      id: code,
      name: parts.length > 1 ? (overview.get(parts[0].number)?.name ?? parts[0].name) : parts[0].name,
      kind: parts[0].kind ?? 'event', // fora da legenda (já avisado) conta como evento
      cards: cards.length,
      sets: parts.length,
      photos: cards.map(card => card.link).filter(Boolean),
    };
  });
}

// ---------- Gravar ----------

// JSON com 2 espaços, mas cada objeto simples (uma carta, um membro) numa linha só.
function formatJson(data) {
  const text = JSON.stringify(data, null, 2)
    .replace(/\{\n\s+([^{}[\]]*?)\n\s*\}/g, (_, inner) => `{ ${inner.replace(/\n\s+/g, ' ')} }`);
  return text + '\n';
}

async function save(url, data) {
  await writeFile(url, formatJson(data));
}

// ---------- Programa ----------

console.log('Lendo a lista de abas...');
const tabs = await listTabs();
const byName = name => {
  const tab = tabs.find(t => t.name === name);
  if (!tab) throw new Error(`Aba "${name}" não encontrada na planilha`);
  return tab;
};

console.log('Baixando Overview, Event Overview, Radiant Overview e To-Do...');
const overview = readOverview(await downloadTab(byName('Overview')));
const eventRows = await downloadTab(byName('Event Overview'));
const radiantRows = await downloadTab(byName('Radiant Overview'));
const todoRows = await downloadTab(byName('To-Do Order'));
const todoSoloRows = await downloadTab(byName('To-Do Order Solo'));

const events = { legend: readEventLegend(eventRows), blocks: readBlocks(eventRows, 'Event Overview', false) };
addEventKinds(events.blocks, events.legend);
const radiants = { blocks: readBlocks(radiantRows, 'Radiant Overview', true) };
const todo = { groups: readTodo(todoRows, 'To-Do Order'), solo: readTodo(todoSoloRows, 'To-Do Order Solo') };

// Abas que já vêm dos Overviews não são baixadas como grupo. Reconhece pelo
// código ou pelo nome do bloco (às vezes o código do Overview é diferente
// do das cartas: Bloodmoon Parade é BDPR no Overview e BMPR nas cartas).
const overviewBlocks = [...events.blocks, ...radiants.blocks];
const blockCodes = new Set([...events.legend.event, ...events.legend.limited, ...overviewBlocks.map(b => b.code)]);
const blockNames = new Set(overviewBlocks.map(b => b.name.toLowerCase()));
const isFromOverview = official =>
  official && (blockCodes.has(official.code) || blockNames.has(official.name.toLowerCase()));

// O número do bloco só serve para abas que NÃO têm formato de grupo
// (Winter Special: código e nome diferentes, mas o número 120 bate).
// Não dá para confiar só nele: as cartas do Farmer Market (aba 344) estão
// com o número 341, que é a aba do VIBY.
const blockNumbers = new Set(overviewBlocks.map(b => b.number).filter(n => n !== null));

// Só agora tira as cartas sem link dos eventos e radiantes: a lista acima
// precisa de todos os blocos, mesmo os que ficaram sem nenhuma carta com link.
events.blocks = dropMissingLinks(events.blocks, 'Event Overview');
radiants.blocks = dropMissingLinks(radiants.blocks, 'Radiant Overview');

const groupTabs = tabs.filter(tab => /^\d+ - /.test(tab.name));
const otherTabs = tabs.filter(tab => !/^\d+ - /.test(tab.name)).map(tab => tab.name);
const skippedAsEvent = [];
const groups = [];

for (const [i, tab] of groupTabs.entries()) {
  const number = Number(tab.name.split(' - ')[0]);
  const official = overview.get(number);
  if (isFromOverview(official)) {
    skippedAsEvent.push(tab.name);
    continue;
  }

  console.log(`[${i + 1}/${groupTabs.length}] ${tab.name}`);
  const rows = await downloadTab(tab);
  if (!findColumns(rows[0] ?? [], GROUP_COLUMNS) && blockNumbers.has(number)) {
    skippedAsEvent.push(tab.name);
    continue;
  }
  const group = readGroupTab(tab, number, rows);
  if (!group) continue;

  if (number !== 0) {
    if (!official) warn('Grupo fora do Overview', tab.name, `${group.name} (${group.code})`);
    else if (official.code !== group.code) {
      warn('Código diferente do Overview', tab.name, `aba: ${group.code}, Overview: ${official.code}`);
    }
  }
  groups.push(group);
}

// To-Do: marca o que já tem carta. O Solo vira uma lista de solistas,
// cada um com as próprias cartas, para comparar igual aos grupos.
const solo = groups.find(group => group.type === 'solo');
const soloists = (solo?.members ?? []).map(member => ({
  name: member.name,
  cards: solo.cards.filter(card => card.member === member.name),
}));
addReleased(todo.groups, groups.filter(group => group.type === 'group'), 'To-Do Order');
addReleased(todo.solo, soloists, 'To-Do Order Solo');

// Tudo baixado: agora sim apaga os arquivos antigos e grava os novos.
await rm(GROUPS_DIR, { recursive: true, force: true });
await mkdir(GROUPS_DIR, { recursive: true });

// O "type" só vai para o index.json; o arquivo do grupo não precisa dele.
for (const { type: _type, ...group } of groups) {
  await save(new URL(`${group.code}.json`, GROUPS_DIR), group);
}
await save(new URL('index.json', OUT_DIR), {
  updatedAt: new Date().toISOString(),
  groups: groups.map(g => ({
    number: g.number,
    name: g.name,
    code: g.code,
    type: g.type,
    cards: g.cards.length,
    members: g.members.length,
    sets: Math.max(0, ...g.cards.map(c => c.set ?? 0)),
  })),
  soloists: solo ? soloSummary(solo) : [],
  events: eventSummary([
    ...events.blocks,
    ...radiants.blocks.map(block => ({ ...block, kind: 'radiant' })),
  ]),
});
await save(new URL('events.json', OUT_DIR), events);
await save(new URL('radiants.json', OUT_DIR), radiants);
await save(new URL('todo.json', OUT_DIR), todo);

// ---------- Resumo ----------

const count = list => list.reduce((sum, b) => sum + b.cards.length, 0);
console.log('\n===== Resumo =====');
console.log(`Abas na planilha: ${tabs.length}`);
console.log(`Grupos gravados: ${groups.length} (${count(groups)} cartas)`);
console.log(`Eventos: ${events.blocks.length} blocos (${count(events.blocks)} cartas)`);
console.log(`Radiantes: ${radiants.blocks.length} blocos (${count(radiants.blocks)} cartas)`);
console.log(`Abas de evento/radiante puladas (vêm dos Overviews): ${skippedAsEvent.length}`);
console.log(`Outras abas: ${otherTabs.join(', ')} (${SKIPPED_TABS.join(', ')} fica de fora)`);

const kinds = [...new Set(problems.map(p => p.kind))];
console.log(`\nProblemas: ${problems.length}`);
for (const kind of kinds) {
  const list = problems.filter(p => p.kind === kind);
  console.log(`\n-- ${kind} (${list.length})`);
  for (const p of list) console.log(`   ${p.where}${p.detail ? ': ' + p.detail : ''}`);
}
