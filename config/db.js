const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        // const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gatepass_db');
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://meetmask_db_user:Lo9JNQapOMekn1J8@cluster90883.1rmjz.mongodb.net/');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
