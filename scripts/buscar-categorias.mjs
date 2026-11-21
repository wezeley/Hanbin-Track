// Descobre a categoria de cada grupo (Boy Group, Girl Group...) pela Wikipedia
// e salva o palpite em src/data/categories.json, junto com a foto da página.
// Uso: npm run categorias
//
// - Grupo que já está no categories.json não é perguntado de novo. Para
//   refazer um grupo, apague a linha dele e rode de novo.
// - Para corrigir uma categoria, NÃO edite o categories.json: coloque o grupo
//   em groupCategories (src/data/hanbinData.js). A correção sempre vence.
// - Pergunta devagar (uma pergunta a cada 5 segundos) e, se a Wikipedia pedir
//   para esperar, espera o tempo que ela pedir. Salva a cada pergunta: se parar
//   no meio, na próxima vez continua de onde parou.
//
// Como decide:
//   1. Grupo com 2 membros na planilha é Duos.
//   2. Procura a página pelo nome exato: "Nome", "Nome (group)", "Nome (band)"...
//   3. Se não achar, usa a busca, mas só aceita se o título da página for o
//      nome do grupo (a busca às vezes devolve outro grupo: TXT -> IVE).
//   4. Categoria da página -> categoria do site (CATEGORY_RULES), de qualquer
//      país (South Korean, Japanese, Thai...).
//   5. Página sem nenhuma dessas categorias: lê a primeira frase do artigo
//      ("Illit is a South Korean girl group").
//   6. Ainda "?": se todos os membros estão em outros grupos da planilha,
//      guarda esses grupos em "parents" (subunidade; o site herda a categoria).
//   7. Ainda "?": tenta a Wikipedia coreana ("보이 밴드", "걸그룹"...).
//   8. Ainda "?" e sem correção manual: tenta o K-pop Wiki (Fandom),
//      categorias "Male groups" / "Female groups".
//
// Fotos: a oficial do Deezer ("deezerPhoto") e, de reserva, a da Wikipedia
// ("photo"). O npm run fotos usa a primeira que existir.
// (O K-pop Wiki não serve para fotos: o servidor de imagens dele bloqueia
// downloads que não venham do próprio site.)
//   Se der mais de uma categoria, ou nenhuma, fica "?" para revisar.

import { readFile, writeFile } from 'node:fs/promises';
import { HANBIN_DATA } from '../src/data/hanbinData.js';

const INDEX = new URL('../src/data/sheet/index.json', import.meta.url);
const OUT = new URL('../src/data/categories.json', import.meta.url);
const API = 'https://en.wikipedia.org/w/api.php';
// A Wikipedia pede que todo programa diga quem é e como achar o responsável.
const HEADERS = { 'User-Agent': 'HanbinTracker/1.0 (https://github.com/wezeley/Hanbin-Track)' };
const PAUSE_MS = 5000;
const MIN_RETRY_MS = 60000;
const MAX_TRIES = 4;
const MAX_TITLES = 50; // limite da Wikipedia por pergunta
const PHOTO_WIDTH = 480;

// Categoria da Wikipedia -> categoria do site. O começo (país) pode ser qualquer um:
// "South Korean boy bands", "Japanese boy bands", "Thai boy bands"...
const CATEGORY_RULES = [
  [/ boy bands$/, 'Boy Group'],
  [/ girl groups$/, 'Girl Group'],
  [/ co-ed groups$|^Mixed-gender bands$/, 'Co-Ed'],
  [/ musical duos$/, 'Duos'],
  [/competition television series$/, 'Survival Shows'],
];

// Grupos mais novos não têm mais "girl groups"/"boy bands" nas categorias da
// Wikipedia. Para eles, a primeira frase do artigo diz: "Illit is a South Korean girl group".
const LEAD_RULES = [
  [/\bgirl (group|band)s?\b/i, 'Girl Group'],
  [/\bboy (band|group)s?\b/i, 'Boy Group'],
  [/\bco-ed\b|\bmixed-gender\b/i, 'Co-Ed'],
  [/\bduos?\b/i, 'Duos'],
  [/\bsurvival\b|\bcompetition\b|\breality show\b/i, 'Survival Shows'],
];
// Se a primeira frase não fala de grupo/banda, a página é de outra coisa
// com o mesmo nome (SMORZ -> um cereal, QQQ -> uma TV australiana).
// "group" sozinho não basta ("owned by Seven Media Group"): precisa ser
// "girl group", "rock band", "vocal group"... ou sub-unit, duo, show.
const LEAD_IS_GROUP = /\b(girl|boy|idol|vocal|pop|rock|dance|hip[- ]hop|music(al)?|k-pop|j-pop|virtual|co-ed|mixed-gender)\s+(group|band|duo)s?\b|\bsub-?units?\b|\bduos?\b|\bshows?\b/i;
const MAX_EXTRACTS = 20; // limite da Wikipedia para a primeira frase por pergunta

// Wikipedia coreana, para quem continuar "?": "대한민국의 5인조 보이 밴드"
const KO_API = 'https://ko.wikipedia.org/w/api.php';
const KO_RULES = [
  [/걸\s?그룹|걸\s?밴드/, 'Girl Group'],
  [/보이\s?그룹|보이\s?밴드/, 'Boy Group'],
  [/혼성/, 'Co-Ed'],
  [/듀오/, 'Duos'],
  [/서바이벌|오디션 프로그램/, 'Survival Shows'],
];

// K-pop Wiki (Fandom), para quem ainda continuar "?": cobre grupos pequenos
// e novos que a Wikipedia não tem. Categorias "Male groups", "Female groups"...
const FANDOM_API = 'https://kpop.fandom.com/api.php';
// Subunidades ficam em "Male subunits" (NCT WISH), não em "Male groups".
const FANDOM_RULES = [
  [/^Male (groups|bands|subunits)$/i, 'Boy Group'],
  [/^Female (groups|bands|subunits)$/i, 'Girl Group'],
  [/^Co-ed (groups|bands|subunits)$/i, 'Co-Ed'],
];

const GROUP_FILE = code => new URL(`../src/data/sheet/groups/${code}.json`, import.meta.url);

// ---------- Wikipedia ----------

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function ask(params, api = API) {
  const url = `${api}?${new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', maxlag: '5', ...params })}`;
  for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
    const res = await fetch(url, { headers: HEADERS });
    await sleep(PAUSE_MS);
    const data = res.ok ? await res.json() : null;
    if (data && !data.error) return data;

    // Só espera e tenta de novo quando é limite de acesso; outro erro
    // (pergunta errada, títulos demais...) para na hora com a mensagem.
    const isRateLimit = res.status === 429 || res.status >= 500 || ['maxlag', 'ratelimited'].includes(data?.error?.code);
    if (!isRateLimit) {
      throw new Error(`Erro da API (${data?.error?.code ?? res.status}): ${data?.error?.info ?? 'sem detalhes'}`);
    }

    // Retry-After: quantos segundos a Wikipedia quer que a gente espere
    const asked = Number(res.headers.get('retry-after')) * 1000 || 0;
    const wait = Math.max(MIN_RETRY_MS * attempt, asked);
    const reason = data?.error?.code ?? res.status;
    console.log(`   Wikipedia pediu para esperar (${reason}): ${Math.round(wait / 1000)}s, tentativa ${attempt} de ${MAX_TRIES}`);
    await sleep(wait);
  }
  throw new Error('A Wikipedia não respondeu. O que já foi descoberto está salvo; rode de novo mais tarde.');
}

// Deezer: API pública, sem chave. Limite deles: 50 perguntas a cada 5 segundos;
// aqui é 1 a cada 2 segundos. Erro de cota (código 4) ou 429: espera e tenta de novo.
const DEEZER_API = 'https://api.deezer.com/search/artist';
const DEEZER_PAUSE_MS = 2000;

async function askDeezer(name) {
  const url = `${DEEZER_API}?${new URLSearchParams({ q: name, limit: '10' })}`;
  for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
    const res = await fetch(url, { headers: HEADERS });
    await sleep(DEEZER_PAUSE_MS);
    const data = res.ok ? await res.json() : null;
    if (data && !data.error) return data;
    const isRateLimit = res.status === 429 || res.status >= 500 || data?.error?.code === 4;
    if (!isRateLimit) throw new Error(`Erro do Deezer (${data?.error?.code ?? res.status}): ${data?.error?.message ?? 'sem detalhes'}`);
    console.log(`   Deezer pediu para esperar, tentativa ${attempt} de ${MAX_TRIES}`);
    await sleep(MIN_RETRY_MS * attempt);
  }
  throw new Error('O Deezer não respondeu. O que já foi descoberto está salvo; rode de novo mais tarde.');
}

// Pergunta várias páginas de uma vez e devolve uma função que diz, para cada
// título pedido, a página onde ele vai parar (seguindo redirecionamentos).
async function lookupTitles(titles, extra, api = API) {
  const pages = new Map();
  const redirects = new Map();
  const normalized = new Map();
  let next = {};
  do {
    const data = await ask({ titles: titles.join('|'), redirects: '1', ...extra, ...next }, api);
    for (const n of data.query?.normalized ?? []) normalized.set(n.from, n.to);
    for (const r of data.query?.redirects ?? []) redirects.set(r.from, r);
    for (const page of data.query?.pages ?? []) {
      const known = pages.get(page.title) ?? { title: page.title, missing: !!page.missing, categories: [], photo: null };
      known.categories.push(...categoryNames(page));
      if (page.thumbnail) known.photo = page.thumbnail.source;
      pages.set(page.title, known);
    }
    next = data.continue ?? null;
  } while (next);

  return title => {
    const name = normalized.get(title) ?? title;
    const redirect = redirects.get(name);
    const page = pages.get(redirect?.to ?? name);
    if (!page || page.missing) return null;
    return { ...page, fragment: redirect?.tofragment ?? null };
  };
}

const categoryNames = page => (page.categories ?? []).map(c => c.title.replace(/^Category:/, ''));

function inChunks(list, size) {
  const chunks = [];
  for (let i = 0; i < list.length; i += size) chunks.push(list.slice(i, i + size));
  return chunks;
}

// ---------- Decidir a categoria ----------

const unique = list => [...new Set(list)];

// Lê as categorias da página: o que vira categoria do site.
function readPage(wikiCategories) {
  const found = unique(wikiCategories.flatMap(c => CATEGORY_RULES.filter(([rule]) => rule.test(c)).map(([, cat]) => cat)));
  return { found };
}

function decide(group, found) {
  if (group.members === 2 || found.includes('Duos')) return 'Duos';
  return found.length === 1 ? found[0] : '?';
}

// "Kard (group)" -> "kard"; "Girl's Day" -> "girlsday"
const simplify = text => text.replace(/\s*\(.*\)$/, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

function variants(name) {
  const capitalized = name[0].toUpperCase() + name.slice(1).toLowerCase(); // "KARD" -> "Kard"
  const bases = unique([name, capitalized]);
  return bases.flatMap(base => [base, `${base} (group)`, `${base} (band)`, `${base} (South Korean band)`, `${base} (South Korean group)`]);
}

// ---------- Arquivo ----------

const index = JSON.parse(await readFile(INDEX, 'utf8'));
const order = index.groups.map(group => group.code);
let saved = {};
try {
  saved = JSON.parse(await readFile(OUT, 'utf8'));
} catch {
  // primeira vez: ainda não existe
}

// Um grupo por linha, na ordem da planilha. Chamado depois de cada pergunta.
async function save() {
  const codes = Object.keys(saved).sort((a, b) => order.indexOf(a) - order.indexOf(b));
  const lines = codes.map(code => `  ${JSON.stringify(code)}: ${JSON.stringify(saved[code])}`);
  await writeFile(OUT, `{\n${lines.join(',\n')}\n}\n`);
}

// "photo" só entra no passo 3; até lá o grupo fica sem esse campo.
function remember(group, { page, found = [], note = null }) {
  saved[group.code] = {
    name: group.name,
    category: page ? decide(group, found) : (group.members === 2 ? 'Duos' : '?'),
    page,
    found,
    ...(note ? { note } : {}),
  };
}

// ---------- Programa ----------

const todo = index.groups.filter(group => group.type === 'group' && !saved[group.code]);
console.log(`${todo.length} grupo(s) para perguntar (${Object.keys(saved).length} já estavam no arquivo).`);

// Passo 1: nome exato, 5 grupos por pergunta (10 títulos cada)
const notFound = []; // { group, note }
const perQuestion = Math.max(1, Math.floor(MAX_TITLES / 10));
const chunks = inChunks(todo, perQuestion);
for (const [i, chunk] of chunks.entries()) {
  console.log(`Nome exato: pergunta ${i + 1} de ${chunks.length}`);
  const titles = unique(chunk.flatMap(g => variants(g.name)));
  const find = await lookupTitles(titles, { prop: 'categories', cllimit: 'max', clshow: '!hidden' });

  for (const group of chunk) {
    let note = null;
    let done = false;
    for (const title of variants(group.name)) {
      const page = find(title);
      if (!page) continue;
      if (page.fragment) {
        note = `leva para uma seção de "${page.title}" (subunidade?)`;
        continue;
      }
      const { found } = readPage(page.categories);
      if (found.length === 0) continue; // desambiguação ou página que não é de grupo
      remember(group, { page: page.title, found });
      done = true;
      break;
    }
    if (!done) notFound.push({ group, note });
  }
  await save();
}

// Passo 2: busca, só para quem não foi achado (uma pergunta por grupo)
for (const [i, { group, note }] of notFound.entries()) {
  console.log(`Busca ${i + 1} de ${notFound.length}: ${group.name}`);
  const data = await ask({
    generator: 'search', gsrsearch: `${group.name} group`, gsrlimit: '1',
    prop: 'categories', cllimit: 'max', clshow: '!hidden',
  });
  const page = data.query?.pages?.[0];

  if (page && simplify(page.title) === simplify(group.name)) {
    remember(group, { page: page.title, ...readPage(categoryNames(page)), note });
  } else {
    const searchNote = page ? `a busca achou "${page.title}", que não confere` : 'nada encontrado';
    remember(group, { page: null, note: note ? `${note}; ${searchNote}` : searchNote });
  }
  await save();
}

// Passo 3: quem tem página mas ficou "?" sem nenhuma categoria lê a primeira
// frase do artigo (inclusive de rodadas anteriores). A frase fica salva em
// "lead" para a revisão.
const byPage = new Map(Object.entries(saved).map(([code, entry]) => [entry.page, { code, entry }]));
const noCategory = Object.values(saved).filter(e => e.page && e.category === '?' && e.found.length === 0 && e.lead === undefined);
for (const [i, chunk] of inChunks(noCategory, MAX_EXTRACTS).entries()) {
  console.log(`Primeira frase: pergunta ${i + 1}`);
  const data = await ask({
    titles: chunk.map(e => e.page).join('|'),
    prop: 'extracts', exintro: '1', explaintext: '1', exsentences: '1', exlimit: String(MAX_EXTRACTS),
  });
  for (const page of data.query?.pages ?? []) {
    const known = byPage.get(page.title);
    if (!known) continue;
    const lead = (page.extract ?? '').trim();
    const fromLead = unique(LEAD_RULES.filter(([rule]) => rule.test(lead)).map(([, cat]) => cat));
    const members = index.groups.find(g => g.code === known.code)?.members;
    const entry = known.entry;
    entry.lead = lead;

    if (!LEAD_IS_GROUP.test(lead)) {
      // Página de outra coisa: descarta a página e a foto dela
      entry.note = `a página "${entry.page}" não é de um grupo`;
      entry.page = null;
      entry.photo = null;
      entry.category = members === 2 ? 'Duos' : '?';
      continue;
    }
    if (fromLead.length) entry.found = fromLead;
    // Programa de competição fala de "girl group" na frase, mas é Survival Show
    entry.category = fromLead.includes('Survival Shows') ? 'Survival Shows' : decide({ members }, fromLead);
  }
  await save();
}

// Passo 4: subunidades, pelos membros da planilha (não pergunta nada).
// Se todos os membros de um grupo "?" estão em outros grupos, esses são os
// "pais" (QQQ -> OnlyOneOf; NCT 2023 -> NCT 127, NCT Dream...). O site herda a
// categoria dos pais, se for a mesma para todos. Nome comparado exatamente
// (LISA e LiSA são pessoas diferentes). Refeito a cada rodada.
const membersOf = new Map();
for (const group of index.groups.filter(g => g.type === 'group')) {
  const data = JSON.parse(await readFile(GROUP_FILE(group.code), 'utf8'));
  membersOf.set(group.code, new Set(data.members.map(m => m.name)));
}
for (const [code, entry] of Object.entries(saved)) {
  delete entry.parents;
  if (entry.category !== '?') continue;
  const members = [...(membersOf.get(code) ?? [])];
  if (members.length < 2) continue;

  const others = [...membersOf].filter(([other]) => other !== code);
  // Um grupo que tem todos os membros, se existir; senão, os grupos de cada membro
  const whole = others.filter(([, names]) => members.every(name => names.has(name))).map(([other]) => other);
  const perMember = members.map(name => others.filter(([, names]) => names.has(name)).map(([other]) => other));
  const parents = whole.length ? whole : perMember.every(list => list.length) ? unique(perMember.flat()) : [];
  if (parents.length) entry.parents = parents;
}
await save();

// Passo 5: Wikipedia coreana, para quem continua "?" e não tem pais.
// Só aceita a página se a primeira frase tiver o nome do grupo em letras
// latinas ("엑스디너리 히어로즈(Xdinary Heroes)는 ... 보이 밴드이다").
// "ko" guarda o título achado (ou null), para não perguntar de novo.
const koPending = Object.entries(saved).filter(([, e]) => e.category === '?' && !e.parents && e.ko === undefined);
for (const [i, [code, entry]] of koPending.entries()) {
  console.log(`Wikipedia coreana ${i + 1} de ${koPending.length}: ${entry.name}`);
  const data = await ask({
    generator: 'search', gsrsearch: entry.name, gsrlimit: '1',
    prop: 'extracts', exintro: '1', explaintext: '1', exsentences: '1',
  }, KO_API);
  const page = data.query?.pages?.[0];
  const lead = (page?.extract ?? '').trim();
  if (!page || !lead.toLowerCase().includes(entry.name.toLowerCase())) {
    entry.ko = null;
  } else {
    const fromKo = unique(KO_RULES.filter(([rule]) => rule.test(lead)).map(([, cat]) => cat));
    const members = index.groups.find(g => g.code === code)?.members;
    entry.ko = page.title;
    entry.koLead = lead;
    if (fromKo.length) entry.found = fromKo;
    entry.category = fromKo.includes('Survival Shows') ? 'Survival Shows' : decide({ members }, fromKo);
  }
  await save();
}

// Passo 6: K-pop Wiki, para quem continua "?", sem pais e sem correção manual.
// Primeiro o nome exato (vários grupos por pergunta), depois a busca com a
// mesma trava do nome. "fandom" guarda o título achado (ou null).
const fandomPending = Object.entries(saved).filter(([code, e]) =>
  e.category === '?' && !e.parents && e.fandom === undefined && !HANBIN_DATA.groupCategories[code]);

const fromFandom = categories => unique(categories.flatMap(c => FANDOM_RULES.filter(([rule]) => rule.test(c)).map(([, cat]) => cat)));
const fandomVariants = name => unique([name, name.toUpperCase(), name[0].toUpperCase() + name.slice(1).toLowerCase()])
  .flatMap(base => [base, `${base} (group)`, `${base} (band)`]);

function applyFandom(code, entry, title, categories) {
  const found = fromFandom(categories);
  const members = index.groups.find(g => g.code === code)?.members;
  entry.fandom = title;
  if (found.length) entry.found = found;
  entry.category = decide({ members }, found);
}

for (const [i, chunk] of inChunks(fandomPending, 5).entries()) {
  console.log(`K-pop Wiki (nome exato): pergunta ${i + 1}`);
  const titles = unique(chunk.flatMap(([, e]) => fandomVariants(e.name)));
  const find = await lookupTitles(titles, { prop: 'categories', cllimit: 'max' }, FANDOM_API);
  for (const [code, entry] of chunk) {
    for (const title of fandomVariants(entry.name)) {
      const page = find(title);
      if (page && fromFandom(page.categories).length) {
        applyFandom(code, entry, page.title, page.categories);
        break;
      }
    }
  }
  await save();
}

for (const [code, entry] of fandomPending.filter(([, e]) => e.fandom === undefined)) {
  console.log(`K-pop Wiki (busca): ${entry.name}`);
  const data = await ask({ generator: 'search', gsrsearch: entry.name, gsrlimit: '1', prop: 'categories', cllimit: 'max' }, FANDOM_API);
  const page = data.query?.pages?.[0];
  if (page && simplify(page.title) === simplify(entry.name)) applyFandom(code, entry, page.title, categoryNames(page));
  else entry.fandom = null;
  await save();
}

// Passo 7: foto oficial do Deezer (a foto do artista no app, enviada pela
// gravadora). Escolhe o artista com o nome igual ao do grupo e mais fãs; se
// houver outro com o mesmo nome e muitos fãs também, avisa no resumo
// ("deezerNote"), porque pode ser outro artista. "deezerPhoto" guarda o
// endereço (ou null). Com --teste, pergunta só por 30 grupos: os 10 primeiros,
// os 10 do meio e os 10 últimos da planilha.
const groupCodes = order.filter(code => saved[code]);
const middle = Math.floor(groupCodes.length / 2) - 5;
const deezerCodes = process.argv.includes('--teste')
  ? unique([...groupCodes.slice(0, 10), ...groupCodes.slice(middle, middle + 10), ...groupCodes.slice(-10)])
  : groupCodes;
const deezerPending = deezerCodes.filter(code => saved[code].deezerPhoto === undefined);

for (const [i, code] of deezerPending.entries()) {
  const entry = saved[code];
  console.log(`Deezer ${i + 1} de ${deezerPending.length}: ${entry.name}`);
  const data = await askDeezer(entry.name);
  const sameName = (data.data ?? [])
    .filter(artist => simplify(artist.name) === simplify(entry.name))
    .sort((a, b) => b.nb_fan - a.nb_fan);
  const [best, second] = sameName;

  // Artista sem foto no Deezer vem com o código da imagem vazio: .../images/artist//500x500...
  const picture = best?.picture_big;
  entry.deezerPhoto = picture && !picture.includes('/artist//') ? picture : null;
  delete entry.deezerNote;
  if (best && second && second.nb_fan >= best.nb_fan * 0.2) {
    entry.deezerNote = `outro artista "${second.name}" com ${second.nb_fan} fãs (escolhido: ${best.nb_fan})`;
  }
  await save();
}

// Passo 8: fotos da Wikipedia (reserva, para quem não tiver no Deezer), inclusive
// de rodadas anteriores que pararam antes daqui. Primeiro só fotos livres; quem
// não tiver, aceita qualquer licença (pôster ou logo, comum em survival show).
for (const license of ['free', 'any']) {
  const pending = Object.values(saved).filter(entry => entry.page && entry.photo === undefined);
  for (const [i, chunk] of inChunks(pending, MAX_TITLES).entries()) {
    console.log(`Fotos (${license === 'free' ? 'livres' : 'qualquer licença'}): pergunta ${i + 1}`);
    const find = await lookupTitles(chunk.map(entry => entry.page), {
      prop: 'pageimages', piprop: 'thumbnail', pithumbsize: String(PHOTO_WIDTH), pilicense: license,
    });
    for (const entry of chunk) {
      const photo = find(entry.page)?.photo;
      if (photo || license === 'any') entry.photo = photo ?? null;
    }
    await save();
  }
}

// ---------- Resumo ----------

const all = order.filter(code => saved[code]).map(code => ({ code, ...saved[code] }));
console.log('\n===== Resumo =====');
console.log(`Grupos no arquivo: ${all.length} (${todo.length} perguntados agora)`);
const counts = {};
for (const g of all) counts[g.category] = (counts[g.category] ?? 0) + 1;
for (const [category, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log(`   ${category}: ${n}`);

const withParents = all.filter(g => g.category === '?' && g.parents);
console.log(`\nSubunidades (o site usa a categoria dos pais, se for a mesma): ${withParents.length}`);
for (const g of withParents) {
  console.log(`   ${g.code} (${g.name}) -> ${g.parents.map(p => `${p} (${saved[p]?.category ?? '?'})`).join(', ')}`);
}

const review = all.filter(g => g.category === '?' && !g.parents);
console.log(`\nPara revisar ("?" -> Uncategorized): ${review.length}`);
for (const g of review) {
  const why = g.found.length ? `Wikipedia: ${g.found.join(' + ')}` : (g.note ?? '');
  console.log(`   ${g.code} (${g.name})${g.page ? ` -> ${g.page}` : ''}: ${why}`);
}
const fromDeezer = all.filter(g => g.deezerPhoto).length;
const noPhoto = all.filter(g => !g.deezerPhoto && !g.photo);
console.log(`\nFotos: ${fromDeezer} do Deezer, ${all.length - fromDeezer - noPhoto.length} só da Wikipedia`);
console.log(`Sem foto: ${noPhoto.length}${noPhoto.length ? ' — ' + noPhoto.map(g => g.code).join(', ') : ''}`);
const doubtful = all.filter(g => g.deezerNote);
if (doubtful.length) {
  console.log(`\nConfira a foto do Deezer (nome repetido): ${doubtful.length}`);
  for (const g of doubtful) console.log(`   ${g.code} (${g.name}): ${g.deezerNote}`);
}
