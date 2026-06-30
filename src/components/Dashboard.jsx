import { HANBIN_DATA } from '../data/hanbinData';

export function Dashboard({ ownedCards = [], onTabChange }) {
  const getGroupTotal = (g) => {
    const maxVal = g.maxSet || 1;
    const lastSet = Math.floor(maxVal);
    const lastRarity = maxVal % 1 === 0 ? 5 : Math.round((maxVal % 1) * 10);
    return (g.members.length * ((lastSet - 1) * 5 + lastRarity));
  };

  const totalPossible = HANBIN_DATA.groups.reduce((acc, g) => acc + getGroupTotal(g), 0);
  const totalOwned = ownedCards.length;
  const percent = ((totalOwned / (totalPossible || 1)) * 100).toFixed(1);

  const missingGroups = HANBIN_DATA.groups.map(g => {
    const groupOwned = ownedCards.filter(id => id.split('#')[0] === g.code).length;
    const total = getGroupTotal(g);
    return { ...g, missing: total - groupOwned };
  }).filter(g => g.missing > 0);

  return (
    <div className="dashboard-layout">
      <div className="dashboard-column">
        <div className="section-header">📊 Global Progress</div>
        <div className="circle-container">
          <div className="circle-value">{percent}%</div>
          <svg style={{position: 'absolute', transform: 'rotate(-90deg)'}} width="150" height="150">
            <circle cx="75" cy="75" r="65" fill="none" stroke="#f1f5f9" strokeWidth="10" />
            <circle cx="75" cy="75" r="65" fill="none" stroke="#3b82f6" strokeWidth="10" 
                    strokeDasharray="408.4" strokeDashoffset={408.4 - (408.4 * percent) / 100} 
                    strokeLinecap="round" style={{transition: 'stroke-dashoffset 1s ease'}} />
          </svg>
        </div>
        <div className="stat-row-tcg"><span>Collected</span><b>{totalOwned}</b></div>
        <div className="stat-row-tcg"><span>Total Cards</span><b>{totalPossible}</b></div>
      </div>

      <div className="dashboard-column">
        <div className="section-header">📄 Missing from Collection</div>
        <div className="missing-grid">
          {missingGroups.map(g => (
            <div key={g.code} className="missing-item-tcg" onClick={() => onTabChange(g.category)}>
              <b>{g.name}</b>
              <span>{g.missing} cards remaining</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}