import React, { useState } from "react";
import { gameService } from "../services/game.service";
import "./Tablero.css";

const TAM = 4;
const INITIAL_LAYOUT = ".........."; 
type Player = "B" | "R";


const stringToYenLayout = (flatLayout: string, size: number) => {
  let yenLayout = "";
  let currentIndex = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= r; c++) {
      yenLayout += flatLayout[currentIndex];
      currentIndex++;
    }
    if (r < size - 1) yenLayout += "/";
  }
  return yenLayout;
};

const coordsToIndex = (x: number, y: number, size: number) => {
  const row = size - 1 - x;
  const col = y;
  return (row * (row + 1)) / 2 + col;
};

const Tablero: React.FC = () => {
  const [layout, setLayout] = useState(INITIAL_LAYOUT);
  const [turn, setTurn] = useState<Player>("B");
  const [loading, setLoading] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [user, setUser] = useState<{ userId: string; username: string } | null>(null);

  /* * INITIALIZATION EFFECT:
  * Executes only once when the component loads ([]).
  * Checks if a user is stored in the browser's memory (previous login).
  * If found, converts it from text to an object and stores it in the local state
  * to know who is playing.
  */
  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const play = async (index: number) => {
    //Human's move
    const newLayoutArray = layout.split("");
    newLayoutArray[index] = "B";
    const updatedFlatLayout = newLayoutArray.join("");
    
    setLayout(updatedFlatLayout);
    setTurn("R"); //Bots turn
    setLoading(true);

    try {
      const yenLayout = stringToYenLayout(updatedFlatLayout, TAM);
      
      const botCoords = await gameService.askBotMove("random_bot", TAM, 1, yenLayout);

      const botIndex = coordsToIndex(botCoords.x, botCoords.y, TAM);

      const finalLayoutArray = updatedFlatLayout.split("");
      finalLayoutArray[botIndex] = "R";
      setLayout(finalLayoutArray.join(""));
      setTurn("B"); 

    } catch (error) {
      console.error("Error communicating with the bot:", error);
      alert("The Rust engine is not responding or the play was invalid.");
      setTurn("B"); 
    } finally {
      setLoading(false);
    }
  };

  const crearTablero = () => {
    let index = 0;
    const filas = [];

    for (let i = 0; i < TAM; i++) {
      const casillas = [];
      for (let j = 0; j <= i; j++) {
        const currentIndex = index; 
        const valor = layout[currentIndex];
        
        let claseColor = "";
        if (valor === "B") claseColor = " player-b";
        if (valor === "R") claseColor = " player-r";

        casillas.push(
          <button
            key={`${i}-${j}`}
            className={`casilla${claseColor}`} 
            onClick={() => play(currentIndex)}
            disabled={valor !== "." || loading}
          >
            {valor !== "." ? valor : ""}
          </button>
        );
        index++;
      }
      filas.push(<div key={i} className="tablero">{casillas}</div>);
    }
    return filas;
  };

  return (
    <div className="gameBoard">
      <div className="board">
        {crearTablero()}
      </div>
      <p style={{ marginTop: '20px', fontSize: '1.2rem' }}>
        Turno: <strong>{turn}</strong>
      </p>
    </div>
  );
};

export default Tablero;