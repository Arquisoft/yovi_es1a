import { describe, it, expect, vi, afterEach, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import app from '../src/index';
import jwt from 'jsonwebtoken';
import User from '../src/models/user-model';
const fetchMock = vi.spyOn(globalThis, 'fetch');

describe('Integration Tests: Bot Controller', () => {
    let testUserId: string;
    let testToken: string;
    beforeAll(async () => {
        const res = await supertest(app)
            .post('/createuser')
            .send({
                username: 'BotTester',
                email: 'bottester@test.com',
                password: 'password123'
            });
        testUserId = res.body.userId;

        const secret = process.env.JWT_SECRET || 'your_super_secret_key';
        testToken = jwt.sign({ id: testUserId, email: 'bottester@test.com' }, secret, { expiresIn: '1h' });
    }, 15000);
    
    afterAll(async () => {
        if (testUserId) {
            await User.deleteOne({ _id: testUserId });
        }
    });
    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /api/bot/play', () => {
        it('1. should return 400 if position is missing', async () => {
            const res = await supertest(app)
                .post('/api/bot/play')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ strategy: 'random_bot' })
                .set('Accept', 'application/json');

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', "The 'position' parameter (YEN notation) is mandatory.");
        });

        it('2. should return 200 and the move when Rust engine responds successfully', async () => {
            const mockRustResponse = {
                coords: 'D4',
                game_status: 'ongoing'
            };

            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => mockRustResponse
            } as any);

            const res = await supertest(app)
                .post('/api/bot/play')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ 
                    position: { size: 3, turn: 0, players: ["B", "R"], layout: "B/BR/.R." },
                    strategy: 'random'
                })
                .set('Accept', 'application/json');

            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                coords: 'D4',
                game_status: 'ongoing'
            });

           expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/v1/ybot/choose/random'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ size: 3, turn: 0, players: ["B", "R"], layout: "B/BR/.R." })
                })
            );
        });

        it('3. should use "random_bot" as default strategy if not provided', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ coords: 'A1', game_status: 'ongoing' })
            } as any);

            await supertest(app)
                .post('/api/bot/play')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ position: { size: 3, turn: 0, players: ["B", "R"], layout: "B/../..." } });

            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/v1/ybot/choose/random_bot'),
                expect.anything()
            );
        });

        it('4. should return 500 if Rust engine returns an error', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                text: async () => JSON.stringify({ detail: 'Invalid position' })
            } as any);

            const res = await supertest(app)
                .post('/api/bot/play')
                .set('Authorization', `Bearer ${testToken}`)
                // FIX: JSON válido
                .send({ position: { size: 3, turn: 0, players: ["B", "R"], layout: "B/../..." } });

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('error', "The Rust engine rejected the play or couldn't find the bot.");
            expect(res.body.details).toHaveProperty('detail', 'Invalid position');
        });

        it('5. should return 500 if fetch throws an exception (network error)', async () => {
            fetchMock.mockRejectedValueOnce(new Error('Network error'));

            const res = await supertest(app)
                .post('/api/bot/play')
                .set('Authorization', `Bearer ${testToken}`)
                // FIX: JSON válido
                .send({ position: { size: 3, turn: 0, players: ["B", "R"], layout: "B/../..." } });

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('error', "Internal error on Node.js server");
        });

        it('6. should handle non-JSON error responses from Rust engine', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                text: async () => "Internal Server Error: Database Down" 
            } as any);

            const res = await supertest(app)
                .post('/api/bot/play')
                .set('Authorization', `Bearer ${testToken}`)
                // FIX: JSON válido
                .send({ position: { size: 3, turn: 0, players: ["B", "R"], layout: "B/../..." } });

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('error', "The Rust engine rejected the play or couldn't find the bot.");
            expect(res.body.details).toHaveProperty('rawError', "Internal Server Error: Database Down");
        });
        it('7. should use a specific valid strategy from validBots array', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ coords: 'B2', game_status: 'ongoing' })
            } as any);

            const res = await supertest(app)
                .post('/api/bot/play')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ 
                    position: { size: 3, turn: 0, players: ["B", "R"], layout: "B/../..." }, 
                    strategy: 'monte_carlo_bot' // Estrategia válida
                });

            expect(res.status).toBe(200);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/v1/ybot/choose/monte_carlo_bot'),
                expect.anything()
            );
        });

        it('8. should return 400 if an invalid strategy is provided', async () => {
            const res = await supertest(app)
                .post('/api/bot/play')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ 
                    position: { size: 3, turn: 0, players: ["B", "R"], layout: "B/../..." }, 
                    strategy: 'fake_bot'
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Invalid strategy: fake_bot');
        });
        it('9. should return 400 if position string is invalid JSON (GET request)', async () => {
            const res = await supertest(app)
                .get('/api/bot/play')
                .set('Authorization', `Bearer ${testToken}`)
                .query({ position: '{esto-no-es-un-json-valido}' }); // Al usar .query(), Express lo recibe como texto

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Invalid JSON format in position parameter.');
        });

        it('10. should return 200 and ONLY coordinates when using GET method', async () => {
            const mockRustResponse = {
                coords: { x: 1, y: 0, z: 2 },
                game_status: 'ongoing'
            };

            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => mockRustResponse
            } as any);

            const res = await supertest(app)
                .get('/api/bot/play')
                .set('Authorization', `Bearer ${testToken}`)
                .query({ 
                    position: JSON.stringify({ size: 3, turn: 0, players: ["B", "R"], layout: "B/BR/.R." }),
                    bot_id: 'monte_carlo_bot'
                });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ x: 1, y: 0, z: 2 }); 
            
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/v1/ybot/choose/monte_carlo_bot'),
                expect.anything()
            );
        });
    });
    
    describe('POST /api/bot/check-winner', () => {
        it('1. should return 200 and status when Rust engine verifies the board', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ status: 'win' })
            } as any);

            const res = await supertest(app)
                .post('/api/bot/check-winner')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ size: 3, layout: 'B/BB/B..' });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ status: 'win' });
            
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/v1/game/check_winner'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ size: 3, layout: 'B/BB/B..', turn: 0, players: ["B", "R"] })
                })
            );
        });

        it('2. should return 500 if Rust engine rejects the check-winner request', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                text: async () => 'Invalid layout format'
            } as any);

            const res = await supertest(app)
                .post('/api/bot/check-winner')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ size: 3, layout: 'invalid_layout' });

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('error', 'Rust rechazó la petición');
            expect(res.body).toHaveProperty('details', 'Invalid layout format');
        });

        it('3. should return 500 if a network or internal exception occurs', async () => {
            fetchMock.mockRejectedValueOnce(new Error('Connection refused'));

            const res = await supertest(app)
                .post('/api/bot/check-winner')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ size: 3, layout: 'B/BB/B..' });

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('error', 'No se pudo contactar con gamey:4000');
        });
    });
});