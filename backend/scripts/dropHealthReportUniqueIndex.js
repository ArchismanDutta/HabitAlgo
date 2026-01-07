import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Drop the unique index on userId + reportDate
const dropIndex = async () => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('healthreports');

    // Get all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));

    // Drop the unique index on userId_1_reportDate_1
    await collection.dropIndex('userId_1_reportDate_1');
    console.log('Successfully dropped unique index: userId_1_reportDate_1');

    // Verify indexes after dropping
    const indexesAfter = await collection.indexes();
    console.log('Indexes after dropping:', JSON.stringify(indexesAfter, null, 2));

    process.exit(0);
  } catch (error) {
    if (error.codeName === 'IndexNotFound') {
      console.log('Index userId_1_reportDate_1 does not exist. No action needed.');
      process.exit(0);
    } else {
      console.error('Error dropping index:', error);
      process.exit(1);
    }
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await dropIndex();
};

run();
