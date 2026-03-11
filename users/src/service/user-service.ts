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

// ==========================================
// SERVICIOS DE USUARIO
// ==========================================

export async function createUser(userData: CreateUserInput): Promise<IUser> {
    const { username, email, password } = userData;

    // --- 1. Validación de Formato Básico ---
    if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
        throw new Error('Invalid input format');
    }

    // --- 2. Sanitización (Quitar espacios en blanco a los extremos) ---
    const sanitizedUsername = username.trim();
    const sanitizedEmail = email.trim();

    // --- 3. Validación de Negocio ---
    if (!sanitizedUsername || !sanitizedEmail || !password) {
        throw new Error('All fields are required');
    }
    
    if (password.length < 3) {
        throw new Error('Password must be at least 3 characters');
    }

    // --- 4. Comprobación de Duplicados ---
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

    // --- 5. Encriptación y Guardado ---
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

    // --- 1. Validación de Formato Básico ---
    if (typeof username !== 'string' || typeof password !== 'string') {
        throw new Error('Invalid input format');
    }

    // --- 2. Sanitización y Búsqueda ---
    const sanitizedUsername = username.trim();
    
    const existingUser = await User.findOne({ 
        username: sanitizedUsername 
    });

    if (!existingUser) {
        throw new Error('User not found');
    }

    // --- 3. Verificación de Contraseña ---
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordValid) {
        throw new Error('Invalid password');
    }

    // --- 4. Retorno Exitoso ---
    return existingUser;
}