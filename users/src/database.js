const mongoose = require('mongoose');

const connectBD = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database successfully connected");
    } catch (error) {
        console.error("Critical error: Could not connect to the database");
        console.error(error);
        process.exit(1);
    }
};

module.exports = connectBD; //It allows other files to import and run this function.