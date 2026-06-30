import { HANBIN_DATA } from '../data/hanbinData';

export function Dashboard({ ownedCards, onTabChange }) {
  // --- LÓGICA DE CÁLCULO ---
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
    
    group.sets.forEach(set => {
      HANBIN_DATA.rarities.forEach(rarity => {
        group.members.forEach(member => {
          const seq = ((set.id - 1) * 5) + rarity + (member.offset || 0);
          const botId = `${group.code}#${member.code}${String(seq).padStart(3, '0')}`;
          const isOwned = ownedCards.includes(botId);

          // Organiza o progresso global por tipo
          let target = `s${set.id}`;
          if (group.category === "Radiant") target = "radiant";
          if (group.category === "Events" || group.category === "Limiteds") target = "event";
          if (group.category === "Survival Shows") target = "survival";

          if (stats[target]) {
            stats[target].total++;
            if (isOwned) stats[target].owned++;
          }

          if (!isOwned) groupMissingCount++;
        });
      });
    });

    if (groupMissingCount > 0) {
      missingGroups.push({ 
        name: group.name, 
        missing: groupMissingCount,
        category: group.category 
      });
    }
  });

  const totalPossible = Object.values(stats).reduce((acc, curr) => acc + curr.total, 0);
  const totalOwned = ownedCards.length;

  return (
    <div className="dashboard-grid">
      {/* COLUNA 1: PROGRESSO GLOBAL */}
      <div className="dashboard-column">
        <div className="section-header">📊 GLOBAL PROGRESS</div>
        <div className="stats-container">
          {Object.entries(stats).map(([key, data]) => {
            if (data.total === 0) return null;
            const percent = ((data.owned / data.total) * 100).toFixed(1);
            return (
              <div key={key} className="progress-item">
                <div className="progress-label">
                  <span className="set-tag">{key.toUpperCase()}</span>
                  <span className="count">{data.owned}/{data.total} ({percent}%)</span>
                </div>
                <div className="discord-progress-bar">
                  <div className="fill" style={{ width: `${percent}%` }}></div>
                </div>
              </div>
            );
          })}
          
          <div className="total-main-card">
            <p>TOTAL PROGRESS</p>
            <h2>{totalOwned} / {totalPossible}</h2>
            <div className="discord-progress-bar big">
                <div className="fill" style={{ width: `${(totalOwned/totalPossible*100)}%` }}></div>
            </div>
            <small>{((totalOwned/totalPossible)*100).toFixed(2)}% COMPLETED</small>
          </div>
        </div>
      </div>

      {/* COLUNA 2: MISSING LIST */}
      <div className="dashboard-column">
        <div className="section-header">📄 MISSING - ALL CARDS</div>
        <div className="missing-list">
          <p className="missing-intro">You are missing {totalPossible - totalOwned} cards from {missingGroups.length} groups:</p>
          <div className="missing-grid">
            {missingGroups.map(g => (
              <div key={g.name} className="missing-item" onClick={() => onTabChange(g.category)}>
                <span className="group-name">{g.name}</span>
                <span className="missing-count">Cards: {g.missing}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}