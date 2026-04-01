import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import "../styles/global.css";
import "../styles/Game.css";
import { useLanguage } from '../idiomaConf/LanguageContext.tsx';
import video from "../assets/videoLinea.mp4";
import { useMultiplayer } from '../hooks/useMultiplayer';
import Tablero from '../components/Tablero';

const GameSettings: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [modo, setModo] = useState<"humano" | "bot" | "online">("bot");
  const [tamano, setTamano] = useState<number>(5);
  const [bot, setBot] = useState<string>("random_bot");
  const [dificultad, setDificultad] = useState<"facil" | "medio" | "dificil">("facil");
  const [colorUsuario, setColorUsuario] = useState<"B" | "R">("B");

  const { 
    isConnected, roomCode, errorMsg, gameStarted, 
    createRoom, joinRoom, lastOpponentMove, sendMove, myColor, opponentName, boardSize 
  } = useMultiplayer();
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const userStr = localStorage.getItem("user");
  const myUsername = userStr ? JSON.parse(userStr).username : "Invitado";

  const irAlJuego = () => {
    navigate("/game", { 
      state: { 
        tamanoSeleccionado: tamano,
        botSeleccionado: bot,
        modoSeleccionado: modo,
        colorUsuario: colorUsuario,
      } 
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value);
    if (isNaN(val)) val = 0; 
    if (val > 50) val = 50; 
    setTamano(val);
  };

  const handleNumberBlur = () => {
    if (tamano < 3) setTamano(3); 
  };

  const dibujarPrevisualizacion = () => {
    const tamanoPrev = tamano > 20 ? 20 : tamano; 
    const cellSize = Math.min(25, Math.floor(320 / tamanoPrev)); 
    const filas = [];
    for (let i = 0; i < tamanoPrev; i++) {
      const casillas = [];
      for (let j = 0; j <= i; j++) {
        casillas.push(
          <div 
            key={`${i}-${j}`} 
            className={`casilla-mini preview-${modo === 'online' ? 'facil' : dificultad}`}
            style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
          ></div>
        );
      }
      filas.push(<div key={i} className="fila-mini">{casillas}</div>);
    }
    return <>{filas}</>;
  };

  if (gameStarted && roomCode && myColor && modo === "online") {
    return (
      <div className="config-page">
        <NavBar activeTab="play" />
        <video autoPlay muted loop className="videoIN">
          <source src={video} type="video/mp4" />
        </video>
        <div style={{ padding: '20px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2 style={{ color: 'white' }}>Partida 1vs1 Online</h2>
          <h4 style={{ color: '#4ade80' }}>Sala: {roomCode} | Tablero: {boardSize}x{boardSize}</h4>
          <p style={{ color: 'white', marginBottom: '20px' }}>
            Jugando contra: <strong>{opponentName}</strong>
          </p>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
            <Tablero 
              tamano={boardSize} 
              isOnline={true}
              onlineColor={myColor}
              lastOpponentLayout={lastOpponentMove}
              onSendMove={(newLayout) => sendMove(roomCode, newLayout)}
              opponentName={opponentName}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="config-page">
      <NavBar activeTab="play" />
      <video autoPlay muted loop className="videoIN">
        <source src={video} type="video/mp4" />
      </video>
      
      <div className="config-container">
        
        <div className="config-controls">
          <h2 className="fixed-title">{modo === "online" ? "Lobby Online" : t("conf")}</h2>

          <div className="control-group">
            <label className="fixed-label"><strong>{t("modo")}</strong></label>
            <select 
              className="control-input"
              value={modo} 
              onChange={(e) => setModo(e.target.value as "humano" | "bot" | "online")}
            >
              <option value="bot">{t("maq")}</option>
              <option value="humano">Local (1vs1 en este PC)</option>
              <option value="online">Online (Jugar por Internet)</option>
            </select>
          </div>

          <hr style={{ borderColor: '#444', marginBottom: '20px', marginTop: '10px' }}/>

          {modo === "online" ? (
            <div className="online-options-area">
              <p style={{ color: isConnected ? '#4ade80' : '#f87171', marginBottom: '15px', fontWeight: 'bold' }}>
                {isConnected ? '🟢 Conectado al servidor' : '🔴 Conectando...'}
              </p>
              {errorMsg && <p style={{ color: '#f87171', fontWeight: 'bold', marginBottom: '15px' }}>{errorMsg}</p>}

              {!roomCode ? (
                <>
                  <div className="control-group">
                    <label className="fixed-label">
                        <strong>Tamaño (Si creas sala)</strong> 
                        <input 
                          className="size-value"
                          type="number"
                          value={tamano === 0 ? '' : tamano}
                          onChange={handleNumberChange}
                          onBlur={handleNumberBlur}
                        />
                    </label>
                    <input 
                      className="control-input-range" 
                      type="range" min="3" max="30" 
                      value={tamano > 30 ? 30 : tamano} 
                      onChange={(e) => setTamano(Number(e.target.value))} 
                    />
                  </div>

                  <button className="btn-jugar-fixed" onClick={() => createRoom(myUsername, tamano)} style={{ marginBottom: '30px' }}>
                    Crear Sala
                  </button>

                  <div className="control-group">
                    <label className="fixed-label"><strong>Unirse a una partida</strong></label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        className="control-input"
                        type="text" 
                        placeholder="CÓDIGO" 
                        value={joinCodeInput}
                        onChange={(e) => setJoinCodeInput(e.target.value)}
                        style={{ textTransform: 'uppercase', flex: 1 }}
                      />
                      <button className="btn-jugar-fixed" onClick={() => joinRoom(joinCodeInput, myUsername)} style={{ width: 'auto', padding: '0 20px' }}>
                        Unirse
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <h3 style={{ color: 'white' }}>Esperando rival...</h3>
                  <h1 style={{ fontSize: '3.5rem', letterSpacing: '8px', color: '#4ade80', margin: '20px 0' }}>{roomCode}</h1>
                  <p style={{ color: '#aaa' }}>Comparte este código para jugar.</p>
                </div>
              )}
            </div>
          ) : (
            
            <div className="offline-options-area">
              <div className="control-group">
                <label className="fixed-label">
                    <strong>{t("tamTabl")}</strong> 
                    <input 
                      className="size-value"
                      type="number"
                      value={tamano === 0 ? '' : tamano}
                      onChange={handleNumberChange}
                      onBlur={handleNumberBlur}
                    />
                </label>
                <input 
                  className="control-input-range" 
                  type="range" 
                  min="3" max="30" 
                  value={tamano > 30 ? 30 : tamano} 
                  onChange={(e) => setTamano(Number(e.target.value))} 
                />
              </div>

              {modo === "bot" && (
                <>
                  <div className="control-group">
                    <label className="fixed-label"><strong>{t("nivelDif")}</strong></label>
                    <select 
                      className="control-input"
                      value={dificultad}
                      onChange={(e) => {
                        const nuevaDif = e.target.value as "facil" | "medio" | "dificil";
                        setDificultad(nuevaDif);
                        if (nuevaDif === "facil") setBot("random_bot");
                        if (nuevaDif === "medio") setBot("triangle_attack_bot");
                        if (nuevaDif === "dificil") setBot("monte_carlo_bot");
                      }}
                    >
                      <option value="facil">{t("facil")}</option>
                      <option value="medio">{t("intermedio")}</option>
                      <option value="dificil">{t("experto")}</option>
                    </select>
                  </div>

                  <div className="control-group">
                    <label className="fixed-label"><strong>{t("eligeOponente")}</strong></label>
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
              
              <div className="control-group">
                <label className="fixed-label"><strong>¿Quién empieza la partida?</strong></label>
                <select 
                  className="control-input"
                  value={colorUsuario} 
                  onChange={(e) => setColorUsuario(e.target.value as "B" | "R")}
                >
                  <option value="B">Empiezo el usuario logeado (Azul)</option>
                  <option value="R">
                    {modo === "bot" ? "Empieza la Máquina (Azul)" : "Empieza el invitado (Azul)"}
                  </option>
                </select>
              </div>

              <button className="btn-jugar-fixed" onClick={irAlJuego}>
                {t("jugar")}
              </button>
            </div>
          )}
        </div>

        <div className="config-preview">
          <h2 className="fixed-title">{t("prevTablero")}</h2>
          <div className="preview-board-fixed">
            <div className="tablero-mini-container">
              {dibujarPrevisualizacion()}
            </div>
          </div>
          {tamano > 20 && (
            <p className="preview-limit-text">Previsualización limitada a 20x20</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default GameSettings;