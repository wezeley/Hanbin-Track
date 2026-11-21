import { useState } from 'react';
import { getNameSize } from '../utils/groupCard';

// Foto do card. getPhoto é chamada uma vez só (o evento sorteia uma carta e
// ela não muda enquanto a tela está aberta). Endereço sem http é de public/.
function CardPhoto({ getPhoto }) {
  const [failed, setFailed] = useState(false);
  const [src] = useState(getPhoto);
  if (!src || failed) return null;

  const url = src.startsWith('http') ? src : `${import.meta.env.BASE_URL}${src}`;
  return <img src={url} alt="" loading="lazy" onError={() => setFailed(true)} />;
}

// Card 8:5 das categorias e da aba Collection: nome, números e progresso à
// esquerda; foto à direita com a etiqueta (código do grupo).
//   stats: [['Cards', 40], ['Sets', 3]]   (rótulo e valor, um por linha)
export function GroupCard({ name, stats, owned, total, pct, tag, getPhoto, onClick }) {
  return (
    <button type="button" className="group-card" onClick={onClick}>
      <span className="group-card-info">
        <span className="group-card-name" style={{ fontSize: getNameSize(name) }}>{name}</span>
        <span className="group-card-stats">
          {stats.map(([label, value]) => (
            <span key={label} className="group-card-stat">
              <span className="group-card-label">{label}</span>
              <b>{value}</b>
            </span>
          ))}
        </span>
        <span className="group-card-progress">
          <span className="progress group-card-bar">
            <span className="progress-fill" style={{ width: `${pct}%` }} />
          </span>
          <span className="group-card-count">{owned} / {total}</span>
        </span>
      </span>
      <span className="group-card-photo">
        <span className="group-card-photo-img">
          <CardPhoto getPhoto={getPhoto} />
        </span>
        <span className="group-card-code">{tag}</span>
      </span>
    </button>
  );
}
