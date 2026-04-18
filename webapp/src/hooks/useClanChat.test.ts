import { renderHook, waitFor, act } from '@testing-library/react';
import { useClanChat } from './useClanChat';
import { vi, describe, it, expect } from 'vitest';
import { authFetch } from '../services/auth.service';
import { socket } from '../services/socket.service';
import { UserUtils } from '../utils/user.utils';

// qMockeamos el socket
vi.mock('../services/socket.service', () => ({
  socket: { on: vi.fn(), off: vi.fn(), emit: vi.fn() }
}));

// Mockeamos authFetch
vi.mock('../services/auth.service', () => ({
  authFetch: vi.fn()
}));

describe('useClanChat', () => {
    beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });
  
  it('should initialize, fetch history and stop loading', async () => {
    (authFetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ username: 'system', text: 'Welcome', timestamp: new Date() }])
    });

    const { result } = renderHook(() => useClanChat('test-clan'));

    expect(result.current.messages).toEqual([]);

    await waitFor(() => {
      expect(result.current.loadingHistory).toBe(false);
    });

    expect(result.current.messages.length).toBe(1);
    expect(result.current.messages[0].text).toBe('Welcome');
  });

  it('should handle fetch error gracefully', async () => {
    (authFetch as any).mockRejectedValue(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useClanChat('test-clan'));

    await waitFor(() => {
      expect(result.current.loadingHistory).toBe(false);
    });

    expect(consoleSpy).toHaveBeenCalledWith("Error al cargar historial del clan", expect.any(Error));
    consoleSpy.mockRestore();
  });


  it('should not do anything if clanId is null', () => {
    renderHook(() => useClanChat(null));
    expect(socket.emit).not.toHaveBeenCalledWith('joinClanRoom', null);
  });

  it('should update messages when newClanMessage is received via socket', async () => {
    let messageHandler: any;
    (socket.on as any).mockImplementation((event: string, cb: any) => {
      if (event === 'newClanMessage') messageHandler = cb;
    });

    const { result } = renderHook(() => useClanChat('test-clan'));

    const newMsg = { username: 'User2', text: 'Realtime message', timestamp: new Date() };
    
    act(() => {
      messageHandler(newMsg);
    });

    expect(result.current.messages).toContainEqual(newMsg);
  });

  it('should send a message correctly when sendMessage is called', () => {
    const clanId = 'clan-123';
    vi.spyOn(UserUtils, 'getUserId').mockReturnValue('u1');
    vi.spyOn(UserUtils, 'getUsername').mockReturnValue('Pablo');

    const { result } = renderHook(() => useClanChat(clanId));

    act(() => {
      result.current.sendMessage('Hola clan');
    });

    expect(socket.emit).toHaveBeenCalledWith('sendClanMessage', {
      clanId,
      userId: 'u1',
      username: 'Pablo',
      text: 'Hola clan'
    });
  });

  it('should not send message if text is empty or only whitespace', () => {
    const { result } = renderHook(() => useClanChat('clan-123'));
    
    act(() => {
      result.current.sendMessage('   ');
    });

    expect(socket.emit).not.toHaveBeenCalledWith('sendClanMessage', expect.any(Object));
  });

  it('should cleanup (emit leave and off) when unmounting', () => {
    const clanId = 'clan-exit';
    const { unmount } = renderHook(() => useClanChat(clanId));

    unmount();

    expect(socket.emit).toHaveBeenCalledWith('leaveClanRoom', clanId);
    expect(socket.off).toHaveBeenCalledWith('newClanMessage', expect.any(Function));
  });

});