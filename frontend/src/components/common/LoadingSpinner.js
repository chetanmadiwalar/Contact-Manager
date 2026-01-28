import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...', fullScreen = false }) => {
  const sizes = {
    small: {
      spinner: 'w-8 h-8',
      ring: 'w-8 h-8 border-2',
      message: 'text-sm',
    },
    medium: {
      spinner: 'w-12 h-12',
      ring: 'w-12 h-12 border-3',
      message: 'text-base',
    },
    large: {
      spinner: 'w-16 h-16',
      ring: 'w-16 h-16 border-4',
      message: 'text-lg',
    },
  };

  const { spinner, ring, message: messageSize } = sizes[size];

  const SpinnerContent = () => (
    <div className="loading-content">
      <div className={`spinner-container ${spinner}`}>
        <motion.div
          className={`spinner-ring ${ring}`}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="spinner-dot"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {message && (
        <motion.p
          className={`loading-message ${messageSize}`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        className="loading-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="loading-modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <SpinnerContent />
        </motion.div>
        
        {/* Optional background pattern */}
        <div className="loading-background">
          <div className="pattern-circle"></div>
          <div className="pattern-circle"></div>
          <div className="pattern-circle"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="loading-inline">
      <SpinnerContent />
    </div>
  );
};

export default LoadingSpinner;