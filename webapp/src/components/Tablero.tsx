import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { gameService } from "../services/game.service";
import { statsService } from "../services/stats.service";
import "./Tablero.css";
import { useLanguage } from '../idiomaConf/LanguageContext.tsx';
import video from "../assets/videoLinea.mp4";

type Player = "B" | "R";

interface TableroProps {
  surrenderTrigger?: boolean;
  undoTrigger?: number;
  passTurnTrigger?: number; 
  onUndoStatusChange?: (canUndo: boolean) => void;
  
  // Props for online mode
  isOnline?: boolean;
  onlineColor?: Player;
  lastOpponentLayout?: string | null;
  onSendMove?: (newLayout: string) => void;
  opponentName?: string;
  tamano?: number;
  
}

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

const TURN_TIME_LIMIT = 20; 

const Tablero: React.FC<TableroProps> = ({ 
  surrenderTrigger, 
  undoTrigger, 
  passTurnTrigger, 
  onUndoStatusChange,
  isOnline,
  onlineColor,
  lastOpponentLayout,
  onSendMove,
  opponentName,
  tamano
}) => {
  const location = useLocation();
  const navigate = useNavigate(); 
  const { t } = useLanguage();

  const { 
    tamanoSeleccionado = 5, 
    botSeleccionado = "random_bot" ,
    modoSeleccionado = "bot",
    colorUsuario = "B"
  } = location.state || {};

  // ADAPTACIÓN MODO ONLINE
  const size = tamano || tamanoSeleccionado;
  const modoReal = isOnline ? "online" : modoSeleccionado;
  const miColor = isOnline ? (onlineColor as Player) : (colorUsuario as Player);
  
  const getInitialLayout = (n: number) => ".".repeat((n * (n + 1)) / 2);

  // Estados
  const [layout, setLayout] = useState(getInitialLayout(size));
  const [turn, setTurn] = useState<Player>("B");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [startTime] = useState<number>(Date.now());
  const [user, setUser] = useState<{ userId: string; username: string } | null>(null);
  
  const [gameFinished, setGameFinished] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winnerMessage, setWinnerMessage] = useState("");

  const [timeLeft, setTimeLeft] = useState(TURN_TIME_LIMIT); 

  // Determinamos si es el turno del jugador humano actual
  const isHumanTurn = modoReal === "humano" || modoReal === "online" || turn === miColor;


  // ==========================================
  // FUNCIONES BASE DE JUEGO
  // ==========================================

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
        opponent: modoReal === "online" ? (opponentName || "Jugador Online") : (modoReal === "humano" ? "Amigo" : botSeleccionado),
        totalMoves: moves,
        gameMode: modoReal === "bot" ? "computer" : "human"
      });
    } catch (error) {
      console.error("Error al guardar en la BD:", error);
    }
  };

  const play = async (index: number) => {
    if (gameFinished) return; 

    setHistory(prev => [...prev, layout]);

    const newLayoutArray = layout.split("");
    newLayoutArray[index] = turn;
    const updatedFlatLayout = newLayoutArray.join("");
    setLayout(updatedFlatLayout);

    // --- BLOQUE MODO ONLINE ---
    if (modoReal === "online") {
      setLoading(true);
      try {
        const yenLayout = stringToYenLayout(updatedFlatLayout, size);
        const data = await gameService.checkWinner(size, yenLayout);

        if (data.status === "win") {
          setGameFinished(true);
          const winnerText = turn === "B" ? "¡GANÓ EL AZUL!" : "¡GANÓ EL ROJO!";
          setWinnerMessage(winnerText);
          setShowWinnerModal(true);
          await safeSaveStats("win", updatedFlatLayout); 
        } else {
          setTurn(turn === "B" ? "R" : "B");
        }
        
        // Emitimos el tablero al servidor para que le llegue al rival
        if (onSendMove) onSendMove(updatedFlatLayout);
        
      } catch (error) {
        console.error("Error verificando victoria:", error);
      } finally {
        setLoading(false);
      }
      return; 
    }
    // --- FIN BLOQUE ONLINE ---

    // LÓGICA MODO HUMANO LOCAL
    if (modoReal === "humano") {
      setLoading(true);
      try {
        const yenLayout = stringToYenLayout(updatedFlatLayout, size);
        const data = await gameService.checkWinner(size, yenLayout);

        if (data.status === "win") {
          setGameFinished(true);
          const winnerText = turn === "B" ? "¡GANÓ EL AZUL!" : "¡GANÓ EL ROJO!";
          setWinnerMessage(winnerText);
          setShowWinnerModal(true);

          if (turn === miColor) {
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

    // LÓGICA MODO BOT
    const botColor: Player = miColor === "B" ? "R" : "B";
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

      setTurn(miColor);
    } catch (error) {
      console.error("Error communicating with the bot:", error);
      setTurn(miColor); 
    } finally {
      setLoading(false);
    }
  };

  const makeRandomMove = () => {
    const emptyIndices: number[] = [];
    for (let i = 0; i < layout.length; i++) {
      if (layout[i] === ".") emptyIndices.push(i);
    }
    
    if (emptyIndices.length > 0) {
      const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)]; 
      play(randomIndex);
    }
  };


  // ==========================================
  // USE EFFECTS
  // ==========================================

  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setLayout(getInitialLayout(size));
    setTurn("B");
    setHistory([]);
    if (storedUser) setUser(JSON.parse(storedUser));
  }, [size]);

  React.useEffect(() => {
    if (onUndoStatusChange) {
      onUndoStatusChange(history.length > 0 && !loading && !gameFinished);
    }
  }, [history.length, loading, gameFinished, onUndoStatusChange]);

  React.useEffect(() => {
    setTimeLeft(TURN_TIME_LIMIT);
  }, [turn, history.length]);

  React.useEffect(() => {
    if (gameFinished || loading || !isHumanTurn) return;
    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [turn, loading, gameFinished, isHumanTurn]);

  // Ejecutar movimiento por temporizador
  React.useEffect(() => {
    if (timeLeft === 0 && !gameFinished && !loading && isHumanTurn && modoReal !== "online") {
      makeRandomMove();
    }
  }, [timeLeft, gameFinished, loading, isHumanTurn, modoReal]);

  // Ejecutar movimiento por botón "Pasar Turno"
  React.useEffect(() => {
    if (passTurnTrigger && passTurnTrigger > 0 && isHumanTurn && !loading && !gameFinished && modoReal !== "online") {
      makeRandomMove();
    }
  }, [passTurnTrigger]);

  // Efecto Deshacer (Desactivado temporalmente en Online para evitar desincronizaciones complejas)
  React.useEffect(() => {
    if (undoTrigger && undoTrigger > 0 && history.length > 0 && modoReal !== "online") {
      const previousLayout = history[history.length - 1]; 
      setHistory(prev => prev.slice(0, -1)); 
      setLayout(previousLayout); 
      setGameFinished(false); 
      setShowWinnerModal(false);
      const moves = previousLayout.split("").filter(c => c !== ".").length;
      setTurn(moves % 2 === 0 ? "B" : "R");
    }
  }, [undoTrigger]);

  // Efecto Rendirse
  React.useEffect(() => {
    const handleSurrender = async () => {
      if (surrenderTrigger && !gameFinished) {
        setGameFinished(true);
        setWinnerMessage("TE HAS RENDIDO. HAS PERDIDO.");
        setShowWinnerModal(true);
        await safeSaveStats("lose", layout);
      }
    };
    handleSurrender();
  }, [surrenderTrigger]);

  // Primer movimiento del bot
  React.useEffect(() => {
    const botJuegaPrimero = async () => {
      if (modoReal === "bot" && miColor === "R" && layout === getInitialLayout(size)) {
        setLoading(true);
        try {
          const yenLayout = stringToYenLayout(layout, size);
          const response = await gameService.askBotMove(botSeleccionado, size, 0, yenLayout);
          const botIndex = coordsToIndex(response.coords.x, response.coords.y, size);
          const newLayoutArray = layout.split("");
          newLayoutArray[botIndex] = "B";
          const newLayout = newLayoutArray.join("");
          
          setHistory(prev => [...prev, layout]); 
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
  }, [modoReal, miColor, size, botSeleccionado]);

  // RECIBIR MOVIMIENTO DEL RIVAL ONLINE
  React.useEffect(() => {
    if (modoReal === "online" && lastOpponentLayout && lastOpponentLayout !== layout) {
      const procesarMovimientoRival = async () => {
        setHistory(prev => [...prev, layout]);
        setLayout(lastOpponentLayout);
        
        const yenLayout = stringToYenLayout(lastOpponentLayout, size);
        const data = await gameService.checkWinner(size, yenLayout);
        
        if (data.status === "win") {
          setGameFinished(true);
          setWinnerMessage("HAS PERDIDO.");
          setShowWinnerModal(true);
          await safeSaveStats("lose", lastOpponentLayout);
        } else {
          setTurn(miColor);
        }
      };
      
      procesarMovimientoRival();
    }
  }, [lastOpponentLayout, modoReal]);


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

        // En modo online solo puedes hacer clic si es tu turno
        const esClickeable = modoReal === "online"
          ? valor === "." && turn === miColor && !loading && !gameFinished
          : modoReal === "humano" 
            ? valor === "." && !loading && !gameFinished 
            : valor === "." && turn === miColor && !loading && !gameFinished; 

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

  return (
    <div className="gameBoard">
      <video autoPlay muted loop className="videoIN">
        <source src={video} type="video/mp4" />
        No se ha podido mostrar el video de fondo
      </video>
      
      <div className="tablero-grid">
        {crearTablero()}
      </div>

      <p style={{ marginTop: '20px', fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {t("turn")}: 
        <strong className={turn === "B" ? "turno-azul" : "turno-rojo"} style={{ marginLeft: '10px' }}>
          {modoReal === "online"
            ? (turn === miColor 
                ? `TÚ (${miColor === "B" ? "Azul" : "Rojo"})` 
                : `RIVAL (${miColor === "B" ? "Rojo" : "Azul"})`)
            : modoReal === "humano" 
              ? (turn === "B" 
                  ? `JUGADOR 1 (Azul) ${miColor === "B" ? "(Tú)" : "(Amigo)"}` 
                  : `JUGADOR 2 (Rojo) ${miColor === "R" ? "(Tú)" : "(Amigo)"}`)
              : (turn === miColor 
                  ? `TÚ (${miColor === "B" ? "Azul" : "Rojo"})` 
                  : `BOT (${miColor === "B" ? "Rojo" : "Azul"})`)}
        </strong>

        {isHumanTurn && !loading && !gameFinished && (
          <span style={{ 
            marginLeft: '20px', 
            color: timeLeft <= 5 ? '#ff4444' : '#ffd700',
            fontWeight: 'bold',
            textShadow: '0 0 5px rgba(255, 215, 0, 0.5)'
          }}>
            ⏱️ {timeLeft}s
          </span>
        )}
      </p>
      
      {loading && modoReal === "bot" && (
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