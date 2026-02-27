import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import { statsService } from "../services/stats.service";
import "./Menu.css";

interface MatchRecord {
  _id: string;
  result: 'win' | 'lose' | 'surrender';
  opponent: string;
  totalMoves: number;
  duration: number;
  boardSize: number;
  createdAt: string;
}

const Estadisticas: React.FC = () => {
  const [history, setHistory] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      fetchHistory(user.userId);
    } else {
      setError("No hay usuario conectado. Inicia sesión para ver tus estadísticas.");
      setLoading(false);
    }
  }, []);

  const fetchHistory = async (userId: string) => {
    try {
      const data = await statsService.getMatchHistory(userId);
      setHistory(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar las estadísticas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {}
      <NavBar activeTab="stats" />
      
      <div className="content" style={{ padding: "20px", marginTop: "60px" }}>
        <h2>Mis Estadísticas</h2>

        {loading && <p>Cargando tus partidas...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && history.length === 0 && (
          <p>Aún no has jugado ninguna partida. ¡Anímate a probar contra el bot!</p>
        )}

        {}
        {!loading && !error && history.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
            <thead>
              <tr style={{ backgroundColor: "#55a667", color: "white", textAlign: "left" }}>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>Fecha</th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>Resultado</th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>Oponente</th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>Movimientos</th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>Duración</th>
              </tr>
            </thead>
            <tbody>
              {history.map((match) => (
                <tr key={match._id}>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {new Date(match.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd", fontWeight: "bold", color: match.result === 'win' ? 'green' : 'red' }}>
                    {match.result.toUpperCase()}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{match.opponent}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{match.totalMoves}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{match.duration} s</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Estadisticas;