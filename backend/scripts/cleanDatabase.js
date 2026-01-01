import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import all models
import Habit from '../models/Habit.js';
import DailyLog from '../models/DailyLog.js';
import MonthlySummary from '../models/MonthlySummary.js';
import WorkoutSession from '../models/WorkoutSession.js';
import WorkoutProgram from '../models/WorkoutProgram.js';
import Exercise from '../models/Exercise.js';
import Supplement from '../models/Supplement.js';
import SupplementLog from '../models/SupplementLog.js';
import BodyMetrics from '../models/BodyMetrics.js';
import BodyGoal from '../models/BodyGoal.js';
import PersonalRecord from '../models/PersonalRecord.js';
import FinancialAccount from '../models/FinancialAccount.js';
import FinancialTransaction from '../models/FinancialTransaction.js';
import Budget from '../models/Budget.js';
import RecurringTransaction from '../models/RecurringTransaction.js';
import FinancialGoal from '../models/FinancialGoal.js';
import FinancialSummary from '../models/FinancialSummary.js';
import LedgerEntry from '../models/LedgerEntry.js';
import MerchantMemory from '../models/MerchantMemory.js';
import Settings from '../models/Settings.js';

const cleanDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all data from all collections
    console.log('\n🗑️  Cleaning database...\n');

    const collections = [
      { name: 'Habits', model: Habit },
      { name: 'DailyLogs', model: DailyLog },
      { name: 'MonthlySummaries', model: MonthlySummary },
      { name: 'WorkoutSessions', model: WorkoutSession },
      { name: 'WorkoutPrograms', model: WorkoutProgram },
      { name: 'Exercises', model: Exercise },
      { name: 'Supplements', model: Supplement },
      { name: 'SupplementLogs', model: SupplementLog },
      { name: 'BodyMetrics', model: BodyMetrics },
      { name: 'BodyGoals', model: BodyGoal },
      { name: 'PersonalRecords', model: PersonalRecord },
      { name: 'FinancialAccounts', model: FinancialAccount },
      { name: 'FinancialTransactions', model: FinancialTransaction },
      { name: 'Budgets', model: Budget },
      { name: 'RecurringTransactions', model: RecurringTransaction },
      { name: 'FinancialGoals', model: FinancialGoal },
      { name: 'FinancialSummaries', model: FinancialSummary },
      { name: 'LedgerEntries', model: LedgerEntry },
      { name: 'MerchantMemories', model: MerchantMemory },
      { name: 'Settings', model: Settings }
    ];

    for (const collection of collections) {
      const result = await collection.model.deleteMany({});
      console.log(`✓ Deleted ${result.deletedCount} documents from ${collection.name}`);
    }

    console.log('\n✅ Database cleaned successfully!');
    console.log('All user data has been deleted. Users can now start fresh with proper data isolation.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  }
};

cleanDatabase();
