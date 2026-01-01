import mongoose from 'mongoose';

/**
 * MerchantMemory - Learns and remembers merchant categorization patterns
 *
 * This model enables intelligent auto-categorization:
 * - Remembers which category user assigns to each merchant
 * - Learns from corrections
 * - Builds confidence scores
 * - Suggests categories for new transactions
 */

const MerchantMemorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Normalized merchant name (lowercase, trimmed)
  merchantName: {
    type: String,
    required: [true, 'Merchant name is required'],
    trim: true,
    lowercase: true,
    index: true
  },
  // Original merchant names seen (for display)
  originalNames: [{
    type: String
  }],
  // Learned category
  category: {
    type: String,
    required: [true, 'Category is required'],
    index: true
  },
  // Learned subcategory
  subcategory: {
    type: String,
    default: null
  },
  // Confidence score (0-100)
  confidenceScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  // Number of times this categorization has been used
  useCount: {
    type: Number,
    default: 1
  },
  // Number of times user corrected this categorization
  correctionCount: {
    type: Number,
    default: 0
  },
  // Last used date
  lastUsedDate: {
    type: Date,
    default: Date.now
  },
  // Average transaction amount for this merchant
  averageAmount: {
    type: Number,
    default: 0,
    get: v => Math.round(v * 100) / 100
  },
  // Typical payment method
  typicalPaymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'bank_transfer', 'cheque', 'other'],
    default: null
  },
  // Typical tags
  typicalTags: [{
    type: String
  }],
  // Is this a recurring merchant (subscription, bill, etc.)
  isRecurring: {
    type: Boolean,
    default: false
  },
  // Suggested recurring frequency
  suggestedFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    default: null
  },
  // Auto-apply this categorization?
  autoApply: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Compound indexes
MerchantMemorySchema.index({ userId: 1, merchantName: 1 }, { unique: true });
MerchantMemorySchema.index({ userId: 1, category: 1 });
MerchantMemorySchema.index({ userId: 1, confidenceScore: -1 });

// Update timestamp on save
MerchantMemorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to learn from transaction
MerchantMemorySchema.statics.learnFromTransaction = async function(userId, transaction) {
  if (!transaction.merchant) return null;

  const merchantName = transaction.merchant.toLowerCase().trim();

  // Find existing memory
  let memory = await this.findOne({ userId, merchantName });

  if (memory) {
    // Update existing memory

    // If category changed, increment correction count
    if (memory.category !== transaction.category) {
      memory.correctionCount += 1;
      memory.category = transaction.category;
      memory.subcategory = transaction.subcategory;

      // Reduce confidence on correction
      memory.confidenceScore = Math.max(30, memory.confidenceScore - 20);
    } else {
      // Same category - increase confidence
      memory.useCount += 1;
      memory.confidenceScore = Math.min(100, memory.confidenceScore + 5);
    }

    // Update average amount
    memory.averageAmount = (memory.averageAmount * (memory.useCount - 1) + transaction.amount) / memory.useCount;

    // Update typical payment method
    if (transaction.paymentMethod) {
      memory.typicalPaymentMethod = transaction.paymentMethod;
    }

    // Add original name if not already present
    if (!memory.originalNames.includes(transaction.merchant)) {
      memory.originalNames.push(transaction.merchant);
    }

    // Update tags
    if (transaction.tags && transaction.tags.length > 0) {
      memory.typicalTags = [...new Set([...memory.typicalTags, ...transaction.tags])];
    }

    memory.lastUsedDate = new Date();

    // Auto-apply if high confidence and low corrections
    if (memory.confidenceScore >= 80 && memory.correctionCount <= 1) {
      memory.autoApply = true;
    }

    await memory.save();
    return memory;
  } else {
    // Create new memory
    const newMemory = await this.create({
      userId,
      merchantName,
      originalNames: [transaction.merchant],
      category: transaction.category,
      subcategory: transaction.subcategory,
      confidenceScore: 50,
      useCount: 1,
      correctionCount: 0,
      averageAmount: transaction.amount,
      typicalPaymentMethod: transaction.paymentMethod,
      typicalTags: transaction.tags || [],
      isRecurring: transaction.isRecurring,
      lastUsedDate: new Date()
    });

    return newMemory;
  }
};

// Static method to get suggestion for merchant
MerchantMemorySchema.statics.getSuggestion = async function(userId, merchantName) {
  if (!merchantName) return null;

  const normalizedName = merchantName.toLowerCase().trim();

  // Exact match
  let memory = await this.findOne({ userId, merchantName: normalizedName });
  if (memory) return memory;

  // Partial match (fuzzy search)
  memory = await this.findOne({
    userId,
    merchantName: { $regex: normalizedName, $options: 'i' }
  }).sort({ confidenceScore: -1, useCount: -1 });

  return memory;
};

// Static method to get high-confidence auto-apply memories
MerchantMemorySchema.statics.getAutoApplyMemories = function(userId) {
  return this.find({
    userId,
    autoApply: true,
    confidenceScore: { $gte: 80 }
  }).sort({ useCount: -1 });
};

// Static method to get all merchant categories
MerchantMemorySchema.statics.getMerchantsByCategory = async function(userId, category) {
  return this.find({ userId, category }).sort({ useCount: -1 });
};

// Instance method to apply to transaction
MerchantMemorySchema.methods.applyToTransaction = function(transaction) {
  transaction.category = this.category;
  transaction.subcategory = this.subcategory;
  transaction.autoCategorized = true;

  if (this.typicalTags && this.typicalTags.length > 0) {
    transaction.tags = [...new Set([...(transaction.tags || []), ...this.typicalTags])];
  }

  return transaction;
};

export default mongoose.model('MerchantMemory', MerchantMemorySchema);
