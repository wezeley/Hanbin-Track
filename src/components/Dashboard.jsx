import { HANBIN_DATA } from '../data/hanbinData';

export function Dashboard({ ownedCards = [], onTabChange }) {
  const getGroupTotal = (group) => {
    const maxVal = group.maxSet || 1;
    const lastSet = Math.floor(maxVal);
    const lastRarity = maxVal % 1 === 0 ? 5 : Math.round((maxVal % 1) * 10);
    return (group.members.length * ((lastSet - 1) * 5 + lastRarity));
  };

  let totalOwned = ownedCards.length;
  let totalPossible = HANBIN_DATA.groups.reduce((acc, g) => acc + getGroupTotal(g), 0);
  const globalPercent = ((totalOwned / (totalPossible || 1)) * 100).toFixed(0);

  const missingGroups = HANBIN_DATA.groups.map(g => {
    const groupOwned = ownedCards.filter(id => id.split('#')[0] === g.code).length;
    const groupTotal = getGroupTotal(g);
    return { ...g, missing: groupTotal - groupOwned };
  }).filter(g => g.missing > 0);

  return (
    <div className="dashboard-layout">
      <aside className="summary-panel">
        <div className="progress-circle-container">
          {/* Gráfico circular simples via CSS */}
          <div className="progress-value">{globalPercent}%</div>
          <svg style={{position: 'absolute', transform: 'rotate(-90deg)'}} width="120" height="120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#f1f5f9" strokeWidth="8" />
            <circle cx="60" cy="60" r="54" fill="none" stroke="#3b82f6" strokeWidth="8" 
                    strokeDasharray="339.29" strokeDashoffset={339.29 - (339.29 * globalPercent) / 100} 
                    strokeLinecap="round" />
          </svg>
        </div>
        <div className="stat-box">
          <div className="stat-row"><span className="stat-label">Collected</span><span>{totalOwned}</span></div>
          <div className="stat-row"><span className="stat-label">Total Cards</span><span>{totalPossible}</span></div>
        </div>
      </aside>

      <section>
        <h2 style={{marginBottom: '20px', fontSize: '1.2rem', fontWeight: 800}}>Missing from Collection</h2>
        <div className="missing-grid">
          {missingGroups.map(g => (
            <div key={g.code} className="missing-card-tcg" onClick={() => onTabChange(g.category)}>
              <span className="m-name">{g.name}</span>
              <span className="m-count">{g.missing} cards left</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}