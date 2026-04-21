import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/user-model'; 

const SALT_ROUNDS = 10;

interface CreateUserInput {
  username?: string;
  email?: string;
  password?: string;
}

interface LoginUserInput {
  username: string;
  password: string;
}

export async function createUser(userData: CreateUserInput): Promise<IUser> {
    const { username, email, password } = userData;
    if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
        throw new Error('Invalid input format');
    }

    const sanitizedUsername = username.trim();
    const sanitizedEmail = email.trim();

    if (!sanitizedUsername || !sanitizedEmail || !password) {
        throw new Error('All fields are required');
    }
    
    if (password.length < 3) {
        throw new Error('Password must be at least 3 characters');
    }

    const existingUser = await User.findOne({ 
        $or: [
            { email: sanitizedEmail }, 
            { username: sanitizedUsername }
        ] 
    });

    if (existingUser) {
        if (existingUser.email === sanitizedEmail) {
            throw new Error('Email already registered');
        }
        if (existingUser.username === sanitizedUsername) {
            throw new Error('Username already taken');
        }
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = new User({
        username: sanitizedUsername,
        email: sanitizedEmail,
        password: hashedPassword
    });

    return await newUser.save();
}


export async function login(userData: LoginUserInput): Promise<IUser> {

    const { username, password } = userData;
    if (typeof username !== 'string' || typeof password !== 'string') {
        throw new Error('Invalid input format');
    }
    const sanitizedUsername = username.trim();
    
    const existingUser = await User.findOne({ 
        username: sanitizedUsername 
    });

    if (!existingUser) {
        throw new Error('User not found');
    }
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
        throw new Error('Invalid password');
    }
    return existingUser;
}