import React, { useState } from 'react';

const BotTester: React.FC = () => {
  const [layout, setLayout] = useState('./../.../..../...../....../.......');
  const [resultado, setResultado] = useState('');

  const pedirMovimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    setResultado('...');

    try {
        const apiEndpoint = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:4000';
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
      setResultado('Error de conexión');
    }
  };

  return (
    <div>
      <h3>Test de conexion Rust y React</h3>
      <form onSubmit={pedirMovimiento}>
        <input 
          type="text" 
          value={layout} 
          onChange={(e) => setLayout(e.target.value)} 
        />
        <button type="submit">Mover</button>
      </form>
      
      { }
      <p>{resultado}</p>
    </div>
  );
};

export default BotTester;