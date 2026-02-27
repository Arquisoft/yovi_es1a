const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const authService = {
  login: async (username: string, password: string) => {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error trying login');
    return data;
  },

  register: async (username: string, email: string, password: string) => {
    const res = await fetch(`${API_URL}/createuser`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server error');
    return data;
  }
};