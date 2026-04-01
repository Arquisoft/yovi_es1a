const NODE_API_URL = import.meta.env.VITE_API_URL || '';

export const matchService = {
  saveWinByAbandonment: async (userId: string, opponentName: string): Promise<boolean> => {
    try {
      const response = await fetch(`${NODE_API_URL}/matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  // getRankingGlobal: async () => { ... }
  // getUserHistory: async (userId) => { ... }
};