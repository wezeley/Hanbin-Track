import { useState, useEffect } from "react";
import { GROUPS, SIDEBAR_CATEGORIES } from "./data/groups";
import { Header } from "./components/Header";
import { CategoryView } from "./components/CategoryView";
import { Dashboard } from "./components/Dashboard";
import { GroupView } from "./components/GroupView";
import { CollectionView } from "./components/CollectionView";
import { navigate, useHashRoute } from "./hooks/useHashRoute";
import { categoryPath, collectionPath, groupPath, homePath, parseRoute, tabPath } from "./utils/routes";
import "./App.css";

function App() {
  const [ownedCards, setOwnedCards] = useState(
    () => JSON.parse(localStorage.getItem("hanbin-collection")) || [],
  );
  const [expandedSets, setExpandedSets] = useState({});

  // A tela atual vem do endereço (#/group/SKZ): é a única fonte. Clicar em
  // algo muda o endereço; daqui sai o que mostrar.
  //   currentView: "dashboard" (Home, categoria e grupo) ou uma aba do topo
  //   activeTab:   a categoria aberta (ou a do grupo aberto), ou null na Home
  //   selectedGroup: o grupo aberto, ou null
  const route = parseRoute(useHashRoute(), SIDEBAR_CATEGORIES, GROUPS);
  const isTopTab = !["home", "category", "group"].includes(route.view);
  const currentView = isTopTab ? route.view : "dashboard";
  const activeTab = route.category;
  const selectedGroup = route.group;
  // Busca da categoria: o texto fica guardado junto com a categoria em que foi
  // digitado. Assim continua ao voltar de um grupo e some ao trocar de categoria.
  const [categorySearch, setCategorySearch] = useState({ category: null, text: "" });
  const categoryQuery = categorySearch.category === activeTab ? categorySearch.text : "";

  useEffect(
    () => localStorage.setItem("hanbin-collection", JSON.stringify(ownedCards)),
    [ownedCards],
  );

  // --- FUNÇÕES DE NAVEGAÇÃO ---
  const toggleCard = (id) =>
    setOwnedCards((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  // Marca (owned = true) ou desmarca (false) várias cartas de uma vez,
  // como uma linha inteira de raridade no fichário.
  const setCardsOwned = (ids, owned) =>
    setOwnedCards((prev) =>
      owned
        ? [...prev, ...ids.filter((id) => !prev.includes(id))]
        : prev.filter((x) => !ids.includes(x)),
    );

  // Navegação: cada clique só muda o endereço
  const handleTabChange = (cat) => navigate(categoryPath(cat));
  const handleGroupSelect = (group) => navigate(groupPath(group));
  const resetNavigation = () => navigate(homePath());

  const toggleSet = (id) =>
    setExpandedSets((p) => ({
      ...p,
      [id]: p[id] === undefined ? false : !p[id],
    }));

  const filteredGroups = GROUPS.filter(
    (g) => g.category?.toLowerCase() === activeTab?.toLowerCase(),
  );

  // Página do grupo (e a Collection): menos espaço em cima do conteúdo.
  // A largura é a mesma em todas as páginas (1360px, no App.css).
  const isGroupPage = (currentView === "dashboard" && selectedGroup) || currentView === "collection";
  const mainWidthClass = isGroupPage ? "app-main-wide" : "";

  // Chips da página de categoria: nome e quantidade de grupos de cada uma.
  const categoryChips = SIDEBAR_CATEGORIES.map((name) => ({
    name,
    count: GROUPS.filter((g) => g.category?.toLowerCase() === name.toLowerCase()).length,
  }));

  // Link do topo que fica sublinhado, pelo tipo de página (route.view).
  // Categoria e grupo são páginas do link "Groups".
  const ACTIVE_LINK = {
    home: "home",
    category: "groups",
    group: "groups",
    cards: "cards",
    collection: "collection",
    commands: "commands",
  };
  const activeLink = ACTIVE_LINK[route.view] ?? null;

  // Para onde o link "Groups" leva: a última categoria aberta (abrir um
  // grupo também conta, pela categoria dele) ou, antes disso, Boy Group.
  // Fica só enquanto a página está aberta: recarregar volta para Boy Group.
  const [lastCategory, setLastCategory] = useState(null);
  useEffect(() => {
    if (activeTab) setLastCategory(activeTab);
  }, [activeTab]);
  const groupsCategory = lastCategory ?? "Boy Group";

  // Clique num link do topo
  const handleNavigate = (id) => {
    if (id === "home") resetNavigation();
    else if (id === "groups") handleTabChange(groupsCategory);
    else navigate(tabPath(id));
  };

  return (
    <div className="app">
      <Header
        activeLink={activeLink}
        onNavigate={handleNavigate}
        onLogoClick={resetNavigation}
      />

        <main
          className={`app-main ${mainWidthClass}`}
        >
          {currentView === "collection" ? (
            <CollectionView
              collectionId={route.collectionId}
              ownedCards={ownedCards}
              onOpen={(collection) => navigate(collectionPath(collection))}
              onBack={() => navigate(tabPath("collection"))}
              onToggleCard={toggleCard}
            />
          ) : currentView !== "dashboard" ? (
            <p>Em breve.</p>
          ) : !activeTab ? (
            <Dashboard
              ownedCards={ownedCards}
              onGroupSelect={handleGroupSelect}
            />
          ) : !selectedGroup ? (
            <CategoryView
              category={activeTab}
              categories={categoryChips}
              onCategoryChange={handleTabChange}
              groups={filteredGroups}
              query={categoryQuery}
              onQueryChange={(text) => setCategorySearch({ category: activeTab, text })}
              ownedCards={ownedCards}
              onGroupSelect={handleGroupSelect}
            />
          ) : (
            <GroupView
              key={selectedGroup.code} // outro grupo (pelo botão voltar) começa do zero, com filtro All
              group={selectedGroup}
              ownedCards={ownedCards}
              expandedSets={expandedSets}
              onToggleSet={toggleSet}
              onToggleCard={toggleCard}
              onSetCardsOwned={setCardsOwned}
              onBack={() => handleTabChange(selectedGroup.category)}
            />
          )}
        </main>
    </div>
  );
}
export default App;
