import { useState, useEffect } from "react";
import { HANBIN_DATA } from "./data/hanbinData";
import { GROUPS, SIDEBAR_CATEGORIES } from "./data/groups";
import { Header } from "./components/Header";
import { CategoryView } from "./components/CategoryView";
import { Dashboard } from "./components/Dashboard";
import { GroupView } from "./components/GroupView";
import "./App.css";

function App() {
  const [ownedCards, setOwnedCards] = useState(
    () => JSON.parse(localStorage.getItem("hanbin-collection")) || [],
  );
  const [activeTab, setActiveTab] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [expandedSets, setExpandedSets] = useState({});
  const [currentView, setCurrentView] = useState("dashboard");

  useEffect(
    () => localStorage.setItem("hanbin-collection", JSON.stringify(ownedCards)),
    [ownedCards],
  );

  // --- FUNÇÕES DE NAVEGAÇÃO ---
  const toggleCard = (id) =>
    setOwnedCards((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleTabChange = (cat) => {
    setCurrentView("dashboard");
    setActiveTab(cat);
    setSelectedGroup(null);
  };

  const handleGroupSelect = (group) => {
    setActiveTab(group.category);
    setSelectedGroup(group);
  };

  const resetNavigation = () => {
    setCurrentView("dashboard");
    setActiveTab(null);
    setSelectedGroup(null);
  };

  const handleViewChange = (view) => {
    if (view === "dashboard") {
      resetNavigation();
    } else {
      setCurrentView(view);
    }
  };

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
  const isGroupPage = currentView === "dashboard" && selectedGroup;
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
          {currentView !== "dashboard" ? (
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
              ownedCards={ownedCards}
              onGroupSelect={setSelectedGroup}
            />
          ) : (
            <GroupView
              group={selectedGroup}
              ownedCards={ownedCards}
              expandedSets={expandedSets}
              onToggleSet={toggleSet}
              onToggleCard={toggleCard}
              onBack={() => setSelectedGroup(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
export default App;
