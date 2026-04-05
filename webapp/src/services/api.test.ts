// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authFetch } from './api';

global.fetch = vi.fn();

describe('API Service - authFetch', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    delete (window as any).location;
    (window as any).location = { ...originalLocation, href: '' };
  });

  afterEach(() => {
    (window as any).location = originalLocation;
  });

  it('debe realizar la petición con el token en los headers si existe', async () => {
    localStorage.setItem('token', 'mi-token-falso');
    
    vi.mocked(fetch).mockResolvedValueOnce({ status: 200 } as Response);

    const res = await authFetch('/ruta-test');

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/ruta-test', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mi-token-falso',
      },
    });
    expect(res.status).toBe(200);
  });

  it('debe realizar la petición SIN el token si no existe en localStorage', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ status: 200 } as Response);

    await authFetch('/ruta-publica');

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/ruta-publica', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('debe mantener y combinar las opciones extras que se le pasen', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ status: 201 } as Response);

    await authFetch('/crear', {
      method: 'POST',
      headers: { 'X-Custom-Header': 'valor-personalizado' }
    });

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/crear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Custom-Header': 'valor-personalizado'
      },
    });
  });

  it('debe limpiar el localStorage y redirigir a /login si recibe un 401', async () => {
    localStorage.setItem('token', 'token-caducado');
    localStorage.setItem('user', 'juanito');
    
    vi.mocked(fetch).mockResolvedValueOnce({ status: 401 } as Response);

    await authFetch('/ruta-protegida');

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(window.location.href).toBe('/login');
  });

  it('debe limpiar el localStorage y redirigir a /login si recibe un 403', async () => {
    localStorage.setItem('token', 'token-prohibido');
    localStorage.setItem('user', 'juanito');
    
    vi.mocked(fetch).mockResolvedValueOnce({ status: 403 } as Response);

    await authFetch('/ruta-secreta');

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(window.location.href).toBe('/login');
  });
});