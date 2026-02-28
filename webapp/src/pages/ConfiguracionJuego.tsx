import React from "react";
import NavBar from "../components/NavBar";
import "./Menu.css";

const Menu: React.FC = () => {
  return (
    <div>
      <NavBar activeTab="play" />

      <div className="content">
        <h2>Configuración de la Partida</h2>
        
        {}
        <p>Cargando opciones de juego...</p>

      </div>
    </div>
  );
};

export default Menu;