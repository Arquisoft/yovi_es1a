const express = require('express');
const router = express.Router();
const userService = require('../services/user-service');

router.post('/createuser', async (req, res) => {
    try {
        const result = await userService.createUser(req.body);
        res.status(201).json({ message: 'User created successfully!', user: result });
    } catch (error) {
        // Si el usuario ya existe o hay error de validación
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;