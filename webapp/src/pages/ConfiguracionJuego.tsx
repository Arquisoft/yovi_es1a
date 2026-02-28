import React, { useState } from "react";
import { Bot, Swords } from 'lucide-react';
import NavBar from "../components/NavBar";
import "./ConfiguracionJuego.css"; 

const ConfiguracionJuego: React.FC = () => {
  const [modo, setModo] = useState<"humano" | "bot">("bot");
  const [tamano, setTamano] = useState<number>(5);
  const [bot, setBot] = useState<string>("random_bot");
  const [dificultad, setDificultad] = useState<"facil" | "medio" | "dificil">("facil");

  return (
    <div className="config-page">
      <NavBar activeTab="play" />

      <div className="config-container">
        
        <div className="config-controls">
          <h2>Configuración de la Partida</h2>

          <div className="control-group">
            <label><strong>Modo de Juego:</strong> </label>
            <select 
              className="control-input"
              value={modo} 
              onChange={(e) => setModo(e.target.value as "humano" | "bot")}
            >
              <option value="bot">Contra la Máquina (1 Jugador)</option>
              <option value="humano">Multijugador Local (2 Jugadores)</option>
            </select>
          </div>

          <div className="control-group">
            <label><strong>Tamaño del Tablero:</strong> {tamano}</label>
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
                <label><strong>Nivel de Dificultad:</strong></label>
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
                  <option value="facil">Fácil</option>
                  <option value="medio">Intermedio</option>
                  <option value="dificil">Experto</option>
                </select>
              </div>

              <div className="control-group">
                <label><strong>Elige tu oponente:</strong></label>
                <select 
                  className="control-input"
                  value={bot} 
                  onChange={(e) => setBot(e.target.value)}
                >
                  {dificultad === "facil" && (
                    <>
                      <option value="random_bot">Elección aleatoria</option>
                      <option value="simple_blocker_bot">Bloqueo Simple</option>
                      <option value="group_expansion_bot">Estrategia de Expansión</option>
                    </>
                  )}

                  {dificultad === "medio" && (
                    <>
                      <option value="priority_block_bot">Prioridad en Bloqueo</option>
                      <option value="triangle_attack_bot">Triángulo de Ataque</option>
                    </>
                  )}

                  {dificultad === "dificil" && (
                    <>
                      <option value="monte_carlo_bot">Monte Carlo</option>
                      <option value="shortest_path_bot">Shortest Path</option>
                    </>
                  )}
                </select>
              </div>
            </>
          )}

          <button className="btn-jugar">
            Jugar
          </button>
        </div>

        <div className="config-preview">
          <h2>Previsualización del tablero</h2>
          
          <div className="preview-board">
          </div>
          
          {modo === "bot" && (
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
          )}
        </div>

      </div>
    </div>
  );
};

export default ConfiguracionJuego;