import mongoose from 'mongoose';

// Embedded schema for reference ranges
const referenceRangeSchema = new mongoose.Schema({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  unit: { type: String, required: true, trim: true }
}, { _id: false });

// Embedded schema for individual health metrics
const healthMetricSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['hormone', 'vitamin', 'mineral', 'blood_marker', 'liver', 'kidney', 'thyroid', 'other'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  referenceRange: {
    type: referenceRangeSchema,
    required: true
  },
  status: {
    type: String,
    enum: ['low', 'normal', 'high'],
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
}, { _id: false });

// Main health report schema
const healthReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reportDate: {
    type: String, // "YYYY-MM-DD" format for consistency
    required: true
  },
  reportName: {
    type: String,
    trim: true,
    default: 'Blood Work'
  },
  labName: {
    type: String,
    trim: true
  },
  metrics: [healthMetricSchema],
  overallNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
healthReportSchema.index({ userId: 1, reportDate: -1 });
healthReportSchema.index({ userId: 1, 'metrics.category': 1 });

// Virtual to calculate status statistics
healthReportSchema.virtual('statusSummary').get(function() {
  const summary = { low: 0, normal: 0, high: 0 };
  this.metrics.forEach(metric => {
    summary[metric.status]++;
  });
  return summary;
});

// Method to calculate metric status based on value and reference range
healthReportSchema.methods.calculateMetricStatus = function(value, referenceRange) {
  if (value < referenceRange.min) return 'low';
  if (value > referenceRange.max) return 'high';
  return 'normal';
};

const HealthReport = mongoose.model('HealthReport', healthReportSchema);

export default HealthReport;
