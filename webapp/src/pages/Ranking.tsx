import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom'; // Importante para detectar el tipo
import NavBar from '../components/NavBar';
import "../styles/global.css";
import "../styles/Ranking.css";
import video from '../assets/videoLinea.mp4';
import { statsService } from '../services/stats.service';
import { useLanguage } from '../idiomaConf/LanguageContext';

interface RankItem {
  id: string;
  name: string; // Nombre genérico (será username o nombre del clan)
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number; 
}


const Ranking: React.FC = () => {
  const { t } = useLanguage();
  
  const { type } = useParams(); // Pillamos "players" o "clans" de la URL
  const isClanView = type === 'clans';
  
  const [stats, setStats] = useState<RankItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [sortBy, setSortBy] = useState<keyof RankItem>('wins');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchRealStats = async () => {
      setLoading(true);
      try {
        // Llamamos al servicio correspondiente según la URL
        const rankingData = isClanView 
          ? await statsService.getClanRanking() 
          : await statsService.getRanking();
        
        const formattedData: RankItem[] = rankingData.map((item: any) => ({
          id: item._id,
          name: isClanView ? item.name : item.username, // Mapeo dinámico
          wins: item.wins,
          losses: item.losses,
          totalMatches: item.totalMatches,
          winRate: item.winRate
        }));

        setStats(formattedData);
        setCurrentPage(1); // Resetear a página 1 al cambiar de tipo
      } catch (error) {
        console.error("Error al obtener el ranking real:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRealStats();
  }, [type]); // Se recarga automáticamente si el usuario cambia el tipo en el NavBar

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
    setSortBy(e.target.value as keyof RankItem);
    setCurrentPage(1);
  };

  return (
    <div className="ranking-page">
      <NavBar activeTab="ranking" />
      <video autoPlay muted loop className="videoIN">
        <source src={video} type="video/mp4" />
      </video>

      <div className="ranking-container">
        {/* Título dinámico según la vista */}
        <h1 className="ranking-title">
            {isClanView ? t("rankGlobal") : t("rankClanes")}
        </h1>

        <div className="ranking-controls">
          <div className="control-group-ranking">
            <label htmlFor="sort-select">{t("ord")}</label>
              <select id="sort-select" value={sortBy} onChange={handleSortChange} className="ranking-select">
              <option value="winRate">{t("pvic")}</option>
              <option value="wins">{t("pg")}</option>
              <option value="losses">{t("pp")}</option>
              <option value="totalMatches">{t("pj")}</option>
            </select>
          </div>

          <button onClick={toggleSortOrder} className="btn-sort-order">
            {sortOrder === 'desc' ? t("mayAmen") : t("menAmay")}
          </button>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="ranking-loading">{t("ce")}</div>
          ) : (
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>{t("pos")}</th>
                  <th>{isClanView ? 'Clan' : 'Jugador'}</th>
                  <th>{t("pt")}</th>
                  <th>{t("vic")}</th>
                  <th>{t("der")}</th>
                  <th>{t("wr")}</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => {
                  const realPosition = indexOfFirstItem + index + 1;
                  return (
                    <tr key={item.id}>
                      <td className="pos-cell">#{realPosition}</td>
                      <td className="name-cell">{item.name}</td>
                      <td>{item.totalMatches}</td>
                      <td className="win-cell">{item.wins}</td>
                      <td className="lose-cell">{item.losses}</td>
                      <td className="rate-cell">{item.winRate.toFixed(1)}%</td>
                    </tr>
                  );
                })}
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                      {t("noData")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn-page"
            >
              {t("ant")}
            </button>
            <span className="page-info">
              {t("pag")} {currentPage} {t("dePag")} {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn-page"
            >
              {t("sig")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ranking;