// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { useTablero } from './useTablero';
import { gameService } from '../services/game.service';
import { statsService } from '../services/stats.service';
import { getInitialLayout } from '../utils/tablero.utils';

const mockLocationState = vi.fn().mockReturnValue({});
vi.mock('react-router-dom', () => ({
  useLocation: () => ({ state: mockLocationState() })
}));

vi.mock('../services/game.service');
vi.mock('../services/stats.service');

describe('useTablero Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('user', JSON.stringify({ userId: '123', username: 'Test' }));
    mockLocationState.mockReturnValue({ tamanoSeleccionado: 3 });
    vi.mocked(gameService.checkWinner).mockResolvedValue({ status: 'ongoing' });
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  test('safeSaveStats logs error when DB fails and returns early if no user', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    vi.mocked(statsService.saveMatchResult).mockRejectedValueOnce(new Error('DB Failed'));
    vi.mocked(gameService.checkWinner).mockResolvedValueOnce({ status: 'win' }); // Forzamos victoria para guardar
    
    const { result } = renderHook(() => useTablero({ modoSeleccionado: 'humano' }));
    
    await act(async () => {
      await result.current.play(0); 
    });

    expect(consoleSpy).toHaveBeenCalledWith("Error al guardar en la BD:", expect.any(Error));

    consoleSpy.mockClear();
    localStorage.removeItem('user');
    const { result: noUserResult } = renderHook(() => useTablero({}));
    
    vi.mocked(gameService.checkWinner).mockResolvedValueOnce({ status: 'win' });
    await act(async () => {
      await noUserResult.current.play(1);
    });

    expect(statsService.saveMatchResult).toHaveBeenCalledTimes(1); 
    consoleSpy.mockRestore();
  });

  test('playOnline works without onSendMove', async () => {
    mockLocationState.mockReturnValue({ modoSeleccionado: 'online' });
    const { result } = renderHook(() => useTablero({ isOnline: true, onlineColor: 'B', tamano: 3 }));
    
    await act(async () => {
      await result.current.play(0);
    });
    
    expect(result.current.layout[0]).toBe('B');
  });

  test('playHumano catches error in checkWinner', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockLocationState.mockReturnValue({ modoSeleccionado: 'humano' });
    vi.mocked(gameService.checkWinner).mockRejectedValueOnce(new Error('Humano Error'));

    const { result } = renderHook(() => useTablero({}));
    
    await act(async () => {
      await result.current.play(0);
    });

    expect(consoleSpy).toHaveBeenCalledWith("Error verificando victoria:", expect.any(Error));
    consoleSpy.mockRestore();
  });

  test('playBot early win and error catch', async () => {
    mockLocationState.mockReturnValue({ modoSeleccionado: 'bot', colorUsuario: 'B' });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // 1. El jugador gana directamente en el turno del bot (Línea 108)
    vi.mocked(gameService.checkWinner).mockResolvedValueOnce({ status: 'win' });
    const { result: winResult } = renderHook(() => useTablero({}));
    
    await act(async () => {
      await winResult.current.play(0);
    });
    expect(winResult.current.winnerMessage).toBe("¡HAS GANADO!");

    vi.mocked(gameService.checkWinner).mockResolvedValueOnce({ status: 'ongoing' });
    vi.mocked(gameService.askBotMove).mockRejectedValueOnce(new Error('Bot broke'));
    
    const { result: errorResult } = renderHook(() => useTablero({}));
    await act(async () => {
      await errorResult.current.play(1);
    });
    
    expect(consoleSpy).toHaveBeenCalledWith("Error communicating with the bot:", expect.any(Error));
    consoleSpy.mockRestore();
  });

  test('makeRandomMove plays a valid random empty cell', async () => {
    vi.useFakeTimers();
    mockLocationState.mockReturnValue({ modoSeleccionado: 'humano' });
    const { result } = renderHook(() => useTablero({ tamano: 2 })); // 2x2 = 3 celdas jugables
    
    await act(async () => {
      vi.advanceTimersByTime(21000);
    });

    expect(result.current.layout).not.toBe(getInitialLayout(2));
  });

  test('surrenderTrigger does nothing if game Finished', async () => {
    mockLocationState.mockReturnValue({ modoSeleccionado: 'humano' });
    
    const { result, rerender } = renderHook((props) => useTablero(props), {
      initialProps: { surrenderTrigger: false }
    });

    await act(async () => {
      await result.current.play(0);
    });
    
    rerender({ surrenderTrigger: true });
    expect(result.current.gameFinished).toBe(true);

    const saveSpy = vi.spyOn(statsService, 'saveMatchResult');
    saveSpy.mockClear();

    rerender({ surrenderTrigger: true, dummyProp: 1 } as any); 
    
    expect(saveSpy).not.toHaveBeenCalled();
  });

  test('ignores opponent layout if it matches current layout or game finished', async () => {
    mockLocationState.mockReturnValue({ modoSeleccionado: 'online' });
    vi.mocked(gameService.checkWinner).mockResolvedValue({ status: 'ongoing' });

    const { result, rerender } = renderHook((props) => useTablero(props), {
      // AQUÍ ESTÁ EL TRUCO: Añadimos surrenderTrigger: false para que TypeScript no llore luego
      initialProps: { isOnline: true, onlineColor: 'B', tamano: 3, lastOpponentLayout: getInitialLayout(3), surrenderTrigger: false }
    });
    
    expect(result.current.turn).toBe("B");
    
    rerender({ isOnline: true, onlineColor: 'B', tamano: 3, lastOpponentLayout: getInitialLayout(3), surrenderTrigger: true });
    expect(result.current.gameFinished).toBe(true);

    rerender({ isOnline: true, onlineColor: 'B', tamano: 3, lastOpponentLayout: "R........", surrenderTrigger: true });
    
    expect(result.current.layout).toBe(getInitialLayout(3));
  });
});