import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
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

// 1. Start the test server first
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

    // 2. Turn off the server when finished
  afterAll(() => {
    io.close();
    httpServer.close();
  });

  // 3. Connect the fake clients before each test
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

  // 4. Disconnect the clients after each test
  afterEach(() => {
    if (hostClient.connected) hostClient.disconnect();
    if (guestClient.connected) guestClient.disconnect();
  });


  it('It should allow creating a room and broadcasting roomCreated', () => {
    return new Promise<void>((resolve) => {
      hostClient.emit('createRoom', { hostUsername: 'HostPlayer', tamano: 7 });

      hostClient.on('roomCreated', (roomCode) => {
        expect(typeof roomCode).toBe('string');
        expect(roomCode.length).toBe(5);
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
        // 2. The Guest joins the newly created room
        guestClient.emit('joinRoom', { roomCode, guestUsername: 'GuestPlayer' });
      });

      let gameStartedCount = 0;

      // 3. We verify that the Host receives the notification
      hostClient.on('gameStarted', (data) => {
        expect(data.color).toBe('B');
        expect(data.tamano).toBe(7);
        expect(data.opponentName).toBe('GuestPlayer');
        gameStartedCount++;
        if (gameStartedCount === 2) resolve();
      });

      // 4. We verify that the Guest receives the notification
      guestClient.on('gameStarted', (data) => {
        expect(data.color).toBe('R');
        expect(data.tamano).toBe(7);
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
        expect(msg).toBe('La sala no existe o el código es incorrecto.');
        resolve();
      });
    });
  });
});