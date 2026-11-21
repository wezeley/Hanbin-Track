import SHEET_INDEX from './sheet/index.json';
import CATEGORIES from './categories.json';
import { HANBIN_DATA } from './hanbinData';

// Grupo sem categoria (ou com "?" no categories.json) fica aqui até ser revisado.
export const UNCATEGORIZED = 'Uncategorized';

// Categoria de um grupo: a correção manual (groupCategories) sempre vence;
// depois vem o palpite da Wikipedia (npm run categorias); se for "?" e o grupo
// for subunidade ("parents"), usa a categoria dos pais quando todos concordam.
// "seen" evita ficar em círculo se dois grupos forem pais um do outro.
// Pais Duos ou Survival Shows não contam: não dizem se o grupo é masculino,
// feminino ou co-ed (NCT 2023 tem membros do NCT JNJM, que é Duos).
const NOT_INHERITED = ['Duos', 'Survival Shows', UNCATEGORIZED];

function categoryOf(code, seen = new Set()) {
  const manual = HANBIN_DATA.groupCategories[code];
  if (manual) return manual;

  const entry = CATEGORIES[code];
  if (entry?.category && entry.category !== '?') return entry.category;

  seen.add(code);
  const parents = (entry?.parents ?? []).filter(parent => !seen.has(parent));
  const fromParents = [...new Set(parents.map(parent => categoryOf(parent, seen)))]
    .filter(category => !NOT_INHERITED.includes(category));
  return fromParents.length === 1 ? fromParents[0] : UNCATEGORIZED;
}

const SOLOISTS_CATEGORY = 'Soloists';

// Grupos da planilha. Cada um tem: number, name, code, type, cards, members,
// sets, category e tag (o texto da etiqueta: o código do grupo)
// (cards, members e sets são quantidades; as cartas mesmo ficam no arquivo do grupo).
const SHEET_GROUPS = SHEET_INDEX.groups
  .filter(group => group.type === 'group')
  .map(group => ({
    ...group,
    name: HANBIN_DATA.groupNames[group.code] ?? group.name, // correção manual de nome
    category: categoryOf(group.code),
    tag: group.code,
  }));

// Solistas: cada um da aba "0 - Solo" aparece como um grupo próprio, em ordem
// alfabética. O code é o id do index.json (SOLO-LS001), a etiqueta é a inicial
// e "codes" são os IDs das cartas (Lisa e LiSA têm a mesma inicial, então o
// progresso não dá para contar pelo começo do ID, como nos grupos).
const SOLOISTS = (SHEET_INDEX.soloists ?? [])
  .map(soloist => ({
    number: 0,
    name: soloist.name,
    code: soloist.id,
    type: 'soloist',
    cards: soloist.cards,
    members: 1,
    sets: soloist.sets,
    category: SOLOISTS_CATEGORY,
    tag: soloist.initial,
    codes: soloist.codes,
  }))
  .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));

// Eventos, Limiteds e radiantes: cada um aparece como um grupo, na ordem da
// planilha. O code e a etiqueta são o código do bloco (SS24); "kind" diz o
// tipo (event, limited ou radiant) e "photos" são os links das cartas, para
// sortear a foto do card. "sets" = páginas (Hanbin Comics tem 3).
const EVENT_CATEGORIES = { event: 'Events', limited: 'Limiteds', radiant: 'Radiant' };
const EVENTS = (SHEET_INDEX.events ?? []).map(event => ({
  number: null,
  name: event.name,
  code: event.id,
  type: 'event',
  kind: event.kind,
  cards: event.cards,
  members: 0,
  sets: event.sets,
  category: EVENT_CATEGORIES[event.kind],
  tag: event.id,
  photos: event.photos,
}));

// Tudo o que aparece no site como "grupo": grupos, solistas e eventos.
export const GROUPS = [...SHEET_GROUPS, ...SOLOISTS, ...EVENTS];

// Categorias da sidebar: as fixas e, se tiver algum grupo sem categoria, Uncategorized no fim.
export const SIDEBAR_CATEGORIES = GROUPS.some(group => group.category === UNCATEGORIZED)
  ? [...HANBIN_DATA.categories, UNCATEGORIZED]
  : HANBIN_DATA.categories;

// Um arquivo por grupo. O Vite só baixa o arquivo quando loadGroup é chamado.
const GROUP_FILES = import.meta.glob('./sheet/groups/*.json', { import: 'default' });

// Os arquivos dos eventos e dos radiantes também só são baixados quando um abre.
const loadEventBlocks = () => Promise.all([
  import('./sheet/events.json'),
  import('./sheet/radiants.json'),
]).then(([events, radiants]) => [...events.default.blocks, ...radiants.default.blocks]);

// Devolve uma Promise com { number, name, code, members, cards } do grupo.
// Solista: abre o arquivo do Solo e fica só com as cartas dele.
// Evento: devolve { name, code, pages: [{ name, cards }] }, uma página por bloco.
export function loadGroup(code) {
  const event = EVENTS.find(e => e.code === code);
  if (event) {
    return loadEventBlocks().then(blocks => ({
      name: event.name,
      code,
      pages: blocks
        .filter(block => block.code === code)
        .map(block => ({ name: block.name, cards: block.cards })),
    }));
  }


  const soloist = SOLOISTS.find(s => s.code === code);
  if (soloist) {
    return loadGroup('SOLO').then(solo => {
      const cards = solo.cards.filter(card => soloist.codes.includes(card.code));
      const members = cards.length ? [{ name: cards[0].member, initial: cards[0].initial }] : [];
      return { number: 0, name: soloist.name, code, members, cards };
    });
  }

  const load = GROUP_FILES[`./sheet/groups/${code}.json`];
  if (!load) return Promise.reject(new Error(`Grupo ${code} não encontrado em src/data/sheet/groups/`));
  return load();
}
