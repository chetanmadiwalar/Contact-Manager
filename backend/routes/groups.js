const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const Contact = require('../models/Contact');

// GET all groups
router.get('/', async (req, res) => {
  try {
    console.log('Fetching groups from database...');
    const groups = await Group.find().sort({ name: 1 });
    console.log(`Found ${groups.length} groups`);
    res.json(groups); // Return array directly
  } catch (error) {
    console.error('Error fetching groups:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch groups',
      details: error.message 
    });
  }
});

// POST create group
router.post('/', async (req, res) => {
  try {
    console.log('Creating group with data:', req.body);
    
    const { name, description, color, icon } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ 
        error: 'Group name is required' 
      });
    }

    // Check if group already exists
    const existingGroup = await Group.findOne({ 
      name: name.trim() 
    });
    
    if (existingGroup) {
      return res.status(400).json({ 
        error: `Group "${name}" already exists` 
      });
    }

    // Create new group
    const group = new Group({
      name: name.trim(),
      description: (description || '').trim(),
      color: color || '#667eea',
      icon: icon || '👥',
    });

    // Save to database
    const savedGroup = await group.save();
    console.log('Group created successfully:', savedGroup._id);
    
    res.status(201).json(savedGroup);
    
  } catch (error) {
    console.error('Error creating group:', error);
    
    // Handle MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Group name already exists' 
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.message 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create group',
      details: error.message 
    });
  }
});

// PUT update group
router.put('/:id', async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!group) {
      return res.status(404).json({ 
        error: 'Group not found' 
      });
    }

    res.json(group);
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ 
      error: 'Failed to update group',
      details: error.message 
    });
  }
});

// DELETE group
router.delete('/:id', async (req, res) => {
  try {
    // Remove group from all contacts first
    await Contact.updateMany(
      { groups: req.params.id },
      { $pull: { groups: req.params.id } }
    );

    const group = await Group.findByIdAndDelete(req.params.id);
    
    if (!group) {
      return res.status(404).json({ 
        error: 'Group not found' 
      });
    }

    res.json({ 
      message: 'Group deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ 
      error: 'Failed to delete group',
      details: error.message 
    });
  }
});

module.exports = router;