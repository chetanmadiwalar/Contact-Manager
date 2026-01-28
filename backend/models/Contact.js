const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    index: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email'],
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true,
  },
  message: {
    type: String,
    trim: true,
    default: '',
  },
  category: {
    type: String,
    enum: ['Personal', 'Business', 'Family', 'Friends', 'Work', 'Other'],
    default: 'Personal',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Archived'],
    default: 'Active',
  },
  source: {
    type: String,
    enum: ['Manual', 'Import', 'Website', 'Referral'],
    default: 'Manual',
  },
  starred: {
    type: Boolean,
    default: false,
  },
  lastContacted: {
    type: Date,
  },
  notes: {
    type: String,
    trim: true,
  },
  customFields: {
    type: Map,
    of: String,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
contactSchema.virtual('fullName').get(function() {
  return this.name;
});

// Indexes for better query performance
contactSchema.index({ email: 1 }, { unique: false });
contactSchema.index({ status: 1 });
contactSchema.index({ category: 1 });
contactSchema.index({ starred: 1 });
contactSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Contact', contactSchema);