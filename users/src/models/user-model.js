import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3 
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 3 
    },
    password: {
        type: String,
        required: true,
        minlength: 3 
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model('User', userSchema);

export default User;