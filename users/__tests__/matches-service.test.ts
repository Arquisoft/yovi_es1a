import { describe, it, expect, afterAll, beforeAll, vi } from 'vitest';
import supertest from 'supertest';
import app from '../src/index'; 
import User from '../src/models/user-model'; 
import Match from '../src/models/match-model';
import * as MatchService from '../src/service/match-service';
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

    describe('POST /matches', () => {
        it('should save a new match and return 201', async () => {
            const res = await supertest(app)
                .post('/matches')
                .send({
                    user: testUserId,
                    result: 'win',
                    duration: 120,
                    boardSize: 7,
                    opponent: 'monte_carlo_bot',
                    totalMoves: 25,
                    gameMode: 'computer'
                })
                .set('Accept', 'application/json');

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('message', 'Match successfully saved');
            expect(res.body).toHaveProperty('matchId');
            expect(res.body).toHaveProperty('result', 'win');
            expect(res.body).toHaveProperty('duration', 120);
            expect(res.body).toHaveProperty('boardSize', 7);
            expect(res.body).toHaveProperty('opponent', 'monte_carlo_bot');
            expect(res.body).toHaveProperty('totalMoves', 25);
            expect(res.body).toHaveProperty('gameMode', 'computer');
        });

        it('should return 400 if required fields are missing', async () => {
            const res = await supertest(app)
                .post('/matches')
                .send({
                    user: testUserId,
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
        });

        it('should return 400 if user ID is missing', async () => {
            const res = await supertest(app)
                .post('/matches')
                .send({
                    result: 'win',
                    duration: 120
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'No user ID received.');
        });

        it('should return 400 if duration is negative', async () => {
            const res = await supertest(app)
                .post('/matches')
                .send({
                    user: testUserId,
                    result: 'win',
                    duration: -50
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
        });

        it('should return 400 if result is not win, lose, or surrender', async () => {
            const res = await supertest(app)
                .post('/matches')
                .send({
                    user: testUserId,
                    result: 'trap',
                    duration: 100
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
        });

        it('should return 500 if an invalid MongoDB ID is provided', async () => {
            const res = await supertest(app)
                .post('/matches')
                .send({
                    user: 'id-falso-que-rompe-mongoose', 
                    result: 'win',
                    duration: 100
                });

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('error');
        });
        it('should return 400 if totalMoves is negative', async () => {
            const res = await supertest(app)
                .post('/matches')
                .send({
                    user: testUserId,
                    result: 'win',
                    duration: 100,
                    totalMoves: -5
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('Total moves cannot be negative');
        });
        
    });

    describe('GET /matches/history/:userId', () => {
        it('should return 200 and the match history for a valid user', async () => {
            const res = await supertest(app)
                .get(`/matches/user/${testUserId}`)
                .set('Accept', 'application/json');

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.content)).toBe(true);
            expect(res.body.content.length).toBeGreaterThanOrEqual(1); 
            const lastMatch = res.body.content[0];
            expect(lastMatch.user.username).toBe('GamerTest');
            if (lastMatch.opponent) {
                expect(lastMatch.opponent).toBeDefined();
                expect(lastMatch.gameMode).toBeDefined();
            }
        });

        it('should return 200 and an empty array if userId is not found', async () => {
            const res = await supertest(app)
                .get('/matches/user/000000000000000000000000')
                .set('Accept', 'application/json');

            expect(res.status).toBe(200);
            expect(res.body.content).toEqual([]);
            expect(res.body.totalElements).toBe(0);
            expect(res.body.totalPages).toBe(0);
        });

        it('should return 500 if an invalid MongoDB ID format is provided', async () => {
            const res = await supertest(app)
                .get(`/matches/user/idfalse`)
                .set('Accept', 'application/json');

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('error');
        });

        it('should return 404 if userId is whitespace', async () => {
            const res = await supertest(app)
                .get('/matches/user/%20')
                .set('Accept', 'application/json');

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('error', 'User ID is required');
        });

        it('should return 400 if service throws Invalid input format', async () => {
            const spy = vi.spyOn(MatchService, 'getMatchHistory').mockRejectedValueOnce(new Error('Invalid input format'));

            const res = await supertest(app)
                .get(`/matches/user/${testUserId}`)
                .set('Accept', 'application/json');

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Invalid input format');
            spy.mockRestore();
        });
    });
});