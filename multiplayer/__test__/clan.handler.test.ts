import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { createServer, Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { registerClanHandlers } from '../src/handlers/clan.handler.js';

global.fetch = vi.fn();

describe('Integration Tests: Clan Chat Handlers', () => {
  let io: Server;
  let httpServer: HttpServer;
  let serverSocket: any;
  let client1: ClientSocket;
  let client2: ClientSocket;
  let port: number;

  beforeAll(async () => {
    httpServer = createServer();
    io = new Server(httpServer);
    
    await new Promise<void>((resolve) => {
      httpServer.listen(() => {
        port = (httpServer.address() as any).port;
        
        io.on('connection', (socket) => {
          serverSocket = socket;
          registerClanHandlers(io, socket);
        });
        resolve(); 
      });
    });
  });

  afterAll(() => {
    io.close();
    httpServer.close();
  });

  beforeEach(() => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    } as Response);

    return new Promise<void>((resolve) => {
      client1 = Client(`http://localhost:${port}`);
      client2 = Client(`http://localhost:${port}`);
      
      let connected = 0;
      const checkDone = () => {
        connected++;
        if (connected === 2) resolve();
      };

      client1.on('connect', checkDone);
      client2.on('connect', checkDone);
    });
  });

  afterEach(() => {
    if (client1.connected) client1.disconnect();
    if (client2.connected) client2.disconnect();
    vi.clearAllMocks();
  });

  it('Should allow joining a clan room', () => {
    return new Promise<void>((resolve) => {
      const clanId = 'clan-123';
      client1.emit('joinClanRoom', clanId);
      
      setTimeout(() => {
        expect(client1.connected).toBe(true);
        resolve();
      }, 50);
    });
  });

  it('Should broadcast a message to all members in the clan room', () => {
    return new Promise<void>((resolve) => {
      const clanId = 'clan-test';
      const testMessage = {
        clanId,
        userId: 'user-1',
        username: 'Player1',
        text: '¡Hola Clan!'
      };

      client1.emit('joinClanRoom', clanId);
      client2.emit('joinClanRoom', clanId);

      client2.on('newClanMessage', (msg) => {
        expect(msg.username).toBe('Player1');
        expect(msg.text).toBe('¡Hola Clan!');
        expect(msg.timestamp).toBeDefined();
        resolve();
      });

      setTimeout(() => {
        client1.emit('sendClanMessage', testMessage);
      }, 50);
    });
  });

  it('Should call the persistence API (fetch) when a message is sent', () => {
    return new Promise<void>((resolve) => {
      const clanId = 'clan-db-test';
      const messageData = {
        clanId,
        userId: 'user-99',
        username: 'Tester',
        text: 'Este mensaje debe guardarse'
      };

      client1.emit('joinClanRoom', clanId);
      
      setTimeout(() => {
        client1.emit('sendClanMessage', messageData);

        setTimeout(() => {
          expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining(`/clans/${clanId}/message`),
            expect.objectContaining({
              method: 'POST',
              body: expect.stringContaining('user-99')
            })
          );
          resolve();
        }, 100);
      }, 50);
    });
  });

  it('Should not receive messages from clans you are not joined to', () => {
    return new Promise<void>((resolve) => {
      const clanA = 'clan-A';
      const clanB = 'clan-B';

      client1.emit('joinClanRoom', clanA);
      client2.emit('joinClanRoom', clanB);

      const spy = vi.fn();
      client2.on('newClanMessage', spy);

      client1.emit('sendClanMessage', {
        clanId: clanA,
        userId: 'u1',
        username: 'P1',
        text: 'Mensaje privado de Clan A'
      });

      setTimeout(() => {
        expect(spy).not.toHaveBeenCalled();
        resolve();
      }, 200);
    });
  });

  it('Should handle persistence API error (500) gracefully', () => {
    return new Promise<void>((resolve) => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Error interno del servidor de usuarios')
      } as any);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      client1.emit('joinClanRoom', 'clan-error');
      
      setTimeout(() => {
        client1.emit('sendClanMessage', {
          clanId: 'clan-error',
          userId: 'u1',
          username: 'P1',
          text: 'Probando error'
        });

        setTimeout(() => {
          expect(fetch).toHaveBeenCalled();
          expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('Error de persistencia: 500')
          );
          resolve();
        }, 100);
      }, 50);
    });
  });

  it('Should successfully leave a clan room and stop receiving messages', () => {
    return new Promise<void>((resolve) => {
      const clanId = 'clan-exit';
      client1.emit('joinClanRoom', clanId);
      client2.emit('joinClanRoom', clanId);

      const spy = vi.fn();
      client1.on('newClanMessage', spy);

      setTimeout(() => {
        client1.emit('leaveClanRoom', clanId);

        setTimeout(() => {
          client2.emit('sendClanMessage', {
            clanId,
            userId: 'u2',
            username: 'P2',
            text: '¿Sigues ahí?'
          });

          setTimeout(() => {
            expect(spy).not.toHaveBeenCalled();
            resolve();
          }, 150);
        }, 50);
      }, 50);
    });
  });
});