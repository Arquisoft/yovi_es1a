import React, { useState } from 'react';
import { useLanguage } from "../idiomaConf/LanguageContext";
import video from "../assets/videoLinea.mp4";

const BotTester: React.FC = () => {
  const [layout, setLayout] = useState('./../.../..../...../....../.......');
  const [resultado, setResultado] = useState('');

  const VALID_BOTS = [
    'random_bot',
    'simple_blocker_bot',
    'group_expansion_bot',
    'shortest_path_bot',
    'triangle_attack_bot',
    'priority_block_bot',
    'monte_carlo_bot'
  ] as const;

  // 1. Añadimos un estado para guardar el bot seleccionado (por defecto "random_bot")
  const [botId, setBotId] = useState('random_bot');

  const pedirMovimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    setResultado('...');

    try {
        const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
        
        const safeBotId = VALID_BOTS.includes(botId as any)
          ? botId
          : 'random_bot';

        // 2. Inyectamos la variable botId en la URL
        const res = await fetch(`${apiEndpoint}/v1/ybot/choose/${safeBotId}`, {
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

  const { t } = useLanguage();

  return (
    <div className="botTester">
      <video autoPlay muted loop className="video">
        <source src={video} type="video/mp4" />
        No se ha podido mostrar el video de fondo
      </video>
      <h1>{t("test")}</h1>
      
      <form onSubmit={pedirMovimiento}>
        {/* 3. Añadimos el selector de dificultad */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="bot-select" style={{ color: 'white', marginRight: '10px' }}>
            Nivel / Tipo de Bot:
          </label>
          <select 
            id="bot-select" 
            value={botId} 
            onChange={(e) => setBotId(e.target.value)}
            style={{ padding: '5px', borderRadius: '5px' }}
          >
            <option value="random_bot">Aleatorio</option>
            <option value="simple_blocker_bot">Bloqueador Simple</option>
            <option value="group_expansion_bot">Expansión de Grupo</option>
            <option value="shortest_path_bot">Camino Más Corto</option>
            <option value="triangle_attack_bot">Ataque Triangular</option>
            <option value="priority_block_bot">Bloqueo Prioritario</option>
            <option value="monte_carlo_bot">Monte Carlo</option>
          </select>
        </div>

        <input 
          type="text" 
          value={layout} 
          onChange={(e) => setLayout(e.target.value)} 
          style={{ marginRight: '10px' }}
        />
        <button type="submit">{t("Mover")}</button>
      </form>
      
      <p style={{ color: 'white', marginTop: '15px' }}>{resultado}</p>
    </div>
  );
};

export default BotTester;