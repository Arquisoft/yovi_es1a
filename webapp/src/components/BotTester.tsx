import React, { useState } from 'react';
import { useLanguage } from "../idiomaConf/LanguageContext";
import video from "../assets/videoLinea.mp4";

const BotTester: React.FC = () => {
  const [layout, setLayout] = useState('./../.../..../...../....../.......');
  const [resultado, setResultado] = useState('');

  const pedirMovimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    setResultado('...');

    try {
        //'http://localhost:4000'
        const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
        const res = await fetch(`${apiEndpoint}/v1/ybot/choose/random_bot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          size: 7,              
          players: ["1", "2"],  
          layout: layout,       
          turn: 0
        })
      });

      const data = await res.json();

      if (res.ok) {
        setResultado(`X: ${data.coords.x}, Y: ${data.coords.y}, Z: ${data.coords.z}`);
      } else {
        setResultado(`Error: ${JSON.stringify(data)}`);
      }

    } catch (err) {
      console.error('Error en pedirMovimiento:', err);
      setResultado('Error de conexión');
    }
  };

      //Usar el idioma
      const { t } = useLanguage();

  return (
    <div className="botTester">
      <video autoPlay muted loop className="video">
        <source src={video} type="video/mp4" />
        No se ha podido mostrar el video de fondo
      </video>
      <h1>{t("test")}</h1>
      <form onSubmit={pedirMovimiento}>
        <input 
          type="text" 
          value={layout} 
          onChange={(e) => setLayout(e.target.value)} 
        />
        <button type="submit">{t("Mover")}</button>
      </form>
      
      { }
      <p>{resultado}</p>
    </div>
  );
};

export default BotTester; // exit door so that the BotTester component can travel to other files.