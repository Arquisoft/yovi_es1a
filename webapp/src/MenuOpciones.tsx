import React, { useState } from "react";
import "./Menu.css";

const Menu: React.FC = () => {
  const [activeTab, setActiveTab] = useState("play");

  return (
    <div>
      <nav className="nav-bar">
        <button onClick={() => setActiveTab("play")} className="nav-item">
          Jugar
        </button>
        <button onClick={() => setActiveTab("stats")} className="nav-item">
          Estadísticas
        </button>
        <button onClick={() => setActiveTab("settings")} className="nav-item">
          Ajustes
        </button>
      </nav>

      <div className="content">
        {activeTab === "play" && <p>Panel de juego</p>}
        {activeTab === "stats" && <p>Panel de estadísticas</p>}
        {activeTab === "settings" && <p>Panel de ajustes</p>}
      </div>

    </div>
  );
};

export default Menu;