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

// Grupos que aparecem no site: todos os grupos da planilha (o Solo entra na parte 5).
// Cada um tem: number, name, code, type, cards, members, sets e category
// (cards, members e sets são quantidades; as cartas mesmo ficam no arquivo do grupo).
export const GROUPS = SHEET_INDEX.groups
  .filter(group => group.type === 'group')
  .map(group => ({
    ...group,
    name: HANBIN_DATA.groupNames[group.code] ?? group.name, // correção manual de nome
    category: categoryOf(group.code),
  }));

// Categorias da sidebar: as fixas e, se tiver algum grupo sem categoria, Uncategorized no fim.
export const SIDEBAR_CATEGORIES = GROUPS.some(group => group.category === UNCATEGORIZED)
  ? [...HANBIN_DATA.categories, UNCATEGORIZED]
  : HANBIN_DATA.categories;

// Um arquivo por grupo. O Vite só baixa o arquivo quando loadGroup é chamado.
const GROUP_FILES = import.meta.glob('./sheet/groups/*.json', { import: 'default' });

// Devolve uma Promise com { number, name, code, members, cards } do grupo.
export function loadGroup(code) {
  const load = GROUP_FILES[`./sheet/groups/${code}.json`];
  if (!load) return Promise.reject(new Error(`Grupo ${code} não encontrado em src/data/sheet/groups/`));
  return load();
}
