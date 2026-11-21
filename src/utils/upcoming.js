// "Upcoming releases" da Home: nomes das abas To-Do Order e To-Do Order Solo
// (src/data/sheet/todo.json). Ficam de fora:
// - a coluna "Ideas";
// - o que já tem carta ("released", marcado pelo npm run planilha);
// - nome repetido na mesma lista (está errado na planilha até ser arrumado).

// Uma lista (grupos ou solistas) vira entradas { name, info }.
function listEntries(columns) {
  const entries = columns
    .filter(column => !/Ideas/i.test(column.header))
    .flatMap(column => column.names.map(name => ({
      name,
      info: `Set ${column.set} · ${column.rarity}H`,
      released: column.released.includes(name),
    })));

  const timesListed = name => entries.filter(entry => entry.name === name).length;
  return entries
    .filter(entry => !entry.released && timesListed(entry.name) === 1)
    .map(({ name, info }) => ({ name, info }));
}

// Embaralha uma cópia da lista (Fisher–Yates): de trás para a frente, cada
// posição troca de lugar com uma posição sorteada entre ela e o começo.
function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Sorteia "count" lançamentos, misturando grupos e solistas.
export function pickUpcoming(todo, count) {
  const entries = [...listEntries(todo.groups), ...listEntries(todo.solo)];
  return shuffle(entries).slice(0, count);
}
