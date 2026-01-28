import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiFileText, FiFile } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

const ExportButton = ({ filters = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const exportFormats = [
    {
      id: 'csv',
      label: 'CSV Format',
      description: 'Comma-separated values, ideal for spreadsheets',
      icon: <FiFileText />,
      color: '#10b981',
    },
    {
      id: 'json',
      label: 'JSON Format',
      description: 'JavaScript Object Notation, for developers',
      icon: <FiFile />,
      color: '#3b82f6',
    },
  ];

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const url = `/api/contacts/export/${format}?${params}`;
      
      // Create a hidden anchor element
      const link = document.createElement('a');
      link.href = url;
      link.download = `contacts_export_${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Exporting contacts as ${format.toUpperCase()}...`);
      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleQuickExport = async () => {
    setExporting(true);
    try {
      const response = await api.get('/contacts/export/csv', {
        params: filters,
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `contacts_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast.success('Contacts exported successfully!');
    } catch (error) {
      toast.error('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="export-button-container">
      <motion.button
        className="export-button"
        onClick={handleQuickExport}
        disabled={exporting}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Quick export"
        title="Quick Export (CSV)"
      >
        <FiDownload />
        {exporting ? 'Exporting...' : 'Export'}
      </motion.button>

      <div className="dropdown-container">
        <button
          className="dropdown-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Export options"
        >
          <FiDownload />
        </button>

        {isOpen && (
          <motion.div
            className="export-dropdown"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="dropdown-header">
              <h4>Export Contacts</h4>
              <p>Choose export format</p>
            </div>

            <div className="format-options">
              {exportFormats.map((format) => (
                <motion.button
                  key={format.id}
                  className="format-option"
                  onClick={() => handleExport(format.id)}
                  disabled={exporting}
                  whileHover={{ x: 5 }}
                  style={{ '--format-color': format.color }}
                >
                  <div className="format-icon">{format.icon}</div>
                  <div className="format-info">
                    <strong>{format.label}</strong>
                    <small>{format.description}</small>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="dropdown-footer">
              <p className="export-info">
                <small>
                  Export includes all contacts matching current filters
                </small>
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ExportButton;