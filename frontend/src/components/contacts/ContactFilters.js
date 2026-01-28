import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiSearch, FiX, FiChevronDown } from 'react-icons/fi';
import Select from 'react-select';
import { api } from '../../services/api';

const ContactFilters = ({ filters, onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const [categories, statuses, groups, tags] = await Promise.all([
        api.get('/contacts/filters/categories'),
        api.get('/contacts/filters/statuses'),
        api.get('/groups'),
        api.get('/contacts/filters/tags'),
      ]);
      
      setAvailableCategories(categories.map(cat => ({ value: cat, label: cat })));
      setAvailableStatuses(statuses.map(status => ({ value: status, label: status })));
      setAvailableGroups(groups.map(group => ({ value: group._id, label: group.name })));
      setAvailableTags(tags.map(tag => ({ value: tag, label: tag })));
    } catch (error) {
      console.error('Failed to load filter options', error);
    }
  };

  const handleChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearchChange = (e) => {
    handleChange('search', e.target.value);
  };

  const handleSelectChange = (key) => (selectedOption) => {
    handleChange(key, selectedOption?.value || '');
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      category: '',
      status: '',
      group: '',
      tag: '',
      starred: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== 'sortBy' && key !== 'sortOrder' && value
  );

  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'category', label: 'Category' },
  ];

  const orderOptions = [
    { value: 'desc', label: 'Descending' },
    { value: 'asc', label: 'Ascending' },
  ];

  const starredOptions = [
    { value: '', label: 'All' },
    { value: 'true', label: 'Starred Only' },
    { value: 'false', label: 'Not Starred' },
  ];

  return (
    <div className="contact-filters">
      <div className="filters-header">
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search contacts by name, email, or phone..."
            value={localFilters.search}
            onChange={handleSearchChange}
            className="search-input"
          />
          {localFilters.search && (
            <button
              className="clear-search"
              onClick={() => handleChange('search', '')}
              aria-label="Clear search"
            >
              <FiX />
            </button>
          )}
        </div>

        <div className="filter-controls">
          <button
            className={`filter-toggle ${isExpanded ? 'active' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Hide filters' : 'Show filters'}
          >
            <FiFilter />
            <span>Filters</span>
            {hasActiveFilters && <span className="filter-badge" />}
            <FiChevronDown className={`chevron ${isExpanded ? 'up' : ''}`} />
          </button>

          <div className="sort-controls">
            <Select
              className="sort-select"
              classNamePrefix="react-select"
              options={sortOptions}
              value={sortOptions.find(opt => opt.value === localFilters.sortBy)}
              onChange={handleSelectChange('sortBy')}
              isSearchable={false}
            />
            <Select
              className="order-select"
              classNamePrefix="react-select"
              options={orderOptions}
              value={orderOptions.find(opt => opt.value === localFilters.sortOrder)}
              onChange={handleSelectChange('sortOrder')}
              isSearchable={false}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="filters-expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="filter-grid">
              <div className="filter-group">
                <label>Category</label>
                <Select
                  options={availableCategories}
                  value={availableCategories.find(
                    opt => opt.value === localFilters.category
                  )}
                  onChange={handleSelectChange('category')}
                  isClearable
                  placeholder="All categories"
                />
              </div>

              <div className="filter-group">
                <label>Status</label>
                <Select
                  options={availableStatuses}
                  value={availableStatuses.find(
                    opt => opt.value === localFilters.status
                  )}
                  onChange={handleSelectChange('status')}
                  isClearable
                  placeholder="All statuses"
                />
              </div>

              <div className="filter-group">
                <label>Group</label>
                <Select
                  options={availableGroups}
                  value={availableGroups.find(
                    opt => opt.value === localFilters.group
                  )}
                  onChange={handleSelectChange('group')}
                  isClearable
                  placeholder="All groups"
                />
              </div>

              <div className="filter-group">
                <label>Tag</label>
                <Select
                  options={availableTags}
                  value={availableTags.find(
                    opt => opt.value === localFilters.tag
                  )}
                  onChange={handleSelectChange('tag')}
                  isClearable
                  placeholder="Any tag"
                />
              </div>

              <div className="filter-group">
                <label>Starred</label>
                <Select
                  options={starredOptions}
                  value={starredOptions.find(
                    opt => opt.value === localFilters.starred.toString()
                  )}
                  onChange={handleSelectChange('starred')}
                  isClearable
                  placeholder="All contacts"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="filter-actions">
                <button
                  className="btn-secondary"
                  onClick={handleClearFilters}
                >
                  <FiX /> Clear All Filters
                </button>
                <div className="active-filters">
                  {Object.entries(filters).map(([key, value]) => {
                    if (!value || key === 'sortBy' || key === 'sortOrder') return null;
                    
                    let label = value;
                    if (key === 'category') label = `Category: ${value}`;
                    if (key === 'status') label = `Status: ${value}`;
                    if (key === 'group') label = `Group: ${value}`;
                    if (key === 'tag') label = `Tag: ${value}`;
                    if (key === 'starred') label = value === 'true' ? 'Starred' : 'Not Starred';
                    if (key === 'search') label = `Search: "${value}"`;

                    return (
                      <span key={key} className="active-filter">
                        {label}
                        <button
                          onClick={() => handleChange(key, '')}
                          aria-label={`Remove ${key} filter`}
                        >
                          <FiX />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactFilters;