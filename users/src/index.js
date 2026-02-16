import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import promBundle from 'express-prom-bundle';
import userRoutes from './routes/user-routes.js';


const app = express();
const port = process.env.PORT || 3000;


app.use(cors({
  origin: '*', //for develop
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

//register data (grafana and prometheus)
const metricsMiddleware = promBundle({ includeMethod: true });
app.use(metricsMiddleware);

const mongoUri = process.env.MONGODB_URI;

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected successfully to:', mongoUri))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Redirects all incoming requests from the root directory ('/') to 'userRoutes'.
// A POST request to '/createuser' is forwarded to the user-routes
app.use('/', userRoutes); 

//check the health (/health)
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'Users Service' });
});

export default app

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Users Service listening on port :${port}`);
    });
}