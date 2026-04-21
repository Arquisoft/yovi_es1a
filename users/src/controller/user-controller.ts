import express, { Request, Response, Router } from 'express';
import { createUser, login } from '../service/user-service';
import jwt from 'jsonwebtoken';

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

router.post('/createuser', async (req: Request, res: Response) => {
    try {
        const user = await createUser(req.body); 
        
        return res.status(201).json({ 
            message: 'User successfully created',
            userId: user._id,
            username: user.username
        });
        
    } catch (error: any) {
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
        const user = await login(req.body);

        const token = jwt.sign(
            { userId: user._id.toString(), username: user.username },
            process.env.JWT_SECRET || 'jwt_token_secret',
            { expiresIn: '1h' }
        );
        
        return res.status(200).json({
            message: 'Login successful',
            userId: user._id,
            username: user.username,
            token
        });

    } catch (error: any) {
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