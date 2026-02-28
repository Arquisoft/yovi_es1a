const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
  saveMatchResult: async (matchData: MatchData) => {
    try {
      const res = await fetch(`${API_URL}/matches/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${localStorage.getItem('token')}` // Para cuando haya JWT
        },
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
  getMatchHistory: async (userId: string) => {
    const res = await fetch(`${API_URL}/matches/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
        // "Authorization": `Bearer ${localStorage.getItem('token')}` // Para cuando haya JWT
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error fetching history');
    
    return data;
  }
};