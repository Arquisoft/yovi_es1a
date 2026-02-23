import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import supertest from 'supertest';
import app from '../src/index'; 
import User from '../src/models/user-model'; 
import Match from '../src/models/match-model';

describe('Integration Tests: Users Service', () => {

    afterAll(async () => {
        await User.deleteOne({ email: 'hugocarbajales@test.com' });
    });

    describe('POST /createuser', () => {
        it('You should create a new user and return 201', async () => {
            const res = await supertest(app) 
                .post('/createuser')
                .send({ 
                    username: 'Hugo',
                    email: 'hugocarbajales@test.com',      
                    password: 'testpassword123'  
                })
                .set('Accept', 'application/json');

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toMatch(/User successfully created/i);
            });

            it('should return 400 if required fields are missing', async () => {
            const res = await supertest(app)
                .post('/createuser')
                .send({ 
                    username: 'FaltaEmail'
                })
                .set('Accept', 'application/json');

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
        });
    });

    describe('POST /login', () => {
        it('It should allow login with the newly created user and return 200.', async () => {
            const res = await supertest(app)
                .post('/login')
                .send({ 
                    username: 'Hugo',
                    password: 'testpassword123'  
                })
                .set('Accept', 'application/json');

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toMatch(/Login successful/i); 
            expect(res.body).toHaveProperty('userId');
            expect(res.body.username).toBe('Hugo');
            });

            it('should return 401 if password is incorrect', async () => {
            const res = await supertest(app)
                .post('/login')
                .send({ 
                    username: 'Hugo',
                    password: 'wrongpassword' 
                })
                .set('Accept', 'application/json');

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('error');
        });
        it('should return 404 if user is not found', async () => {
            const res = await supertest(app)
                .post('/login')
                .send({ 
                    username: 'fakeuser',
                    password: 'testpassword123' 
                })
                .set('Accept', 'application/json');

            expect(res.status).toBe(404); 
            expect(res.body).toHaveProperty('error');
        });
    });
});
describe('Integration Tests: Matches Service', () => {
    let testUserId: string;
    //Create an user
    beforeAll(async () => {
        const res = await supertest(app)
            .post('/createuser')
            .send({ 
                username: 'GamerTest',
                email: 'gamertest@test.com',      
                password: 'password123'  
            });
        testUserId = res.body.userId; // save real id in db
    }, 15000);

    //When finish delete user and games
    afterAll(async () => {
        await User.deleteOne({ _id: testUserId });
        await Match.deleteMany({ user: testUserId });
    });

    describe('POST /matches/save', () => {
        it('should save a new match and return 201', async () => {
            const res = await supertest(app)
                .post('/matches/save')
                .send({
                    userId: testUserId,
                    result: 'win',
                    duration: 120,
                    boardSize: 7
                })
                .set('Accept', 'application/json');

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('message', 'Match successfully saved');
            expect(res.body).toHaveProperty('matchId');
        });

        it('should return 400 if required fields are missing', async () => {
            const res = await supertest(app)
                .post('/matches/save')
                .send({
                    userId: testUserId,
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
        });

        it('should return 400 if duration is negative', async () => {
            const res = await supertest(app)
                .post('/matches/save')
                .send({
                    userId: testUserId,
                    result: 'win',
                    duration: -50
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
        });

        it('should return 400 if result is not win, lose, or surrender', async () => {
            const res = await supertest(app)
                .post('/matches/save')
                .send({
                    userId: testUserId,
                    result: 'trap',
                    duration: 100
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
        });

        it('should return 500 if an invalid MongoDB ID is provided', async () => {
            const res = await supertest(app)
                .post('/matches/save')
                .send({
                    userId: 'id-falso-que-rompe-mongoose', 
                    result: 'win',
                    duration: 100
                });

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('error');
        });
    });

    describe('GET /matches/history/:userId', () => {
        it('should return 200 and the match history for a valid user', async () => {
            const res = await supertest(app)
                .get(`/matches/history/${testUserId}`)
                .set('Accept', 'application/json');

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(1); 
            expect(res.body[0].user.username).toBe('GamerTest');
        });

        it('should return 404 if userId is missing', async () => {
            const res = await supertest(app)
                .get('/matches/history/')
                .set('Accept', 'application/json');

            expect(res.status).toBe(404);
        });

        it('should return 500 if an invalid MongoDB ID format is provided', async () => {
            const res = await supertest(app)
                .get('/matches/history/id-false') 
                .set('Accept', 'application/json');

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('error');
        });
    });
});