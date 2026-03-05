const RUST_API_URL = process.env.RUST_API_URL;
import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();

router.post('/play', async (req: Request, res: Response) => {
    try {
        const { position, strategy } = req.body;

        if (!position) {
            return res.status(400).json({ error: "The 'position' parameter (YEN notation) is mandatory." });
        }

        const validBots = ["random_bot", "group_expansion_bot", "monte_carlo_bot","priority_block_bot","shortest_path_bot","simple_blocker_bot","triangle_attack_bot"];
        let botId = "random_bot";
        if (strategy === "random") {
            botId = "random_bot";
        } else if (validBots.includes(strategy)) {
            botId = strategy;
        } else if (strategy) {
            return res.status(400).json({ error: `Invalid strategy: ${strategy}` });
        }
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
                console.warn("Could not parse Rust error response as JSON:", e);
                errorData = { rawError: errorText };
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