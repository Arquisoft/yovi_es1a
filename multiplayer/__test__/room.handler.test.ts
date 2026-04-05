import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { createServer, Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { registerRoomHandlers } from '../src/handlers/room.handler.js';

describe('Integration Tests: Multiplayer Room Handlers', () => {
  let io: Server;
  let httpServer: HttpServer;
  let serverSocket: any;
  let hostClient: ClientSocket;
  let guestClient: ClientSocket;
  let port: number;
  //Start test server and register handlers before all tests
  beforeAll(async () => {
    httpServer = createServer();
    io = new Server(httpServer);
    
    await new Promise<void>((resolve) => {
      httpServer.listen(() => {
        port = (httpServer.address() as any).port;
        
        io.on('connection', (socket) => {
          serverSocket = socket;
          registerRoomHandlers(io, socket);
        });
        resolve(); 
      });
    });
  });
  //Close server after all tests
  afterAll(() => {
    io.close();
    httpServer.close();
  });

  // Connect fake clients before each test
  beforeEach(() => {
    return new Promise<void>((resolve) => {
      hostClient = Client(`http://localhost:${port}`);
      guestClient = Client(`http://localhost:${port}`);
      
      let connected = 0;
      const checkDone = () => {
        connected++;
        if (connected === 2) resolve();
      };

      hostClient.on('connect', checkDone);
      guestClient.on('connect', checkDone);
    });
  });

  // DIsconnect clients and restore mocks after each test
  afterEach(() => {
    if (hostClient.connected) hostClient.disconnect();
    if (guestClient.connected) guestClient.disconnect();
    vi.restoreAllMocks();
  });

  it('It should allow creating a room and broadcasting roomCreated', () => {
    return new Promise<void>((resolve) => {
      hostClient.emit('createRoom', { hostUsername: 'HostPlayer', tamano: 7, hostId: 'id-host-123' });

      hostClient.on('roomCreated', (roomCode) => {
        expect(typeof roomCode).toBe('string');
        expect(roomCode.length).toBe(6);
        resolve();
      });
    });
  });

  it('It should match two players and emit gameStarted to both', () => {
    return new Promise<void>((resolve) => {
      let globalRoomCode = '';

      hostClient.emit('createRoom', { hostUsername: 'HostPlayer', tamano: 7 });

      hostClient.on('roomCreated', (roomCode) => {
        globalRoomCode = roomCode;
        guestClient.emit('joinRoom', { roomCode, guestUsername: 'GuestPlayer', guestId: 'id-guest-123' });
      });

      let gameStartedCount = 0;

      hostClient.on('gameStarted', (data) => {
        expect(data.color).toBe('B');
        expect(data.opponentName).toBe('GuestPlayer');
        gameStartedCount++;
        if (gameStartedCount === 2) resolve();
      });

      guestClient.on('gameStarted', (data) => {
        expect(data.color).toBe('R');
        expect(data.opponentName).toBe('HostPlayer');
        gameStartedCount++;
        if (gameStartedCount === 2) resolve();
      });
    });
  });

  it('It should give an error if the guest tries to join a fake room code', () => {
    return new Promise<void>((resolve) => {
      guestClient.emit('joinRoom', { roomCode: 'FALSO', guestUsername: 'GuestPlayer' });

      guestClient.on('roomError', (msg) => {
        expect(msg).toBe('La sala no existe.');
        resolve();
      });
    });
  });

  it('It should forward makeMove data to the opponent', () => {
    return new Promise<void>((resolve) => {
      hostClient.emit('createRoom', { hostUsername: 'HostPlayer', tamano: 7 });

      hostClient.on('roomCreated', (roomCode) => {
        guestClient.emit('joinRoom', { roomCode, guestUsername: 'GuestPlayer' });

        guestClient.on('gameStarted', () => {
          hostClient.emit('makeMove', { roomCode, moveData: 'movimiento-secreto' });
        });

        guestClient.on('moveReceived', (moveData) => {
          expect(moveData).toBe('movimiento-secreto');
          resolve();
        });
      });
    });
  });

  it('It should handle leaveMatchGracefully and notify the opponent to cleanup', () => {
    return new Promise<void>((resolve) => {
      hostClient.emit('createRoom', { hostUsername: 'HostPlayer', tamano: 7 });

      hostClient.on('roomCreated', (roomCode) => {
        guestClient.emit('joinRoom', { roomCode, guestUsername: 'GuestPlayer' });

        guestClient.on('gameStarted', () => {
          hostClient.emit('leaveMatchGracefully');
        });

        guestClient.on('matchFinishedCleanup', () => {
          expect(true).toBe(true);
          resolve();
        });
      });
    });
  });

  it('It should apply punishment when a player disconnects abruptly', () => {
    return new Promise<void>((resolve) => {
      // Mocked the fetch so that it doesn't make real HTTP requests to the user service.
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({ status: 201 } as any);

      hostClient.emit('createRoom', { hostUsername: 'HostPlayer', tamano: 7, hostId: 'user-to-punish' });

      hostClient.on('roomCreated', (roomCode) => {
        guestClient.emit('joinRoom', { roomCode, guestUsername: 'GuestPlayer' });

        guestClient.on('gameStarted', () => {
          // The Host violently closes the (X) tab
          hostClient.disconnect();
        });

        guestClient.on('opponent_disconnected', () => {
          // The server waits 500ms before punishing, so we wait a bit more
          setTimeout(() => {
            // We verify that fetch was called and check its arguments directly
            expect(fetchSpy).toHaveBeenCalledWith(
              expect.anything(), // The first argument is the URL, we dont care about it
              expect.objectContaining({ // The second argument are the options
                body: expect.stringContaining('user-to-punish')
              })
            );

            expect(fetchSpy).toHaveBeenCalledWith(
              expect.anything(),
              expect.objectContaining({
                body: expect.stringContaining('surrender')
              })
            );
            
            resolve();
          }, 600);
        });
      });
    });
  });

});