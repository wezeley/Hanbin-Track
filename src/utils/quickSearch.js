// Quick search da Home: grupos (pelo nome ou pela etiqueta) e pessoas
// (membros dos grupos e cartas de evento/radiante, do people.json).
// Pode ter várias palavras, e cada uma precisa aparecer em algum lugar:
// "jaehyun nct" acha só os Jaehyun do NCT; "juyeon pool" acha o do Pool Party.
// Grupos vêm primeiro; pessoas, depois. Pessoa só entra se alguma palavra
// estiver no nome dela (senão "nct" listaria todos os membros do NCT).

const wordsOf = text => text.toLowerCase().split(/\s+/).filter(Boolean);

export function quickSearch(query, groups, people, limit) {
  const words = wordsOf(query);
  if (words.length === 0) return [];
  const hasAll = text => words.every(word => text.toLowerCase().includes(word));

  const groupResults = groups
    .filter(group => hasAll(`${group.name} ${group.tag}`))
    .map(group => ({ key: group.code, group, person: null, origin: null }));

  const byCode = new Map(groups.map(group => [group.code, group]));
  const personResults = (people ?? [])
    .map(([person, code, origin = null]) => ({ person, origin, group: byCode.get(code) }))
    .filter(({ person, origin, group }) =>
      group &&
      words.some(word => person.toLowerCase().includes(word)) &&
      hasAll(`${person} ${group.name} ${group.tag} ${origin ?? ''}`))
    .map(result => ({ ...result, key: `${result.person}|${result.group.code}|${result.origin ?? ''}` }));

  return [...groupResults, ...personResults].slice(0, limit);
}
