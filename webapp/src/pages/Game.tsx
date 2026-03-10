import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import Tablero from '../components/Tablero';
import './Game.css';
import { useLanguage } from '../idiomaConf/LanguageContext.tsx';

const Game: React.FC = () => {
  const { t } = useLanguage();
  const [isSurrendered, setIsSurrendered] = useState(false);

  const handleSurrenderClick = () => { // Función para manejar el clic en el botón de rendirse
    if (window.confirm(t("confirmSurrender"))) {// Confirmar rendición
      setIsSurrendered(true); // Activar el estado de rendición, que se pasará al tablero para finalizar la partida
    }
};

  return (
    <div className="game-page">
      <NavBar activeTab="play" />
      <div className="game-container"> 
        <div className="game-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="game-title" style={{ margin: 0 }}>{t("partCurso")}</h2>
          
          <button 
            className="btn-surrender" 
            onClick={handleSurrenderClick}
            disabled={isSurrendered}
          >
            🏳️ {t("rendirse") || "Rendirse"}
          </button>
        </div>

        {/* Le pasamos el estado al tablero */}
        <Tablero surrenderTrigger={isSurrendered} /> 
      </div>
    </div>
  );
};

export default Game;