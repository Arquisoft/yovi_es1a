const express = require('express');
const router = express.Router();
const { createUser } = require('../service/user-service');

router.post('/createuser', async (req, res) => {
  try {
    const userData = req.body;
    const user = await createUser(userData);
    
    res.status(201).json({ 
      message: 'User successfully created',
      userId: user._id,
      username: user.username
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error.message === 'All fields are required') {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === 'Password must be at least 3 characters') {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === 'Email already registered') {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

module.exports = router;