import { useState } from 'react';

// Foto do card. getPhoto é chamada uma vez só (o evento sorteia uma carta e
// ela não muda enquanto a tela está aberta). Endereço sem http é de public/.
function CardPhoto({ getPhoto }) {
  const [failed, setFailed] = useState(false);
  const [src] = useState(getPhoto);
  if (!src || failed) return null;

  const url = src.startsWith('http') ? src : `${import.meta.env.BASE_URL}${src}`;
  return <img src={url} alt="" loading="lazy" onError={() => setFailed(true)} />;
}

// Card compacto das categorias (112px de altura): nome numa linha, os
// detalhes ("8 members", opcional) e o progresso à esquerda; a foto fica
// por trás da metade direita, com fade até o texto, e a etiqueta no canto.
// O nome comprido termina em "…"; o nome inteiro aparece no title (mouse).
export function GroupCard({ name, details, owned, total, pct, tag, getPhoto, onClick }) {
  return (
    <button type="button" className="group-card" onClick={onClick} title={name}>
      <span className="group-card-photo" aria-hidden="true">
        <CardPhoto getPhoto={getPhoto} />
      </span>
      <span className="group-card-code">{tag}</span>

      <span className="group-card-info">
        <span className="group-card-name">{name}</span>
        {details && <span className="group-card-details">{details}</span>}
        <span className="group-card-progress">
          <span className="progress group-card-bar">
            <span className="progress-fill" style={{ width: `${pct}%` }} />
          </span>
          <span className="group-card-count">{owned}/{total}</span>
        </span>
      </span>
    </button>
  );
}
