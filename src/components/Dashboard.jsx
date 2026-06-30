import { HANBIN_DATA } from '../data/hanbinData';

export function Dashboard({ ownedCards = [], onTabChange }) {
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
    group.sets?.forEach(set => {
      HANBIN_DATA.rarities?.forEach(rarity => {
        group.members?.forEach(member => {
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
    <div className="dashboard-grid">
      <section>
        <div className="section-header">📊 GLOBAL PROGRESS</div>
        <div className="horizontal-scroll-row">
          {Object.entries(stats).map(([key, data]) => {
            if (data.total === 0) return null;
            const percent = ((data.owned / data.total) * 100).toFixed(0);
            return (
              <div key={key} className="stat-card-mini">
                <h4>{key}</h4>
                <span className="count">{data.owned}/{data.total}</span>
                <div className="mini-bar"><div className="fill" style={{ width: `${percent}%` }}></div></div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="section-header">📄 MISSING GROUPS</div>
        <div className="missing-grid">
          {missingGroups.map(g => (
            <div key={g.name} className="missing-item" onClick={() => onTabChange(g.category)}>
              <span className="group-name">{g.name}</span>
              <span className="missing-count">{g.missing} left</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}