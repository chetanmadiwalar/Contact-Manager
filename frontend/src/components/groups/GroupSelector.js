import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiPlus, FiCheck, FiX, FiSearch } from 'react-icons/fi';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';

const GroupSelector = ({
  value = [],
  onChange,
  maxSelections = 5,
  showSelectedCount = true,
  disabled = false,
  placeholder = "Select groups...",
  allowCreate = true,
}) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    color: '#667eea',
    icon: '👥',
  });

  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchGroups();
  }, [debouncedSearch]);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const params = searchTerm ? { search: searchTerm } : {};
      const response = await api.get('/groups', { params });
      setGroups(response.data);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  const handleCreateGroup = async () => {
    if (!newGroupData.name.trim()) {
      toast.error('Group name is required');
      return;
    }

    try {
      const response = await api.post('/groups', newGroupData);
      toast.success('Group created successfully');
      
      // Add new group to the list
      setGroups(prev => [...prev, response.data]);
      
      // Add to selected groups
      if (onChange) {
        const newValue = [...value, response.data._id];
        onChange(newValue);
      }
      
      // Reset form
      setNewGroupData({
        name: '',
        color: '#667eea',
        icon: '👥',
      });
      setShowCreateModal(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create group');
    }
  };

  const handleSelectChange = (selectedOptions) => {
    const selectedIds = selectedOptions.map(option => option.value);
    if (onChange) {
      onChange(selectedIds);
    }
  };

  const handleCreateOption = (inputValue) => {
    if (allowCreate) {
      setNewGroupData(prev => ({ ...prev, name: inputValue }));
      setShowCreateModal(true);
    }
  };

  const handleRemoveGroup = (groupId) => {
    if (disabled) return;
    
    const newValue = value.filter(id => id !== groupId);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleClearAll = () => {
    if (disabled) return;
    
    if (onChange) {
      onChange([]);
    }
  };

  const getGroupInfo = (groupId) => {
    return groups.find(group => group._id === groupId);
  };

  const selectedGroups = value
    .map(groupId => {
      const group = getGroupInfo(groupId);
      return group ? {
        value: group._id,
        label: group.name,
        color: group.color,
        icon: group.icon,
        contactCount: group.contactCount,
      } : null;
    })
    .filter(Boolean);

  const groupOptions = groups.map(group => ({
    value: group._id,
    label: group.name,
    color: group.color,
    icon: group.icon,
    contactCount: group.contactCount,
  }));

  const colorOptions = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4fd1c7',
    '#38b2ac', '#ed8936', '#ecc94b', '#48bb78', '#9f7aea'
  ];

  const iconOptions = ['👥', '👤', '🏢', '👨‍👩‍👧‍👦', '💼', '🎓', '⚕️', '🔧', '🎨', '⚡'];

  return (
    <div className="group-selector">
      <div className="selector-header">
        <label className="selector-label">
          <FiUsers /> Groups
          {showSelectedCount && (
            <span className="selected-count">
              ({selectedGroups.length} selected)
            </span>
          )}
        </label>
        
        {selectedGroups.length > 0 && !disabled && (
          <button
            type="button"
            className="clear-btn"
            onClick={handleClearAll}
            aria-label="Clear all groups"
          >
            <FiX /> Clear All
          </button>
        )}
      </div>

      <Select
        isMulti
        options={groupOptions}
        value={selectedGroups}
        onChange={handleSelectChange}
        onInputChange={setSearchTerm}
        isLoading={loading}
        isDisabled={disabled}
        isClearable={false}
        placeholder={placeholder}
        maxMenuHeight={200}
        className="group-select"
        classNamePrefix="react-select"
        noOptionsMessage={({ inputValue }) => 
          inputValue ? `No groups found for "${inputValue}"` : 'No groups available'
        }
        formatOptionLabel={({ label, color, icon, contactCount }) => (
          <div className="group-option">
            <div className="option-icon" style={{ backgroundColor: color }}>
              {icon}
            </div>
            <div className="option-content">
              <span className="option-label">{label}</span>
              {contactCount !== undefined && (
                <span className="option-count">
                  {contactCount} contact{contactCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        )}
        formatCreateLabel={(inputValue) => (
          <div className="create-option">
            <FiPlus />
            <span>Create group "{inputValue}"</span>
          </div>
        )}
        onCreateOption={handleCreateOption}
        isOptionDisabled={() => selectedGroups.length >= maxSelections}
        components={{
          DropdownIndicator: () => null,
          IndicatorSeparator: () => null,
          MultiValueRemove: (props) => (
            <components.MultiValueRemove {...props}>
              <FiX />
            </components.MultiValueRemove>
          ),
        }}
      />

      <AnimatePresence>
        {selectedGroups.length > 0 && (
          <motion.div
            className="selected-groups-preview"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="preview-header">
              <h4>Selected Groups</h4>
              <span className="preview-count">
                {selectedGroups.length} / {maxSelections}
              </span>
            </div>
            
            <div className="groups-grid">
              {selectedGroups.map((group) => (
                <motion.div
                  key={group.value}
                  className="group-chip"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  style={{ '--group-color': group.color }}
                >
                  <div className="chip-content">
                    <div className="chip-icon">{group.icon}</div>
                    <span className="chip-label">{group.label}</span>
                    {!disabled && (
                      <button
                        type="button"
                        className="chip-remove"
                        onClick={() => handleRemoveGroup(group.value)}
                        aria-label={`Remove ${group.label} group`}
                      >
                        <FiX />
                      </button>
                    )}
                  </div>
                  {group.contactCount !== undefined && (
                    <div className="chip-stats">
                      <FiUsers />
                      <span>{group.contactCount}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Create New Group</h3>
                <button
                  className="modal-close"
                  onClick={() => setShowCreateModal(false)}
                  aria-label="Close modal"
                >
                  <FiX />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="form-group">
                  <label>Group Name *</label>
                  <input
                    type="text"
                    value={newGroupData.name}
                    onChange={(e) => setNewGroupData(prev => ({ 
                      ...prev, 
                      name: e.target.value 
                    }))}
                    placeholder="Enter group name"
                    autoFocus
                  />
                </div>
                
                <div className="form-group">
                  <label>Group Color</label>
                  <div className="color-picker">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`color-option ${newGroupData.color === color ? 'selected' : ''}`}
                        onClick={() => setNewGroupData(prev => ({ ...prev, color }))}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Group Icon</label>
                  <div className="icon-picker">
                    {iconOptions.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        className={`icon-option ${newGroupData.icon === icon ? 'selected' : ''}`}
                        onClick={() => setNewGroupData(prev => ({ ...prev, icon }))}
                        aria-label={`Select icon ${icon}`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleCreateGroup}
                >
                  <FiPlus /> Create Group
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Need to import components from react-select for custom MultiValueRemove
import { components } from 'react-select';

export default GroupSelector;