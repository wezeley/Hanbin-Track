// Chips das categorias, embaixo do título da página de categoria.
// "categories" = [{ name, count }]; o chip da categoria aberta fica escuro.
// Em tela estreita a linha rola para o lado (overflow-x no CSS).
export function CategoryChips({ categories, active, onSelect }) {
  return (
    <nav className="category-chips" aria-label="Categories">
      {categories.map(({ name, count }) => (
        <button
          key={name}
          type="button"
          className={`category-chip ${name === active ? 'active' : ''}`}
          aria-current={name === active ? 'page' : undefined}
          onClick={() => onSelect(name)}
        >
          {name}
          <span className="category-chip-count">{count}</span>
        </button>
      ))}
    </nav>
  );
}
