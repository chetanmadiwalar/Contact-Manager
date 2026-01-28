import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHome,
  FiUsers,
  FiFolderPlus,
  FiGrid,
  FiActivity,
  FiStar,
  FiArchive,
  FiSettings,
  FiHelpCircle,
} from 'react-icons/fi';
import { RiDashboardLine } from 'react-icons/ri';

const Sidebar = ({ isOpen }) => {
  const menuItems = [
    { path: '/dashboard', icon: <RiDashboardLine />, label: 'Dashboard' },
    { path: '/contacts', icon: <FiUsers />, label: 'Contacts', badge: '24' },
    { path: '/contacts/new', icon: <FiFolderPlus />, label: 'New Contact' },
    { path: '/groups', icon: <FiGrid />, label: 'Groups' },
    { path: '/activities', icon: <FiActivity />, label: 'Activity Log' },
    { path: '/starred', icon: <FiStar />, label: 'Starred' },
  ];

  const secondaryItems = [
    { path: '/settings', icon: <FiSettings />, label: 'Settings' },
    { path: '/help', icon: <FiHelpCircle />, label: 'Help & Support' },
  ];

  const containerVariants = {
    open: { width: 280, opacity: 1 },
    closed: { width: 0, opacity: 0 }
  };

  return (
    <motion.aside
      className="sidebar"
      variants={containerVariants}
      animate={isOpen ? 'open' : 'closed'}
      initial="open"
    >
      <div className="sidebar-content">
        <nav className="main-nav">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        <div className="sidebar-divider" />

        {/* <nav className="secondary-nav">
          {secondaryItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav> */}

        <div className="sidebar-footer">
          <div className="storage-info">
            <div className="storage-bar">
              <div className="storage-fill" style={{ width: '65%' }} />
            </div>
            <span className="storage-text">65% of 1GB used</span>
          </div>
          
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-value">247</span>
              <span className="stat-label">Contacts</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">12</span>
              <span className="stat-label">Groups</span>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;