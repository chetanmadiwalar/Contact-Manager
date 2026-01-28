import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiStar, FiEdit2, FiTrash2, FiEye, FiRefreshCw } from 'react-icons/fi';
import { AiOutlineStar } from 'react-icons/ai';
import toast from 'react-hot-toast';
import ContactFilters from './ContactFilters';
import BulkActions from './BulkActions';
import ExportButton from './ExportButton';
import Pagination from '../common/Pagination';
import { api } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';

const ContactList = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    group: '',
    tag: '',
    starred: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        search: debouncedSearch,
        page: pagination.page,
        limit: pagination.limit,
      };

      const response = await api.get('/contacts', { params });
      
      // Debug: Log the response to see actual structure
      console.log('API Response:', response);
      
      // Extract data based on common API patterns
      if (response.data) {
        // Pattern 1: { success: true, data: [], pagination: {} }
        if (response.data.data && response.data.pagination) {
          setContacts(response.data.data);
          setPagination(response.data.pagination);
        }
        // Pattern 2: { contacts: [], total: 0, page: 1, pages: 1 }
        else if (response.data.contacts) {
          setContacts(response.data.contacts);
          setPagination({
            page: response.data.page || pagination.page,
            limit: response.data.limit || pagination.limit,
            total: response.data.total || response.data.count || 0,
            pages: response.data.pages || response.data.totalPages || 1,
          });
        }
        // Pattern 3: Direct array with pagination info in response.data
        else if (Array.isArray(response.data.data)) {
          setContacts(response.data.data);
          setPagination({
            page: response.data.page || pagination.page,
            limit: response.data.limit || pagination.limit,
            total: response.data.total || 0,
            pages: response.data.pages || 1,
          });
        }
        // Pattern 4: Array is directly in response.data
        else if (Array.isArray(response.data)) {
          setContacts(response.data);
          // If no pagination info, use defaults
          setPagination(prev => ({
            ...prev,
            total: response.data.length,
          }));
        }
      }
    } catch (error) {
      toast.error('Failed to load contacts');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
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

  const handleStarContact = async (id, starred) => {
    try {
      await api.post(`/contacts/${id}/star`);
      setContacts(prev =>
        prev.map(contact =>
          contact._id === id ? { ...contact, starred: !starred } : contact
        )
      );
      toast.success(`Contact ${starred ? 'unstarred' : 'starred'}`);
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
      toast.success('Contact deleted successfully');
    } catch (error) {
      toast.error('Failed to delete contact');
    }
  };

  const handleBulkActionComplete = () => {
    setSelectedContacts([]);
    fetchContacts();
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading contacts...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="contact-list-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="list-header">
        <div>
          <h1>Contacts</h1>
          <p className="subtitle">
            {pagination?.total || 0} contacts • {selectedContacts.length} selected
          </p>
        </div>
        <div className="header-actions">
          <ExportButton filters={filters} />
          <button
            className="btn-primary"
            onClick={() => navigate('/contacts/new')}
          >
            <FiPlus /> Add Contact
          </button>
        </div>
      </div>

      <ContactFilters filters={filters} onFilterChange={handleFilterChange} />

      {selectedContacts.length > 0 && (
        <BulkActions
          selectedCount={selectedContacts.length}
          contactIds={selectedContacts}
          onComplete={handleBulkActionComplete}
        />
      )}

      <div className="contacts-table-container">
        <div className="table-responsive">
          <table className="contacts-table">
            <thead>
              <tr>
                <th className="select-column">
                  <input
                    type="checkbox"
                    checked={
                      contacts.length > 0 &&
                      selectedContacts.length === contacts.length
                    }
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
                          {contact.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="contact-name">
                            {contact.name}
                            {contact.starred && (
                              <FiStar className="star-icon filled" />
                            )}
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
                          aria-label={contact.starred ? 'Unstar contact' : 'Star contact'}
                          title={contact.starred ? 'Unstar' : 'Star'}
                        >
                          {contact.starred ? (
                            <FiStar className="starred" />
                          ) : (
                            <AiOutlineStar />
                          )}
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
                          aria-label="View contact details"
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

          {contacts.length === 0 && !loading && (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="empty-icon">📇</div>
              <h3>No contacts found</h3>
              <p>Try adjusting your filters or add a new contact</p>
              <button
                className="btn-primary"
                onClick={() => navigate('/contacts/new')}
              >
                <FiPlus /> Add Your First Contact
              </button>
            </motion.div>
          )}
        </div>

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
          <div className="refresh-control">
            <button
              className="icon-btn"
              onClick={fetchContacts}
              aria-label="Refresh contacts"
              title="Refresh"
            >
              <FiRefreshCw />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactList;