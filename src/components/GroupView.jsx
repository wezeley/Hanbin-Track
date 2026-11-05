import { Card } from './Card';

export function GroupView({ group, ownedCards, onToggleCard, onBack, baseUrl, rarities }) {
  return (
    <div className="focused-group-view">
      <button className="back-button" onClick={onBack}>← BACK</button>
      <h2 className="focused-group-name">{group.name}</h2>

      {group.sets.map((set) => (
        <div key={set.id} className="set-section">
          <div className="set-symbol-container">
            <img src={`${baseUrl}symbols/S${set.id}.webp`} alt="Set" className="set-symbol-icon" />
          </div>
          <div className="rarities-container">
            {rarities.map((rarityLevel) => (
              <div key={rarityLevel} className="rarity-row">
                <div className="grid">
                  {group.members.map((member) => {
                    const seq = ((set.id - 1) * 5) + rarityLevel + (member.offset || 0);
                    const botId = `${group.code}#${member.code}${String(seq).padStart(3, '0')}`;
                    const folder = (group.folder || group.code).toUpperCase();
                    const path = `${baseUrl}cards/${folder}/${encodeURIComponent(botId).toUpperCase()}.webp`;
                    
                    return (
                      <Card 
                        key={botId} 
                        botId={botId} 
                        imagePath={path} 
                        isOwned={ownedCards.includes(botId)} 
                        onToggle={onToggleCard} 
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}