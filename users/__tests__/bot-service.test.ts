import { describe, it, expect, vi, afterEach } from 'vitest';
import supertest from 'supertest';
import app from '../src/index';

const fetchMock = vi.spyOn(globalThis, 'fetch');

describe('Integration Tests: Bot Controller', () => {

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /api/bot/play', () => {
        it('1. should return 400 if position is missing', async () => {
            const res = await supertest(app)
                .post('/api/bot/play')
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
                .send({ position: 'some_position' });

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
                .send({ position: 'bad-pos' });

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('error', "The Rust engine rejected the play or couldn't find the bot.");
            expect(res.body.details).toHaveProperty('detail', 'Invalid position');
        });

        it('5. should return 500 if fetch throws an exception (network error)', async () => {
            fetchMock.mockRejectedValueOnce(new Error('Network error'));

            const res = await supertest(app)
                .post('/api/bot/play')
                .send({ position: 'pos' });

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
                .send({ position: 'pos' });

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
                .send({ 
                    position: { size: 3, turn: 0, players: ["B", "R"], layout: "B/../..." }, 
                    strategy: 'fake_bot'
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Invalid strategy: fake_bot');
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
                .send({ size: 3, layout: 'invalid_layout' });

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('error', 'Rust rechazó la petición');
            expect(res.body).toHaveProperty('details', 'Invalid layout format');
        });

        it('3. should return 500 if a network or internal exception occurs', async () => {
            fetchMock.mockRejectedValueOnce(new Error('Connection refused'));

            const res = await supertest(app)
                .post('/api/bot/check-winner')
                .send({ size: 3, layout: 'B/BB/B..' });

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('error', 'No se pudo contactar con gamey:4000');
        });
    });
});