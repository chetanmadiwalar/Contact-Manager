const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE_CONTACT', 
      'UPDATE_CONTACT', 
      'DELETE_CONTACT',
      'ADD_TO_GROUP', 
      'REMOVE_FROM_GROUP',
      'STARRED', 
      'UNSTARRED',
      'EXPORT', 
      'BULK_DELETE',
      'BULK_UPDATE'
    ],
  },
  entityType: {
    type: String,
    default: 'Contact',
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  entityName: {
    type: String,
  },
  changes: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  performedBy: {
    type: String,
    default: 'System',
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
});

// Index for faster queries
activitySchema.index({ entityId: 1, timestamp: -1 });
activitySchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('Activity', activitySchema);