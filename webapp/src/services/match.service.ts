import { authFetch } from './api';

export const matchService = {
  /**
   * Registra automáticamente una victoria en la base de datos cuando el oponente 
   * se desconecta o abandona la partida multijugador online.
   * 
   * @param userId - El ID del jugador que permanece en la partida (el ganador).
   * @param opponentName - El nombre del jugador que abandonó (o fallback genérico).
   * @returns `true` si la partida se guardó correctamente, `false` si hubo un error.
   */
  saveWinByAbandonment: async (userId: string, opponentName: string): Promise<boolean> => {
    try {
      const response = await authFetch('/matches', {
        method: 'POST',
        body: JSON.stringify({
          user: userId,
          result: "win",
          duration: 0,
          opponent: opponentName || "Jugador Desconectado",
          totalMoves: 0,
          gameMode: "online"
        })
      });

      if (!response.ok) {
        throw new Error(`Error guardando partida: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error("Error al guardar la victoria por abandono:", error);
      return false;
    }
  },
};