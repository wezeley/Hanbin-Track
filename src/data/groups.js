import SHEET_INDEX from './sheet/index.json';
import { HANBIN_DATA } from './hanbinData';

// Grupos que aparecem no site: os da planilha que já têm categoria.
// Cada um tem: number, name, code, type, cards, members, sets e category
// (cards, members e sets são quantidades; as cartas mesmo ficam no arquivo do grupo).
export const GROUPS = SHEET_INDEX.groups
  .filter(group => HANBIN_DATA.groupCategories[group.code])
  .map(group => ({ ...group, category: HANBIN_DATA.groupCategories[group.code] }));

// Um arquivo por grupo. O Vite só baixa o arquivo quando loadGroup é chamado.
const GROUP_FILES = import.meta.glob('./sheet/groups/*.json', { import: 'default' });

// Devolve uma Promise com { number, name, code, members, cards } do grupo.
export function loadGroup(code) {
  const load = GROUP_FILES[`./sheet/groups/${code}.json`];
  if (!load) return Promise.reject(new Error(`Grupo ${code} não encontrado em src/data/sheet/groups/`));
  return load();
}
