import { describe, it, expect, vi, afterEach } from 'vitest';
import supertest from 'supertest';
import app from '../src/index';

// Mock global fetch
global.fetch = vi.fn();

describe('Integration Tests: Bot Controller', () => {

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /bot/play', () => {
        it('should return 400 if position is missing', async () => {
            const res = await supertest(app)
                .post('/bot/play')
                .send({ strategy: 'random_bot' })
                .set('Accept', 'application/json');

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', "The 'position' parameter (YEN notation) is mandatory.");
        });

        it('should return 200 and the move when Rust engine responds successfully', async () => {
            const mockRustResponse = {
                coords: 'D4',
                game_status: 'ongoing'
            };

            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => mockRustResponse
            });

            const res = await supertest(app)
                .post('/bot/play')
                .send({ 
                    position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
                    strategy: 'minimax'
                })
                .set('Accept', 'application/json');

            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                move: 'D4',
                game_status: 'ongoing'
            });

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/v1/ybot/choose/minimax'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
                })
            );
        });

        it('should use "random_bot" as default strategy if not provided', async () => {
            const mockRustResponse = { coords: 'A1', game_status: 'ongoing' };
            (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => mockRustResponse
            });

            await supertest(app)
                .post('/bot/play')
                .send({ position: 'some_position' });

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/v1/ybot/choose/random_bot'),
                expect.anything()
            );
        });

        it('should return 500 if Rust engine returns an error', async () => {
            (fetch as any).mockResolvedValue({
                ok: false,
                text: async () => 'Engine Error',
                json: async () => ({ detail: 'Invalid position' })
            });

            const res = await supertest(app)
                .post('/bot/play')
                .send({ position: 'bad-pos' });

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('error', "The Rust engine rejected the play or couldn't find the bot.");
        });

        it('should return 500 if fetch throws an exception (network error)', async () => {
            (fetch as any).mockRejectedValue(new Error('Network error'));

            const res = await supertest(app)
                .post('/bot/play')
                .send({ position: 'pos' });

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('error', "Internal error on Node.js server");
        });
    });
});