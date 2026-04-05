import { authFetch } from './api';

export const matchService = {
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
