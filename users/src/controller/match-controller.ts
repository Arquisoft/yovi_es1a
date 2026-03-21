import express, { Request, Response, Router } from 'express';
import { saveMatch, getMatchHistory } from '../service/match-service'; // Agrupamos los imports del mismo archivo
import Match, { IMatch } from '../models/match-model.ts';//Tabla base datos de partidas

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

router.get('/ranking/global', async (req: Request, res: Response) => {
    try {
        const ranking = await Match.aggregate([
            {
                $group: {
                    _id: "$user",
                    totalMatches: { $sum: 1 },
                    wins: {
                        $sum: { $cond: [{ $eq: ["$result", "win"] }, 1, 0] }
                    },
                    losses: {
                        $sum: { $cond: [{ $in: ["$result", ["lose", "surrender"]] }, 1, 0] }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },
            { $unwind: "$userInfo" },
            {
                $project: {
                    _id: 1,
                    username: "$userInfo.username",
                    totalMatches: 1,
                    wins: 1,
                    losses: 1,
                    winRate: {
                        $multiply: [ { $divide: ["$wins", "$totalMatches"] }, 100 ]
                    }
                }
            }
        ]);

        return res.status(200).json(ranking);

    } catch (error) {
        console.error("Error fetching global ranking:", error);
        return res.status(500).json({ error: 'Internal server error while fetching ranking' });
    }
});

router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // --- 1. Validación Básica ---
    if (!userId || userId.trim() === '') {
        return res.status(404).json({ error: 'User ID is required' });
    }

    //req.query contiene todos los parámetros de la URL que vienen después del ? que se puso en service (page y size)
    const page = parseInt(req.query.page as string) || 1;//Página actual
    const size = parseInt(req.query.size as string) || 5;//Size
    //const result = req.query.result as string; // filtro opcional
    const { result, maxMoves, maxDuration } = req.query;//Asigna los valores

    const filters = {
        result: result as string,
        maxMoves: maxMoves ? parseInt(maxMoves as string) : undefined,
        maxDuration: maxDuration ? parseInt(maxDuration as string) : undefined,
    };
    // --- 2. Consulta al Servicio ---
    const history = await getMatchHistory(userId, page, size, filters);
        
    // --- 3. Respuesta Exitosa ---
    //return res.status(200).json(history);
    res.json(history);

  } catch (error: any) {
        // --- 4. Manejo de Errores ---
        if (error?.message === 'Invalid input format') {
            return res.status(400).json({ error: error.message });
        }
        
        console.error("Error fetching match history:", error);
        return res.status(500).json({ error: 'Internal server error while fetching history' });
    }
});

export default router;