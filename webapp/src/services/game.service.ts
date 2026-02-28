const NODE_API_URL = "http://localhost:3000";

export interface BotMoveResponse {
  api_version: string;
  bot_id: string;
  coords: { x: number; y: number; z: number };
  game_status: string;
}

export const gameService = {
  askBotMove: async (botId: string, size: number, turn: number, layout: string): Promise<BotMoveResponse> => {
    try {
      const positionYen = {
        size,
        turn: turn,
        players: ["B", "R"],
        layout,
      };
      const response = await fetch(`${NODE_API_URL}/api/bot/play`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          position: positionYen,
          strategy: botId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        api_version: "v1",
        bot_id: botId,
        coords: data.move,
        game_status: data.game_status
      };
    } catch (error) {
      console.error("Error calling Rust API:", error);
      throw error;
    }
  },
};