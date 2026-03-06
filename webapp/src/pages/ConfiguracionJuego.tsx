import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import "./ConfiguracionJuego.css"; 
import { useLanguage } from '../idiomaConf/LanguageContext.tsx';
import video from "../assets/videoLinea.mp4";

const ConfiguracionJuego: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [modo, setModo] = useState<"humano" | "bot">("bot");
  const [tamano, setTamano] = useState<number>(5);
  const [bot, setBot] = useState<string>("random_bot");
  const [dificultad, setDificultad] = useState<"facil" | "medio" | "dificil">("facil");

  const irAlJuego = () => {
    navigate("/partida", { 
      state: { tamanoSeleccionado: tamano, botSeleccionado: bot, modoSeleccionado: modo } 
    });
  };

  const dibujarPrevisualizacion = () => {
    const filas = [];
    for (let i = 0; i < tamano; i++) {
      const casillas = [];
      for (let j = 0; j <= i; j++) {
        casillas.push(<div key={`${i}-${j}`} className={`casilla-mini preview-${dificultad}`}></div>);
      }
      filas.push(<div key={i} className="fila-mini">{casillas}</div>);
    }
    return filas;
  };

  return (
    <div className="config-page">
      <NavBar activeTab="play" />
      <video autoPlay muted loop className="videoIN">
        <source src={video} type="video/mp4" />
      </video>

      <div className="config-container">
        {/* COLUMNA IZQUIERDA: CONTROLES */}
        <div className="config-controls">
          <h2 className="fixed-title">{t("conf")}</h2>

          <div className="control-group">
            <label className="fixed-label"><strong>{t("modo")}</strong></label>
            <select className="control-input" value={modo} onChange={(e) => setModo(e.target.value as "humano" | "bot")}>
              <option value="bot">{t("maq")}</option>
              <option value="humano">{t("multijugador")}</option>
            </select>
          </div>

          <div className="control-group">
            <label className="fixed-label">
              <strong>{t("tamTabl")}</strong> 
              <span className="size-value"> {tamano}</span>
            </label>
            <input className="control-input-range" type="range" min="3" max="15" value={tamano} onChange={(e) => setTamano(Number(e.target.value))} />
          </div>

          <div className="bot-options-area">
            {modo === "bot" && (
              <>
                <div className="control-group">
                  <label className="fixed-label"><strong>{t("nivelDif")}</strong></label>
                  <select className="control-input" value={dificultad} onChange={(e) => setDificultad(e.target.value as any)}>
                    <option value="facil">{t("facil")}</option>
                    <option value="medio">{t("intermedio")}</option>
                    <option value="dificil">{t("experto")}</option>
                  </select>
                </div>
                <div className="control-group">
                  <label className="fixed-label"><strong>{t("eligeOponente")}</strong></label>
                  <select className="control-input" value={bot} onChange={(e) => setBot(e.target.value)}>
                    <option value="random_bot">{t("aleatorio")}</option>
                    <option value="simple_blocker_bot">{t("bloqSim")}</option>
                    <option value="group_expansion_bot">{t("expansi")}</option>
                  </select>
                </div>
              </>
            )}
          </div>

          <button className="btn-jugar-fixed" onClick={irAlJuego}>{t("jugar")}</button>
        </div>

        {/* COLUMNA DERECHA: PREVISUALIZACIÓN */}
        <div className="config-preview">
          <h2 className="fixed-title">{t("prevTablero")}</h2>
          <div className="preview-board-fixed">
            <div className="tablero-mini-container">
              {dibujarPrevisualizacion()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionJuego;