import React from 'react';
import { useLocation } from 'react-router-dom'; 
import NavBar from '../components/NavBar';
import Tablero from '../components/Tablero';
import './Game.css';
import { useLanguage } from '../idiomaConf/LanguageContext.tsx';

const Game: React.FC = () => {
  const location = useLocation();
  
  const configuracion = location.state || { 
    tamanoSeleccionado: 5, 
    botSeleccionado: "random_bot",
    modoSeleccionado: "bot"
  };

  //Usar el idioma
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="game-page">
      <NavBar activeTab="play" />
      <div className="game-container"> 
        <h2 className="game-title">{t("partCurso")}</h2>
        <Tablero size={configuracion.tamanoSeleccionado} /> 
      </div>
    </div>
  );
};

export default Game;