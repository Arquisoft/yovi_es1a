import { authFetch } from './api';

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

  getRanking: async () => {
    const res = await authFetch('/matches/ranking/global');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error fetching ranking data');
    return data;
  },

  getClanRanking: async () => {
    const res = await authFetch('/clans/ranking/global');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error fetching clan ranking data');
    return data;
  },

  getMatchHistory: async (userId: string, page = 1, size = 5,
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
