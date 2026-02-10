//IMPORTS: Necessary tools.
const express = require('express');
const cors = require('cors');
//Connection and data model.
const conectDB = require('./src/database');
const User = require('./src/models/User');

require('dotenv').config();

const app = express();
const port = 3000;

//Start the app
app.use(express.json()); // Allows server to understand data in JSON format.
app.use(cors()); // Allows React (other port) talks.


conectDB();

//Test: To see if the server is live.
app.get('/', (req, res) => {
    res.json({ status: 'OK', service: 'Users Service' });
});

// POST /login
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Insuficient data' });
        }

        let user = await User.findOne({ username });

        if (user) {
            console.log(`Existing user logged in: ${username}`);
            return res.status(200).json({ message: "Incorrect logging", user });
        } else {
            user = new User({ username, password });
            await user.save();
            console.log(`New user created: ${username}`);
            //201 -> Created
            return res.status(201).json({ message: "New user logged", user });
        }

    } catch (error) {
        console.error("Logging error:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(port, () => {
    console.log(`User service listening at the port ${port}`);
});