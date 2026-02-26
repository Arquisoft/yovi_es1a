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
