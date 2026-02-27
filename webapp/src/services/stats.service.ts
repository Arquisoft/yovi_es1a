const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const statsService = {
  getMatchHistory: async (userId: string) => {
    const res = await fetch(`${API_URL}/matches/history/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error fetching history');
    
    return data;
  }
};