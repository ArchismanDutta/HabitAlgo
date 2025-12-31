import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Habit name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  category: {
    type: String,
    enum: ['Health', 'Work', 'Mind', 'Custom'],
    default: 'Custom'
  },
  customCategory: {
    type: String,
    trim: true,
    maxlength: 50
  },
  type: {
    type: String,
    enum: ['boolean', 'numeric'],
    default: 'boolean'
  },
  numericConfig: {
    unit: {
      type: String,
      enum: ['minutes', 'reps', 'count', 'custom'],
      default: 'count'
    },
    customUnit: String
  },
  targetMonthly: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  icon: {
    type: String,
    default: '⭐'
  },

  // ✨ NEW: Why & Identity fields
  why: {
    type: String,
    trim: true,
    maxlength: [500, 'Why statement cannot exceed 500 characters'],
    default: ''
  },
  identityStatement: {
    type: String,
    trim: true,
    maxlength: [200, 'Identity statement cannot exceed 200 characters'],
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for performance
habitSchema.index({ isActive: 1, createdAt: -1 });
habitSchema.index({ category: 1 });

// Virtual for display category
habitSchema.virtual('displayCategory').get(function() {
  return this.category === 'Custom' ? this.customCategory : this.category;
});

// Method to check if habit has meaning defined
habitSchema.methods.hasMeaning = function() {
  return !!(this.why || this.identityStatement);
};

// Ensure virtuals are included in JSON
habitSchema.set('toJSON', { virtuals: true });
habitSchema.set('toObject', { virtuals: true });

const Habit = mongoose.model('Habit', habitSchema);

export default Habit;
