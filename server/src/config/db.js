import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.log('ℹ️ MONGODB_URI not found. Using local JSON/Memory for history.');
    return null;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.log('ℹ️ Falling back to local JSON/Memory for history.');
    return null;
  }
};

export default connectDB;
