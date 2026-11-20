import { useState, useEffect } from "react";
import { HANBIN_DATA } from "./data/hanbinData";
import { Header } from "./components/Header";
import { CategoryView } from "./components/CategoryView";
import { Dashboard } from "./components/Dashboard";
import { Card } from "./components/Card";
import { getGroupStructure } from "./utils/groupStructure";
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

  const baseUrl = import.meta.env.BASE_URL;
  const filteredGroups = HANBIN_DATA.groups.filter(
    (g) => g.category?.toLowerCase() === activeTab?.toLowerCase(),
  );
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

          {HANBIN_DATA.categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`sidebar-item ${currentView === "dashboard" && activeTab === cat ? "active" : ""}`}
              onClick={() => handleTabChange(cat)}
            >
              <span>{cat}</span>
              <span className="sidebar-count">
                {
                  HANBIN_DATA.groups.filter(
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

        <main className="app-main">
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
            <div className="skeleton-group-view">
              <button onClick={() => setSelectedGroup(null)}>VOLTAR</button>
              <h1>{selectedGroup.name}</h1>

              {getGroupStructure(selectedGroup).map((set) => (
                <div key={set.id} className="skeleton-set">
                  <div
                    className="skeleton-set-header"
                    onClick={() => toggleSet(`${selectedGroup.code}-${set.id}`)}
                  >
                    SET {set.id}{" "}
                    {expandedSets[`${selectedGroup.code}-${set.id}`] === false
                      ? "[Abrir]"
                      : "[Fechar]"}
                  </div>

                  {expandedSets[`${selectedGroup.code}-${set.id}`] !==
                    false && (
                    <div className="rarities-container">
                      {set.rarities.map((r) => (
                        <div key={r} className="skeleton-rarity-row">
                          <span>{r}H</span>
                          <div className="skeleton-grid">
                            {selectedGroup.members.map((m) => {
                              const seq =
                                (set.id - 1) * 5 + r + (m.offset || 0);
                              const botId = `${selectedGroup.code}#${m.code}${String(seq).padStart(3, "0")}`;

                              // --- NOVA LÓGICA DE IMAGEM (LINKS EXTERNOS) ---
                              let finalPath = "";

                              // 1. Tenta pegar o link do Spreadsheet (ex: m.links.s1h1)
                              if (m.links && m.links[`s${set.id}h${r}`]) {
                                finalPath = m.links[`s${set.id}h${r}`];
                              } else {
                                // 2. Fallback: Se não tiver link, usa a pasta local
                                const folder = (
                                  selectedGroup.folder || selectedGroup.code
                                ).toUpperCase();
                                const fileName =
                                  encodeURIComponent(botId).toUpperCase();
                                finalPath = `${baseUrl}cards/${folder}/${fileName}.png`;
                              }

                              return (
                                <Card
                                  key={botId}
                                  botId={botId}
                                  imagePath={finalPath}
                                  isOwned={ownedCards.includes(botId)}
                                  onToggle={toggleCard}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
export default App;
