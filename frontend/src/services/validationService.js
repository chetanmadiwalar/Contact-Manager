class ValidationService {
  // Validation patterns
  static PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[\+]?[1-9][\d]{0,15}$/,
    URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    DATE: /^\d{4}-\d{2}-\d{2}$/,
    TIME: /^([01]\d|2[0-3]):([0-5]\d)$/,
    ZIP_CODE: /^\d{5}(-\d{4})?$/,
    ALPHANUMERIC: /^[a-zA-Z0-9\s]*$/,
    NAME: /^[a-zA-Z\s.'-]+$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  };

  // Validation messages
  static MESSAGES = {
    REQUIRED: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PHONE: 'Please enter a valid phone number',
    INVALID_URL: 'Please enter a valid URL',
    INVALID_DATE: 'Please enter a valid date (YYYY-MM-DD)',
    INVALID_TIME: 'Please enter a valid time (HH:MM)',
    INVALID_ZIP: 'Please enter a valid ZIP code',
    INVALID_NAME: 'Please enter a valid name',
    PASSWORD_TOO_WEAK: 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character',
    PASSWORD_MISMATCH: 'Passwords do not match',
    MIN_LENGTH: (min) => `Must be at least ${min} characters`,
    MAX_LENGTH: (max) => `Cannot exceed ${max} characters`,
    MIN_VALUE: (min) => `Value must be at least ${min}`,
    MAX_VALUE: (max) => `Value cannot exceed ${max}`,
    BETWEEN: (min, max) => `Value must be between ${min} and ${max}`,
    INVALID_CHOICE: 'Please select a valid option',
    FUTURE_DATE: 'Date cannot be in the future',
    PAST_DATE: 'Date cannot be in the past',
    UNIQUE: 'This value already exists',
    INVALID_FORMAT: 'Invalid format'
  };

  /**
   * Validate a single field
   * @param {string} value - Field value
   * @param {Object} rules - Validation rules
   * @returns {Array} Array of error messages
   */
  static validateField(value, rules) {
    const errors = [];
    const val = typeof value === 'string' ? value.trim() : value;

    // Required validation
    if (rules.required && (val === '' || val === null || val === undefined)) {
      errors.push(this.MESSAGES.REQUIRED);
      return errors; // Return early for required fields
    }

    // Skip further validation if value is empty and not required
    if (!rules.required && (val === '' || val === null || val === undefined)) {
      return errors;
    }

    // Type-specific validations
    if (rules.type) {
      switch (rules.type) {
        case 'email':
          if (!this.PATTERNS.EMAIL.test(val)) {
            errors.push(this.MESSAGES.INVALID_EMAIL);
          }
          break;
        
        case 'phone':
          const cleanPhone = val.replace(/[\s\-\(\)]/g, '');
          if (!this.PATTERNS.PHONE.test(cleanPhone)) {
            errors.push(this.MESSAGES.INVALID_PHONE);
          }
          break;
        
        case 'url':
          if (!this.PATTERNS.URL.test(val)) {
            errors.push(this.MESSAGES.INVALID_URL);
          }
          break;
        
        case 'date':
          if (!this.PATTERNS.DATE.test(val) || isNaN(Date.parse(val))) {
            errors.push(this.MESSAGES.INVALID_DATE);
          } else {
            // Additional date validations
            const date = new Date(val);
            if (rules.minDate && date < new Date(rules.minDate)) {
              errors.push(`Date must be after ${rules.minDate}`);
            }
            if (rules.maxDate && date > new Date(rules.maxDate)) {
              errors.push(`Date must be before ${rules.maxDate}`);
            }
            if (rules.future && date <= new Date()) {
              errors.push(this.MESSAGES.FUTURE_DATE);
            }
            if (rules.past && date >= new Date()) {
              errors.push(this.MESSAGES.PAST_DATE);
            }
          }
          break;
        
        case 'time':
          if (!this.PATTERNS.TIME.test(val)) {
            errors.push(this.MESSAGES.INVALID_TIME);
          }
          break;
        
        case 'zip':
          if (!this.PATTERNS.ZIP_CODE.test(val)) {
            errors.push(this.MESSAGES.INVALID_ZIP);
          }
          break;
        
        case 'name':
          if (!this.PATTERNS.NAME.test(val)) {
            errors.push(this.MESSAGES.INVALID_NAME);
          }
          break;
        
        case 'password':
          if (!this.PATTERNS.PASSWORD.test(val)) {
            errors.push(this.MESSAGES.PASSWORD_TOO_WEAK);
          }
          break;
      }
    }

    // Length validations
    if (rules.minLength && val.length < rules.minLength) {
      errors.push(this.MESSAGES.MIN_LENGTH(rules.minLength));
    }
    
    if (rules.maxLength && val.length > rules.maxLength) {
      errors.push(this.MESSAGES.MAX_LENGTH(rules.maxLength));
    }

    // Numeric validations
    if (rules.type === 'number' || !isNaN(val)) {
      const num = parseFloat(val);
      
      if (rules.min !== undefined && num < rules.min) {
        errors.push(this.MESSAGES.MIN_VALUE(rules.min));
      }
      
      if (rules.max !== undefined && num > rules.max) {
        errors.push(this.MESSAGES.MAX_VALUE(rules.max));
      }
      
      if (rules.between && (num < rules.between[0] || num > rules.between[1])) {
        errors.push(this.MESSAGES.BETWEEN(...rules.between));
      }
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(val)) {
      errors.push(rules.patternMessage || this.MESSAGES.INVALID_FORMAT);
    }

    // Custom validation function
    if (rules.validate && typeof rules.validate === 'function') {
      const customError = rules.validate(val);
      if (customError) {
        errors.push(customError);
      }
    }

    // Choice validation (for select, radio, checkbox)
    if (rules.choices && !rules.choices.includes(val)) {
      errors.push(this.MESSAGES.INVALID_CHOICE);
    }

    return errors;
  }

  /**
   * Validate an entire form
   * @param {Object} formData - Form data object
   * @param {Object} validationSchema - Validation schema
   * @returns {Object} Object with errors and isValid flag
   */
  static validateForm(formData, validationSchema) {
    const errors = {};
    let isValid = true;

    for (const [fieldName, rules] of Object.entries(validationSchema)) {
      const value = formData[fieldName];
      const fieldErrors = this.validateField(value, rules);
      
      if (fieldErrors.length > 0) {
        errors[fieldName] = fieldErrors;
        isValid = false;
      }
    }

    return { errors, isValid };
  }

  /**
   * Validate contact form data
   * @param {Object} contactData - Contact form data
   * @returns {Object} Validation result
   */
  static validateContact(contactData) {
    const schema = {
      name: {
        required: true,
        type: 'name',
        minLength: 2,
        maxLength: 100
      },
      email: {
        required: true,
        type: 'email',
        maxLength: 100
      },
      phone: {
        required: true,
        type: 'phone',
        validate: (value) => {
          const clean = value.replace(/[\s\-\(\)]/g, '');
          return clean.length >= 10 ? null : 'Phone number must be at least 10 digits';
        }
      },
      category: {
        required: false,
        choices: ['Personal', 'Business', 'Family', 'Friends', 'Work', 'Other']
      },
      status: {
        required: false,
        choices: ['Active', 'Inactive', 'Archived']
      },
      tags: {
        required: false,
        validate: (value) => {
          if (Array.isArray(value) && value.length > 10) {
            return 'Maximum 10 tags allowed';
          }
          return null;
        }
      },
      message: {
        required: false,
        maxLength: 1000
      },
      notes: {
        required: false,
        maxLength: 5000
      }
    };

    return this.validateForm(contactData, schema);
  }

  /**
   * Validate group form data
   * @param {Object} groupData - Group form data
   * @returns {Object} Validation result
   */
  static validateGroup(groupData) {
    const schema = {
      name: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z0-9\s\-_]+$/,
        patternMessage: 'Group name can only contain letters, numbers, spaces, hyphens and underscores'
      },
      description: {
        required: false,
        maxLength: 500
      },
      color: {
        required: true,
        pattern: /^#[0-9A-F]{6}$/i,
        patternMessage: 'Color must be a valid hex code (e.g., #FF0000)'
      },
      icon: {
        required: false
      }
    };

    return this.validateForm(groupData, schema);
  }

  /**
   * Real-time validation with debouncing
   * @param {string} value - Field value
   * @param {Object} rules - Validation rules
   * @param {number} delay - Debounce delay in ms
   * @returns {Promise} Promise with validation result
   */
  static async validateRealTime(value, rules, delay = 300) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const errors = this.validateField(value, rules);
        resolve({
          isValid: errors.length === 0,
          errors
        });
      }, delay);
    });
  }

  /**
   * Check if email is valid format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  static isValidEmail(email) {
    return this.PATTERNS.EMAIL.test(email);
  }

  /**
   * Check if phone is valid format
   * @param {string} phone - Phone to validate
   * @returns {boolean} True if valid
   */
  static isValidPhone(phone) {
    const clean = phone.replace(/[\s\-\(\)]/g, '');
    return this.PATTERNS.PHONE.test(clean);
  }

  /**
   * Check if URL is valid format
   * @param {string} url - URL to validate
   * @returns {boolean} True if valid
   */
  static isValidURL(url) {
    return this.PATTERNS.URL.test(url);
  }

  /**
   * Check if date is valid
   * @param {string} date - Date string
   * @returns {boolean} True if valid
   */
  static isValidDate(date) {
    return this.PATTERNS.DATE.test(date) && !isNaN(Date.parse(date));
  }

  /**
   * Sanitize input (basic XSS protection)
   * @param {string} input - Input to sanitize
   * @returns {string} Sanitized input
   */
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Normalize phone number format
   * @param {string} phone - Phone number
   * @returns {string} Normalized phone number
   */
  static normalizePhone(phone) {
    if (!phone) return '';
    
    // Remove all non-digit characters except plus
    let normalized = phone.replace(/[^\d+]/g, '');
    
    // Add country code if missing and starts with 0
    if (normalized.startsWith('0') && !normalized.startsWith('+')) {
      normalized = '+1' + normalized.substring(1);
    }
    
    // Format with spaces for readability (optional)
    if (normalized.length > 3) {
      if (normalized.startsWith('+')) {
        // International format: +1 234 567 8900
        normalized = normalized.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
      } else {
        // Local format: (123) 456-7890
        normalized = normalized.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
      }
    }
    
    return normalized;
  }

  /**
   * Normalize name (capitalize first letters)
   * @param {string} name - Name to normalize
   * @returns {string} Normalized name
   */
  static normalizeName(name) {
    if (!name) return '';
    
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();
  }

  /**
   * Validate and normalize email
   * @param {string} email - Email to normalize
   * @returns {string} Normalized email
   */
  static normalizeEmail(email) {
    if (!email) return '';
    
    const normalized = email.toLowerCase().trim();
    
    // Remove spaces
    return normalized.replace(/\s+/g, '');
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} Strength analysis
   */
  static analyzePasswordStrength(password) {
    const analysis = {
      score: 0,
      length: password.length,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecial: /[@$!%*?&]/.test(password),
      isCommon: this.isCommonPassword(password)
    };

    // Calculate score
    let score = 0;
    if (analysis.length >= 8) score += 1;
    if (analysis.length >= 12) score += 1;
    if (analysis.hasLowercase) score += 1;
    if (analysis.hasUppercase) score += 1;
    if (analysis.hasNumbers) score += 1;
    if (analysis.hasSpecial) score += 1;
    if (analysis.isCommon) score = Math.max(0, score - 2);

    analysis.score = Math.min(score, 5);
    
    // Determine strength level
    if (analysis.score <= 2) analysis.strength = 'Weak';
    else if (analysis.score <= 3) analysis.strength = 'Fair';
    else if (analysis.score <= 4) analysis.strength = 'Good';
    else analysis.strength = 'Strong';

    return analysis;
  }

  /**
   * Check if password is common
   * @param {string} password - Password to check
   * @returns {boolean} True if common
   */
  static isCommonPassword(password) {
    const commonPasswords = [
      'password', '123456', '12345678', '123456789', 'password1',
      'qwerty', 'abc123', '111111', 'admin', 'letmein'
    ];
    return commonPasswords.includes(password.toLowerCase());
  }

  /**
   * Generate validation rules from schema
   * @param {Object} schema - Database schema or form schema
   * @returns {Object} Validation rules
   */
  static generateRulesFromSchema(schema) {
    const rules = {};
    
    for (const [field, config] of Object.entries(schema)) {
      const fieldRules = {};
      
      if (config.required) {
        fieldRules.required = true;
      }
      
      if (config.type) {
        fieldRules.type = config.type === 'String' ? 'text' : config.type.toLowerCase();
      }
      
      if (config.minLength) {
        fieldRules.minLength = config.minLength;
      }
      
      if (config.maxLength) {
        fieldRules.maxLength = config.maxLength;
      }
      
      if (config.enum) {
        fieldRules.choices = config.enum;
      }
      
      if (config.match) {
        fieldRules.pattern = config.match;
        fieldRules.patternMessage = `Must match pattern: ${config.match}`;
      }
      
      rules[field] = fieldRules;
    }
    
    return rules;
  }

  /**
   * Validate file upload
   * @param {File} file - File object
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  static validateFile(file, options = {}) {
    const errors = [];
    
    if (!file) {
      errors.push('File is required');
      return { isValid: false, errors };
    }
    
    // File type validation
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      errors.push(`File type not allowed. Allowed types: ${options.allowedTypes.join(', ')}`);
    }
    
    // File size validation
    if (options.maxSize && file.size > options.maxSize) {
      const maxSizeMB = options.maxSize / (1024 * 1024);
      errors.push(`File size exceeds ${maxSizeMB}MB limit`);
    }
    
    // File name validation
    if (options.pattern && !options.pattern.test(file.name)) {
      errors.push(`File name must match pattern: ${options.pattern}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      file
    };
  }

  /**
   * Create a validation debouncer
   * @param {Function} validationFn - Validation function
   * @param {number} delay - Debounce delay
   * @returns {Function} Debounced validation function
   */
  static createDebouncedValidator(validationFn, delay = 300) {
    let timeoutId;
    
    return (...args) => {
      return new Promise((resolve) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          resolve(validationFn(...args));
        }, delay);
      });
    };
  }
}

// Export individual validators for convenience
export const validateEmail = ValidationService.isValidEmail;
export const validatePhone = ValidationService.isValidPhone;
export const validateURL = ValidationService.isValidURL;
export const validateDate = ValidationService.isValidDate;
export const sanitize = ValidationService.sanitizeInput;
export const normalizePhone = ValidationService.normalizePhone;
export const normalizeName = ValidationService.normalizeName;
export const normalizeEmail = ValidationService.normalizeEmail;

export default ValidationService;