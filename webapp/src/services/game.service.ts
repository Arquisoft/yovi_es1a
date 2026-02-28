const RUST_API_URL = import.meta.env.VITE_RUST_API_URL || "http://localhost:4000";

export interface BotMoveResponse {
  api_version: string;
  bot_id: string;
  coords: { x: number; y: number; z: number };
  game_status: string;
}

export const gameService = {
  askBotMove: async (botId: string, size: number, turn: number, layout: string): Promise<BotMoveResponse> => {
    try {
      const response = await fetch(`${RUST_API_URL}/v1/ybot/choose/${botId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          size,
          turn,
          players: ["B", "R"],
          layout,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BotMoveResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error calling Rust API:", error);
      throw error;
    }
  },
};