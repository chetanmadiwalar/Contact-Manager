import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const StatsCard = ({ title, value, icon, color, trend, description, onClick }) => {
  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
      return val.toString();
    }
    return val;
  };

  return (
    <motion.div
      className="stats-card"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stats-header">
        <h3 className="stats-title">{title}</h3>
        <div className="stats-icon" style={{ color }}>
          {icon}
        </div>
      </div>

      <div className="stats-content">
        <motion.div
          className="stats-value"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {formatValue(value)}
        </motion.div>

        {trend && (
          <div className={`stats-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
            {trend.isPositive ? (
              <FiTrendingUp className="trend-icon" />
            ) : (
              <FiTrendingDown className="trend-icon" />
            )}
            <span className="trend-value">{trend.value}</span>
            <span className="trend-label">from last period</span>
          </div>
        )}

        {description && (
          <p className="stats-description">{description}</p>
        )}

        {/* Progress bar for percentage-based stats */}
        {typeof value === 'number' && value <= 100 && (
          <div className="stats-progress">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${value}%` }}
              transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
              style={{ backgroundColor: color }}
            />
          </div>
        )}
      </div>

      {/* Decorative elements */}
      <div className="stats-decoration">
        <div className="decoration-circle" style={{ backgroundColor: `${color}20` }} />
        <div className="decoration-circle" style={{ backgroundColor: `${color}10` }} />
      </div>

      {/* Sparkline chart for trend visualization */}
      {trend && (
        <div className="stats-sparkline">
          <svg width="100%" height="30" viewBox="0 0 100 30">
            <motion.path
              d="M0,15 Q25,5 50,10 T100,20"
              fill="none"
              stroke={trend.isPositive ? '#10b981' : '#ef4444'}
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </svg>
        </div>
      )}

      {/* Hover effect overlay */}
      {onClick && (
        <motion.div
          className="stats-overlay"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <span className="overlay-text">Click to view details</span>
        </motion.div>
      )}
    </motion.div>
  );
};

// Optional: Prop types for better development experience
StatsCard.defaultProps = {
  trend: null,
  description: null,
  onClick: null,
};

export default StatsCard;