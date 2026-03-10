import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import Tablero from '../components/Tablero';
import './Game.css';
import { useLanguage } from '../idiomaConf/LanguageContext.tsx';

const Game: React.FC = () => {
  const { t } = useLanguage();
  const [isSurrendered, setIsSurrendered] = useState(false);
  
  // Nuevos estados para controlar el Deshacer
  const [undoTrigger, setUndoTrigger] = useState(0);
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

  return (
    <div className="game-page">
      <NavBar activeTab="play" />
      <div className="game-container"> 
        
        <div className="game-header">
          <h2 className="game-title">{t("partCurso")}</h2>
          
          {/* Contenedor para agrupar los botones */}
          <div className="game-actions">
            <button 
              className="btn-undo" 
              onClick={handleUndoClick}
              disabled={!canUndo || isSurrendered}
            >
              {t("deshacer") || "Deshacer"}
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
          onUndoStatusChange={setCanUndo}
        /> 
      </div>
    </div>
  );
};

export default Game;