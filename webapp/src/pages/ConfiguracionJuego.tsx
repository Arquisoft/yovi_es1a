import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import "./ConfiguracionJuego.css"; 
import { useLanguage } from '../idiomaConf/LanguageContext.tsx';

const ConfiguracionJuego: React.FC = () => {
  // 2. Añade esta línea justo al principio de tu componente:
  const navigate = useNavigate();
  
  const [modo, setModo] = useState<"humano" | "bot">("bot");
  const [tamano, setTamano] = useState<number>(5);
  const [bot, setBot] = useState<string>("random_bot");
  const [dificultad, setDificultad] = useState<"facil" | "medio" | "dificil">("facil");

  const irAlJuego = () => {
    navigate("/partida", { 
      state: { 
        tamanoSeleccionado: tamano,
        botSeleccionado: bot,
        modoSeleccionado: modo
      } 
    });
  };

const dibujarPrevisualizacion = () => {
    const filas = [];
    for (let i = 0; i < tamano; i++) {
      const casillas = [];
      for (let j = 0; j <= i; j++) {
        casillas.push(<div key={`${i}-${j}`} className="casilla-mini"></div>);
      }
      filas.push(<div key={i} className="fila-mini">{casillas}</div>);
    }
    return filas;
}

    //Usar el idioma
    const { lang, setLang, t } = useLanguage();

  return (
    <div className="config-page">
      <NavBar activeTab="play" />

      <div className="config-container">
        
        <div className="config-controls">
          <h2>{t("conf")}</h2>

          <div className="control-group">
            <label><strong>{t("modo")}</strong> </label>
            <select 
              className="control-input"
              value={modo} 
              onChange={(e) => setModo(e.target.value as "humano" | "bot")}
            >
              <option value="bot">{t("maq")}</option>
              <option value="humano">{t("multijugador")}</option>
            </select>
          </div>

          <div className="control-group">
            <label><strong>{t("tamTabl")}</strong> {tamano}</label>
            <input 
              className="control-input"
              type="range" 
              min="3" 
              max="15" 
              value={tamano} 
              onChange={(e) => setTamano(Number(e.target.value))} 
            />
          </div>

          {modo === "bot" && (
            <>
              <div className="control-group">
                <label><strong>{t("nivelDif")}</strong></label>
                <select 
                  className="control-input"
                  value={dificultad}
                  onChange={(e) => {
                    const nuevaDif = e.target.value as "facil" | "medio" | "dificil";
                    setDificultad(nuevaDif);
                    if (nuevaDif === "facil") setBot("random_bot");
                    if (nuevaDif === "medio") setBot("expansion_bot");
                    if (nuevaDif === "dificil") setBot("monte_carlo_bot");
                  }}
                >
                  <option value="facil">{t("facil")}</option>
                  <option value="medio">{t("intermedio")}</option>
                  <option value="dificil">{t("experto")}</option>
                </select>
              </div>

              <div className="control-group">
                <label><strong>{t("eligeOponente")}</strong></label>
                <select 
                  className="control-input"
                  value={bot} 
                  onChange={(e) => setBot(e.target.value)}
                >
                  {dificultad === "facil" && (
                    <>
                      <option value="random_bot">{t("aleatorio")}</option>
                      <option value="simple_blocker_bot">{t("bloqSim")}</option>
                      <option value="group_expansion_bot">{t("expansi")}</option>
                    </>
                  )}

                  {dificultad === "medio" && (
                    <>
                      <option value="priority_block_bot">{t("bloq")}</option>
                      <option value="triangle_attack_bot">{t("trianAt")}</option>
                    </>
                  )}

                  {dificultad === "dificil" && (
                    <>
                      <option value="monte_carlo_bot">{t("monteCarl")}</option>
                      <option value="shortest_path_bot">{t("shortPa")}</option>
                    </>
                  )}
                </select>
              </div>
            </>
          )}

          <button className="btn-jugar" onClick={irAlJuego}>
            {t("jugar")}
          </button>
        </div>

        <div className="config-preview">
          <h2>{t("prevTablero")}</h2>
          
          <div className="preview-board">
            <div className="tablero-mini-container">
              {dibujarPrevisualizacion()}
            </div>
          </div>
          
          {/* {modo === "bot" && (
            <div className="preview-bot">
              <p>Bot rival: <strong>{bot}</strong></p>
              <Bot size={64} strokeWidth={1.5} color="#2c3e50" />
            </div>
          )}

          {modo === "humano" && (
            <div className="preview-human">
              <p>Jugador vs Jugador</p>
              <Swords size={64} strokeWidth={1.5} color="#2c3e50" />
            </div>
          )} */}
        </div>

      </div>
    </div>
  );
};

export default ConfiguracionJuego;