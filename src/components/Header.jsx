export function Header({ title, onHome }) {
  return (
    <header>
      <h1 className="title" onClick={onHome}>
        {title}
      </h1>
    </header>
  );
}