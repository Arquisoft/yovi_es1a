import React from "react";
import video from "../assets/videoLinea.mp4";

const About: React.FC = () => {
  return (
    <div id="about">
        <video autoPlay muted loop className="videoIN">
            <source src={video} type="video/mp4" />
            No se ha podido mostrar el video de fondo
        </video>
      <h2>Acerca del Proyecto</h2>

      <p>
        Este proyecto es una aplicación web desarrollada como parte de un laboratorio universitario. Su objetivo principal es proporcionar un entorno estructurado para la experimentación, el aprendizaje y la práctica de tecnologías web modernas.
      </p>

      <h3>Autores</h3>
      <ul>
        <li>José Iván Díaz Potenciano</li>
        <li>Adrián Gutiérrez García</li>
        <li>Fernando Remis Figueroa</li>
        <li>Hugo Carbajales Quintana</li>
        <li>Sergio Argüelles Huerta</li>
      </ul>

      <h3>Tecnologías Utilizadas</h3>
      <ul>
        <li>Frontend: React, TypeScript, Vite</li>
        <li>Backend: Node.js, Express, API REST</li>
        <li>Base de Datos: MongoDB con Mongoose</li>
        <li>Contenerización: Docker & Docker Compose</li>
        <li>Motor de Juego: Rust (módulo opcional)</li>
      </ul>

      <h3>Estructura del Proyecto</h3>
      <ul>
        <li>
          <strong>webapp/</strong> – Aplicación frontend
        </li>
        <li>
          <strong>users/</strong> – Servicio backend de gestión de usuarios
        </li>
        <li>
          <strong>gamey/</strong> – Módulo del motor de juego (Rust)
        </li>
        <li>
          <strong>docs/</strong> – Documentación y arquitectura
        </li>
      </ul>

      <h3>Cómo Ejecutar el Proyecto</h3>
      <p>
        El proyecto puede ejecutarse usando Docker o de manera local. Docker es recomendado para asegurar un entorno consistente. Alternativamente, se puede iniciar el frontend y backend por separado usando Node.js y los scripts de cada paquete.
      </p>

      <h3>Propósito</h3>
      <p>
        Este proyecto sirve como plataforma de aprendizaje para explorar desarrollo web, diseño de APIs y estructura modular de proyectos. Se enfoca en la limpieza del código, la mantenibilidad y el uso de herramientas modernas en un entorno colaborativo.
      </p>
    </div>
  );
};

export default About;