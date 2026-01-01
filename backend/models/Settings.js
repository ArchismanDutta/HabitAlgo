import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  // UI Preferences
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'auto'
  },
  primaryView: {
    type: String,
    enum: ['today', 'monthly', 'weekly', 'analytics', 'focus'],
    default: 'today'
  },

  // Calendar state
  selectedMonth: {
    type: Number,
    min: 1,
    max: 12,
    default: () => new Date().getMonth() + 1
  },
  selectedYear: {
    type: Number,
    default: () => new Date().getFullYear()
  },

  // Display options
  showStreaks: {
    type: Boolean,
    default: true
  },
  showCompletionRate: {
    type: Boolean,
    default: true
  },
  compactMode: {
    type: Boolean,
    default: false
  },

  // Data
  lastSyncTime: {
    type: Date,
    default: null
  },
  totalHabits: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Static method to get or create settings
settingsSchema.statics.getSettings = async function(userId) {
  let settings = await this.findOne({ userId });
  if (!settings) {
    settings = await this.create({ userId });
  }
  return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
