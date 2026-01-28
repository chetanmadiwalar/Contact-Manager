const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    trim: true,
  },
  color: {
    type: String,
    default: '#667eea',
  },
  icon: {
    type: String,
    default: '👥',
  },
  contactCount: {
    type: Number,
    default: 0,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Update contact count when contacts are added/removed
groupSchema.pre('save', function(next) {
  if (this.isModified('contactCount') && this.contactCount < 0) {
    this.contactCount = 0;
  }
  next();
});

module.exports = mongoose.model('Group', groupSchema);