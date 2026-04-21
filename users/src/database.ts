import mongoose from 'mongoose';

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