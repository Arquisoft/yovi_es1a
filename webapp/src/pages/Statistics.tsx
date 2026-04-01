import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar.tsx";
import { statsService } from "../services/stats.service.ts";
import "../styles/global.css";
import "../styles/Statistics.css";
import { useLanguage } from '../idiomaConf/LanguageContext.tsx';
import video from "../assets/videoLinea.mp4";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<{ result?: string; maxMoves?: number; maxDuration?: number }>({});

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setLoading(true);
      fetchHistory(user.userId, currentPage, filters);
    } else {
      setError("No hay usuario conectado. Inicia sesión para ver tus estadísticas.");
      setLoading(false);
    }
  }, [currentPage, filters]);

  const fetchHistory = async (userId: string, page = 1,
    filters?: { result?: string; maxMoves?: number; maxDuration?: number }
  ) => {
    try {
      const data = await statsService.getMatchHistory(userId, page, 5, filters);
      setHistory(data.content);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message || "Error al cargar las estadísticas.");
    } finally {
      setLoading(false);
    }
  };

  const { t } = useLanguage();

  return (
    <div className="stats-page">
      <NavBar activeTab="stats" />
      <video autoPlay muted loop className="videoIN">
        <source src={video} type="video/mp4" />
      </video>

      <div className="stats">
        <h2>{t("MisEstadisticas")}</h2>

          <div className="filtros-container">
            <select
              className="filtroResult"
              onChange={(e) => {
                setFilters({ ...filters, result: e.target.value });
                setCurrentPage(1);
              }}
            >
              <option value="">Todos</option>
              <option value="win">Wins</option>
              <option value="lose">Lose</option>
              <option value="surrender">Surrender</option>
            </select>

            <input
              type="number"
              placeholder="Duración máxima (s)"
              value={filters.maxDuration || ""}
              onChange={(e) => setFilters({ ...filters, maxDuration: Number(e.target.value) })}
              className="filtroInput"
            />

            <input
              type="number"
              placeholder="Movimientos máximos"
              value={filters.maxMoves || ""}
              onChange={(e) => setFilters({ ...filters, maxMoves: Number(e.target.value) })}
              className="filtroInput"
            />
          </div>

        {loading && <p className="loading-text">{t("cargandoPartidas")}</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && history.length === 0 && (
          <p className="empty-text">{t("ceroPartidas")}</p>
        )}

        {!loading && !error && history.length > 0 && (
          <div className="tabla-container-scroll">
            <table className="tabla-stats">
              <thead>
                <tr>
                  <th>{t("fecha")}</th>
                  <th>{t("resultado")}</th>
                  <th>{t("oponente")}</th>
                  <th>{t("movimientos")}</th>
                  <th>{t("duracion")}</th>
                </tr>
              </thead>
              <tbody>
                {history.map((match) => (
                  <tr key={match._id}>
                    <td>{new Date(match.createdAt).toLocaleDateString()}</td>
                    <td className={`res-${match.result}`}>
                      {match.result.toUpperCase()}
                    </td>
                    <td>{match.opponent}</td>
                    <td>{match.totalMoves}</td>
                    <td>{match.duration} s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(pag => pag - 1)}>
            Anterior
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(pag => pag + 1)}>
            Siguiente
          </button>
        </div>

      </div>
    </div>
  );
};

export default Estadisticas;
