import dotenv from 'dotenv';

dotenv.config(); 

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import promBundle from 'express-prom-bundle';

import userRoutes from './controller/user-controller'; 
import matchRoutes from './controller/match-controller';
import connectBD from './database'; 

const app: Application = express();
app.disable('x-powered-by');
const port: string | number = process.env.PORT || 3000;

// middlewaers (allow front which is on a different port to request data from backend)
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:80',
    'http://localhost',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); //convert plain text in json

//metrics so that Prometheus and Grafana can read them and make graphs.
/**
const metricsMiddleware = promBundle({ 
  includeMethod: true,
  includePath: true,
  promClient: {
    collectDefaultMetrics: {}
  }
});
app.use(metricsMiddleware);
*/

connectBD(); //conect bd

app.use('/', userRoutes);  // connect with user-controller
app.use('/matches', matchRoutes); // connect with match-controller

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', service: 'Users Service' });
});

export default app;

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Users Service listening on port :${port}`);
    });
}