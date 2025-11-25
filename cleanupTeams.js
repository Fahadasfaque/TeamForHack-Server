const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // List all indexes
        const indexes = await conn.connection.db.collection('teams').indexes();
        console.log('Current indexes on teams collection:', JSON.stringify(indexes, null, 2));

        // Drop the problematic teamId_1 index if it exists
        try {
            await conn.connection.db.collection('teams').dropIndex('teamId_1');
            console.log('✅ Dropped teamId_1 index');
        } catch (err) {
            console.log('ℹ️  teamId_1 index does not exist (this is good)');
        }

        // Drop the entire collection to start fresh
        try {
            await conn.connection.db.collection('teams').drop();
            console.log('✅ Teams collection dropped');
        } catch (err) {
            console.log('ℹ️  Teams collection does not exist');
        }

        console.log('\n✅ Database is clean! You can now create teams with the new schema.');
        process.exit(0);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
