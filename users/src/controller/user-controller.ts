import express, { Request, Response, Router } from 'express';
import { createUser, login } from '../service/user-service'; // Agrupamos las importaciones
import jwt from 'jsonwebtoken';

// Instead of putting all the routes directly into the main index.ts file, 
// express.Router() creates a mini-server dedicated solely to users.
const router: Router = express.Router(); 

// ==========================================
// FUNCIONES AUXILIARES DE ERROR
// ==========================================

const isValidationError = (msg: string): boolean => {
    return [
        'All fields are required', 
        'Password must be at least 3 characters', 
        'Invalid input format'
    ].includes(msg);
};

const isConflictError = (msg: string): boolean => {
    return [
        'Email already registered', 
        'Username already taken'
    ].includes(msg);
};


// ==========================================
// RUTAS
// ==========================================

// This creates a specific gateway called /createuser that only accepts packets delivered via the POST method
router.post('/createuser', async (req: Request, res: Response) => {
    try {
        // --- 1. Llamada al Servicio ---
        const user = await createUser(req.body); 
        
        // --- 2. Respuesta Exitosa ---
        return res.status(201).json({ 
            message: 'User successfully created',
            userId: user._id,
            username: user.username
        });
        
    } catch (error: any) {
        // --- 3. Manejo de Errores ---
        const msg = error?.message;

        if (isValidationError(msg)) {
            return res.status(400).json({ error: msg });
        }
        
        if (isConflictError(msg)) {
            return res.status(409).json({ error: msg });
        }
        
        console.error("Error creating user:", error);
        return res.status(500).json({ error: 'Error creating user' });
    }
});


router.post('/login', async (req: Request, res: Response) => {
    try {
        // --- Llamada al Servicio ---
        const user = await login(req.body);

        // Generar el token
        const token = jwt.sign(
            { userId: user._id.toString(), username: user.username },
            process.env.JWT_SECRET || 'jwt_token_secret',
            { expiresIn: '1h' }
        );
        
        // --- Respuesta Exitosa ---
        return res.status(200).json({
            message: 'Login successful',
            userId: user._id,
            username: user.username,
            token
        });

    } catch (error: any) {
        // --- Manejo de Errores ---
        const msg = error?.message;

        if (msg === 'User not found') {
            return res.status(404).json({ error: msg });
        } 
        
        if (msg === 'Invalid password') {
            return res.status(401).json({ error: msg });
        }
        
        console.error("Error during login:", error);
        return res.status(500).json({ error: 'Internal server error during login' });
    }
});

export default router;