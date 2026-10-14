import mongoose from 'mongoose';

const connectDB = async (retries = 5, delay = 3000) => {
  while (retries > 0) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskmanage');
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`MongoDB Connection Error: ${error.message}`);
      retries -= 1;
      if (retries === 0) {
        process.exit(1);
      }
      console.log(`Retrying MongoDB connection in ${delay / 1000}s... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export default connectDB;
