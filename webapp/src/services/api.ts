const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = sessionStorage.getItem('token');

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    }
  });

  if (res.status === 401 || res.status === 403) {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    globalThis.location.href = '/login';
  }

  return res; 
};
