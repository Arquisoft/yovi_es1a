import React, { useState,useEffect }  from "react";
import "./Tablero.css";
import avatar from './img/avatar.png';
import { useNavigate } from 'react-router-dom';

const TAM = 4;
type Player = "B" | "R";

const GameBoard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("play");
  const [layout, setLayout] = useState("....");
  const [turn, setTurn] = useState<Player>("B");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ userId: string; username: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  //Crear tablero del tamaño indicado
  //Empieza con . pero luego va cambiando
  const crearTablero = () => {
    let index = 0;
    const filas = [];

    for (let i = 0; i < TAM; i++) {
      const casillas = [];

      for (let j = 0; j <= i; j++) {
        const valor = layout[index];//Asigno .
        index++;

        casillas.push(
          <button
            key={`${i}-${j}`}
            className="casilla"
            onClick={() => jugar(i, j)}
            disabled={valor !== "." || loading}//Boton desabilitado si es distinto de . o si está esperando la respuesta del backend
          >
            {valor !== "." ? valor : ""}
          </button>//Si valor no es "." → la casilla tiene un jugador ("B" o "R"), sino ""
        );
      }

      filas.push(
        <div key={i} className="tablero">
          {casillas}
        </div>//Añado las casillas de cada fila
      );
    }

    return filas;
  };

  // Cuando el jugador hace click
  const jugar = async (_row: number, _col: number) => {
    setLoading(true);//Espero

    try {
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:3000";

      const res = await fetch(`${API_URL}/play`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          size: TAM,
          turn: turn,
          players: ["B", "R"],
          layout: layout,
          //move_: { row, col },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setLayout(data.layout);
        setTurn(data.turn);
      }
    } catch (error) {
      console.log("Error:", error);
    }

    setLoading(false);
  };

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



      <div className="gameBoard">
          <h2>Juego Y</h2>
          <div className="board">
              {crearTablero()}
          </div>

          <p>
          Turno: <strong>{turn}</strong>
        </p>
      </div>

    </div>
    );
  };

export default GameBoard;