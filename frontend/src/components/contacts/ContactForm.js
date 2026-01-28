import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiMessageSquare, FiTag, FiGrid } from 'react-icons/fi';
import { api } from '../../services/api';
import FormWizard from '../common/FormWizard';

const ContactForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    category: 'Personal',
    tags: [],
    groups: [],
    status: 'Active',
    notes: '',
    customFields: {},
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);

  // Fetch contact data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchContact();
    }
    fetchGroups();
  }, [id]);

  const fetchContact = async () => {
    try {
      const response = await api.get(`/contacts/${id}`);
      setFormData(response.data);
    } catch (error) {
      toast.error('Failed to load contact');
      navigate('/contacts');
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      setGroups(response.data);
    } catch (error) {
      console.error('Failed to load groups');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTagsChange = (newTags) => {
    setFormData(prev => ({
      ...prev,
      tags: newTags.map(tag => tag.value),
    }));
  };

  const handleGroupsChange = (selectedGroups) => {
    setFormData(prev => ({
      ...prev,
      groups: selectedGroups.map(group => group.value),
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    }

    if (step === 2) {
      // Additional validations for step 2 if needed
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      toast.error('Please fix the errors before proceeding');
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        await api.put(`/contacts/${id}`, formData);
        toast.success('Contact updated successfully!');
      } else {
        await api.post('/contacts', formData);
        toast.success('Contact created successfully!');
      }
      navigate('/contacts');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const tagOptions = formData.tags.map(tag => ({ value: tag, label: tag }));
  const groupOptions = groups.map(group => ({ 
    value: group._id, 
    label: group.name,
    color: group.color,
  }));

  const categoryOptions = [
    { value: 'Personal', label: 'Personal', icon: '👤' },
    { value: 'Business', label: 'Business', icon: '💼' },
    { value: 'Family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
    { value: 'Friends', label: 'Friends', icon: '👥' },
    { value: 'Work', label: 'Work', icon: '🏢' },
    { value: 'Other', label: 'Other', icon: '🔖' },
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active', color: '#10b981' },
    { value: 'Inactive', label: 'Inactive', color: '#6b7280' },
    { value: 'Archived', label: 'Archived', color: '#ef4444' },
  ];

  const steps = [
    { number: 1, title: 'Basic Info', icon: '👤' },
    { number: 2, title: 'Additional Details', icon: '📝' },
    { number: 3, title: 'Review & Submit', icon: '✅' },
  ];

  return (
    <motion.div
      className="contact-form-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="form-header">
        <h1>{isEditMode ? 'Edit Contact' : 'Add New Contact'}</h1>
        <p>Fill in the contact details below</p>
      </div>

      <FormWizard steps={steps} currentStep={currentStep} />

      <form onSubmit={handleSubmit} className="contact-form">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="form-step"
            >
              <div className="form-section">
                <h3>Basic Information</h3>
                
                <div className="input-group">
                  <label>
                    <FiUser className="input-icon" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>
                      <FiMail className="input-icon" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>

                  <div className="input-group">
                    <label>
                      <FiPhone className="input-icon" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                      className={errors.phone ? 'error' : ''}
                    />
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                  </div>
                </div>

                <div className="input-group">
                  <label>
                    <FiMessageSquare className="input-icon" />
                    Message (Optional)
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Any additional information..."
                    rows="3"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="form-step"
            >
              <div className="form-section">
                <h3>Advanced Details</h3>

                <div className="input-row">
                  <div className="input-group">
                    <label>Category</label>
                    <Select
                      options={categoryOptions}
                      value={categoryOptions.find(opt => opt.value === formData.category)}
                      onChange={(option) => 
                        setFormData(prev => ({ ...prev, category: option.value }))
                      }
                      formatOptionLabel={({ value, label, icon }) => (
                        <div className="select-option">
                          <span className="option-icon">{icon}</span>
                          <span>{label}</span>
                        </div>
                      )}
                      isSearchable={false}
                    />
                  </div>

                  <div className="input-group">
                    <label>Status</label>
                    <Select
                      options={statusOptions}
                      value={statusOptions.find(opt => opt.value === formData.status)}
                      onChange={(option) => 
                        setFormData(prev => ({ ...prev, status: option.value }))
                      }
                      formatOptionLabel={({ value, label, color }) => (
                        <div className="select-option">
                          <div className="status-dot" style={{ backgroundColor: color }} />
                          <span>{label}</span>
                        </div>
                      )}
                      isSearchable={false}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>
                    <FiTag className="input-icon" />
                    Tags
                  </label>
                  <CreatableSelect
                    isMulti
                    options={tagOptions}
                    value={tagOptions}
                    onChange={handleTagsChange}
                    placeholder="Add tags (press Enter to create new)"
                    className="tags-select"
                    classNamePrefix="react-select"
                  />
                </div>

                <div className="input-group">
                  <label>
                    <FiGrid className="input-icon" />
                    Groups
                  </label>
                  <Select
                    isMulti
                    options={groupOptions}
                    value={groupOptions.filter(opt => 
                      formData.groups.includes(opt.value)
                    )}
                    onChange={handleGroupsChange}
                    placeholder="Select groups"
                    className="groups-select"
                    classNamePrefix="react-select"
                    formatOptionLabel={({ label, color }) => (
                      <div className="select-option">
                        <div 
                          className="group-color" 
                          style={{ backgroundColor: color }}
                        />
                        <span>{label}</span>
                      </div>
                    )}
                  />
                </div>

                <div className="input-group">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Add private notes about this contact..."
                    rows="4"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="form-step"
            >
              <div className="form-section">
                <h3>Review & Submit</h3>
                
                <div className="review-summary">
                  <div className="review-item">
                    <span className="review-label">Name:</span>
                    <span className="review-value">{formData.name}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Email:</span>
                    <span className="review-value">{formData.email}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Phone:</span>
                    <span className="review-value">{formData.phone}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Category:</span>
                    <span className="review-value">
                      <span className={`category-badge ${formData.category.toLowerCase()}`}>
                        {formData.category}
                      </span>
                    </span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Status:</span>
                    <span className="review-value">
                      <span className={`status-badge ${formData.status.toLowerCase()}`}>
                        {formData.status}
                      </span>
                    </span>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="review-item">
                      <span className="review-label">Tags:</span>
                      <span className="review-value">
                        {formData.tags.map(tag => (
                          <span key={tag} className="tag-badge">{tag}</span>
                        ))}
                      </span>
                    </div>
                  )}
                  {formData.notes && (
                    <div className="review-item">
                      <span className="review-label">Notes:</span>
                      <span className="review-value">{formData.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="form-actions">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="btn-secondary"
            >
              Previous
            </button>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <>
                <div className="spinner-small" />
                {currentStep === 3 ? 'Saving...' : 'Processing...'}
              </>
            ) : currentStep === 3 ? (
              isEditMode ? 'Update Contact' : 'Create Contact'
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ContactForm;