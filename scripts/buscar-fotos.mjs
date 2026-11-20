// Busca a foto de cada grupo na Wikipedia e salva em public/banners/.
// Uso: npm run fotos
//
// - Grupo que já tem arquivo em public/banners/ é pulado. Para trocar uma
//   foto, apague o arquivo dele (ou coloque a sua por cima) e rode de novo.
// - No final, gera src/data/banners.json com todas as fotos da pasta.

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { HANBIN_DATA } from '../src/data/hanbinData.js';

// Mesmos grupos do site: os da planilha (npm run planilha) que têm categoria.
const SHEET_INDEX = JSON.parse(await readFile(new URL('../src/data/sheet/index.json', import.meta.url), 'utf8'));
const GROUPS = SHEET_INDEX.groups.filter(group => HANBIN_DATA.groupCategories[group.code]);

const BANNERS_DIR = new URL('../public/banners/', import.meta.url);
const MANIFEST = new URL('../src/data/banners.json', import.meta.url);
const API = 'https://en.wikipedia.org/w/api.php';
const HEADERS = { 'User-Agent': 'HanbinTracker/1.0 (fan tracker)' };

async function findPhoto(groupName) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: `${groupName} South Korean group`,
    gsrlimit: '1',
    prop: 'pageimages',
    piprop: 'thumbnail',
    pithumbsize: '960',
  });
  const res = await fetch(`${API}?${params}`, { headers: HEADERS });
  const data = await res.json();
  const page = Object.values(data.query?.pages ?? {})[0];
  if (!page?.thumbnail) return null;
  return { title: page.title, url: page.thumbnail.source.split('?')[0] };
}

await mkdir(BANNERS_DIR, { recursive: true });
const existing = await readdir(BANNERS_DIR);

for (const group of GROUPS) {
  const current = existing.find(f => f.startsWith(`${group.code}.`));
  if (current) {
    console.log(`=  ${group.code}: já tem ${current}, pulando`);
    continue;
  }

  const photo = await findPhoto(group.name);
  if (!photo) {
    console.log(`x  ${group.code}: nenhuma foto encontrada`);
    continue;
  }

  const image = await fetch(photo.url, { headers: HEADERS });
  if (!image.ok) {
    console.log(`x  ${group.code}: erro ${image.status} ao baixar`);
    continue;
  }

  const file = `${group.code}.${photo.url.split('.').pop().toLowerCase()}`;
  await writeFile(new URL(file, BANNERS_DIR), Buffer.from(await image.arrayBuffer()));
  console.log(`ok ${group.code}: ${file} (página "${photo.title}")`);
}

const manifest = {};
for (const file of (await readdir(BANNERS_DIR)).sort()) {
  const code = file.slice(0, file.lastIndexOf('.'));
  manifest[code] = `banners/${file}`;
}
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\nbanners.json atualizado com ${Object.keys(manifest).length} foto(s).`);
