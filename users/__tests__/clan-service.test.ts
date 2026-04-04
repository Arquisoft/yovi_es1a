import { describe, it, expect, afterAll, beforeAll, vi } from 'vitest';
import supertest from 'supertest';
import app from '../src/index'; // tu Express app
import User from '../src/models/user-model';
import Clan from '../src/models/clan-model';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import { ClanService } from '../src/service/clan-service';

describe('Integration Tests: Clan Service', () => {
  let testUserId: string;
  let testUserId2: string;
  let testUserId3: string;
  let testClanId: string;
  let testToken: string;

  beforeAll(async () => {
    const res1 = await supertest(app)
      .post('/createuser')
      .send({
        username: 'ClanUser1',
        email: 'clanuser1@test.com',
        password: 'password123'
      });
    testUserId = res1.body.userId;
    
    const res2 = await supertest(app)
      .post('/createuser')
      .send({
        username: 'ClanUser2',
        email: 'clanuser2@test.com',
        password: 'password123'
      });
    testUserId2 = res2.body.userId;

    const res3 = await supertest(app)
      .post('/createuser')
      .send({
        username: 'ClanUser3',
        email: 'clanuser3@test.com',
        password: 'password123'
      });
    testUserId3 = res3.body.userId;

    const secret = process.env.JWT_SECRET as string;
    testToken = jwt.sign({ id: testUserId, email: 'clanuser1@test.com' }, secret, { expiresIn: '1h' });

  }, 20000);

  // Limpiar base de datos después de los tests
  afterAll(async () => {
    await User.deleteMany({ _id: { $in: [testUserId, testUserId2, testUserId3] } });
    await Clan.deleteMany({});
  });

  describe('GET /ranking/global', () => {
    it('should return 200 and the clan ranking', async () => {
      const res = await supertest(app)
        .get('/clans/ranking/global')
        .set('Authorization', `Bearer ${testToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 500 if there is a DB error fetching the ranking', async () => {
      const spy = vi.spyOn(Clan, 'aggregate').mockRejectedValueOnce(new Error('Fake DB Error'));
      
      const res = await supertest(app)
        .get('/clans/ranking/global')
        .set('Authorization', `Bearer ${testToken}`);
      
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'Error interno obteniendo el ranking de clanes');
      
      spy.mockRestore();
    });
  });
  
  describe('POST /createClan', () => {
    it('should create a clan successfully', async () => {
      const res = await supertest(app)
        .post('/clans/createClan')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'TestClan',
          memberIds: [testUserId, testUserId2]
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'Clan successfully created');
      expect(res.body).toHaveProperty('clanId');
      expect(res.body).toHaveProperty('name', 'TestClan');
      expect(res.body.members.length).toBe(2);

      testClanId = res.body.clanId;//Guardar para tests siguientes
    });

    it('should return 400 if name is missing', async () => {
      const res = await supertest(app)
        .post('/clans/createClan')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ memberIds: [testUserId] });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Clan name is required');
    });

    it('should return 400 if memberIds is missing', async () => {
      const res = await supertest(app)
        .post('/clans/createClan')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ name: 'ClanWithoutMembers' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Clan name is required');
    });
  });
  describe('POST /:clanId/addUser', () => {
    it('should add a user to the clan', async () => {
      const res = await supertest(app)
        .post(`/clans/${testClanId}/addUser`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ userId: testUserId3 }); 

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'User added to clan successfully');
      expect(res.body.members).toContain(testUserId3); 
    }, 10000);

    it('should return 500 if userId is missing', async () => {
        const res = await supertest(app)
            .post(`/clans/${testClanId}/addUser`)
            .set('Authorization', `Bearer ${testToken}`)
            .send({});

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error', 'Error adding member to clan');
    });

  });

    describe('GET /', () => {
        it('should return at least one clan', async () => {
            const res = await supertest(app).get('/clans')
            .set('Authorization', `Bearer ${testToken}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(1);
        });
    });

  describe('POST /:clanId/message and GET /:clanId/messages', () => {
    it('should send a message to the clan', async () => {
      const res = await supertest(app)
        .post(`/clans/${testClanId}/message`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ userId: testUserId, username: 'ClanUser1', text: 'Hello' });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty('text', 'Hello');
      expect(res.body[0]).toHaveProperty('username', 'ClanUser1');
    });

    it('should return 400 if message data is missing', async () => {
      const res = await supertest(app)
        .post(`/clans/${testClanId}/message`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ userId: testUserId });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Faltan datos del mensaje');
    });

    it('should get messages for the clan', async () => {
      const res = await supertest(app).get(`/clans/${testClanId}/messages`).set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty('text', 'Hello');
    });

      it('should return 500 if clan does not exist', async () => {
        const fakeClanId = new Types.ObjectId().toString();
        const res = await supertest(app)
            .post(`/clans/${fakeClanId}/addUser`)
            .set('Authorization', `Bearer ${testToken}`)
            .send({ userId: testUserId2 });
        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error', 'Error adding member to clan');
    });
  });

  it('should return 500 if sending a message fails internally', async () => {
      const spy = vi.spyOn(ClanService, 'sendMessage').mockRejectedValueOnce(new Error('Mensaje roto'));
      const res = await supertest(app)
        .post(`/clans/${testClanId}/message`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ userId: testUserId, username: 'ClanUser1', text: 'Hello' });

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('Mensaje roto');
      spy.mockRestore();
    });

    it('should get messages for the clan', async () => {
      const res = await supertest(app).get(`/clans/${testClanId}/messages`).set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(200);
    });

    it('should return 500 if getting messages fails internally', async () => {
      const spy = vi.spyOn(ClanService, 'getClanMessages').mockRejectedValueOnce(new Error('No hay mensajes'));
      const res = await supertest(app).get(`/clans/${testClanId}/messages`).set('Authorization', `Bearer ${testToken}`);
      
      expect(res.status).toBe(500);
      expect(res.body.error).toContain('No hay mensajes');
      spy.mockRestore();
    });

    it('should return 500 if clan does not exist', async () => {
        const fakeClanId = new Types.ObjectId().toString();
        const res = await supertest(app)
            .post(`/clans/${fakeClanId}/addUser`)
            .set('Authorization', `Bearer ${testToken}`)
            .send({ userId: testUserId2 });
        expect(res.status).toBe(500);
    });
  });