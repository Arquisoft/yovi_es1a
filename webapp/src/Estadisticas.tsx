import React, { useState,useEffect  } from "react";
import avatar from './img/avatar.png';
import { useNavigate } from 'react-router-dom';
import "./Menu.css";


const Estadisticas: React.FC = () => {
    const [activeTab, setActiveTab] = useState("stats");
    const [user, setUser] = useState<{ userId: string; username: string } | null>(null);
    const navigate = useNavigate();

    
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
          <button onClick={() => {
            setActiveTab("Inicio")
            navigate("/menu")}}
            className={`nav-item ${activeTab === "Inicio" ? "active" : ""}`}>
            Inicio
          </button>
          <button onClick={() => {
            setActiveTab("play")
            navigate("/game")}}
            className={`nav-item ${activeTab === "play" ? "active" : ""}`}>
            Jugar
          </button>
          <button onClick={() => {
            setActiveTab("stats")
            navigate("/estadisticas")}}
            className={`nav-item ${activeTab === "stats" ? "active" : ""}`}>
            Estadísticas
          </button>
        </div>

        <div className="nav-right">
          <button className="nav-item">Idioma</button>
          <button className="nav-item perfil">
            <img src={avatar} className="avatar" alt="avatar" />
            <span className="username">{user?.username || "Invitado"}</span>
          </button>
        </div>
      </nav>
    <h2>ESTADÍSTICAS</h2>
    </div>
  );
};

export default Estadisticas;