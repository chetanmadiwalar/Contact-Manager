import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiStar, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiRefreshCw, 
  FiMail, 
  FiPhone,
  FiUser,
  FiChevronLeft
} from 'react-icons/fi';
import { AiOutlineStar } from 'react-icons/ai';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import Pagination from '../common/Pagination';

const StarredContacts = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1,
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const fetchStarredContacts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        starred: 'true',
        page: pagination.page,
        limit: pagination.limit,
        sortBy: 'name',
        sortOrder: 'asc',
      };

      const response = await api.get('/contacts', { params });
      
      // Handle API response structure
      let contactsData = [];
      let paginationData = {};
      
      if (response.data) {
        // Pattern 1: { data: [], pagination: {} }
        if (response.data.data && response.data.pagination) {
          contactsData = response.data.data;
          paginationData = response.data.pagination;
        }
        // Pattern 2: { contacts: [], total: 0, page: 1, pages: 1 }
        else if (response.data.contacts) {
          contactsData = response.data.contacts;
          paginationData = {
            page: response.data.page || pagination.page,
            limit: response.data.limit || pagination.limit,
            total: response.data.total || response.data.count || 0,
            pages: response.data.pages || response.data.totalPages || 1,
          };
        }
        // Pattern 3: Direct array in data
        else if (Array.isArray(response.data)) {
          contactsData = response.data;
          paginationData = {
            ...pagination,
            total: response.data.length,
          };
        }
        
        // Filter to ensure only starred contacts are shown
        contactsData = contactsData.filter(contact => contact.starred === true);
      }

      setContacts(contactsData);
      setPagination(prev => ({
        ...prev,
        ...paginationData,
        total: contactsData.length, // Use filtered count
      }));
    } catch (error) {
      toast.error('Failed to load starred contacts');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    fetchStarredContacts();
  }, [fetchStarredContacts]);

  const handleStarContact = async (id, starred) => {
    try {
      await api.post(`/contacts/${id}/star`);
      setContacts(prev => prev.filter(contact => contact._id !== id));
      setSelectedContacts(prev => prev.filter(contactId => contactId !== id));
      
      // Update pagination total
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1,
      }));
      
      toast.success('Contact unstarred');
    } catch (error) {
      toast.error('Failed to update star status');
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;

    try {
      await api.delete(`/contacts/${id}`);
      setContacts(prev => prev.filter(contact => contact._id !== id));
      setSelectedContacts(prev => prev.filter(contactId => contactId !== id));
      
      // Update pagination total
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1,
      }));
      
      toast.success('Contact deleted successfully');
    } catch (error) {
      toast.error('Failed to delete contact');
    }
  };

  const handleSelectContact = (id) => {
    setSelectedContacts(prev =>
      prev.includes(id)
        ? prev.filter(contactId => contactId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(contact => contact._id));
    }
  };

  const handleBulkUnstar = async () => {
    if (!window.confirm(`Unstar ${selectedContacts.length} contacts?`)) return;
    
    try {
      await Promise.all(
        selectedContacts.map(id => api.post(`/contacts/${id}/star`))
      );
      
      // Remove unstarred contacts from the list
      setContacts(prev => prev.filter(contact => !selectedContacts.includes(contact._id)));
      setSelectedContacts([]);
      
      // Update pagination total
      setPagination(prev => ({
        ...prev,
        total: prev.total - selectedContacts.length,
      }));
      
      toast.success(`${selectedContacts.length} contacts unstarred`);
    } catch (error) {
      toast.error('Failed to unstar contacts');
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleExportStarred = () => {
    // Implement export functionality
    toast.success('Export functionality coming soon!');
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading starred contacts...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="starred-contacts-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="starred-header">
        <div className="header-left">
          <button
            className="btn-back"
            onClick={() => navigate('/contacts')}
            aria-label="Go back to all contacts"
          >
            <FiChevronLeft /> Back to Contacts
          </button>
          <div>
            <h1>
              <FiStar className="star-icon-header" /> Starred Contacts
            </h1>
            <p className="subtitle">
              {pagination.total || 0} starred contacts • {selectedContacts.length} selected
            </p>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              title="Grid View"
            >
              ▦
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
              title="List View"
            >
              ≡
            </button>
          </div>
          
          {selectedContacts.length > 0 && (
            <button
              className="btn-secondary danger"
              onClick={handleBulkUnstar}
            >
              <AiOutlineStar /> Unstar Selected ({selectedContacts.length})
            </button>
          )}
          
          <button
            className="btn-secondary"
            onClick={handleExportStarred}
            aria-label="Export starred contacts"
          >
            Export
          </button>
          
          <button
            className="btn-secondary"
            onClick={fetchStarredContacts}
            aria-label="Refresh starred contacts"
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {selectedContacts.length > 0 && (
        <div className="bulk-actions-bar">
          <div className="bulk-actions-content">
            <span>{selectedContacts.length} contacts selected</span>
            <div className="bulk-actions-buttons">
              <button
                className="btn-small"
                onClick={handleBulkUnstar}
              >
                <AiOutlineStar /> Unstar
              </button>
            </div>
          </div>
        </div>
      )}

      {contacts.length === 0 ? (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="empty-icon">
            <FiStar />
          </div>
          <h3>No starred contacts yet</h3>
          <p>Star important contacts to see them here</p>
          <button
            className="btn-primary"
            onClick={() => navigate('/contacts')}
          >
            Browse All Contacts
          </button>
        </motion.div>
      ) : viewMode === 'grid' ? (
        <div className="contacts-grid">
          <AnimatePresence>
            {contacts.map((contact, index) => (
              <motion.div
                key={contact._id}
                className="contact-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="card-header">
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(contact._id)}
                    onChange={() => handleSelectContact(contact._id)}
                    aria-label={`Select ${contact.name}`}
                    className="contact-checkbox"
                  />
                  
                  <button
                    className="star-btn active"
                    onClick={() => handleStarContact(contact._id, contact.starred)}
                    aria-label="Unstar contact"
                    title="Unstar"
                  >
                    <FiStar />
                  </button>
                </div>
                
                <div 
                  className="card-body"
                  onClick={() => navigate(`/contacts/${contact._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="contact-avatar-large">
                    {contact.name?.charAt(0).toUpperCase()}
                  </div>
                  
                  <h3 className="contact-name">{contact.name}</h3>
                  
                  <div className="contact-info">
                    <div className="info-item">
                      <FiMail /> {contact.email}
                    </div>
                    <div className="info-item">
                      <FiPhone /> {contact.phone}
                    </div>
                  </div>
                  
                  <div className="contact-tags">
                    <span className="category-badge">
                      {contact.category}
                    </span>
                    <span className="status-badge">
                      {contact.status}
                    </span>
                  </div>
                </div>
                
                <div className="card-actions">
                  <button
                    className="icon-btn"
                    onClick={() => navigate(`/contacts/edit/${contact._id}`)}
                    aria-label="Edit contact"
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="icon-btn"
                    onClick={() => navigate(`/contacts/${contact._id}`)}
                    aria-label="View contact"
                    title="View"
                  >
                    <FiEye />
                  </button>
                  <button
                    className="icon-btn danger"
                    onClick={() => handleDeleteContact(contact._id)}
                    aria-label="Delete contact"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="contacts-table-container">
          <table className="contacts-table">
            <thead>
              <tr>
                <th className="select-column">
                  <input
                    type="checkbox"
                    checked={contacts.length > 0 && selectedContacts.length === contacts.length}
                    onChange={handleSelectAll}
                    aria-label="Select all contacts"
                  />
                </th>
                <th>Contact</th>
                <th>Category</th>
                <th>Status</th>
                <th>Groups</th>
                <th>Tags</th>
                <th>Last Contacted</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {contacts.map((contact, index) => (
                  <motion.tr
                    key={contact._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={selectedContacts.includes(contact._id) ? 'selected' : ''}
                  >
                    <td className="select-column">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact._id)}
                        onChange={() => handleSelectContact(contact._id)}
                        aria-label={`Select ${contact.name}`}
                      />
                    </td>
                    <td>
                      <div className="contact-info-cell">
                        <div className="contact-avatar">
                          {contact.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="contact-name">
                            {contact.name}
                            <FiStar className="star-icon filled" />
                          </div>
                          <div className="contact-email">{contact.email}</div>
                          <div className="contact-phone">{contact.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`category-badge ${contact.category?.toLowerCase()}`}>
                        {contact.category}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${contact.status?.toLowerCase()}`}>
                        {contact.status}
                      </span>
                    </td>
                    <td>
                      <div className="groups-cell">
                        {contact.groups?.slice(0, 2).map(group => (
                          <span
                            key={group._id || group}
                            className="group-badge"
                            style={{ backgroundColor: group.color || '#6c757d' }}
                          >
                            {group.name || group}
                          </span>
                        ))}
                        {contact.groups?.length > 2 && (
                          <span className="more-groups">
                            +{contact.groups.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="tags-cell">
                        {contact.tags?.slice(0, 3).map(tag => (
                          <span key={tag} className="tag-badge">
                            {tag}
                          </span>
                        ))}
                        {contact.tags?.length > 3 && (
                          <span className="more-tags">
                            +{contact.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {contact.lastContacted ? (
                        new Date(contact.lastContacted).toLocaleDateString()
                      ) : (
                        <span className="text-muted">Never</span>
                      )}
                    </td>
                    <td className="actions-column">
                      <div className="action-buttons">
                        <button
                          className="icon-btn"
                          onClick={() => handleStarContact(contact._id, contact.starred)}
                          aria-label="Unstar contact"
                          title="Unstar"
                        >
                          <FiStar className="starred" />
                        </button>
                        <button
                          className="icon-btn"
                          onClick={() => navigate(`/contacts/edit/${contact._id}`)}
                          aria-label="Edit contact"
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="icon-btn"
                          onClick={() => navigate(`/contacts/${contact._id}`)}
                          aria-label="View contact"
                          title="View"
                        >
                          <FiEye />
                        </button>
                        <button
                          className="icon-btn danger"
                          onClick={() => handleDeleteContact(contact._id)}
                          aria-label="Delete contact"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {contacts.length > 0 && (
        <div className="table-footer">
          <div className="selected-info">
            {selectedContacts.length > 0 && (
              <span>{selectedContacts.length} contacts selected</span>
            )}
          </div>
          <Pagination
            currentPage={pagination?.page || 1}
            totalPages={pagination?.pages || 1}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </motion.div>
  );
};

export default StarredContacts;