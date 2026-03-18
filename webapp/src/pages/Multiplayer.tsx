import React, { useState } from 'react';
import { useMultiplayer } from '../hooks/useMultiplayer';
import Tablero from '../components/Tablero';

const Multiplayer: React.FC = () => {
  const { 
    isConnected, 
    roomCode, 
    errorMsg, 
    gameStarted, 
    createRoom, 
    joinRoom,
    lastOpponentMove, 
    sendMove,
    myColor,
    opponentName
  } = useMultiplayer();
  
  const [joinCodeInput, setJoinCodeInput] = useState('');

  const userStr = localStorage.getItem("user");
  const myUsername = userStr ? JSON.parse(userStr).username : "Invitado";

  if (gameStarted && roomCode && myColor) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Partida 1vs1</h2>
        <h4 style={{ color: '#4ade80' }}>Estás en la sala: {roomCode}</h4>
        <p style={{ color: 'white', marginBottom: '20px' }}>
          Jugando contra: <strong>{opponentName}</strong>
        </p>
        
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          <Tablero 
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


  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
      <h2>Lobby Multijugador</h2>
      <p style={{ color: isConnected ? 'green' : 'red' }}>
        {isConnected ? '🟢 Conectado al servidor' : '🔴 Conectando...'}
      </p>

      {errorMsg && <p style={{ color: 'red', fontWeight: 'bold' }}>{errorMsg}</p>}

      {!roomCode ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px' }}>
          <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h3>Crear una nueva partida</h3>
            <button onClick={() => createRoom(myUsername)} style={{ padding: '10px 20px', cursor: 'pointer' }}>Crear Sala</button>
          </div>

          <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h3>Unirse a una partida</h3>
            <input 
              type="text" 
              placeholder="Introduce el código" 
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value)}
              style={{ padding: '10px', marginRight: '10px', textTransform: 'uppercase' }}
            />
            <button onClick={() => joinRoom(joinCodeInput, myUsername)} style={{ padding: '10px 20px', cursor: 'pointer' }}>Unirse</button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '30px', padding: '30px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>Esperando a tu rival...</h3>
          <h1 style={{ letterSpacing: '5px', color: '#007bff' }}>{roomCode}</h1>
        </div>
      )}
    </div>
  );
};

export default Multiplayer;