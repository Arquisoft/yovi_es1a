import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import Tablero from '../components/Tablero';
import './Game.css';
import { useLanguage } from '../idiomaConf/LanguageContext.tsx';

const Game: React.FC = () => {
  const { t } = useLanguage();
  const [isSurrendered, setIsSurrendered] = useState(false);
  const [undoTrigger, setUndoTrigger] = useState(0);
  const [passTurnTrigger, setPassTurnTrigger] = useState(0); // <--- NUEVO
  const [canUndo, setCanUndo] = useState(false);

  const handleSurrenderClick = () => {
    if (window.confirm(t("confirmSurrender") || "¿Estás seguro?")) {
      setIsSurrendered(true);
    }
  };

  const handleUndoClick = () => {
    if (canUndo) {
      setUndoTrigger(prev => prev + 1);
    }
  };

  const handlePassTurnClick = () => {
    setPassTurnTrigger(prev => prev + 1); // <--- NUEVO
  };

  return (
    <div className="game-page">
      <NavBar activeTab="play" />
      <div className="game-container"> 
        
        <div className="game-header">
          <h2 className="game-title">{t("partCurso")}</h2>
          
          <div className="game-actions">
            <button 
              className="btn-undo" 
              onClick={handleUndoClick}
              disabled={!canUndo || isSurrendered}
            >
              {t("deshacer") || "Deshacer"}
            </button>
            <button 
              className="btn-pass" 
              onClick={handlePassTurnClick}
              disabled={isSurrendered}
            >
              {t("pasarTurno") || "Pasar"}
            </button>

            <button 
              className="btn-surrender" 
              onClick={handleSurrenderClick}
              disabled={isSurrendered}
            >
              {t("rendirse") || "Rendirse"}
            </button>
          </div>
        </div>

        <Tablero 
          surrenderTrigger={isSurrendered} 
          undoTrigger={undoTrigger}
          passTurnTrigger={passTurnTrigger}
          onUndoStatusChange={setCanUndo}
        /> 
      </div>
    </div>
  );
};

export default Game;