import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiActivity,
  FiClock,
  FiUser,
  FiEdit,
  FiTrash,
  FiPlus,
  FiStar,
  FiDownload,
  FiFilter,
  FiRefreshCw,
} from 'react-icons/fi';
import Pagination from './Pagination';
import { api } from '../../services/api';

const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    dateRange: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  useEffect(() => {
    fetchActivities();
  }, [filters, pagination.page]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      };

      const response = await api.get('/analytics/activities', { params });
      console.log('API Response:', response); // Debug log
      
      // Handle different API response structures
      if (response.data) {
        // Pattern 1: { success: true, data: [], pagination: {} }
        if (response.data.data && response.data.pagination) {
          setActivities(response.data.data);
          setPagination(response.data.pagination);
        }
        // Pattern 2: { activities: [], total: 0, page: 1, pages: 1 }
        else if (response.data.activities) {
          setActivities(response.data.activities);
          setPagination({
            page: response.data.page || pagination.page,
            limit: response.data.limit || pagination.limit,
            total: response.data.total || response.data.count || 0,
            pages: response.data.pages || response.data.totalPages || 1,
          });
        }
        // Pattern 3: Direct array in data
        else if (Array.isArray(response.data)) {
          setActivities(response.data);
          // If no pagination info, estimate from array length
          setPagination(prev => ({
            ...prev,
            total: response.data.length,
          }));
        }
        // Pattern 4: Mixed response
        else {
          // Try to find activities array in response.data
          const activitiesKey = Object.keys(response.data).find(key => 
            Array.isArray(response.data[key])
          );
          if (activitiesKey) {
            setActivities(response.data[activitiesKey]);
            // Try to find pagination in response.data
            const paginationData = response.data.pagination || {};
            setPagination({
              page: paginationData.page || response.data.page || pagination.page,
              limit: paginationData.limit || response.data.limit || pagination.limit,
              total: paginationData.total || response.data.total || response.data[activitiesKey].length,
              pages: paginationData.pages || response.data.pages || 
                     Math.ceil((paginationData.total || response.data[activitiesKey].length) / 
                     (paginationData.limit || pagination.limit)) || 1,
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const iconMap = {
      CREATE_CONTACT: <FiPlus />,
      UPDATE_CONTACT: <FiEdit />,
      DELETE_CONTACT: <FiTrash />,
      STARRED: <FiStar />,
      UNSTARRED: <FiStar />,
      EXPORT: <FiDownload />,
      BULK_DELETE: <FiTrash />,
      BULK_UPDATE: <FiEdit />,
      ADD_TO_GROUP: <FiUser />,
      REMOVE_FROM_GROUP: <FiUser />,
    };
    return iconMap[action] || <FiActivity />;
  };

  const getActionColor = (action) => {
    const colorMap = {
      CREATE_CONTACT: '#10b981',
      UPDATE_CONTACT: '#3b82f6',
      DELETE_CONTACT: '#ef4444',
      STARRED: '#f59e0b',
      UNSTARRED: '#6b7280',
      EXPORT: '#8b5cf6',
      BULK_DELETE: '#ef4444',
      BULK_UPDATE: '#3b82f6',
      ADD_TO_GROUP: '#667eea',
      REMOVE_FROM_GROUP: '#667eea',
    };
    return colorMap[action] || '#6b7280';
  };

  const getActionText = (activity) => {
    const texts = {
      CREATE_CONTACT: `Created contact "${activity.entityName}"`,
      UPDATE_CONTACT: `Updated contact "${activity.entityName}"`,
      DELETE_CONTACT: `Deleted contact "${activity.entityName}"`,
      STARRED: `Starred contact "${activity.entityName}"`,
      UNSTARRED: `Unstarred contact "${activity.entityName}"`,
      EXPORT: `Exported ${activity.changes?.count || 'multiple'} contacts`,
      BULK_DELETE: `Deleted ${activity.changes?.deletedCount || 'multiple'} contacts`,
      BULK_UPDATE: `Updated ${activity.changes?.modifiedCount || 'multiple'} contacts`,
      ADD_TO_GROUP: `Added to group`,
      REMOVE_FROM_GROUP: `Removed from group`,
    };

    let text = texts[activity.action] || `${activity.action} ${activity.entityName}`;

    // Add details if changes exist
    if (activity.changes) {
      const changeDetails = Object.entries(activity.changes)
        .filter(([key]) => !['count', 'deletedCount', 'modifiedCount'].includes(key))
        .map(([key, value]) => {
          if (typeof value === 'object' && value.old !== undefined && value.new !== undefined) {
            return `${key}: ${value.old} → ${value.new}`;
          }
          return `${key}: ${value}`;
        })
        .join(', ');

      if (changeDetails) {
        text += ` (${changeDetails})`;
      }
    }

    return text;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  if (loading && activities.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading activity log...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="activity-log-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="activity-header">
        <div>
          <h1>Activity Log</h1>
          <p>Track all actions performed in the system</p>
        </div>
        <button
          className="btn-secondary"
          onClick={fetchActivities}
          aria-label="Refresh activities"
        >
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <div className="activity-filters">
        <div className="filter-group">
          <label>
            <FiFilter /> Action Type
          </label>
          <select
            value={filters.action}
            onChange={(e) => handleFilterChange('action', e.target.value)}
          >
            <option value="">All Actions</option>
            <option value="CREATE_CONTACT">Create Contact</option>
            <option value="UPDATE_CONTACT">Update Contact</option>
            <option value="DELETE_CONTACT">Delete Contact</option>
            <option value="STARRED">Starred</option>
            <option value="EXPORT">Export</option>
            <option value="BULK_DELETE">Bulk Delete</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Date Range</label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <div className="filter-group search-group">
          <input
            type="text"
            placeholder="Search activities..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="activity-list-container">
        {activities.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No activities found</h3>
            <p>Activities will appear here as you use the system</p>
          </div>
        ) : (
          <>
            <div className="activity-timeline">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity._id || index}
                  className="activity-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div
                    className="activity-icon"
                    style={{ backgroundColor: getActionColor(activity.action) }}
                  >
                    {getActionIcon(activity.action)}
                  </div>

                  <div className="activity-content">
                    <div className="activity-header">
                      <p className="activity-text">{getActionText(activity)}</p>
                      <span className="activity-time">
                        <FiClock /> {formatTime(activity.timestamp)}
                      </span>
                    </div>

                    <div className="activity-details">
                      <span className="activity-performed-by">
                        <FiUser /> {activity.performedBy || 'System'}
                      </span>
                      {activity.ipAddress && (
                        <span className="activity-ip">
                          IP: {activity.ipAddress}
                        </span>
                      )}
                    </div>

                    {activity.changes && Object.keys(activity.changes).length > 0 && (
                      <div className="activity-changes">
                        <details>
                          <summary>View Changes</summary>
                          <pre className="changes-json">
                            {JSON.stringify(activity.changes, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Use safe access for pagination */}
            <Pagination
              currentPage={pagination?.page || 1}
              totalPages={pagination?.pages || 1}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      <div className="activity-summary">
        <div className="summary-card">
          <h4>Activity Summary</h4>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-value">{pagination?.total || 0}</span>
              <span className="stat-label">Total Activities</span>
            </div>
            <div className="stat">
              <span className="stat-value">
                {activities.filter(a => a.action === 'CREATE_CONTACT').length}
              </span>
              <span className="stat-label">Contacts Created</span>
            </div>
            <div className="stat">
              <span className="stat-value">
                {activities.filter(a => a.action === 'UPDATE_CONTACT').length}
              </span>
              <span className="stat-label">Updates Made</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityLog;