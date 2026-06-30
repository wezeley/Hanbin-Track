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
  }).filter(g => g.missing > 0).slice(0, 9); // LIMITADO A 9

  return (
    <div className="dashboard-layout">
      <div className="dashboard-column">
        <div className="section-header">📊 Global Progress</div>
        <div className="circle-container">
          <div className="circle-value">{percent}%</div>
          <svg style={{position: 'absolute', transform: 'rotate(-90deg)'}} width="120" height="120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#1a1a1a" strokeWidth="8" />
            <circle cx="60" cy="60" r="54" fill="none" stroke="#3b82f6" strokeWidth="8" 
                    strokeDasharray="339.3" strokeDashoffset={339.3 - (339.3 * percent) / 100} 
                    strokeLinecap="round" style={{transition: 'stroke-dashoffset 1s ease'}} />
          </svg>
        </div>
        <div style={{fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}><span>Collected</span><b>{totalOwned}</b></div>
        <div style={{fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between'}}><span>Total Cards</span><b>{totalPossible}</b></div>
      </div>

      <div className="dashboard-column">
        <div className="section-header">📄 Missing (Top 9)</div>
        <div className="missing-grid">
          {missingGroups.map(g => (
            <div key={g.code} className="missing-item-tcg" onClick={() => onTabChange(g.category)}>
              <b>{g.name}</b>
              <span>{g.missing} left</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}