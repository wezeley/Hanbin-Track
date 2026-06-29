export function Card({ botId, imagePath, isOwned, onToggle }) {
  return (
    <div className={`card ${isOwned ? 'owned' : ''}`} onClick={() => onToggle(botId)}>
      <div className="card-inner">
        <img 
          src={imagePath} 
          alt={botId} 
          className="card-image" 
          loading="lazy"
          onError={(e) => { 
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/110x165?text=NOT+FOUND'; 
          }} 
        />
      </div>
    </div>
  );
}