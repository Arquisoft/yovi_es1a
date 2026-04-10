import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RoomService } from '../services/room.service.js';

describe('RoomService', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    RoomService.deleteSocketData('socket-1');
    RoomService.deleteSocketData('socket-2');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a room and store host data', () => {
    const socketId = 'socket-host';
    const code = RoomService.createRoom(socketId, 'Alice', 7, 'user-alice');

    expect(code).toHaveLength(6);
    expect(RoomService.getRoomBySocketId(socketId)).toBe(code);
  });

  it('should allow a guest to join an existing room', () => {
    const hostSocket = 'socket-host';
    const guestSocket = 'socket-guest';
    const code = RoomService.createRoom(hostSocket, 'Alice', 7, 'user-alice');

    const info = RoomService.joinRoom(guestSocket, code, hostSocket, 'Bob', 'user-bob');

    expect(info).not.toBeNull();
    expect(info?.hostName).toBe('Alice');
    expect(info?.tamano).toBe(7);
  });

  it('should return null when joining a non-existent room', () => {
    const info = RoomService.joinRoom('socket-any', 'NON-EXISTENT', 'host-any', 'Bob');
    expect(info).toBeNull();
  });

  it('should handle game finish by room code', () => {
    const code = 'TEST12';
    RoomService.endGameByRoom(code);
    expect(RoomService.isRoomFinished(code)).toBe(true);
  });

  it('should handle disconnection and return correct match data', () => {
    const hostS = 'h';
    const guestS = 'g';
    const code = RoomService.createRoom(hostS, 'Alice', 5, 'id-a');
    RoomService.joinRoom(guestS, code, hostS, 'Bob', 'id-b');

    const disconnectData = RoomService.handleDisconnect(hostS);

    expect(disconnectData.userName).toBe('Alice');
    expect(disconnectData.opponentName).toBe('Bob');
    expect(disconnectData.opponentId).toBe('id-b');
  });

  it('should call fetch to record match results', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({})
    } as Response);

    RoomService.recordMatchResult('user-1', 'OponenteX', 'win');

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/matches/'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'x-server-key': 'token_backend' }),
        body: expect.stringContaining('"result":"win"')
      })
    );
  });

  it('should log an error if recording match result fails', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('API Down'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    RoomService.recordMatchResult('user-1', 'Oppo', 'surrender');

    await new Promise(res => setTimeout(res, 10));

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error registrando surrender:'),
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });

  it('should clean up socket data on deleteSocketData and cleanExit', () => {
    const sId = 'socket-99';
    const code = RoomService.createRoom(sId, 'Alice', 5);
    
    RoomService.cleanExit(sId);
    expect(RoomService.getRoomBySocketId(sId)).toBeUndefined();

    RoomService.createRoom(sId, 'Alice', 5);
    RoomService.deleteSocketData(sId);
    expect(RoomService.getRoomBySocketId(sId)).toBeUndefined();
  });
});