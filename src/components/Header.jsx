export function Header({ title, activeTab, onHome, onTabChange }) {
  return (
    <nav className="top-nav">
      <div className="title" onClick={onHome} style={{fontSize: '1.2rem', fontWeight: 800, color: '#0f172a'}}>
        {title}
      </div>
      <div className="nav-links">
        <div className={`nav-item ${activeTab === null ? 'active' : ''}`} onClick={onHome}>
          🏠 Dashboard
        </div>
        <div className="nav-item">🗂 Folders</div>
        <div className="nav-item">🔍 Search</div>
      </div>
      <div className="user-profile" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
        <span style={{fontSize: '0.75rem', fontWeight: 700}}>WESLEY LIMA</span>
        <div style={{width: '32px', height: '32px', background: '#22c55e', borderRadius: '50%'}}></div>
      </div>
    </nav>
  );
}