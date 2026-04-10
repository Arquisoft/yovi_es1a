const API_URL = import.meta.env.VITE_API_URL || '';

export const authService = {
  login: async (username: string, password: string) => {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error trying login');
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
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
export const authFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');

  const headers = new Headers(options.headers);

  // Añadimos el Content-Type usando .set()
  headers.set('Content-Type', 'application/json');

  // Añadimos el Token de la misma forma
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Hacemos la petición real añadiendo el endpoint a la API
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401) {
    console.warn("Token caducado o inválido. Cerrando sesión...");
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; 
  }

  return response;
};