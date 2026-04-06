import { authFetch } from './api';

/**
 * Representa los datos necesarios para registrar el resultado de una partida en la base de datos.
 */
export interface MatchData {
  user: string;
  result: 'win' | 'lose' | 'surrender';
  duration: number;
  boardSize: number;
  opponent: string;
  totalMoves: number;
  gameMode: string;
}

export const statsService = {
  /**
   * Guarda las estadísticas de una partida finalizada en el backend.
   * 
   * @param matchData - Objeto con los detalles de la partida (duración, oponente, resultado, etc).
   * @returns Confirmación del servidor tras guardar los datos.
   * @throws Lanza un error si la base de datos no puede guardar las estadísticas.
   */
  saveMatchResult: async (matchData: MatchData) => {
    try {
      const res = await authFetch('/matches/', {
        method: "POST",
        body: JSON.stringify(matchData),
      });

      if (!res.ok) {
        throw new Error("The statistics could not be saved to the database");
      }

      return await res.json();
    } catch (error) {
      console.error("Error saving stats:", error);
      throw error;
    }
  },

  /**
   * Obtiene el ranking global de los mejores jugadores.
   * 
   * @returns Lista de jugadores ordenados por su puntuación o ratio de victorias.
   */
  getRanking: async () => {
    const res = await authFetch('/matches/ranking/global');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error fetching ranking data');
    return data;
  },

  /**
   * Obtiene el ranking global de clanes.
   * 
   * @returns Lista de clanes ordenados por su puntuación colectiva.
   */
  getClanRanking: async () => {
    const res = await authFetch('/clans/ranking/global');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error fetching clan ranking data');
    return data;
  },

  /**
   * Recupera el historial de partidas de un usuario específico, con paginación y filtros.
   * 
   * @param userId - ID único del jugador.
   * @param page - Número de página para la paginación (por defecto 1).
   * @param size - Cantidad de partidas por página (por defecto 5).
   * @param filters - (Opcional) Filtros para buscar por resultado, movimientos o duración máxima.
   * @returns El historial paginado de partidas del jugador.
   */
  getMatchHistory: async (
    userId: string, 
    page = 1, 
    size = 5,
    filters?: { result?: string; maxMoves?: number; maxDuration?: number }
  ) => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("size", size.toString());
    
    if (filters?.result) params.append("result", filters.result);
    if (filters?.maxMoves) params.append("maxMoves", filters.maxMoves.toString());
    if (filters?.maxDuration) params.append("maxDuration", filters.maxDuration.toString());

    const res = await authFetch(`/matches/user/${userId}?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error fetching history');
    return data;
  }
};