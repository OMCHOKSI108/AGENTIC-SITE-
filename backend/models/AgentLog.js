const mongoose = require('mongoose');

const agentLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agentSlug: {
    type: String,
    required: true
  },
  agentName: {
    type: String,
    required: true
  },
  input: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  output: {
    type: mongoose.Schema.Types.Mixed
  },
  tokensUsed: {
    type: Number,
    default: 0
  },
  cost: {
    type: Number,
    default: 0
  },
  executionTime: {
    type: Number, // in milliseconds
    required: true
  },
  success: {
    type: Boolean,
    required: true
  },
  error: {
    type: String
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
agentLogSchema.index({ userId: 1, createdAt: -1 });
agentLogSchema.index({ agentSlug: 1, createdAt: -1 });

module.exports = mongoose.model('AgentLog', agentLogSchema);