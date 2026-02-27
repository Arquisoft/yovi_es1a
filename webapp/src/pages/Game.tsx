import React from 'react';
import NavBar from '../components/NavBar';
import Tablero from '../components/Tablero';

const Game: React.FC = () => {
  return (
    <div>
      <NavBar activeTab="play" />
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <h2>Partida en curso</h2>
        <Tablero />
      </div>
    </div>
  );
};

export default Game;