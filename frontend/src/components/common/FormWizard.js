import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';

const FormWizard = ({ steps, currentStep }) => {
  return (
    <div className="form-wizard">
      <div className="wizard-progress">
        <div 
          className="progress-bar"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>
      
      <div className="wizard-steps">
        {steps.map((step, index) => {
          const isCompleted = index + 1 < currentStep;
          const isCurrent = index + 1 === currentStep;
          const stepNumber = index + 1;

          return (
            <motion.div
              key={step.number}
              className={`wizard-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="step-indicator">
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="step-check"
                  >
                    <FiCheck />
                  </motion.div>
                ) : (
                  <span className="step-number">{stepNumber}</span>
                )}
              </div>
              
              <div className="step-content">
                <div className="step-title">{step.title}</div>
                <div className="step-icon">{step.icon}</div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="step-connector" />
              )}
            </motion.div>
          );
        })}
      </div>
      
      <div className="wizard-info">
        <span className="current-step-info">
          Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}
        </span>
        <span className="progress-percentage">
          {Math.round(((currentStep - 1) / (steps.length - 1)) * 100)}%
        </span>
      </div>
    </div>
  );
};

export default FormWizard;