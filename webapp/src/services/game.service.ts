const RUST_API_URL = import.meta.env.VITE_RUST_API_URL || "http://localhost:4000";

export const gameService = {
  askBotMove: async (botId: string, size: number, turnId: number, layoutWithSlashes: string) => {
    const url = `${RUST_API_URL}/v1/ybot/choose/${botId}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        size: size,
        turn: turnId,
        players: ["B", "R"],
        layout: layoutWithSlashes
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "The bot was unable to calculate the movement.");
    
    return data.coords; 
  }
};