import { HANBIN_DATA } from '../data/hanbinData';

export function Dashboard({ ownedCards = [] }) {
  const totalPossible = 864; // O total de cartas do bot
  const totalOwned = ownedCards.length;
  const percent = ((totalOwned / totalPossible) * 100).toFixed(1);

  return (
    <div className="dashboard-grid">
      <div className="dash-column">
        <div className="section-label">📊 GLOBAL PROGRESS</div>
        <div style={{textAlign: 'center', padding: '20px 0'}}>
            <div className="progress-value-big">{totalOwned}</div>
            <div className="progress-total-label">/ {totalPossible} Cards</div>
            <p style={{marginTop: '10px', color: '#94a3b8', fontWeight: 700}}>{percent}% Collected</p>
        </div>
      </div>

      <div className="dash-column">
        <div className="section-label">🚀 UPCOMING RELEASES</div>
        {HANBIN_DATA.upcoming?.map((item, i) => (
          <div key={i} className="upcoming-card-mini">
            <span className="u-date-tag">{item.date}</span>
            <div>
              <b style={{fontSize: '0.85rem'}}>{item.group}</b>
              <p style={{fontSize: '0.75rem', color: '#64748b'}}>{item.info}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}