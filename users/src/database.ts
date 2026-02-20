import mongoose from 'mongoose';

//need to connect database in cloud (its not instantaneous)
//i use async and promise, so the system waits for it to finish and notifies when ends or goes wrong
const connectBD = async (): Promise<void> => { 
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error("MONGODB_URI is not defined in the environment variables");
        }

        await mongoose.connect(mongoURI);
        console.log("Database successfully connected");
    } catch (error) {
        console.error("Critical error: Could not connect to the database");
        console.error(error);
        process.exit(1);
    }
};

export default connectBD;