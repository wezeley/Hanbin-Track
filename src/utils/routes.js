// Endereços de cada tela (a parte depois do #):
//   /                      Home
//   /category/boy-group    categoria (nome em minúsculas, com "-")
//   /group/SKZ             grupo, solista (SOLO-LS001) ou evento (SS24), pelo código
//   /collection, /events, /commands   abas do topo
// Endereço que não existe (código errado, categoria apagada) volta para a Home.

export const TOP_TABS = ['collection', 'events', 'commands'];

// "Boy Group" -> "boy-group"; "Uncategorized" -> "uncategorized"
const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const homePath = () => '/';
export const categoryPath = (category) => `/category/${slug(category)}`;
// encodeURIComponent: código com símbolo (como &) não quebra o endereço
export const groupPath = (group) => `/group/${encodeURIComponent(group.code)}`;
export const tabPath = (tab) => `/${tab}`;

// "/group/SKZ" -> { view: 'group', group, category }
// view: 'home', 'category', 'group' ou uma das TOP_TABS
export function parseRoute(path, categories, groups) {
  const [, section = '', value = ''] = path.split('/');
  const home = { view: 'home', category: null, group: null };

  if (section === 'category') {
    const category = categories.find(c => slug(c) === value);
    return category ? { view: 'category', category, group: null } : home;
  }
  if (section === 'group') {
    let code;
    try {
      code = decodeURIComponent(value);
    } catch {
      return home; // endereço com % quebrado
    }
    const group = groups.find(g => g.code === code);
    return group ? { view: 'group', category: group.category, group } : home;
  }
  if (TOP_TABS.includes(section)) return { view: section, category: null, group: null };
  return home;
}
