import { describe, it, expect, vi, beforeEach } from 'vitest';
import { matchService } from './match.service';
import { authFetch } from './api';

vi.mock('./api', () => ({
  authFetch: vi.fn(),
}));

describe('matchService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when the match is saved successfully', async () => {
    (authFetch as any).mockResolvedValue({
      ok: true,
      status: 201,
    });

    const result = await matchService.saveWinByAbandonment('user-123', 'Oponente');

    expect(result).toBe(true);
    expect(authFetch).toHaveBeenCalledWith('/matches/', expect.objectContaining({
      method: 'POST',
      body: expect.stringContaining('"result":"win"')
    }));
  });

  it('should return false and throw error when response is not ok', async () => {
    (authFetch as any).mockResolvedValue({
      ok: false,
      status: 400,
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await matchService.saveWinByAbandonment('user-123', 'Oponente');

    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
        "Error al guardar la victoria por abandono:", 
        expect.any(Error)
    );
    
    consoleSpy.mockRestore();
  });

  it('should return false when a network exception occurs', async () => {
    (authFetch as any).mockRejectedValue(new Error('Network Fail'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await matchService.saveWinByAbandonment('user-123', 'Oponente');

    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
        "Error al guardar la victoria por abandono:", 
        expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('should use fallback name when opponentName is empty', async () => {
    (authFetch as any).mockResolvedValue({ ok: true });

    await matchService.saveWinByAbandonment('user-123', '');

    expect(authFetch).toHaveBeenCalledWith('/matches/', expect.objectContaining({
      body: expect.stringContaining('"opponent":"Jugador Desconectado"')
    }));
  });
});