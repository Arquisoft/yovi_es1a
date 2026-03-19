import { describe, it, expect, afterAll, beforeAll, vi } from 'vitest';
import supertest from 'supertest';
import app from '../src/index'; // tu Express app
import User from '../src/models/user-model';
import Clan from '../src/models/clan-model';
import { Types } from 'mongoose';

describe('Integration Tests: Clan Service', () => {
  let testUserId: string;
  let testUserId2: string;
  let testClanId: string;

  // Crear usuarios de prueba
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
  }, 20000);

  // Limpiar base de datos después de los tests
  afterAll(async () => {
    await User.deleteMany({ _id: { $in: [testUserId, testUserId2] } });
    await Clan.deleteMany({});
  });

  describe('POST /createClan', () => {
    it('should create a clan successfully', async () => {
      const res = await supertest(app)
        .post('/clans/createClan')
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
        .send({ memberIds: [testUserId] });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Clan name is required');
    });

    it('should return 400 if memberIds is missing', async () => {
      const res = await supertest(app)
        .post('/clans/createClan')
        .send({ name: 'ClanWithoutMembers' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Clan name is required');
    });
  });

  describe('POST /:clanId/addUser', () => {
    it('should add a user to the clan', async () => {
      const res = await supertest(app)
        .post(`/clans/${testClanId}/addUser`)
        .send({ userId: testUserId });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'User added to clan successfully');
      expect(res.body.members).toContain(testUserId);
    });
  });

    describe('GET /', () => {
    it('should return at least one clan', async () => {
        const res = await supertest(app).get('/clans');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
    });

  describe('POST /:clanId/message and GET /:clanId/messages', () => {
    it('should send a message to the clan', async () => {
      const res = await supertest(app)
        .post(`/clans/${testClanId}/message`)
        .send({ userId: testUserId, username: 'ClanUser1', text: 'Hello' });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty('text', 'Hello');
      expect(res.body[0]).toHaveProperty('username', 'ClanUser1');
    });

    it('should return 400 if message data is missing', async () => {
      const res = await supertest(app)
        .post(`/clans/${testClanId}/message`)
        .send({ userId: testUserId });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Faltan datos del mensaje');
    });

    it('should get messages for the clan', async () => {
      const res = await supertest(app).get(`/clans/${testClanId}/messages`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty('text', 'Hello');
    });
  });
});