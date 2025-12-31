import mongoose from 'mongoose';

const supplementSchema = new mongoose.Schema({
  userId: {
    type: String, // TODO: Change to ObjectId when auth is implemented
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['protein', 'creatine', 'pre_workout', 'bcaa', 'vitamins', 'other'],
    default: 'other'
  },
  dosage: {
    type: String,
    trim: true
  },
  timing: [{
    type: String,
    enum: ['morning', 'pre_workout', 'post_workout', 'night']
  }],
  color: {
    type: String,
    default: '#6366f1'
  },
  icon: {
    type: String,
    default: '💊'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
supplementSchema.index({ userId: 1, isActive: 1 });

const Supplement = mongoose.model('Supplement', supplementSchema);

export default Supplement;
