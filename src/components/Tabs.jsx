export function Tabs({ categories, activeTab, onTabChange }) {
  return (
    <nav className="tabs-container">
      {categories.map((cat) => (
        <button 
          key={cat}
          className={`tab-button ${activeTab === cat ? 'active' : ''}`}
          onClick={() => onTabChange(cat)}
        >
          {cat}
        </button>
      ))}
    </nav>
  );
}