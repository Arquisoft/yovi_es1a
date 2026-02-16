import dotenv from 'dotenv';
dotenv.config(); 

import express from 'express';
import cors from 'cors';
import promBundle from 'express-prom-bundle';

import userRoutes from './routes/user-routes.js';
import connectBD from './database.js'; 

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const metricsMiddleware = promBundle({ includeMethod: true });
app.use(metricsMiddleware);

connectBD(); 

app.use('/', userRoutes); 

app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'Users Service' });
});

export default app;

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Users Service listening on port :${port}`);
    });
}