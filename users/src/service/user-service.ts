import User, { IUser } from '../models/user-model'; 
import bcrypt from 'bcryptjs';

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
    const { username, email, password } = userData; //extract the variables from userdata

    if (!username || !email || !password) {
        throw new Error('All fields are required');
    }
    
    if (password.length < 3) {
        throw new Error('Password must be at least 3 characters');
    }

    const existingUser = await User.findOne({ 
    $or: [
        { email: { $eq: email } }, 
        { username: { $eq: username } }
    ] 
    });//search if already exist the email or the username

    if (existingUser) {
        if (existingUser.email === email) {
          throw new Error('Email already registered');
        }
        if (existingUser.username === username) {
          throw new Error('Username already taken');
        }
    }

  
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        username,
        email,
        password: hashedPassword
    });

    return await newUser.save();
}

export async function login(userData: LoginUserInput):Promise<IUser> {
  const { username, password } = userData;
  const existingUser = await User.findOne({ username: { $eq: username } });

  if (!existingUser) {
    throw new Error('User not found');
  }
  const isPasswordValid = await bcrypt.compare(password, existingUser.password);

  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  return existingUser;
}