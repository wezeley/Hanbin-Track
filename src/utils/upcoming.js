// "Upcoming releases" da Home: nomes das abas To-Do Order e To-Do Order Solo
// (src/data/sheet/todo.json). O npm run planilha já grava só o que aparece
// aqui: sem a coluna "Ideas", sem o que já tem carta e sem nome repetido na
// mesma lista (o resto da To-Do não vai para o site).

// Uma lista (grupos ou solistas) vira entradas { name, info }.
function listEntries(columns) {
  return columns.flatMap(column => column.names.map(name => ({
    name,
    info: `Set ${column.set} · ${column.rarity}H`,
  })));
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
