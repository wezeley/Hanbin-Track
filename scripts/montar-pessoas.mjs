// Monta src/data/sheet/people.json: cada pessoa (membro de grupo ou carta de
// evento/radiante) e onde ela aparece, para a busca por pessoa da Home.
// Uso: npm run pessoas (só lê os arquivos de src/data/sheet/, não baixa nada).
// O npm run planilha também roda isto no final.
//
// Formato: uma linha por pessoa em cada grupo/evento, [nome, código] ou
// [nome, código, grupo de origem] (o grupo de origem só existe nos eventos e
// radiantes: ["Dino", "PPTY", "Seventeen"]). Nomes iguais de pessoas diferentes
// ficam separados pelo grupo. Solistas ficam de fora: o próprio solista já
// aparece na busca pelo nome.

import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const SHEET_DIR = new URL('../src/data/sheet/', import.meta.url);
const readJson = async name => JSON.parse(await readFile(new URL(name, SHEET_DIR), 'utf8'));

export async function buildPeople() {
  const index = await readJson('index.json');
  const people = [];
  const seen = new Set();
  const add = (name, code, origin) => {
    const key = `${name}|${code}|${origin ?? ''}`;
    if (!name || seen.has(key)) return;
    seen.add(key);
    people.push(origin ? [name, code, origin] : [name, code]);
  };

  for (const group of index.groups.filter(g => g.type === 'group')) {
    const data = await readJson(`groups/${group.code}.json`);
    for (const member of data.members) add(member.name, group.code);
  }

  const events = await readJson('events.json');
  const radiants = await readJson('radiants.json');
  for (const block of [...events.blocks, ...radiants.blocks]) {
    for (const card of block.cards) add(card.member, block.code, card.group);
  }

  // Uma pessoa por linha, para o git mostrar as mudanças de forma legível
  await writeFile(new URL('people.json', SHEET_DIR), `[\n${people.map(p => JSON.stringify(p)).join(',\n')}\n]\n`);
  return people.length;
}

// Rodado direto (npm run pessoas), e não importado pelo npm run planilha
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(`people.json: ${await buildPeople()} pessoas`);
}
