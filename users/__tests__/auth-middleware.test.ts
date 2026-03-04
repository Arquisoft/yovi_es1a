import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyToken } from '../src/middleware/auth-middleware';
import * as jwt from 'jsonwebtoken';

describe('Auth Middleware', () => {
    let mockRequest: any;
    let mockResponse: any;
    let nextFunction: any;

    beforeEach(() => {
        mockRequest = { headers: {} };
        mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
        nextFunction = vi.fn();
        process.env.JWT_SECRET = 'test-secret';
    });

    it('debe dar 401 si no hay cabecera de autorización', () => {
        verifyToken(mockRequest, mockResponse, nextFunction);
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: "Acceso denegado. No hay token." });
    });

    it('debe llamar a next() si el token es válido', () => {
        const payload = { userId: '123', username: 'testuser' };
        const token = jwt.sign(payload, 'test-secret');
        mockRequest.headers['authorization'] = `Bearer ${token}`;

        verifyToken(mockRequest, mockResponse, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(mockRequest.user).toMatchObject(payload);
    });

    it('debe dar 403 si el token es inválido', () => {
        mockRequest.headers['authorization'] = 'Bearer token-falso';
        verifyToken(mockRequest, mockResponse, nextFunction);
        expect(mockResponse.status).toHaveBeenCalledWith(403);
    });
});