// Baixa a foto de cada grupo e salva em public/banners/.
// Uso: npm run fotos (depois do npm run categorias)
//
// - A foto vem do categories.json (npm run categorias): primeiro a oficial do
//   Deezer; senão, a da Wikipedia. Grupo sem nenhuma das duas fica com o fundo pastel.
// - O script lembra de onde baixou cada foto (src/data/banners-sources.json).
//   Se a fonte mudar (ex.: Wikipedia -> Deezer), baixa de novo sozinho.
// - Foto que VOCÊ colocar em public/banners/ (com o nome <CODIGO>.jpg/.png...)
//   nunca é substituída: o script vê que não foi ele que baixou.
// - Baixa uma foto por vez, com pausa, para ninguém bloquear.
// - No final, gera src/data/banners.json com todas as fotos da pasta.

import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';

const BANNERS_DIR = new URL('../public/banners/', import.meta.url);
const MANIFEST = new URL('../src/data/banners.json', import.meta.url);
const SOURCES = new URL('../src/data/banners-sources.json', import.meta.url);
const CATEGORIES = new URL('../src/data/categories.json', import.meta.url);
// Os sites pedem que todo programa diga quem é e como achar o responsável.
const HEADERS = { 'User-Agent': 'HanbinTracker/1.0 (https://github.com/wezeley/Hanbin-Track)' };
const PAUSE_MS = 1000;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const readJson = async (url, fallback) => {
  try {
    return JSON.parse(await readFile(url, 'utf8'));
  } catch {
    return fallback;
  }
};

// Extensão pelo nome do arquivo no endereço:
//   Wikipedia: .../480px-Stray_Kids.jpg?utm_source=... -> jpg
//   Deezer:    .../500x500-000000-80-0-0.jpg          -> jpg
const extensionOf = url => decodeURIComponent(new URL(url).pathname).split('.').pop().toLowerCase();

const categories = await readJson(CATEGORIES, {});
const sources = await readJson(SOURCES, {}); // código -> endereço de onde a foto foi baixada

await mkdir(BANNERS_DIR, { recursive: true });
const files = await readdir(BANNERS_DIR);
const fileOf = code => files.find(f => f.slice(0, f.lastIndexOf('.')) === code);

let downloaded = 0;
const noPhoto = [];

for (const [code, info] of Object.entries(categories)) {
  const url = info.deezerPhoto ?? info.photo;
  const current = fileOf(code);

  if (current && !sources[code]) continue;            // foto colocada à mão
  if (current && sources[code] === url) continue;     // já é a foto certa
  if (!url) {
    noPhoto.push(code);
    continue;
  }

  const image = await fetch(url, { headers: HEADERS });
  await sleep(PAUSE_MS);
  if (!image.ok) {
    console.log(`x  ${code}: erro ${image.status} ao baixar`);
    continue;
  }

  if (current) await rm(new URL(current, BANNERS_DIR)); // a antiga pode ter outra extensão
  const file = `${code}.${extensionOf(url)}`;
  await writeFile(new URL(file, BANNERS_DIR), Buffer.from(await image.arrayBuffer()));
  sources[code] = url;
  downloaded++;
  console.log(`ok ${code}: ${file} (${info.deezerPhoto ? 'Deezer' : 'Wikipedia'})`);
}

await writeFile(SOURCES, JSON.stringify(sources, null, 2) + '\n');

const manifest = {};
for (const file of (await readdir(BANNERS_DIR)).sort()) {
  const code = file.slice(0, file.lastIndexOf('.'));
  manifest[code] = `banners/${file}`;
}
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\n${downloaded} foto(s) baixada(s). banners.json tem ${Object.keys(manifest).length} foto(s).`);
if (noPhoto.length) console.log(`Sem foto (${noPhoto.length}): ${noPhoto.join(', ')}`);
