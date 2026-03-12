import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar.tsx";
import { statsService } from "../services/stats.service.ts";
import "./Menu.css";
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
  const [totalPages, setTotalPages] = useState(1);//1 inicial
  const [filter, setFilter] = useState("");// "" valor inicial

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const user = JSON.parse(storedUser);
      setLoading(true);
      fetchHistory(user.userId, currentPage, filter);
    } else {
      setError("No hay usuario conectado. Inicia sesión para ver tus estadísticas.");
      setLoading(false);
    }
  }, [currentPage, filter]);//Esto es para recargar

  const fetchHistory = async (userId: string, page = 1, result="") => {
    try {
      const data = await statsService.getMatchHistory(userId, page, 5, result);
      setHistory(data.content);
      setTotalPages(data.totalPages);
      //const data = await statsService.getMatchHistory(userId);
      //setHistory(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar las estadísticas.");
    } finally {
      setLoading(false);
    }
  };

  const { t } = useLanguage();

  return (
    <div>
      <NavBar activeTab="stats" />
      <video autoPlay muted loop className="videoIN">
        <source src={video} type="video/mp4" />
        No se ha podido mostrar el video de fondo
      </video>
      <div className="stats">
        <h2>{t("MisEstadisticas")}</h2>

        {loading && <p className="loading-text">{t("cargandoPartidas")}</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && history.length === 0 && (
          <p className="empty-text">{t("ceroPartidas")}</p>
        )}
        <select className="filtroResult"
          onChange={(e) => {
            setFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
        <option value="">Todos</option>
        <option value="win">Wins</option>
        <option value="lose">Lose</option>
        <option value="surrender">Surrender</option>
      </select>
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
      </div>
      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(pag => pag - 1)}>
          Anterior
        </button>
        <span>Página {currentPage} de {totalPages}</span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(pag => pag + 1)}>
          Siguiente
        </button>{/* Si estas en última pagina se desactiva (el disabled)*/}
      </div>
    </div>
  );
};

export default Estadisticas;