import React, { useState } from 'react';
import { useMultiplayer } from '../hooks/useMultiplayer';
import Tablero from '../components/Tablero';
import NavBar from "../components/NavBar";
import "./GameSettings.css"; // ¡Reutilizamos tu CSS magistral!
import video from "../assets/videoLinea.mp4";

const Multiplayer: React.FC = () => {
  const { 
    isConnected, roomCode, errorMsg, gameStarted, 
    createRoom, joinRoom, lastOpponentMove, sendMove, myColor, opponentName, boardSize 
  } = useMultiplayer();
  
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [tamano, setTamano] = useState<number>(5);

  const userStr = localStorage.getItem("user");
  const myUsername = userStr ? JSON.parse(userStr).username : "Invitado";

  // VISTA 1: El juego real una vez emparejados
  if (gameStarted && roomCode && myColor) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Partida 1vs1 Online</h2>
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
    );
  }

  // VISTA 2: El Lobby con la misma estética de GameSettings
  const dibujarPrevisualizacion = () => {
    const cellSize = Math.min(25, Math.floor(320 / tamano)); 
    const filas = [];
    for (let i = 0; i < tamano; i++) {
      const casillas = [];
      for (let j = 0; j <= i; j++) {
        casillas.push(
          <div 
            key={`${i}-${j}`} 
            className="casilla-mini preview-facil"
            style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
          ></div>
        );
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
        
        <div className="config-controls">
          <h2 className="fixed-title">Lobby Online</h2>
          <p style={{ color: isConnected ? '#4ade80' : '#f87171', marginBottom: '15px', fontWeight: 'bold' }}>
            {isConnected ? '🟢 Conectado al servidor' : '🔴 Conectando...'}
          </p>

          {errorMsg && <p style={{ color: '#f87171', fontWeight: 'bold', marginBottom: '15px' }}>{errorMsg}</p>}

          {!roomCode ? (
            <>
              {/* CREAR SALA */}
              <div className="control-group">
                <label className="fixed-label">
                    <strong>Tamaño (Si creas sala)</strong> 
                    <span className="size-value">{tamano}</span>
                </label>
                <input 
                  className="control-input-range" 
                  type="range" min="3" max="15" 
                  value={tamano} 
                  onChange={(e) => setTamano(Number(e.target.value))} 
                />
              </div>

              <button className="btn-jugar-fixed" onClick={() => createRoom(myUsername, tamano)} style={{ marginBottom: '30px' }}>
                Crear Sala
              </button>

              <hr style={{ borderColor: '#444', marginBottom: '30px' }}/>

              {/* UNIRSE A SALA */}
              <div className="control-group">
                <label className="fixed-label"><strong>Unirse a una partida</strong></label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    className="control-input"
                    type="text" 
                    placeholder="CÓDIGO DE SALA" 
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
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <h3 style={{ color: 'white' }}>Esperando a tu rival...</h3>
              <h1 style={{ fontSize: '3.5rem', letterSpacing: '8px', color: '#4ade80', margin: '20px 0' }}>{roomCode}</h1>
              <p style={{ color: '#aaa' }}>Comparte este código con tu amigo para que se una a tu partida de {tamano}x{tamano}.</p>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: PREVISUALIZACIÓN */}
        <div className="config-preview">
          <h2 className="fixed-title">Previsualización</h2>
          <div className="preview-board-fixed">
            <div className="tablero-mini-container">
              {!roomCode ? dibujarPrevisualizacion() : <h3 style={{color: 'white', marginTop: '100px'}}>Esperando conexión...</h3>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Multiplayer;