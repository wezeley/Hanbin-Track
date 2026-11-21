// Description da planilha, mais curta para a tela: tira "Teaser Image(s)" e
// "Concept Photo(s)" e as aspas em volta do nome. O que vem depois (a versão)
// fica entre parênteses, porque são coleções diferentes:
//   "Lose my Breath" - Teaser Image        -> Lose my Breath
//   ATE - Concept Photos                   -> ATE
//   "Versus" - Concept Photo Fake ver.     -> Versus (Fake ver.)
// Os arquivos continuam com o texto original da planilha.
const PHOTO_WORDS = /\s*[-–:]?\s*(?:teaser|concept)\s+(?:images?|photos?)\b\s*/i;

export function shortDescription(text) {
  const match = text.match(PHOTO_WORDS);
  if (!match) return text;
  const version = text.slice(match.index + match[0].length).trim();
  const name = text.slice(0, match.index)
    .trim()
    .replace(/\s*[-–:]$/, '')         // " - " que sobrou no fim
    .replace(/^"(.+)"$/, '$1');        // aspas em volta do nome inteiro
  if (!name) return text;              // a descrição era só "Concept Photo"
  return version ? `${name} (${version})` : name;
}
