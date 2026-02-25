import React, { useState,useEffect  } from "react";
import "./Menu.css";
import avatar from './img/avatar.png';
import { useNavigate } from 'react-router-dom';

const Menu: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Inicio");
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
          <button>Idioma</button>
          <button className="nav-item perfil">
            <img src={avatar} className="avatar" alt="avatar" />
            <span className="username">{user?.username || "Invitado"}</span>
          </button>
        </div>
      </nav>

      <div className="content">
        <h2>Bienvenido a Game Y</h2>
        <h3>Introducción</h3>
        <p>El juego Y es un juego de tablero donde prima la estrategia. El objetivo será conectar los tres lados del teclado antes que tu oponente</p>
        <h3>Reglas del juego</h3>
        <ul>
          <li>Se juega por turnos</li>
          <li>el ganador será el primero en conectar los tres lados del tablero</li>
        </ul>
        <h3>Posibilidades</h3>
          <ul>
            <li>Jugar contra un bot</li>
            <li>Elegir estrategia y nivel de dificultad</li>
            <li>Consultar estadísticas</li>
          </ul>

        <h3>Estrategias disponibles</h3>
          <ul>
            <li>Estrategia de expansión: el bot intentará, si es posible, marcar casillas vecinas.</li>
            <li>Monte carlo: el bot calcula las posibles posibilidades y marca la casilla donde más posibilidades tiene de ganar.</li>
            <li>Prioridad en el bloqueo: El bot marca la casilla más proximida a sus propias piezas y bloquea a las del enemigo, dando prioridad a los bordes.</li>
            <li>Random: el bot marca una casilla al azar de las disponibles.</li>
            <li>Shortest path: el bot elige la casillas que maximiza la conexión propia entre los lados del tablero y bloquea las oportunidades del oponente.</li>
            <li>Bloque simple: el bot elige la casilla vacía más cercana a las piezas del oponente para bloquear su expansión. Si no hay piezas enemigas cercanas, elige aleatoriamente.</li>
            <li>Triángulo de ataque: El bot busca casillas vacías que conecten varias de sus propias piezas. Si no hay, se expande.</li>
          </ul>



      </div>

    </div>
  );
};

export default Menu;