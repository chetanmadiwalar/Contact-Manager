const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const Group = require('../models/Group');
const Activity = require('../models/ActivityLog');

// GET dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    // Get basic counts
    const [totalContacts, activeContacts, starredContacts, totalGroups] = await Promise.all([
      Contact.countDocuments(),
      Contact.countDocuments({ status: 'Active' }),
      Contact.countDocuments({ starred: true }),
      Group.countDocuments(),
    ]);

    // Get category stats
    const categoryStats = await Contact.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get weekly stats (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyStats = await Contact.aggregate([
      {
        $match: {
          createdAt: { $gte: oneWeekAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
    ]);

    // Get latest contacts
    const latestContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email category createdAt')
      .lean();

    // Get recent activities
    const recentActivities = await Activity.find()
      .sort({ timestamp: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: {
        summary: {
          totalContacts,
          activeContacts,
          starredContacts,
          totalGroups,
        },
        categoryStats,
        weeklyStats,
        latestContacts,
        recentActivities,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch analytics' 
    });
  }
});

// GET activity log
router.get('/activities', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      Activity.find()
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Activity.countDocuments(),
    ]);

    res.json({
      success: true,
      data: activities,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Activities error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch activities' 
    });
  }
});

module.exports = router;