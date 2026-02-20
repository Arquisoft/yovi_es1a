import { describe, it, expect, afterAll } from 'vitest';
import supertest from 'supertest';
import app from '../src/index'; 
import User from '../src/models/user-model'; 

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
    });
});