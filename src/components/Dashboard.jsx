import { HANBIN_DATA } from '../data/hanbinData';

export function Dashboard({ ownedCards = [] }) {
  // Lógica de totais
  const stats = { s1: { o:0, t:0 }, s2: { o:0, t:0 }, s3: { o:0, t:0 }, other: { o:0, t:0 } };
  
  HANBIN_DATA.groups.forEach(g => {
    const maxVal = g.maxSet || 1;
    const lastSet = Math.floor(maxVal);
    const lastRarity = maxVal % 1 === 0 ? 5 : Math.round((maxVal % 1) * 10);
    
    for (let s = 1; s <= lastSet; s++) {
      const rarities = s < lastSet ? 5 : lastRarity;
      const key = s <= 3 ? `s${s}` : 'other';
      stats[key].t += (g.members.length * rarities);
      // Aqui contaria os owned reais por set (simplificado para o exemplo)
    }
  });

  const totalPossible = 864; // Valor que você pediu para exibir como total do bot

  return (
    <div className="dashboard-grid-final">
      <div className="dash-col">
        <div className="section-label">📊 GLOBAL PROGRESS</div>
        <div className="progress-big-box">
          <div className="stat-main">
            <span className="val">{ownedCards.length}</span>
            <span className="total">/ {totalPossible} Cards</span>
          </div>
          <div className="stat-bar-bg">
          <div className="stat-bar-fill" style={{ width: `${(ownedCards.length / (totalPossible || 1)) * 100}%` }}>
        </div>
      </div>

      <div className="dash-col">
        <div className="section-label">🚀 UPCOMING RELEASES</div>
        <div className="upcoming-container">
          {HANBIN_DATA.upcoming?.map((item, i) => (
            <div key={i} className="upcoming-card-minimal">
              <span className="date">{item.date}</span>
              <div className="info">
                <b>{item.group}</b>
                <p>{item.info}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}