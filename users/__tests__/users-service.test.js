import { describe, it, expect, afterEach, vi } from 'vitest'
import request from 'supertest'
import app from '../src/index.js'

describe('POST /createuser', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('returns a greeting message for the provided username', async () => {
        const res = await request(app)
            .post('/createuser')
            .send({ 
                username: 'Pablo',
                email: 'pablo@test.com',      
                password: 'testpassword123'  
            })
            .set('Accept', 'application/json')

        expect(res.status).toBe(201)
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toMatch(/User successfully created/i)
    })
})
