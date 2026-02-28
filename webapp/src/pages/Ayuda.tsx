import React from "react";
import NavBar from "../components/NavBar";
import "./Menu.css";

const Ayuda: React.FC = () => {
  return (
    <div>
      <NavBar activeTab="Ayuda" />

      <div className="content">
        <h2>Bienvenido a Game Y</h2>
        
        <h3>Introducción</h3>
        <p>El juego Y es un juego de tablero donde prima la estrategia. El objetivo será conectar los tres lados del tablero antes que tu oponente.</p>
        
        <h3>Reglas del juego</h3>
        <ul>
          <li>Se juega por turnos</li>
          <li>El ganador será el primero en conectar los tres lados del tablero.</li>
          <li>Se considera que las casillas de las esquinas pertenecen a los dos lados.</li>
        </ul>
        
        <h3>Posibilidades</h3>
        <ul>
          <li>Jugar contra un bot</li>
          <li>Elegir estrategia y nivel de dificultad</li>
          <li>Consultar estadísticas</li>
          <li>Tamaño de tablero variable</li>
        </ul>

        <h3>Estrategias disponibles</h3>
        <ul>
          <li><strong>Estrategia de expansión:</strong> el bot intentará, si es posible, marcar casillas vecinas.</li>
          <li><strong>Monte carlo:</strong> el bot calcula las posibles posibilidades y marca la casilla donde más posibilidades tiene de ganar.</li>
          <li><strong>Prioridad en el bloqueo:</strong> El bot marca la casilla más próxima a sus propias piezas y bloquea a las del enemigo, dando prioridad a los bordes.</li>
          <li><strong>Random:</strong> el bot marca una casilla al azar de las disponibles.</li>
          <li><strong>Shortest path:</strong> el bot elige la casilla que maximiza la conexión propia entre los lados del tablero y bloquea las oportunidades del oponente.</li>
          <li><strong>Bloque simple:</strong> el bot elige la casilla vacía más cercana a las piezas del oponente para bloquear su expansión. Si no hay piezas enemigas cercanas, elige aleatoriamente.</li>
          <li><strong>Triángulo de ataque:</strong> El bot busca casillas vacías que conecten varias de sus propias piezas. Si no hay, se expande.</li>
        </ul>
      </div>
    </div>
  );
};

export default Ayuda;