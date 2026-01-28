import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTrash2,
  FiStar,
  FiDownload,
  FiArchive,
  FiMail,
  FiCheck,
  FiX,
} from 'react-icons/fi';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

const BulkActions = ({ selectedCount, contactIds, onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusValue, setStatusValue] = useState('');

  const actions = [
    {
      id: 'star',
      label: 'Star Selected',
      icon: <FiStar />,
      color: '#f59e0b',
      confirm: true,
    },
    {
      id: 'unstar',
      label: 'Unstar Selected',
      icon: <FiStar />,
      color: '#6b7280',
      confirm: true,
    },
    {
      id: 'change-status',
      label: 'Change Status',
      icon: <FiArchive />,
      color: '#3b82f6',
      needsValue: true,
    },
    {
      id: 'export',
      label: 'Export Selected',
      icon: <FiDownload />,
      color: '#10b981',
    },
    {
      id: 'delete',
      label: 'Delete Selected',
      icon: <FiTrash2 />,
      color: '#ef4444',
      confirm: true,
      confirmText: 'Are you sure you want to delete these contacts? This action cannot be undone.',
    },
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Archived', label: 'Archived' },
  ];

  const handleActionSelect = (action) => {
    if (action.needsValue) {
      setSelectedAction(action);
    } else {
      executeAction(action);
    }
  };

  const executeAction = async (action, additionalData = {}) => {
    if (action.confirm) {
      const confirmed = window.confirm(
        action.confirmText || `Are you sure you want to ${action.label.toLowerCase()}?`
      );
      if (!confirmed) return;
    }

    setLoading(true);
    try {
      let response;
      
      switch (action.id) {
        case 'star':
        case 'unstar':
          response = await api.post('/contacts/bulk/actions', {
            action: action.id,
            contactIds,
          });
          break;
          
        case 'change-status':
          if (!statusValue) {
            toast.error('Please select a status');
            return;
          }
          response = await api.post('/contacts/bulk/actions', {
            action: 'change-status',
            contactIds,
            data: { status: statusValue },
          });
          break;
          
        case 'delete':
          response = await api.post('/contacts/bulk/actions', {
            action: 'delete',
            contactIds,
          });
          break;
          
        case 'export':
          // Handle export logic
          exportContacts();
          break;
          
        default:
          throw new Error('Invalid action');
      }

      if (action.id !== 'export') {
        toast.success(response.message || 'Action completed successfully');
        onComplete();
      }
      
      setIsOpen(false);
      setSelectedAction(null);
      setStatusValue('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const exportContacts = () => {
    // Create CSV content
    const csvContent = 'data:text/csv;charset=utf-8,Name,Email,Phone,Category,Status\n' +
      contactIds.map(id => {
        // In real app, you would fetch contact data
        return `${id},example@email.com,1234567890,Personal,Active`;
      }).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `contacts_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${selectedCount} contacts`);
    onComplete();
  };

  const ActionButton = ({ action }) => (
    <motion.button
      className="bulk-action-btn"
      onClick={() => handleActionSelect(action)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{ '--action-color': action.color }}
      disabled={loading}
      aria-label={action.label}
    >
      <span className="action-icon">{action.icon}</span>
      <span className="action-label">{action.label}</span>
    </motion.button>
  );

  return (
    <AnimatePresence>
      <motion.div
        className="bulk-actions-container"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <div className="bulk-actions-header">
          <div className="selected-count">
            <FiCheck className="check-icon" />
            <span>{selectedCount} contacts selected</span>
          </div>
          
          <div className="bulk-actions-buttons">
            {actions.map(action => (
              <ActionButton key={action.id} action={action} />
            ))}
            
            <button
              className="close-bulk"
              onClick={() => onComplete()}
              aria-label="Clear selection"
            >
              <FiX /> Clear Selection
            </button>
          </div>
        </div>

        {selectedAction?.needsValue && (
          <motion.div
            className="action-value-prompt"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="prompt-content">
              <p>Select status for {selectedCount} contacts:</p>
              <Select
                options={statusOptions}
                value={statusOptions.find(opt => opt.value === statusValue)}
                onChange={(option) => setStatusValue(option?.value)}
                className="status-select"
                classNamePrefix="react-select"
                placeholder="Select status..."
              />
              <div className="prompt-actions">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setSelectedAction(null);
                    setStatusValue('');
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={() => executeAction(selectedAction)}
                  disabled={loading || !statusValue}
                >
                  {loading ? 'Applying...' : 'Apply'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default BulkActions;