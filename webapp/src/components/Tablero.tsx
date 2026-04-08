import React from "react";
import { useNavigate } from "react-router-dom";
import "./Tablero.css";
import { useLanguage } from '../idiomaConf/LanguageContext.tsx';
import video from "../assets/videoLinea.mp4";
import { useTablero } from "../hooks/useTablero";

type Player = "B" | "R";

interface TableroProps {
  surrenderTrigger?: boolean;
  undoTrigger?: number;
  passTurnTrigger?: number; 
  onUndoStatusChange?: (canUndo: boolean) => void;
  isOnline?: boolean;
  onlineColor?: Player;
  lastOpponentLayout?: string | null;
  onSendMove?: (newLayout: string) => void;
  opponentName?: string;
  tamano?: number;
  onLeave?: () => void;
}

const Tablero: React.FC<TableroProps> = (props) => {
  const navigate = useNavigate(); 
  const { t } = useLanguage();

  const { 
    layout, turn, loading, gameFinished, showWinnerModal, winnerMessage, timeLeft,
    isHumanTurn, modoReal, miColor, size, play
  } = useTablero(props);

  const crearTablero = () => {
    const navbarHeight = 60;
    const headerHeight = 150;
    const turnInfoHeight = 60;
    const availableHeight = window.innerHeight - navbarHeight - headerHeight - turnInfoHeight;
    const availableWidth = window.innerWidth - 150;
    
    const maxByHeight = Math.floor(availableHeight / (size * 1.15));
    const maxByWidth = Math.floor(availableWidth / size);
    const cellSize = Math.max(4, Math.min(50, maxByHeight, maxByWidth));
    const cellHeight = Math.floor(cellSize * 1.15);

    let index = 0;
    const filas = [];
    for (let i = 0; i < size; i++) {
      const casillas = [];
      for (let j = 0; j <= i; j++) {
        const currentIndex = index; 
        const valor = layout[currentIndex];
        
        const esClickeable = modoReal === "online"
          ? valor === "." && turn === miColor && !loading && !gameFinished
          : modoReal === "humano" 
            ? valor === "." && !loading && !gameFinished 
            : valor === "." && turn === miColor && !loading && !gameFinished; 

        casillas.push(
          <button
            key={`${i}-${j}`}
            className={`casilla${valor === "B" ? " jugador-b" : valor === "R" ? " jugador-r" : ""}`} 
            onClick={() => esClickeable && play(currentIndex)}
            disabled={!esClickeable} 
            style={{ width: `${cellSize}px`, height: `${cellHeight}px`, margin: `${Math.max(0.5, cellSize * 0.05)}px` }}
          />
        );
        index++;
      }
      filas.push(
        <div key={i} className="tablero" style={{ gap: `${Math.max(1, cellSize * 0.1)}px` }}>
          {casillas}
        </div>
      );
    }
    return filas;
  };

  return (
    <div className="gameBoard">
      <video autoPlay muted loop className="videoIN">
        <source src={video} type="video/mp4" />
      </video>
      
      <div className="tablero-grid">
        {crearTablero()}
      </div>

      <p style={{ marginTop: '20px', fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {t("turn")}: 
        <strong className={turn === "B" ? "turno-azul" : "turno-rojo"} style={{ marginLeft: '10px' }}>
          {modoReal === "online"
            ? (turn === miColor ? `TÚ (${miColor === "B" ? "Azul" : "Rojo"})` : `RIVAL (${miColor === "B" ? "Rojo" : "Azul"})`)
            : modoReal === "humano" 
              ? (turn === "B" ? `JUGADOR 1 (Azul) ${miColor === "B" ? "(Tú)" : "(Amigo)"}` : `JUGADOR 2 (Rojo) ${miColor === "R" ? "(Tú)" : "(Amigo)"}`)
              : (turn === miColor ? `TÚ (${miColor === "B" ? "Azul" : "Rojo"})` : `BOT (${miColor === "B" ? "Rojo" : "Azul"})`)}
        </strong>

        {isHumanTurn && !loading && !gameFinished && modoReal !== "online" && (
          <span style={{ marginLeft: '20px', color: timeLeft <= 5 ? '#ff4444' : '#ffd700', fontWeight: 'bold' }}>
            ⏱️ {timeLeft}s
          </span>
        )}
      </p>
      
      {loading && modoReal === "bot" && <p style={{ color: '#60a5fa' }}>{t("botCalc")}</p>}

      {showWinnerModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className={`modal-title ${winnerMessage.includes("GANADO") || winnerMessage.includes("AZUL") ? "turno-azul" : "turno-rojo"}`}>
                {winnerMessage}
              </h2>
              <div className="modal-actions">
                
                <button className="btn-modal primary" onClick={() => {
                   if (modoReal === "online") {
                     if (props.onLeave) props.onLeave();
                     setTimeout(() => { navigate("/multiplayer"); }, 150);
                   } else {
                     window.location.reload();
                   }
                }}>
                  {modoReal === "online" ? "Volver al Lobby" : t("jugar")}
                </button>
                
                <button className="btn-modal secondary" onClick={() => {
                      if (props.onLeave) props.onLeave(); 
                      setTimeout(() => { navigate("/statistics"); }, 150);
                }}>
                    {t("estadisticas")}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Tablero;