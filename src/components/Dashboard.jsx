export function Dashboard({ ownedCount, totalAvailable, stats, onTabChange }) {
  return (
    <div className="home-dashboard">
      <div className="main-stats">
        <div className="stat-card">
          <h3>TOTAL PROGRESS</h3>
          <p>{ownedCount} <span>/ {totalAvailable}</span></p>
          <div className="progress-bar">
            <div className="progress-fill" style={{width: `${(ownedCount/totalAvailable)*100}%`}}></div>
          </div>
        </div>
      </div>
      <div className="category-stats-grid">
        {stats.map(stat => (
          <div key={stat.name} className="cat-stat-tile" onClick={() => onTabChange(stat.name)}>
            <h4>{stat.name}</h4>
            <p>{stat.count} <span>/ {stat.total}</span></p>
          </div>
        ))}
      </div>
    </div>
  );
}