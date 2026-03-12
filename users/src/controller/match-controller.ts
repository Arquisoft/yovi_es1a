import express, { Request, Response, Router } from 'express';
import { saveMatch, getMatchHistory } from '../service/match-service'; // Agrupamos los imports del mismo archivo
import Match, { IMatch } from '../models/match-model.ts';

const router: Router = express.Router();

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

/**
 * Determina si un error es de validación (Bad Request - 400) 
 * basándose en el mensaje devuelto por el servicio.
 */
const isValidationError = (errorMessage: string): boolean => {
    if (!errorMessage) return false;
    
    const validationMessages = [
        'Invalid input format',
        'Invalid input format for boardSize',
        'Invalid match result',
        'Duration cannot be negative'
    ];
    
    return validationMessages.includes(errorMessage) || errorMessage.includes('negative');
};


// ==========================================
// RUTAS
// ==========================================

router.post('/', async (req: Request, res: Response) => {
    try {
        const { user, ...rest } = req.body; 

        // --- 1. Validación Básica ---
        if (!user) {
            return res.status(400).json({ error: "No user ID received." });
        }

        // --- 2. Guardado en Base de Datos ---
        const match = await saveMatch({ 
            userId: user, 
            ...rest 
        });

        // --- 3. Respuesta Exitosa ---
        return res.status(201).json({
            message: 'Match successfully saved',
            matchId: match._id,
            ...match.toJSON()
        });

    } catch (error: any) {
        // --- 4. Manejo de Errores ---
        if (isValidationError(error?.message)) {
            return res.status(400).json({ error: error.message });
        }
        
        console.error("Error saving match:", error); // Siempre es bueno tener un log en el servidor para los 500
        return res.status(500).json({ error: 'Error saving match' });
    }
});


/*router.get('/user/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        // --- 1. Validación Básica ---
        if (!userId || userId.trim() === '') {
            return res.status(404).json({ error: 'User ID is required' });
        }

        // --- 2. Consulta al Servicio ---
        const history = await getMatchHistory(userId);
        
        // --- 3. Respuesta Exitosa ---
        return res.status(200).json(history);

    } catch (error: any) {
        // --- 4. Manejo de Errores ---
        if (error?.message === 'Invalid input format') {
            return res.status(400).json({ error: error.message });
        }
        
        console.error("Error fetching match history:", error);
        return res.status(500).json({ error: 'Internal server error while fetching history' });
    }
});*/

router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;   // página actual
    const size = parseInt(req.query.size as string) || 10;  // tamaño de página

    const skip = (page - 1) * size;

    // Buscar partidas paginadas
    const content = await Match.find({ user: userId })
      .sort({ createdAt: -1 })   // opcional: ordenar por fecha
      .skip(skip)
      .limit(size);

    const totalElements = await Match.countDocuments({ user: userId });

    res.json({
      content,
      page,
      size,
      totalElements,
      totalPages: Math.ceil(totalElements / size)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching match history" });
  }
});

export default router;