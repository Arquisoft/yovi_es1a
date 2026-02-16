import User from '../models/user-model.js'; 
import bcrypt from 'bcrypt';

export async function createUser(userData) {
    const { username, email, password } = userData;

    if (!username || !email || !password) {
        throw new Error('All fields are required');
    }
    if (password.length < 3) {
        throw new Error('Password must be at least 3 characters');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        username,
        email,
        password: hashedPassword
    });

    return await newUser.save();
}

