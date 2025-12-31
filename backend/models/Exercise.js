import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Custom'],
    required: true
  },
  muscleGroup: [{
    type: String,
    trim: true
  }],
  equipment: {
    type: String,
    trim: true
  },
  isCompound: {
    type: Boolean,
    default: false
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  userId: {
    type: String, // TODO: Change to ObjectId when auth is implemented
    required: function() {
      return this.isCustom;
    }
  },
  instructions: {
    type: String,
    trim: true
  },
  videoUrl: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  }
}, {
  timestamps: true
});

// Index for efficient queries
exerciseSchema.index({ category: 1, isCustom: 1 });
exerciseSchema.index({ name: 1 });
exerciseSchema.index({ userId: 1 }, { sparse: true });

const Exercise = mongoose.model('Exercise', exerciseSchema);

export default Exercise;
