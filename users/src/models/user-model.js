const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlenght: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlenght: 3
    },
    password: {
        type: String,
        required: true,
        minlenght: 3
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;