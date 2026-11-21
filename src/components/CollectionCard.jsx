import { useState } from 'react';

// Card de uma coleção na aba Collection: texto à esquerda (nome, grupo, set e
// progresso) e até 5 cartas em leque à direita, em escadinha: a do meio na
// frente e mais alta, e os lados descendo. Carta que não tenho fica cinza.
// As cartas do leque são sorteadas cada vez que o card aparece.

const MAX_FAN = 5;

// Sorteia até "count" posições da lista (só cartas com imagem, se houver),
// embaralhando com Fisher–Yates. A 1ª sorteada vai para o meio do leque.
function sampleFan(cards, count) {
  const withImage = cards.map((card, i) => i).filter(i => cards[i].cover);
  const pool = withImage.length ? withImage : cards.map((card, i) => i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const picked = pool.slice(0, count);
  // Ordem no leque: 1ª no meio, depois alternando direita e esquerda
  const fan = [];
  picked.forEach((index, i) => (i % 2 ? fan.push(index) : fan.unshift(index)));
  return fan;
}

// "qlY9f5o.png" (Imgur, guardado curto) -> miniatura de 320px do Imgur, bem
// mais leve que a carta inteira: https://i.imgur.com/qlY9f5om.png
const thumbUrl = (cover) => {
  if (!cover) return null;
  if (cover.startsWith('http')) return cover;
  return `https://i.imgur.com/${cover.replace(/(\.\w+)$/, 'm$1')}`;
};

//   cards: [{ cover, owned }]  (todas as cartas da coleção)
export function CollectionCard({ name, group, meta, tag, cards, owned, total, onClick }) {
  // Sorteio uma vez só (marcar uma carta não sorteia de novo)
  const [fanIndexes] = useState(() => sampleFan(cards, MAX_FAN));

  // ===== Cálculos =====
  const fan = fanIndexes.map(i => cards[i]);
  const more = total - fan.length;
  const mid = (fan.length - 1) / 2;
  const pct = total ? Math.round(owned / total * 100) : 0;
  // Cada passo para o lado do meio: mais para o lado, mais baixa, mais para
  // trás, um pouco menor e inclinada para fora
  const fanStyle = (i) => {
    const step = i - mid;
    const away = Math.abs(step);
    return {
      zIndex: 10 - Math.round(away * 2),
      transform: `translateX(${step * 24}px) translateY(${away * 8}px) rotate(${step * 5}deg) scale(${1 - away * 0.06})`,
    };
  };

  // ===== Tela =====
  return (
    <button type="button" className="collection-card" onClick={onClick}>
      <span className="collection-card-info">
        <span className="collection-card-name">{name}</span>
        <span className="collection-card-meta">
          <b>{group}</b>
          {meta && <span>{meta}</span>}
        </span>
        <span className="collection-card-progress">
          <span className="progress collection-card-bar">
            <span className="progress-fill" style={{ width: `${pct}%` }} />
          </span>
          <span className="collection-card-count">{owned} / {total}</span>
        </span>
      </span>
      <span className="collection-card-fan">
        {fan.map((card, i) => {
          const src = thumbUrl(card.cover);
          return src
            ? <img key={i} src={src} alt="" loading="lazy" className={card.owned ? '' : 'is-missing'} style={fanStyle(i)} />
            : <span key={i} className="collection-card-blank" style={fanStyle(i)} />;
        })}
        <span className="collection-card-tag">{tag}</span>
        {more > 0 && <span className="collection-card-more">+{more}</span>}
      </span>
    </button>
  );
}
