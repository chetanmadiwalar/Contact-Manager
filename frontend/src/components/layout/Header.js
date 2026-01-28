import React from 'react';
import { motion } from 'framer-motion';
import { FiMenu, FiBell, FiSearch, FiUser } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

const Header = ({ toggleSidebar }) => {
  const { isDarkMode } = useTheme();

  return (
    <motion.header 
      className="app-header"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <div className="header-left">
        <button 
          className="menu-btn" 
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <FiMenu size={24} />
        </button>
        
        <div className="logo" style={{'marginBottom':'50px'}}>
          <span className="logo-icon">📇</span>
          <h1>ContactPro</h1>
          <span className="badge">v2.0</span>
        </div>
      </div>

      <div className="header-center">
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search contacts, groups, tags..."
            className="search-input"
          />
          <div className="search-shortcut">⌘K</div>
        </div>
      </div>

      <div className="header-right">
        <ThemeToggle />
        
        <button className="icon-btn notification-btn" aria-label="Notifications">
          <FiBell size={20} />
          <span className="notification-badge">3</span>
        </button>
        
        <div className="user-profile">
          <div className="avatar">
            <FiUser size={20} />
          </div>
          <div className="user-info">
            <span className="user-name">John</span>
            <span className="user-role">Admin</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;