const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Drop all indexes on teams collection first
        try {
            await conn.connection.db.collection('teams').dropIndexes();
            console.log('All indexes dropped from teams collection');
        } catch (err) {
            console.log('No indexes to drop or collection does not exist');
        }

        // Drop the teams collection to reset schema
        try {
            await conn.connection.db.collection('teams').drop();
            console.log('Teams collection dropped successfully');
        } catch (err) {
            console.log('Collection does not exist or already dropped');
        }

        console.log('Database cleanup complete! You can now create teams.');
        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
