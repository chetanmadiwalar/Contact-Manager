const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const Contact = require('../models/Contact');
const Group = require('../models/Group');
const Activity = require('../models/ActivityLog');
const { stringify } = require('csv-stringify');
const moment = require('moment');

// Validation rules
const contactValidation = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('phone').notEmpty().withMessage('Phone is required').trim(),
  body('category').optional().isIn(['Personal', 'Business', 'Family', 'Friends', 'Work', 'Other']),
  body('status').optional().isIn(['Active', 'Inactive', 'Archived']),
];

// Helper: Log activity
const logActivity = async (action, entityId, entityName, changes = {}, req) => {
  try {
    await Activity.create({
      action,
      entityId,
      entityName,
      changes,
      performedBy: 'User', // In real app, use req.user.id
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// GET all contacts with advanced filtering
router.get('/', [
  query('search').optional().trim(),
  query('category').optional().trim(),
  query('status').optional().trim(),
  query('group').optional().trim(),
  query('tag').optional().trim(),
  query('starred').optional().isBoolean(),
  query('sortBy').optional().trim(),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
], async (req, res) => {
  try {
    const {
      search,
      category,
      status,
      group,
      tag,
      starred,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (group) filter.groups = group;
    if (tag) filter.tags = tag;
    if (starred !== undefined) filter.starred = starred === 'true';

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [contacts, total] = await Promise.all([
      Contact.find(filter)
        .populate('groups', 'name color')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Contact.countDocuments(filter),
    ]);

    // Get unique categories, tags, and statuses for filters
    const categories = await Contact.distinct('category');
    const tags = await Contact.distinct('tags');
    const statuses = await Contact.distinct('status');

    res.json({
      success: true,
      data: contacts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      filters: {
        categories,
        tags,
        statuses,
      },
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch contacts' });
  }
});

// GET single contact
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('groups', 'name color icon');
    
    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }

    // Get activity log for this contact
    const activities = await Activity.find({ entityId: req.params.id })
      .sort({ timestamp: -1 })
      .limit(10);

    res.json({
      success: true,
      data: contact,
      activities,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch contact' });
  }
});

// POST create new contact
router.post('/', contactValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const contactData = req.body;
    
    // Handle tags (convert string to array if needed)
    if (contactData.tags && typeof contactData.tags === 'string') {
      contactData.tags = contactData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }

    const newContact = new Contact(contactData);
    const savedContact = await newContact.save();

    // Log activity
    await logActivity('CREATE_CONTACT', savedContact._id, savedContact.name, {}, req);

    // Update group counts if groups are specified
    if (contactData.groups && contactData.groups.length > 0) {
      await Group.updateMany(
        { _id: { $in: contactData.groups } },
        { $inc: { contactCount: 1 } }
      );
    }

    res.status(201).json({
      success: true,
      data: savedContact,
      message: 'Contact created successfully',
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ success: false, error: 'Failed to create contact' });
  }
});

// PUT update contact
router.put('/:id', contactValidation, async (req, res) => {
  try {
    const oldContact = await Contact.findById(req.params.id);
    if (!oldContact) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }

    const updates = req.body;
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    // Log activity with changes
    const changes = {};
    Object.keys(updates).forEach(key => {
      if (oldContact[key] !== updates[key]) {
        changes[key] = {
          old: oldContact[key],
          new: updates[key],
        };
      }
    });

    await logActivity('UPDATE_CONTACT', updatedContact._id, updatedContact.name, changes, req);

    res.json({
      success: true,
      data: updatedContact,
      message: 'Contact updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update contact' });
  }
});

// DELETE contact
router.delete('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }

    // Remove contact from groups
    if (contact.groups.length > 0) {
      await Group.updateMany(
        { _id: { $in: contact.groups } },
        { $inc: { contactCount: -1 } }
      );
    }

    await Contact.findByIdAndDelete(req.params.id);
    
    // Log activity
    await logActivity('DELETE_CONTACT', contact._id, contact.name, {}, req);

    res.json({
      success: true,
      message: 'Contact deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete contact' });
  }
});

// POST bulk actions
router.post('/bulk/actions', async (req, res) => {
  try {
    const { action, contactIds, data } = req.body;

    if (!action || !contactIds || !Array.isArray(contactIds)) {
      return res.status(400).json({ success: false, error: 'Invalid request' });
    }

    let result;
    const changes = { action, affectedContacts: contactIds.length };

    switch (action) {
      case 'delete':
        result = await Contact.deleteMany({ _id: { $in: contactIds } });
        changes.deletedCount = result.deletedCount;
        break;

      case 'update':
        result = await Contact.updateMany(
          { _id: { $in: contactIds } },
          { $set: data, updatedAt: Date.now() }
        );
        changes.modifiedCount = result.modifiedCount;
        changes.updates = data;
        break;

      case 'star':
        result = await Contact.updateMany(
          { _id: { $in: contactIds } },
          { $set: { starred: true, updatedAt: Date.now() } }
        );
        changes.modifiedCount = result.modifiedCount;
        break;

      case 'unstar':
        result = await Contact.updateMany(
          { _id: { $in: contactIds } },
          { $set: { starred: false, updatedAt: Date.now() } }
        );
        changes.modifiedCount = result.modifiedCount;
        break;

      case 'change-status':
        if (!data.status) {
          return res.status(400).json({ success: false, error: 'Status is required' });
        }
        result = await Contact.updateMany(
          { _id: { $in: contactIds } },
          { $set: { status: data.status, updatedAt: Date.now() } }
        );
        changes.modifiedCount = result.modifiedCount;
        changes.newStatus = data.status;
        break;

      default:
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    // Log bulk activity
    await logActivity(`BULK_${action.toUpperCase()}`, null, 'Multiple Contacts', changes, req);

    res.json({
      success: true,
      data: result,
      message: `Bulk action '${action}' completed successfully`,
    });
  } catch (error) {
    console.error('Bulk action error:', error);
    res.status(500).json({ success: false, error: 'Bulk action failed' });
  }
});

// GET export contacts
router.get('/export/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const { search, category, status } = req.query;

    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (category) filter.category = category;
    if (status) filter.status = status;

    const contacts = await Contact.find(filter).lean();

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');

      const csvData = contacts.map(contact => ({
        Name: contact.name,
        Email: contact.email,
        Phone: contact.phone,
        Category: contact.category,
        Status: contact.status,
        Tags: contact.tags.join(', '),
        Created: moment(contact.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      }));

      stringify(csvData, { header: true }, (err, output) => {
        if (err) throw err;
        res.send(output);
      });
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=contacts.json');
      res.json(contacts);
    } else {
      res.status(400).json({ success: false, error: 'Invalid format' });
    }

    // Log export activity
    await logActivity('EXPORT', null, 'All Contacts', { format, count: contacts.length }, req);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Export failed' });
  }
});

// POST star/unstar contact
router.post('/:id/star', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }

    const starred = !contact.starred;
    await Contact.findByIdAndUpdate(req.params.id, { starred });

    // Log activity
    await logActivity(
      starred ? 'STARRED' : 'UNSTARRED',
      contact._id,
      contact.name,
      { starred },
      req
    );

    res.json({
      success: true,
      data: { starred },
      message: `Contact ${starred ? 'starred' : 'unstarred'} successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update star status' });
  }
});

module.exports = router;