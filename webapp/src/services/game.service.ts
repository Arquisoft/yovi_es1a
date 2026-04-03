import { authFetch } from './api';

export interface BotMoveResponse {
  api_version: string;
  bot_id: string;
  coords: { x: number; y: number; z: number };
  game_status: string;
}

export interface CheckWinnerResponse {
  status: string;
}

export const gameService = {
  askBotMove: async (botId: string, size: number, turn: number, layout: string): Promise<BotMoveResponse> => {
    try {
      const positionYen = {
        size,
        turn,
        players: ["B", "R"],
        layout,
      };
      const response = await authFetch('/api/bot/play', {
        method: "POST",
        body: JSON.stringify({ position: positionYen, strategy: botId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        api_version: "v1",
        bot_id: botId,
        coords: data.coords,
        game_status: data.game_status
      };
    } catch (error) {
      console.error("Error calling Rust API:", error);
      throw error;
    }
  },

  checkWinner: async (size: number, layout: string): Promise<CheckWinnerResponse> => {
    try {
      const response = await authFetch('/api/bot/check-winner', {
        method: "POST",
        body: JSON.stringify({ size, layout }),
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor de Node: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error al verificar ganador:", error);
      throw error;
    }
  },
};
