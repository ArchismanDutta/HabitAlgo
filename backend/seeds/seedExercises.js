import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Exercise from '../models/Exercise.js';
import { exercisesData } from './exercisesData.js';

// Load environment variables
dotenv.config();

const seedExercises = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing system exercises
    await Exercise.deleteMany({ isCustom: false });
    console.log('✓ Cleared existing system exercises');

    // Insert exercise data
    await Exercise.insertMany(exercisesData);
    console.log(`✓ Successfully seeded ${exercisesData.length} exercises!`);

    // Display stats
    const stats = await Exercise.aggregate([
      { $match: { isCustom: false } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📊 Exercise Library Stats:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} exercises`);
    });
    console.log(`   Total: ${exercisesData.length} exercises\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding exercises:', error);
    process.exit(1);
  }
};

seedExercises();
