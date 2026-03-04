import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        res.status(401).json({ error: "Acceso denegado. No hay token." });
        return;
    }

    try {
        const secret = process.env.JWT_SECRET as string;
        const decoded = jwt.verify(token, secret) as { userId: string, username: string };
        
        (req as any).user = decoded; 
        
        next(); 
    } catch (error) {
        res.status(403).json({ error: "Token no válido o caducado." });
    }
};