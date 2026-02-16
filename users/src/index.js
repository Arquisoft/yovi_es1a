require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose'); //conect and talk with mongodb
const cors = require('cors'); //allow extern peticions
const promBundle = require('express-prom-bundle');

const userRoutes = require('./routes/user-routes'); 

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
