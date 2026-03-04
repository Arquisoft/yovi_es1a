const RUST_API_URL = process.env.RUST_API_URL || "http://gamey:4000";
import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();

router.post('/play', async (req: Request, res: Response) => {
    try {
        const { position, strategy } = req.body;

        if (!position) {
            return res.status(400).json({ error: "The 'position' parameter (YEN notation) is mandatory." });
        }

        const botId = (strategy === "random") ? "random_bot" : (strategy || "random_bot");

        const rustResponse = await fetch(`${RUST_API_URL}/v1/ybot/choose/${botId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(position) 
        });

        if (!rustResponse.ok) {
            const errorText = await rustResponse.text();
            let errorData = {};
            
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
            }

            return res.status(500).json({ 
                error: "The Rust engine rejected the play or couldn't find the bot.", 
                details: errorData 
            });
        }

        const data = await rustResponse.json();
        return res.status(200).json(data);

    } catch (error: any) {
        console.error("Error communicating with the YEN engine:", error);
        return res.status(500).json({ error: "Internal error on Node.js server" });
    }
});

export default router;