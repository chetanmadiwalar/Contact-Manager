import React from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <motion.button
      className="theme-toggle"
      onClick={toggleTheme}
      whileTap={{ scale: 0.9 }}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <motion.div
        className="toggle-track"
        initial={false}
        animate={{ background: isDarkMode ? '#4B5563' : '#E5E7EB' }}
      >
        <motion.div
          className="toggle-thumb"
          initial={false}
          animate={{
            x: isDarkMode ? 24 : 0,
            background: isDarkMode ? '#FBBF24' : '#F59E0B',
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.div>
      <div className="theme-icons">
        <FiSun className={`sun-icon ${!isDarkMode ? 'active' : ''}`} />
        <FiMoon className={`moon-icon ${isDarkMode ? 'active' : ''}`} />
      </div>
    </motion.button>
  );
};

export default ThemeToggle;