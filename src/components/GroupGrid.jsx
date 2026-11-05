export function GroupGrid({ groups, onSelectGroup }) {
  return (
    <div className="group-tiles-grid">
      {groups.map(group => (
        <div key={group.code} className="group-tile" onClick={() => onSelectGroup(group)}>
          {group.name}
        </div>
      ))}
    </div>
  );
}