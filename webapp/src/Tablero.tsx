import React, { useState }  from "react";
import "./Tablero.css";

const TAM = 4;
type Player = "B" | "R";

const GameBoard: React.FC = () => {
  const [layout, setLayout] = useState("....");
  const [turn, setTurn] = useState<Player>("B");
  const [loading, setLoading] = useState(false);

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
  const jugar = async (row: number, col: number) => {
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
    <div className="gameBoard">
        <h2>Juego Y</h2>
        <div className="board">
            {crearTablero()}
        </div>

        <p>
        Turno: <strong>{turn}</strong>
      </p>
    </div>
  );
};

export default GameBoard;