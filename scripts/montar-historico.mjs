// Atualiza src/data/sheet/history.json: quando cada carta apareceu na planilha,
// para a aba Cards mostrar as mais novas primeiro.
// Uso: npm run historico (só lê os arquivos de src/data/sheet/, não baixa nada).
// O npm run planilha também roda isto no final.
//
// A planilha não tem datas: o histórico compara o que já tinha com o que
// entrou desde a última vez. Formato (o mais antigo primeiro):
//   [
//     { "date": "2026-11-21", "baseline": true, "codes": [...] },  o que já existia
//     { "date": "2026-11-25", "codes": [...] },                    o que entrou nesse dia
//   ]
// No baseline (antes do rastreio) não dá para saber a ordem real: os grupos
// de número maior (mais novos na planilha) vêm primeiro, e dentro de cada um
// as últimas cartas da aba primeiro. Carta que sai da planilha continua no
// histórico (o site ignora quem não existe mais).

import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const SHEET_DIR = new URL('../src/data/sheet/', import.meta.url);
const HISTORY = new URL('history.json', SHEET_DIR);
const readJson = async name => JSON.parse(await readFile(new URL(name, SHEET_DIR), 'utf8'));

// Todas as cartas de hoje, das mais novas (pelo número da aba) para as mais antigas
async function currentCodes() {
  const index = await readJson('index.json');
  const owners = [];
  for (const group of index.groups) {
    const data = await readJson(`groups/${group.code}.json`);
    owners.push({ number: group.number, codes: data.cards.map(card => card.code) });
  }
  const events = await readJson('events.json');
  const radiants = await readJson('radiants.json');
  for (const block of [...events.blocks, ...radiants.blocks]) {
    owners.push({ number: block.number ?? -1, codes: block.cards.map(card => card.code) });
  }
  owners.sort((a, b) => b.number - a.number);
  return owners.flatMap(owner => [...owner.codes].reverse());
}

export async function updateHistory() {
  const codes = await currentCodes();
  const today = new Date().toLocaleDateString('sv-SE'); // 2026-11-21 (data local)

  let history = null;
  try {
    history = JSON.parse(await readFile(HISTORY, 'utf8'));
  } catch {
    // primeira vez: tudo o que existe hoje vira o baseline
  }

  let added;
  if (!history) {
    history = [{ date: today, baseline: true, codes }];
    added = codes.length;
  } else {
    const known = new Set(history.flatMap(entry => entry.codes));
    const fresh = codes.filter(code => !known.has(code));
    added = fresh.length;
    if (fresh.length) {
      const last = history.at(-1);
      // Rodou mais de uma vez no mesmo dia: junta no mesmo dia
      if (last.date === today && !last.baseline) last.codes.push(...fresh);
      else history.push({ date: today, codes: fresh });
    }
  }

  // Um dia por linha
  await writeFile(HISTORY, `[\n${history.map(entry => JSON.stringify(entry)).join(',\n')}\n]\n`);
  return added;
}

// Rodado direto (npm run historico), e não importado pelo npm run planilha
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(`history.json: ${await updateHistory()} carta(s) nova(s)`);
}
