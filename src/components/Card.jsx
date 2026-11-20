const PLACEHOLDER = `${import.meta.env.BASE_URL}card-placeholder.svg`;

export function Card({ cardId, label, imagePath, isOwned, isHidden, onToggle }) {
  if (isHidden) return <div className="card-slot-empty" aria-hidden="true" />;

  return (
    <button
      type="button"
      className={`card-sleeve ${isOwned ? 'owned' : ''}`}
      onClick={() => onToggle(cardId)}
      aria-pressed={isOwned}
      aria-label={label}
      title={label}
    >
      <span className="card-sleeve-mouth" aria-hidden="true" />
      <span className="card-sleeve-image">
        <img
          src={imagePath || PLACEHOLDER}
          alt=""
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = PLACEHOLDER;
          }}
        />
      </span>
      <span className="card-sleeve-footer">
        <span>{cardId}</span>
        {isOwned && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12l5 5 9-10" />
          </svg>
        )}
      </span>
    </button>
  );
}
