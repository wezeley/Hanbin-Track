import { useState, useEffect } from "react";
import { HANBIN_DATA } from "./data/hanbinData";
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
  const handleViewChange = (view) =>
    navigate(view === "dashboard" ? homePath() : tabPath(view));

  const toggleSet = (id) =>
    setExpandedSets((p) => ({
      ...p,
      [id]: p[id] === undefined ? false : !p[id],
    }));

  const filteredGroups = GROUPS.filter(
    (g) => g.category?.toLowerCase() === activeTab?.toLowerCase(),
  );

  // Largura da área principal: a página do grupo é um pouco mais larga e a
  // da categoria usa a tela inteira (até 1600px) para caber mais cards.
  const isGroupPage = (currentView === "dashboard" && selectedGroup) || currentView === "collection";
  const isCategoryPage = currentView === "dashboard" && activeTab && !selectedGroup;
  const mainWidthClass = isGroupPage ? "app-main-wide" : isCategoryPage ? "app-main-full" : "";
  const isHomeActive = currentView !== "dashboard" || !activeTab;

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <button
          type="button"
          className="sidebar-logo"
          onClick={resetNavigation}
        >
          <span className="sidebar-logo-mark" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </span>
          <span className="sidebar-logo-text">Hanbin Tracker</span>
        </button>

        <nav className="sidebar-nav" aria-label="Categories">
          <button
            type="button"
            className={`sidebar-home ${isHomeActive ? "active" : ""}`}
            onClick={resetNavigation}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
            </svg>
            Home
          </button>

          <span className="sidebar-label">Categories</span>

          {SIDEBAR_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`sidebar-item ${currentView === "dashboard" && activeTab === cat ? "active" : ""}`}
              onClick={() => handleTabChange(cat)}
            >
              <span>{cat}</span>
              <span className="sidebar-count">
                {
                  GROUPS.filter(
                    (g) => g.category?.toLowerCase() === cat.toLowerCase(),
                  ).length
                }
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="app-column">
        <Header
          title={HANBIN_DATA.botName}
          currentView={currentView}
          onViewChange={handleViewChange}
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
    </div>
  );
}
export default App;
