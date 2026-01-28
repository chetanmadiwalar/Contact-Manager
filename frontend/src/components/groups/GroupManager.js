import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiChevronRight,
  FiSearch,
  FiX,
  FiRefreshCw,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

const GroupManager = () => {
  const [groups, setGroups] = useState([]); // Initialize as empty array
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#667eea',
    icon: '👥',
  });

  const icons = ['👥', '👤', '🏢', '👨‍👩‍👧‍👦', '💼', '🎓', '⚕️', '🔧', '🎨', '⚡'];
  const colorOptions = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4fd1c7',
    '#38b2ac', '#ed8936', '#ecc94b', '#48bb78', '#9f7aea',
    '#4299e1', '#ed64a6', '#68d391', '#f6ad55', '#63b3ed'
  ];

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    // Ensure groups is an array before filtering
    if (Array.isArray(groups)) {
      const filtered = groups.filter(group =>
        group?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group?.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGroups(filtered);
    } else {
      setFilteredGroups([]);
    }
  }, [searchTerm, groups]);

  const fetchGroups = async () => {
  try {
    setLoading(true);
    console.log('Fetching groups...');
    
    const response = await api.get('/groups');
    console.log('API Response:', response);
    
    // Ensure response is an array
    let groupsData = response;
    
    if (!Array.isArray(groupsData)) {
      console.warn('Response is not an array, converting...');
      
      if (groupsData && groupsData.data && Array.isArray(groupsData.data)) {
        groupsData = groupsData.data;
      } else if (groupsData && Array.isArray(groupsData)) {
        // Already an array
      } else {
        groupsData = [];
      }
    }
    
    console.log('Processed groups data:', groupsData);
    console.log('Number of groups:', groupsData.length);
    
    // Sort by name
    const sortedGroups = [...groupsData].sort((a, b) => 
      a.name.localeCompare(b.name)
    );
    
    setGroups(sortedGroups);
    setFilteredGroups(sortedGroups);
    
  } catch (error) {
    console.error('Failed to load groups:', error);
    console.error('Error details:', error.response?.data);
    toast.error('Failed to load groups');
    setGroups([]);
    setFilteredGroups([]);
  } finally {
    setLoading(false);
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (color) => {
    setFormData(prev => ({ ...prev, color }));
  };

  const handleIconSelect = (icon) => {
    setFormData(prev => ({ ...prev, icon }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Group name is required');
      return;
    }

    try {
      if (editingGroup) {
        await api.put(`/groups/${editingGroup._id}`, formData);
        toast.success('Group updated successfully');
      } else {
        await api.post('/groups', formData);
        toast.success('Group created successfully');
      }
      
      resetForm();
      fetchGroups();
    } catch (error) {
      console.error('Error saving group:', error);
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name || '',
      description: group.description || '',
      color: group.color || '#667eea',
      icon: group.icon || '👥',
    });
    setShowForm(true);
  };

  const handleDelete = async (groupId) => {
    if (!window.confirm('Are you sure? This will remove the group from all contacts.')) {
      return;
    }

    try {
      await api.delete(`/groups/${groupId}`);
      toast.success('Group deleted successfully');
      fetchGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#667eea',
      icon: '👥',
    });
    setEditingGroup(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading groups...</p>
      </div>
    );
  }

  // Safely check if we have groups
  const hasGroups = Array.isArray(groups) && groups.length > 0;
  const hasFilteredGroups = Array.isArray(filteredGroups) && filteredGroups.length > 0;

  return (
    <motion.div
      className="group-manager"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="manager-header">
        <div>
          <h1>Contact Groups</h1>
          <p>Organize contacts into groups for better management</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={fetchGroups}
            aria-label="Refresh groups"
          >
            <FiRefreshCw /> Refresh
          </button>
          <button
            className="btn-primary"
            onClick={() => setShowForm(true)}
          >
            <FiPlus /> Create Group
          </button>
        </div>
      </div>

      <div className="search-container">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search groups by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button
            className="clear-search"
            onClick={() => setSearchTerm('')}
            aria-label="Clear search"
          >
            <FiX />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            className="group-form-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetForm}
          >
            <motion.div
              className="group-form-container"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="form-header">
                <h2>{editingGroup ? 'Edit Group' : 'Create New Group'}</h2>
                <button className="close-btn" onClick={resetForm}>
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Group Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Colleagues, Family, Clients"
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of this group..."
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Group Color</label>
                    <div className="color-picker-simple">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="color-input-native"
                        title="Choose color"
                      />
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="color-input-text"
                        placeholder="#667eea"
                      />
                      <div className="color-presets">
                        {colorOptions.map(color => (
                          <button
                            key={color}
                            type="button"
                            className={`color-preset ${formData.color === color ? 'selected' : ''}`}
                            style={{ backgroundColor: color }}
                            onClick={() => handleColorChange(color)}
                            aria-label={`Select color ${color}`}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Group Icon</label>
                    <div className="icon-selector">
                      {icons.map(icon => (
                        <button
                          key={icon}
                          type="button"
                          className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                          onClick={() => handleIconSelect(icon)}
                          aria-label={`Select icon ${icon}`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingGroup ? 'Update Group' : 'Create Group'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!hasGroups ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No groups found</h3>
          <p>Create your first group to organize contacts</p>
          <button
            className="btn-primary"
            onClick={() => setShowForm(true)}
          >
            <FiPlus /> Create Group
          </button>
        </div>
      ) : !hasFilteredGroups && searchTerm ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No groups found for "{searchTerm}"</h3>
          <p>Try a different search term or create a new group</p>
          <button
            className="btn-secondary"
            onClick={() => setSearchTerm('')}
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="groups-grid">
          {filteredGroups.map((group, index) => (
            <motion.div
              key={group._id || index}
              className="group-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{ '--group-color': group.color || '#667eea' }}
            >
              <div className="group-header">
                <div 
                  className="group-icon" 
                  style={{ backgroundColor: group.color || '#667eea' }}
                >
                  {group.icon || '👥'}
                </div>
                <div className="group-info">
                  <h3>{group.name || 'Unnamed Group'}</h3>
                  <p>{group.description || 'No description'}</p>
                </div>
              </div>

              <div className="group-stats">
                <div className="stat">
                  <FiUsers />
                  <span>{group.contactCount || 0} contacts</span>
                </div>
                <div className="stat">
                  <span className="privacy-badge">
                    {group.isPrivate ? 'Private' : 'Public'}
                  </span>
                </div>
              </div>

              <div className="group-actions">
                <button
                  className="action-btn view"
                  onClick={() => {
                    // Navigate to group view
                    console.log('View group:', group._id);
                  }}
                  aria-label="View group"
                >
                  View <FiChevronRight />
                </button>
                <div className="action-buttons">
                  <button
                    className="icon-btn"
                    onClick={() => handleEdit(group)}
                    aria-label="Edit group"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="icon-btn danger"
                    onClick={() => handleDelete(group._id)}
                    aria-label="Delete group"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {hasGroups && (
        <div className="stats-footer">
          <div className="stats-info">
            <span className="stat-label">Total Groups:</span>
            <span className="stat-value">{groups.length}</span>
            {searchTerm && (
              <>
                <span className="stat-label">Filtered:</span>
                <span className="stat-value">{filteredGroups.length}</span>
              </>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default GroupManager;