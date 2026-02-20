import express, { Request, Response, Router } from 'express';
import { createUser } from '../service/user-service';
import { login } from '../service/user-service';

//Instead of putting all the routes directly into the main index.ts file, 
// express.Router() creates a mini-server dedicated solely to users.
const router: Router = express.Router(); 


//This creates a specific gateway called /createuser that only accepts packets delivered via the POST method
router.post('/createuser', async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    
    const user = await createUser(userData);  //call service to create the user
    
    return res.status(201).json({ 
      message: 'User successfully created',
      userId: user._id,
      username: user.username
    });
    
  } catch (error: any) {
    
    if (error.message === 'All fields are required') {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === 'Password must be at least 3 characters') {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === 'Email already registered') {
      return res.status(409).json({ error: error.message });
    }
    if(error.message==='Username already taken'){
      return res.status(409).json({error: error.message});
    }
    return res.status(500).json({ error: 'Error creating user' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
      const userdata= req.body;
      const user = await login(userdata);
      return res.status(200).json(
        {
          message: 'Login successful',
          userId: user._id,
          username: user.username
        })
  }catch(error: any)
  {
      if(error.message==='User not found'){
          return res.status(404).json({error: error.message});
      }else if(error.message==='Invalid password'){
        return res.status(500).json({error: error.message});
      }
      return res.status(500).json({ error: 'Internal server error during login' });
  }
})
export default router;