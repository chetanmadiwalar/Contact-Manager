import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiStar,
  FiActivity,
  FiTrendingUp,
  FiGrid,
  FiCalendar,
} from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import StatsCard from './StatsCard';
import { api } from '../../services/api';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/analytics/dashboard');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setError('Failed to load analytics data');
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">📊</div>
        <h3>Failed to load analytics</h3>
        <p>{error}</p>
        <button className="btn-primary" onClick={fetchAnalytics}>
          Retry
        </button>
      </div>
    );
  }

  if (!analytics || !analytics.data) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📊</div>
        <h3>No analytics data available</h3>
        <p>Start adding contacts to see analytics</p>
      </div>
    );
  }

  const { summary, categoryStats, weeklyStats, latestContacts, recentActivities } = analytics.data;

  // Prepare chart data with fallbacks
  const categoryData = (categoryStats || []).map(item => ({
    name: item._id || 'Unknown',
    value: item.count || 0,
  }));

  const weeklyData = (weeklyStats || []).map(item => ({
    day: item._id ? new Date(item._id).toLocaleDateString('en-US', { weekday: 'short' }) : 'N/A',
    contacts: item.count || 0,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Default stats if data is missing
  const defaultSummary = {
    totalContacts: 0,
    activeContacts: 0,
    starredContacts: 0,
    totalGroups: 0,
  };

  const safeSummary = summary || defaultSummary;
  const safeLatestContacts = latestContacts || [];
  const safeRecentActivities = recentActivities || [];

  return (
    <motion.div
      className="dashboard-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="dashboard-header">
        <h1>Analytics Dashboard</h1>
        <p>Comprehensive overview of your contact management</p>
        <button className="refresh-btn" onClick={fetchAnalytics} style={{ color: 'red' }}>
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatsCard
          title="Total Contacts"
          value={safeSummary.totalContacts}
          icon={<FiUsers />}
          color="#667eea"
          trend={{ value: '+0%', isPositive: true }}
        />
        <StatsCard
          title="Active Contacts"
          value={safeSummary.activeContacts}
          icon={<FiActivity />}
          color="#10b981"
          trend={{ value: '+0%', isPositive: true }}
        />
        <StatsCard
          title="Starred"
          value={safeSummary.starredContacts}
          icon={<FiStar />}
          color="#f59e0b"
          trend={{ value: '+0%', isPositive: true }}
        />
        <StatsCard
          title="Groups"
          value={safeSummary.totalGroups}
          icon={<FiGrid />}
          color="#8b5cf6"
          trend={{ value: '+0', isPositive: true }}
        />
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <motion.div 
          className="chart-card"
          whileHover={{ y: -5 }}
        >
          <div className="chart-header">
            <h3>Contacts by Category</h3>
            <FiTrendingUp className="chart-icon" />
          </div>
          <div className="chart-container">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">
                <p>No category data available</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          className="chart-card"
          whileHover={{ y: -5 }}
        >
          <div className="chart-header">
            <h3>Weekly Activity</h3>
            <FiCalendar className="chart-icon" />
          </div>
          <div className="chart-container">
            {weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weeklyData}>
                  <Line
                    type="monotone"
                    dataKey="contacts"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">
                <p>No weekly activity data</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="recent-section">
        <div className="recent-card">
          <div className="card-header">
            <h3>Recent Contacts</h3>
            <a href="/contacts" className="view-all">View All</a>
          </div>
          <div className="recent-list">
            {safeLatestContacts.length > 0 ? (
              safeLatestContacts.map((contact, index) => (
                <motion.div
                  key={contact._id || index}
                  className="recent-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="recent-avatar">
                    {contact.name ? contact.name.charAt(0) : '?'}
                  </div>
                  <div className="recent-info">
                    <h4>{contact.name || 'Unknown Contact'}</h4>
                    <p>{contact.email || 'No email'}</p>
                  </div>
                  <div className="recent-meta">
                    <span className={`category-badge ${(contact.category || 'other').toLowerCase()}`}>
                      {contact.category || 'Other'}
                    </span>
                    <span className="recent-time">
                      {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="empty-list">
                <p>No recent contacts</p>
              </div>
            )}
          </div>
        </div>

        <div className="recent-card">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <a href="/activities" className="view-all">View All</a>
          </div>
          <div className="activity-list">
            {safeRecentActivities.length > 0 ? (
              safeRecentActivities.map((activity, index) => (
                <motion.div
                  key={activity._id || index}
                  className="activity-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`activity-icon ${activity.action ? activity.action.toLowerCase() : ''}`}>
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="activity-details">
                    <p className="activity-text">{getActivityText(activity)}</p>
                    <span className="activity-time">
                      {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString() : 'N/A'}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="empty-list">
                <p>No recent activities</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Helper functions with null checks
const getActivityIcon = (action) => {
  if (!action) return '⚡';
  
  const icons = {
    CREATE_CONTACT: '➕',
    UPDATE_CONTACT: '✏️',
    DELETE_CONTACT: '🗑️',
    STARRED: '⭐',
    EXPORT: '📤',
  };
  return icons[action] || '⚡';
};

const getActivityText = (activity) => {
  if (!activity) return 'Unknown activity';
  
  const texts = {
    CREATE_CONTACT: `Created contact "${activity.entityName || 'Unknown'}"`,
    UPDATE_CONTACT: `Updated contact "${activity.entityName || 'Unknown'}"`,
    DELETE_CONTACT: `Deleted contact "${activity.entityName || 'Unknown'}"`,
    STARRED: `Starred contact "${activity.entityName || 'Unknown'}"`,
    EXPORT: `Exported contacts`,
  };
  
  return texts[activity.action] || `${activity.action || 'Activity'} performed`;
};

export default AnalyticsDashboard;