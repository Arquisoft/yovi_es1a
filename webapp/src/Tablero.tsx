import React from "react";
import "./Tablero.css";

const TAM_TABLERO = 10;

const GameBoard: React.FC = () => {
  const generarTablero = () => {
    const filas = [];

    for (let i = 0; i < TAM_TABLERO; i++) {
        const casillas = [];
        for (let j = 0; j <= i; j++) {
            casillas.push( <div key={`${i} ${j}`} className="casilla"></div>);
        }
        
        filas.push( <div key={i} className="tablero">{casillas}</div>//Casillas de cada fila
        );
    }

    return filas;
};

return (
    <div className="gameBoard">
        <h2>Juego Y</h2>
        <div className="board">
            {generarTablero()}
        </div>
    </div>
  );
};

export default GameBoard;