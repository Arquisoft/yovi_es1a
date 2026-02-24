import React, { useState,useEffect  } from "react";
import "./Menu.css";
import avatar from './img/avatar.png';

const Menu: React.FC = () => {
  const [activeTab, setActiveTab] = useState("play");
  const [user, setUser] = useState<{ userId: string; username: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div>
      <nav className="nav-bar">
        <div className="nav-left">
          <button onClick={() => setActiveTab("play")} className={`nav-item ${activeTab === "play" ? "active" : ""}`}>
            Jugar
          </button>
          <button onClick={() => setActiveTab("stats")} className={`nav-item ${activeTab === "stats" ? "active" : ""}`}>
            Estadísticas
          </button>
          <button onClick={() => setActiveTab("settings")} className={`nav-item ${activeTab === "settings" ? "active" : ""}`}>
            Ajustes
          </button>
        </div>

        <div className="nav-right">
          <button>Idioma</button>
          <button className="nav-item perfil">
            <img src={avatar} className="avatar" alt="avatar" />
            <span className="username">{user?.username || "Invitado"}</span>
          </button>
        </div>
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