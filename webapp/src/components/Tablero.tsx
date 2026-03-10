import React, { useState } from "react";
interface TableroProps {
  surrenderTrigger?: boolean; // Flag para indicar si se ha activado la rendición
}
import { useLocation, useNavigate } from "react-router-dom";
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

const Tablero: React.FC<TableroProps> = ({ surrenderTrigger }) => {
  const location = useLocation();
  const navigate = useNavigate(); 
  
  const { 
    tamanoSeleccionado = 5, 
    botSeleccionado = "random_bot" ,
    modoSeleccionado = "bot",
    colorUsuario = "B"
  } = location.state || {};

  const size = tamanoSeleccionado;
  const getInitialLayout = (n: number) => ".".repeat((n * (n + 1)) / 2);

  const [layout, setLayout] = useState(getInitialLayout(size));
  const [turn, setTurn] = useState<Player>("B");
  const [loading, setLoading] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [user, setUser] = useState<{ userId: string; username: string } | null>(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winnerMessage, setWinnerMessage] = useState("");

  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setLayout(getInitialLayout(size));
    setTurn("B");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, [size]);

  React.useEffect(() => {
  const handleSurrender = async () => {
    if (surrenderTrigger && !gameFinished) {
      setGameFinished(true);
      setWinnerMessage("TE HAS RENDIDO. HAS PERDIDO.");
      setShowWinnerModal(true);
      
      // Guardamos la derrota en la BD
      await safeSaveStats("lose", layout);
    }
  };
  
  handleSurrender();
}, [surrenderTrigger]);

  React.useEffect(() => {
    const botJuegaPrimero = async () => {
      if (modoSeleccionado === "bot" && colorUsuario === "R" && layout === getInitialLayout(size)) {
        setLoading(true);
        try {
          const yenLayout = stringToYenLayout(layout, size);
          const response = await gameService.askBotMove(botSeleccionado, size, 0, yenLayout);

          const botIndex = coordsToIndex(response.coords.x, response.coords.y, size);
          const newLayoutArray = layout.split("");
          newLayoutArray[botIndex] = "B";
          const newLayout = newLayoutArray.join("");
          setLayout(newLayout);
          
          const yenLayoutAfterBot = stringToYenLayout(newLayout, size);
          const checkBot = await gameService.checkWinner(size, yenLayoutAfterBot);
          
          if (checkBot.status === "win") {
            setGameFinished(true);
            setWinnerMessage("HAS PERDIDO.");
            setShowWinnerModal(true);
            await safeSaveStats("lose", newLayout);
            return;
          }
          
          setTurn("R");
        } catch (error) {
          console.error("Error en el primer movimiento del bot:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    botJuegaPrimero();
  }, [modoSeleccionado, colorUsuario, size, botSeleccionado]);

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
    } catch (error) {
      console.error("Error al guardar en la BD:", error);
    }
  };

  const play = async (index: number) => {
    if (gameFinished) return; 

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
          const winnerText = turn === "B" ? "¡GANÓ EL AZUL!" : "¡GANÓ EL ROJO!";
          setWinnerMessage(winnerText);
          setShowWinnerModal(true);

          if (turn === colorUsuario) {
            await safeSaveStats("win", updatedFlatLayout); 
          } else {
            await safeSaveStats("lose", updatedFlatLayout); 
          }
          setLoading(false);
          return;
        }
        setTurn(turn === "B" ? "R" : "B");
      } catch (error) {
        console.error("Error verificando victoria:", error);
      } finally {
        setLoading(false);
      }
      return; 
    }

    const botColor: Player = colorUsuario === "B" ? "R" : "B";
    setTurn(botColor); 
    setLoading(true);

    try {
      const yenLayoutAfterHuman = stringToYenLayout(updatedFlatLayout, size);
      const checkHuman = await gameService.checkWinner(size, yenLayoutAfterHuman);
      
      if (checkHuman && checkHuman.status === "win") {
        setGameFinished(true);
        setWinnerMessage("¡HAS GANADO!");
        setShowWinnerModal(true);
        await safeSaveStats("win", updatedFlatLayout);
        setLoading(false);
        return;
      }

      const yenLayout = stringToYenLayout(updatedFlatLayout, size); 
      const turnoDelBot = botColor === "B" ? 0 : 1;
      const response = await gameService.askBotMove(botSeleccionado, size, turnoDelBot, yenLayout); 

      const botIndex = coordsToIndex(response.coords.x, response.coords.y, size);
      const finalLayoutArray = updatedFlatLayout.split("");
      finalLayoutArray[botIndex] = botColor;
      const finalLayout = finalLayoutArray.join("");
      setLayout(finalLayout);

      const yenLayoutAfterBot = stringToYenLayout(finalLayout, size);
      const checkBot = await gameService.checkWinner(size, yenLayoutAfterBot);

      if (checkBot && checkBot.status === "win") {
        setGameFinished(true);
        setWinnerMessage("HAS PERDIDO.");
        setShowWinnerModal(true);
        await safeSaveStats("lose", finalLayout);
        setLoading(false);
        return;
      }

      setTurn(colorUsuario);
    } catch (error) {
      console.error("Error communicating with the bot:", error);
      setTurn(colorUsuario); 
    } finally {
      setLoading(false);
    }
  };

  const crearTablero = () => {
    const baseSize = size > 10 ? 380 : 450; 
    const cellSize = Math.min(50, Math.floor(baseSize / size)); 
    const cellHeight = Math.floor(cellSize * 1.15);

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

        const esClickeable = modoSeleccionado === "humano" 
          ? valor === "." && !loading && !gameFinished 
          : valor === "." && turn === colorUsuario && !loading && !gameFinished; 

        casillas.push(
          <button
            key={`${i}-${j}`}
            className={`casilla${claseColor}`} 
            onClick={() => esClickeable && play(currentIndex)}
            disabled={!esClickeable} 
            style={{ 
              width: `${cellSize}px`, 
              height: `${cellHeight}px`,
              margin: `${cellSize * 0.05}px` 
            }}
          />
        );
        index++;
      }
      filas.push(<div key={i} className="tablero" style={{ gap: `${cellSize * 0.1}px` }}>{casillas}</div>);
    }
    return filas;
  };

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
        <strong className={turn === "B" ? "turno-azul" : "turno-rojo"} style={{ marginLeft: '10px' }}>
          {modoSeleccionado === "humano" 
            ? (turn === "B" 
                ? `JUGADOR 1 (Azul) ${colorUsuario === "B" ? "(Tú)" : "(Amigo)"}` 
                : `JUGADOR 2 (Rojo) ${colorUsuario === "R" ? "(Tú)" : "(Amigo)"}`)
            : (turn === colorUsuario 
                ? `TÚ (${colorUsuario === "B" ? "Azul" : "Rojo"})` 
                : `BOT (${colorUsuario === "B" ? "Rojo" : "Azul"})`)}
        </strong>
      </p>
      
      {loading && modoSeleccionado === "bot" && (
        <p style={{ color: '#60a5fa' }}>El Bot está calculando...</p>
      )}


      {showWinnerModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className={`modal-title ${
                winnerMessage.includes("GANADO") || winnerMessage.includes("AZUL") || winnerMessage.includes("GANASTE")
                  ? "turno-azul" 
                  : "turno-rojo"
              }`}>
                {winnerMessage}
              </h2>
              
              <div className="modal-actions">
                <button className="btn-modal primary" onClick={() => window.location.reload()}>
                  {t("jugar")} 
                </button>
                <button className="btn-modal secondary" onClick={() => navigate("/")}>
                  {t("inicio")}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Tablero;