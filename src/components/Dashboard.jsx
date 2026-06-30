import { HANBIN_DATA } from '../data/hanbinData';

export function Dashboard({ ownedCards = [], onTabChange }) {
  const getGroupStructure = (group) => {
    const maxVal = group.maxSet || 1;
    const lastSetId = Math.floor(maxVal);
    const lastRarity = maxVal % 1 === 0 ? 5 : Math.round((maxVal % 1) * 10);
    const sets = [];
    for (let s = 1; s <= lastSetId; s++) {
      const rarities = s < lastSetId ? [1, 2, 3, 4, 5] : Array.from({ length: lastRarity }, (_, i) => i + 1);
      sets.push({ id: s, rarities });
    }
    return sets;
  };

  const stats = {
    s1: { owned: 0, total: 0 },
    s2: { owned: 0, total: 0 },
    s3: { owned: 0, total: 0 },
    event: { owned: 0, total: 0 },
    radiant: { owned: 0, total: 0 },
    survival: { owned: 0, total: 0 },
  };

  const missingGroups = [];

  HANBIN_DATA.groups.forEach(group => {
    let groupMissingCount = 0;
    const structure = getGroupStructure(group);
    structure.forEach(set => {
      set.rarities.forEach(rarity => {
        group.members.forEach(member => {
          const seq = ((set.id - 1) * 5) + rarity + (member.offset || 0);
          const botId = `${group.code}#${member.code}${String(seq).padStart(3, '0')}`;
          const isOwned = ownedCards?.includes(botId);
          let target = group.category === "Radiant" ? "radiant" : group.category === "Survival Shows" ? "survival" : (group.category === "Events" || group.category === "Limiteds") ? "event" : `s${set.id}`;
          if (stats[target]) { stats[target].total++; if (isOwned) stats[target].owned++; }
          if (!isOwned) groupMissingCount++;
        });
      });
    });
    if (groupMissingCount > 0) missingGroups.push({ name: group.name, missing: groupMissingCount, category: group.category });
  });

  return (
    <div className="dashboard-layout">
      <div className="dashboard-column">
        <div className="section-header">📊 GLOBAL PROGRESS</div>
        {Object.entries(stats).map(([key, data]) => (
          data.total > 0 && (
            <div key={key} className="stat-row-premium">
              <div className="stat-info"><span style={{color: 'var(--accent)'}}>{key.toUpperCase()}</span><span>{data.owned}/{data.total}</span></div>
              <div className="stat-bar-bg"><div className="stat-bar-fill" style={{ width: `${(data.owned/data.total)*100}%` }}></div></div>
            </div>
          )
        ))}
      </div>
      <div className="dashboard-column">
        <div className="section-header">📄 MISSING GROUPS</div>
        <div className="missing-scroll-area">
          {missingGroups.map(g => (
            <div key={g.name} className="missing-card-mini" onClick={() => onTabChange(g.category)}>
              <span className="m-name">{g.name}</span>
              <span className="m-count">{g.missing} left</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}