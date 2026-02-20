import { describe, it, expect, vi } from 'vitest';
import { createUser, login } from './user-service';
import User from '../models/user-model';
import bcrypt from 'bcryptjs';
vi.mock('../models/user-model');
vi.mock('bcryptjs');

/**
 * Unitary test for Register an user.
 */
describe('User service - Register', ()=>{
    it('1.It should throw an error when fields are missing.', async () => {
        await expect(createUser({username:'roberto'})).rejects.toThrow('All fields are required');
    });

    it('2.It should throw an error because the password is less than 3 characters long.',async()=>
        {
            await expect(createUser({username:'antonio',email:'antonio@gmail.com',password:'12'})).rejects.
            toThrow('Password must be at least 3 characters');
        })
    it('3.It should throw an error because the email already exists.',async()=>
    {
        vi.mocked(User.findOne).mockResolvedValue({ email: 'hugo@gmail.com' } as any);
        
        await expect(createUser({username:'newuser',email:'hugo@gmail.com',password:'123456'})).
        rejects.toThrow('Email already registered');
    });
    it('4.It should throw an error because the username already exists.',async()=>
    {
        vi.mocked(User.findOne).mockResolvedValue({ username: 'hugocarbajales' } as any);
        
        await expect(createUser({username:'hugocarbajales',email:'antonio@gmail.com',password:'23456'})).
        rejects.toThrow('Username already taken');
    });
    it('5.It should create and save the user without any problems.',async()=>
    {
        //simulate that the database is free (findOne returns null)
        vi.mocked(User.findOne).mockResolvedValue(null);
        //simulate that bcrypt returns a invented hash
        vi.mocked(bcrypt.hash).mockResolvedValue('secure_hash' as never);

        const usersaved= {username:'hugocarbajales',email:'hugo@gmail.com',password:'secure_hash'};
        User.prototype.save = vi.fn().mockResolvedValue(usersaved);
        const result = await createUser({ username: 'hugocarbajales', email: 'hugo@gmail.com', password: '123' });
        expect(result).toEqual(usersaved);
        //pretend that we have encrypted the password
        expect(bcrypt.hash).toHaveBeenCalledWith('123', 10);
    });
})
/**
 * Unitary test to login with an user.
 */
describe('User service - Login', ()=>{
    it('1.It should give an error when the username cannot be found.',async()=>{
        vi.mocked(User.findOne).mockResolvedValue(null);
        await expect(login({username:'noexist',password:'123'})).rejects.toThrow('User not found');
    })
    it('2.It should give an error when the password is incorrect.',async()=>{
        //prepare scenary
        vi.mocked(User.findOne).mockResolvedValue({username:'hugocarbajales',password:'fasle_hash'} as any);
        vi.mocked(bcrypt.compare).mockResolvedValue(false as any);
        //act
        await expect(login({ username: 'hugocarbajales', password: 'incorrect_password' }))
        //assert
        .rejects.toThrow('Invalid password');
    });
    it('3.It should be able to login since all the information is correct.',async()=>{
        const user_simultated = {username:'hugocarbajales',password:'good_hash'};
        vi.mocked(User.findOne).mockResolvedValue(user_simultated as any);
        vi.mocked(bcrypt.compare).mockResolvedValue(true as any);
        const result = await login({username:'hugocarbajales',password:'good_hash'});
        expect(result).toEqual(user_simultated);
    });
});
