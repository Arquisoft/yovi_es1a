import { Request, Response, NextFunction } from 'express';
import pkg from 'jsonwebtoken';
const { verify } = pkg;

interface UserPayload {
    userId: string;
    username: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
        }
    }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: "Acceso denegado. No hay token." });
        return;
    }

    try {
        const secret = process.env.JWT_SECRET || 'jwt_token_secret';
        const decoded = verify(token, secret) as UserPayload;
        req.user = decoded;

        next();
    } catch (error) {
        console.error("Error verificando token:", error);
        res.status(403).json({ error: "Token no válido o caducado." });
    }
};