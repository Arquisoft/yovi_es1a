import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { authService } from './auth.service';

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
});