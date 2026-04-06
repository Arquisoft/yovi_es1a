import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import Tablero from '../components/Tablero';
import { useLanguage } from '../idiomaConf/LanguageContext.tsx';

// Importaciones de estilos agrupadas
import "../styles/global.css";
import "../styles/Game.css";

const Game: React.FC = () => {
  const { t } = useLanguage();

  // ==========================================
  // 1. ESTADOS DEL JUEGO (Lógica interna)
  // ==========================================
  const [isSurrendered, setIsSurrendered] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  
  // Usamos "triggers" (contadores) para forzar al componente hijo (Tablero) 
  // a ejecutar una acción a través de useEffect cuando cambian.
  const [undoTrigger, setUndoTrigger] = useState(0);
  const [passTurnTrigger, setPassTurnTrigger] = useState(0); 

  // ==========================================
  // 2. ESTADOS DE LA INTERFAZ (UI)
  // ==========================================
  const [showModal, setShowModal] = useState(false);

  // ==========================================
  // 3. MANEJADORES DE EVENTOS (Handlers)
  // ==========================================

  // --- Modal de Rendición ---
  const handleSurrenderClick = () => setShowModal(true);
  
  const confirmSurrender = () => {
    setIsSurrendered(true);
    setShowModal(false);
  };
  
  const cancelSurrender = () => setShowModal(false);

  // --- Acciones de Turno ---
  const handleUndoClick = () => {
    if (canUndo) setUndoTrigger(prev => prev + 1);
  };

  const handlePassTurnClick = () => {
    setPassTurnTrigger(prev => prev + 1);
  };


  // ==========================================
  // 4. RENDERIZADO DEL COMPONENTE
  // ==========================================
  return (
    <div className="game-page">
      <NavBar activeTab="play" />
      
      <div className="game-container"> 
        {/* Cabecera y Controles */}
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

        {/* Tablero de Juego */}
        <Tablero 
          surrenderTrigger={isSurrendered} 
          undoTrigger={undoTrigger}
          passTurnTrigger={passTurnTrigger}
          onUndoStatusChange={setCanUndo}
        /> 
      </div>

      {/* 
        Modal de Confirmación de Rendición 
        Nota: Ahora usa t() para soportar múltiples idiomas.
      */}
      {showModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content">
            <h3>{t("confirmSurrender") || "¿Estás seguro de que quieres rendirte?"}</h3>
            <p>{t("surrenderWarning") || "Perderás la partida automáticamente."}</p>
            
            <div className="custom-modal-buttons">
              <button className="btn-modal-cancel" onClick={cancelSurrender}>
                {t("cancel") || "Cancelar"}
              </button>
              <button className="btn-modal-confirm" onClick={confirmSurrender}>
                {t("confirmSurrenderBtn") || "Sí, rendirme"}
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Game;