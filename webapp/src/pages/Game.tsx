import React from 'react';
import NavBar from '../components/NavBar';
import Tablero from '../components/Tablero';
import './Game.css';
import { useLanguage } from '../idiomaConf/LanguageContext.tsx';

const Game: React.FC = () => {
  //Usar el idioma
  const { t } = useLanguage();

  return (
    <div className="game-page">
      <NavBar activeTab="play" />
      <div className="game-container"> 
        <h2 className="game-title">{t("partCurso")}</h2>
        <Tablero /> 
      </div>
    </div>
  );
};

export default Game;