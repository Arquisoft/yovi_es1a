import React, { useState } from "react";
import { useLocation } from "react-router-dom"; 
import { gameService } from "../services/game.service";
import { statsService } from "../services/stats.service";
import "./Tablero.css";
import { useLanguage } from '../idiomaConf/LanguageContext.tsx';
import video from "../assets/videoLinea.mp4";

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
  const location = useLocation();
  
  const { 
    tamanoSeleccionado = 5, 
    botSeleccionado = "random_bot" ,
    modoSeleccionado = "bot"
  } = location.state || {};

  const size = tamanoSeleccionado;

  const getInitialLayout = (n: number) => ".".repeat((n * (n + 1)) / 2);

  const [layout, setLayout] = useState(getInitialLayout(size));
  const [turn, setTurn] = useState<Player>("B");
  const [loading, setLoading] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [user, setUser] = useState<{ userId: string; username: string } | null>(null);
  const [gameFinished, setGameFinished] = useState(false);

  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setLayout(getInitialLayout(size));
    setTurn("B");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, [size]);

  const safeSaveStats = async (result: "win" | "lose", finalBoard: string) => {
    if (!user || !user.userId) return;
    try {
      const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
      const moves = finalBoard.split("").filter(c => c !== ".").length;
      await statsService.saveMatchResult({
        user: user.userId,
        result,
        duration: durationSeconds,
        boardSize: size, 
        opponent: modoSeleccionado === "humano" ? "Amigo" : botSeleccionado, 
        totalMoves: moves,
        gameMode: modoSeleccionado === "humano" ? "human" : "computer"
      });
      console.log("Estadísticas guardadas con éxito en Node.js");
    } catch (error) {
      console.error("Error al guardar en la BD:", error);
    }
  };

  const play = async (index: number) => {
  const newLayoutArray = layout.split("");
  newLayoutArray[index] = turn;
  const updatedFlatLayout = newLayoutArray.join("");
  
  setLayout(updatedFlatLayout);

  if (modoSeleccionado === "humano") {
    setLoading(true);
    try {
      const yenLayout = stringToYenLayout(updatedFlatLayout, size);
      
  
      const data = await gameService.checkWinner(size, yenLayout);

      if (data.status === "win") {
        setGameFinished(true);
        const winnerName = turn === "B" ? "1 (Azul)" : "2 (Rojo)";
        if (turn === "R") {
          setTimeout(() => alert(`¡Ha ganado tu amigo! (Jugador ${winnerName}). Has perdido la partida.`), 100);
          await safeSaveStats("lose", updatedFlatLayout); 
        } else {
          setTimeout(() => alert(`¡Felicidades! Has ganado al Jugador ${winnerName}.`), 100);
          await safeSaveStats("win", updatedFlatLayout); 
    }
    
    setLoading(false);
    return;
}
    
      setTurn(turn === "B" ? "R" : "B");
    } catch (error) {
      console.error("Error verificando victoria en modo humano:", error);
    } finally {
      setLoading(false);
    }
    return; 
  }
  setTurn("R"); 
  setLoading(true);

  try {
    const yenLayout = stringToYenLayout(updatedFlatLayout, size); 
    const response = await gameService.askBotMove(botSeleccionado, size, 1, yenLayout); 

    if (response.game_status === "human_won") {
      setGameFinished(true);
      setTimeout(() => alert("¡HAS GANADO!"), 100);
      await safeSaveStats("win", updatedFlatLayout);
      return; 
    }

    const botIndex = coordsToIndex(response.coords.x, response.coords.y, size);
    const finalLayoutArray = updatedFlatLayout.split("");
    finalLayoutArray[botIndex] = "R";
    setLayout(finalLayoutArray.join(""));

    if (response.game_status === "bot_won") {
      setGameFinished(true);
      setTimeout(() => alert("HAS PERDIDO."), 100);
      await safeSaveStats("lose", finalLayoutArray.join(""));
      return;
    }

    setTurn("B"); 
  } catch (error) {
    console.error("Error communicating with the bot:", error);
    alert(`El bot ${botSeleccionado} no responde o la jugada fue inválida.`);
    setTurn("B"); 
  } finally {
    setLoading(false);
  }
};

  const crearTablero = () => {
    let index = 0;
    const filas = [];
    for (let i = 0; i < size; i++) {
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
          disabled={valor !== "." || loading || gameFinished} 
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

  //Usar el idioma
  const { t } = useLanguage();

  return (
    <div className="gameBoard">
      <video autoPlay muted loop className="videoIN">
        <source src={video} type="video/mp4" />
        No se ha podido mostrar el video de fondo
      </video>
      
      <div className="tablero-grid">
        {crearTablero()}
      </div>

      <p style={{ marginTop: '20px', fontSize: '1.2rem', color: 'white' }}>
        {t("turn")}: 
        <strong style={{ color: turn === "B" ? "#3b82f6" : "#ef4444", marginLeft: '10px' }}>
          {modoSeleccionado === "humano" 
            ? (turn === "B" ? "JUGADOR 1 (Azul)" : "JUGADOR 2 (Rojo)")
            : (turn === "B" ? "JUGADOR (Azul)" : "BOT (Rojo)")}
        </strong>
      </p>
      
      {loading && modoSeleccionado === "bot" && (
        <p style={{ color: '#60a5fa' }}>El Bot está calculando...</p>
      )}
    </div>
  );
};

export default Tablero;