const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['content', 'data', 'productivity', 'devtools', 'marketing', 'creative', 'finance', 'enterprise', 'automation', 'career', 'design', 'assistant']
  },
  tags: [{
    type: String,
    trim: true
  }],
  ui_card: {
    title: String,
    short: String,
    inputs: [{
      name: String,
      type: {
        type: String,
        enum: ['text', 'file', 'url', 'file-upload', 'select', 'number']
      },
      required: Boolean
    }],
    outputs: [{
      type: {
        type: String,
        enum: ['text', 'file', 'json', 'url']
      },
      preview: Boolean
    }]
  },
  tooling: {
    tools_required: {
      llm: [String],
      storage: [String],
      external_api: [String]
    },
    async_workers: Boolean,
    queue: String
  },
  endpoints: {
    api: [{
      route: String,
      method: {
        type: String,
        enum: ['GET', 'POST', 'PUT', 'DELETE']
      },
      auth: {
        type: String,
        enum: ['user', 'public', 'admin']
      }
    }],
    websocket: Boolean
  },
  persistence: {
    save_results: Boolean,
    memory_type: {
      type: String,
      enum: ['ephemeral', 'persistent', 'embedding']
    },
    retention_days: Number
  },
  security: {
    auth_required: Boolean,
    scopes: [String],
    rate_limit_per_min: Number
  },
  ui_interactions: {
    page: String,
    widgets: [String],
    realtime: Boolean
  },
  sample_prompt: String,
  notes: {
    complexity_estimate: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    extra_steps: String
  },
  // Additional metadata
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 4.8
  },
  usageCount: {
    type: Number,
    default: 1200
  },
  responseTime: {
    type: String,
    default: '< 2s'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
agentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Agent', agentSchema);