import React, { useState, useEffect, useMemo } from 'react';
import NavBar from '../components/NavBar';
import './Ranking.css';
import video from '../assets/videoLinea.mp4';
import { statsService } from '../services/stats.service';

interface PlayerStats {
  id: string;
  username: string;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number; 
}

const Ranking: React.FC = () => {
  
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [sortBy, setSortBy] = useState<keyof PlayerStats>('wins');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  
  // ¡AQUÍ ESTÁ EL CAMBIO! 5 jugadores por página en lugar de 10
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchRealStats = async () => {
      setLoading(true);
      try {
        const rankingData = await statsService.getRanking();
        
        const formattedData: PlayerStats[] = rankingData.map((user: any) => ({
          id: user._id,
          username: user.username,
          wins: user.wins,
          losses: user.losses,
          totalMatches: user.totalMatches,
          winRate: user.winRate
        }));

        setStats(formattedData);
      } catch (error) {
        console.error("Error al obtener el ranking real:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRealStats();
  }, []);

  const sortedStats = useMemo(() => {
    const sorted = [...stats].sort((a, b) => {
      let valA = Number(a[sortBy]);
      let valB = Number(b[sortBy]);

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [stats, sortBy, sortOrder]);

  const totalPages = Math.ceil(sortedStats.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedStats.slice(indexOfFirstItem, indexOfLastItem);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as keyof PlayerStats);
    setCurrentPage(1);
  };

  return (
    <div className="ranking-page">
      <NavBar activeTab="ranking" />
      <video autoPlay muted loop className="videoIN">
        <source src={video} type="video/mp4" />
      </video>

      <div className="ranking-container">
        <h1 className="ranking-title">Ranking Global</h1>

        <div className="ranking-controls">
          <div className="control-group-ranking">
            <label>Ordenar por:</label>
            <select value={sortBy} onChange={handleSortChange} className="ranking-select">
              <option value="winRate">Porcentaje de Acierto (%)</option>
              <option value="wins">Partidas Ganadas</option>
              <option value="losses">Partidas Perdidas</option>
              <option value="totalMatches">Partidas Jugadas</option>
            </select>
          </div>

          <button onClick={toggleSortOrder} className="btn-sort-order">
            {sortOrder === 'desc' ? '🔽 Mayor a Menor' : '🔼 Menor a Mayor'}
          </button>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="ranking-loading">Cargando estadísticas...</div>
          ) : (
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>Posición</th>
                  <th>Jugador</th>
                  <th>Partidas Totales</th>
                  <th>Victorias</th>
                  <th>Derrotas</th>
                  <th>Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((player, index) => {
                  const realPosition = indexOfFirstItem + index + 1;
                  return (
                    <tr key={player.id}>
                      <td className="pos-cell">#{realPosition}</td>
                      <td className="name-cell">{player.username}</td>
                      <td>{player.totalMatches}</td>
                      <td className="win-cell">{player.wins}</td>
                      <td className="lose-cell">{player.losses}</td>
                      <td className="rate-cell">{player.winRate.toFixed(1)}%</td>
                    </tr>
                  );
                })}
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                      No hay datos disponibles.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn-page"
            >
              Anterior
            </button>
            <span className="page-info">
              Página {currentPage} de {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn-page"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ranking;