import React, { useState } from "react";
import { gameService } from "../services/game.service";
import { statsService } from "../services/stats.service";
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
  return (row * (row + 1)) / 2 + y;
};

const Tablero: React.FC = () => {
  const [layout, setLayout] = useState(INITIAL_LAYOUT);
  const [turn, setTurn] = useState<Player>("B");
  const [loading, setLoading] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [user, setUser] = useState<{ userId: string; username: string } | null>(null);

  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const safeSaveStats = async (result: "win" | "lose", finalBoard: string) => {
    if (!user || !user.userId) return;
    try {
      const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
      const moves = finalBoard.split("").filter(c => c !== ".").length;
      await statsService.saveMatchResult({
        user: user.userId,
        result,
        duration: durationSeconds,
        boardSize: TAM,
        opponent: "random_bot",
        totalMoves: moves,
        gameMode: "computer"
      });
      console.log("Estadísticas guardadas con éxito en Node.js");
    } catch (error) {
      console.error("Error al guardar en la BD:", error);
    }
  };

  const play = async (index: number) => {
    const newLayoutArray = layout.split("");
    newLayoutArray[index] = "B";
    const updatedFlatLayout = newLayoutArray.join("");
    
    setLayout(updatedFlatLayout);
    setTurn("R"); 
    setLoading(true);

    try {
      const yenLayout = stringToYenLayout(updatedFlatLayout, TAM);
      
      const response = await gameService.askBotMove("random_bot", TAM, 1, yenLayout);

      if (response.game_status === "human_won") {
        setTimeout(() => alert("¡HAS GANADO!"), 100);
        await safeSaveStats("win", updatedFlatLayout);
        return; 
      }

      const botIndex = coordsToIndex(response.coords.x, response.coords.y, TAM);
      const finalLayoutArray = updatedFlatLayout.split("");
      finalLayoutArray[botIndex] = "R";
      setLayout(finalLayoutArray.join(""));

      if (response.game_status === "bot_won") {
        setTimeout(() => alert("HAS PERDIDO."), 100);
        await safeSaveStats("lose", finalLayoutArray.join(""));
        return;
      }

      setTurn("B"); 
    } catch (error) {
      console.error("Error communicating with the bot:", error);
      alert("El motor de Rust no responde o la jugada fue inválida.");
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
        if (valor === "B") claseColor = " jugador-b";
        if (valor === "R") claseColor = " jugador-r";

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
      <div className="board">{crearTablero()}</div>
      <p style={{ marginTop: '20px', fontSize: '1.2rem' }}>Turno: <strong>{turn}</strong></p>
    </div>
  );
};

export default Tablero;