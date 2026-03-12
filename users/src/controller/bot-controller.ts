import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();

// 1. Las variables de entorno y constantes globales definidas aquí para evitar repetición y facilitar mantenimiento
const RUST_API_URL = process.env.RUST_API_URL;

const VALID_BOTS = [
    "random_bot", 
    "group_expansion_bot", 
    "monte_carlo_bot",
    "priority_block_bot",
    "shortest_path_bot",
    "simple_blocker_bot",
    "triangle_attack_bot"
];

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

/**
 * Resuelve el ID del bot a partir de la estrategia recibida.
 * Retorna null si la estrategia no es válida.
 */
const getBotId = (strategy?: string): string | null => {
    if (!strategy || strategy === "random") return "random_bot";
    if (VALID_BOTS.includes(strategy)) return strategy;
    return null; // Estrategia inválida
};

/**
 * Intenta parsear el error de Rust como JSON
 */
const parseRustError = async (response: any) => {
    const errorText = await response.text();
    try {
        return JSON.parse(errorText);
    } catch (e) {
        console.warn("Could not parse Rust error response as JSON:", e);
        return { rawError: errorText };
    }
};


// ==========================================
// RUTAS
// ==========================================

const playHandler = async (req: Request, res: Response) => {
    try {
        // 1. Extraemos los datos dependiendo de por dónde lleguen (body o query)
        const rawPosition = req.body?.position || req.query?.position;
        // El frontend usa 'strategy', la API usa 'bot_id' en la URL
        const rawStrategy = req.body?.strategy || req.query?.bot_id || req.query?.strategy;

        if (!rawPosition) {
            return res.status(400).json({ error: "The 'position' parameter (YEN notation) is mandatory." });
        }

        let position;
        // Si viene de la API, será un string y hay que convertirlo a objeto
        if (typeof rawPosition === 'string') {
            try {
                position = JSON.parse(rawPosition);
            } catch (e) {
                return res.status(400).json({ error: "Invalid JSON format in position parameter." });
            }
        } else {
            position = rawPosition; // Si viene del frontend, ya es un objeto JSON
        }

        const botId = getBotId(rawStrategy as string);
        if (!botId) {
            return res.status(400).json({ error: `Invalid strategy: ${rawStrategy}` });
        }

        // --- 3. Llamada a la API de Rust ---
        const rustResponse = await fetch(`${RUST_API_URL}/v1/ybot/choose/${botId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(position) 
        });

        if (!rustResponse.ok) {
            const errorData = await parseRustError(rustResponse);
            return res.status(500).json({ 
                error: "The Rust engine rejected the play or couldn't find the bot.", 
                details: errorData 
            });
        }

        const data = await rustResponse.json();
        if (req.method === 'GET') {
            const coordinates = data.coords || data.move; 
            return res.status(200).json(coordinates);
        }
        
        return res.status(200).json(data);

    } catch (error: any) {
        console.error("Error communicating with the YEN engine:", error);
        return res.status(500).json({ error: "Internal error on Node.js server" });
    }
};


router.post('/play', playHandler); // Para tu Frontend React
router.get('/play', playHandler);  // Para el Curl de tu profesor (-G)


router.post('/check-winner', async (req: Request, res: Response) => {
    try {
        const { size, layout } = req.body;

        // --- 1. Preparación de datos ---
        const position = {
            size,
            layout,
            turn: 0, 
            players: ["B", "R"]
        };

        // --- 2. Llamada a la API de Rust ---
        const rustResponse = await fetch(`${RUST_API_URL}/v1/game/check_winner`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(position) 
        });

        // --- 3. Manejo de Errores del Motor ---
        if (!rustResponse.ok) {
            const errorText = await rustResponse.text();
            return res.status(500).json({ error: "Rust rechazó la petición", details: errorText });
        }

        // --- 4. Respuesta Exitosa ---
        const data = await rustResponse.json();
        return res.status(200).json(data);

    } catch (error: any) {
        console.error("Error en Node:", error);
        return res.status(500).json({ error: "No se pudo contactar con gamey:4000" });
    }
});

export default router;