const mongoose = require('mongoose');
require('dotenv').config();

const fixDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        // Drop the firebaseUid index
        try {
            await usersCollection.dropIndex('firebaseUid_1');
            console.log('✅ Successfully dropped firebaseUid_1 index');
        } catch (error) {
            if (error.code === 27) {
                console.log('Index firebaseUid_1 does not exist (already dropped)');
            } else {
                throw error;
            }
        }

        console.log('Database fixed!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixDatabase();
