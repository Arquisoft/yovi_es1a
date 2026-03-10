import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import Tablero from '../components/Tablero';
import './Game.css';
import { useLanguage } from '../idiomaConf/LanguageContext.tsx';

const Game: React.FC = () => {
  const { t } = useLanguage();
  const [isSurrendered, setIsSurrendered] = useState(false);

  const handleSurrenderClick = () => {
    if (window.confirm(t("confirmSurrender"))) {
      setIsSurrendered(true);
    }
  };

  return (
    <div className="game-page">
      <NavBar activeTab="play" />
      <div className="game-container"> 
        
        {/* Cabecera más visual*/}
        <div className="game-header">
          <h2 className="game-title">{t("partCurso")}</h2>
          
          <button 
            className="btn-surrender" 
            onClick={handleSurrenderClick}
            disabled={isSurrendered}
          >
            {t("rendirse") || "Rendirse"}
          </button>
        </div>

        <Tablero surrenderTrigger={isSurrendered} /> 
      </div>
    </div>
  );
};

export default Game;