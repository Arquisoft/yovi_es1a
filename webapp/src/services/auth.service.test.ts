import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { authFetch, authService } from './auth.service';

describe('authService', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('login', () => {
    test('performs a successful login request and returns the user data', async () => {
      const mockResponseData = { userId: 1, username: 'Pablo' };
      
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponseData,
      } as Response);

      const result = await authService.login('Pablo', 'password123');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'Pablo', password: 'password123' })
      });
      expect(result).toEqual(mockResponseData);
    });

    test('throws a specific error when the login request fails with a server message', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid credentials' }),
      } as Response);

      await expect(authService.login('Pablo', 'wrongpass')).rejects.toThrow('Invalid credentials');
    });

    test('throws a fallback error when the login request fails without a specific message', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response);

      await expect(authService.login('Pablo', 'wrongpass')).rejects.toThrow('Error trying login');
    });
  });

  describe('register', () => {
    test('performs a successful registration request and returns the new user data', async () => {
      const mockResponseData = { message: 'User created', userId: 2, username: 'Laura' };
      
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponseData,
      } as Response);

      const result = await authService.register('Laura', 'laura@test.com', 'pass123');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/createuser'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'Laura', email: 'laura@test.com', password: 'pass123' })
      });
      expect(result).toEqual(mockResponseData);
    });

    test('throws a specific error when the registration request fails with a server message', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Email already exists' }),
      } as Response);

      await expect(authService.register('Laura', 'laura@test.com', 'pass123')).rejects.toThrow('Email already exists');
    });

    test('throws a fallback error when the registration request fails without a specific message', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response);

      await expect(authService.register('Laura', 'laura@test.com', 'pass123')).rejects.toThrow('Server error');
    });
  });
  describe('authFetch', () => {
  beforeEach(() => {
    localStorage.clear();
    // Mock de window.location.href para evitar errores de navegación en el test
    vi.stubGlobal('location', { href: '' });
  });

  test('adds Authorization header if token exists in localStorage', async () => {
    localStorage.setItem('token', 'fake-jwt-token');
    
    vi.mocked(global.fetch).mockResolvedValueOnce({
      status: 200,
      ok: true,
    } as Response);

    await authFetch('/clans/123');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/clans/123'),
      expect.objectContaining({
        headers: expect.any(Headers)
      })
    );

    // Verificamos que los headers contienen el token
    const callArgs = vi.mocked(global.fetch).mock.calls[0];
    const headers = callArgs[1]?.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer fake-jwt-token');
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  test('uses absolute URL if endpoint starts with http', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({ ok: true } as Response);

    const absoluteUrl = 'http://external-api.com/data';
    await authFetch(absoluteUrl);

    expect(global.fetch).toHaveBeenCalledWith(absoluteUrl, expect.any(Object));
  });

  test('handles 401 Unauthorized by clearing storage and redirecting', async () => {
    localStorage.setItem('token', 'expired-token');
    localStorage.setItem('user', 'some-user');
    
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    vi.mocked(global.fetch).mockResolvedValueOnce({
      status: 401,
      ok: false,
    } as Response);

    await authFetch('/private-data');

    // Verificamos limpieza
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    
    // Verificamos redirección
    expect(window.location.href).toBe('/login');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Token caducado"));
    
    consoleSpy.mockRestore();
  });

  test('works correctly without a token in localStorage', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({ ok: true } as Response);

    await authFetch('/public-data');

    const callArgs = vi.mocked(global.fetch).mock.calls[0];
    const headers = callArgs[1]?.headers as Headers;
    
    expect(headers.get('Authorization')).toBeNull();
    expect(headers.get('Content-Type')).toBe('application/json');
  });
});
});