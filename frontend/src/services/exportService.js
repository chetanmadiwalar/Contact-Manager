import { api } from './api';
import toast from 'react-hot-toast';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

class ExportService {
  // Available export formats
  static FORMATS = {
    CSV: 'csv',
    JSON: 'json',
    EXCEL: 'xlsx',
    PDF: 'pdf'
  };

  // Available data types
  static DATA_TYPES = {
    CONTACTS: 'contacts',
    GROUPS: 'groups',
    ACTIVITIES: 'activities',
    ANALYTICS: 'analytics'
  };

  /**
   * Export data in specified format
   * @param {string} dataType - Type of data to export
   * @param {string} format - Export format
   * @param {Object} filters - Filters to apply
   * @param {Array} selectedIds - Specific IDs to export
   * @returns {Promise<void>}
   */
  static async exportData(dataType, format, filters = {}, selectedIds = []) {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      let filename = '';
      let data = [];

      switch (dataType) {
        case this.DATA_TYPES.CONTACTS:
          data = await this.fetchContacts(filters, selectedIds);
          filename = `contacts_${timestamp}`;
          break;

        case this.DATA_TYPES.GROUPS:
          data = await this.fetchGroups(filters);
          filename = `groups_${timestamp}`;
          break;

        case this.DATA_TYPES.ACTIVITIES:
          data = await this.fetchActivities(filters);
          filename = `activities_${timestamp}`;
          break;

        case this.DATA_TYPES.ANALYTICS:
          data = await this.fetchAnalytics(filters);
          filename = `analytics_${timestamp}`;
          break;

        default:
          throw new Error(`Unsupported data type: ${dataType}`);
      }

      switch (format) {
        case this.FORMATS.CSV:
          await this.exportToCSV(data, filename);
          break;

        case this.FORMATS.JSON:
          await this.exportToJSON(data, filename);
          break;

        case this.FORMATS.EXCEL:
          await this.exportToExcel(data, filename);
          break;

        case this.FORMATS.PDF:
          await this.exportToPDF(data, filename, dataType);
          break;

        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      this.trackExport(dataType, format, data.length);
      return true;
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(`Export failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Quick export for contacts (most common use case)
   * @param {Object} filters - Contact filters
   * @param {Array} selectedIds - Selected contact IDs
   * @param {string} format - Export format
   */
  static async exportContacts(filters = {}, selectedIds = [], format = this.FORMATS.CSV) {
    return this.exportData(this.DATA_TYPES.CONTACTS, format, filters, selectedIds);
  }

  /**
   * Fetch contacts with filters
   */
  static async fetchContacts(filters = {}, selectedIds = []) {
    try {
      const params = { ...filters, limit: 10000 }; // Increased limit for export
      
      if (selectedIds.length > 0) {
        // If specific IDs are selected, fetch them individually
        const promises = selectedIds.map(id => 
          api.get(`/contacts/${id}`).catch(() => null)
        );
        const results = await Promise.all(promises);
        return results.filter(Boolean).map(res => res.data);
      } else {
        // Fetch with filters
        const response = await api.get('/contacts', { params });
        return response.data || [];
      }
    } catch (error) {
      console.error('Failed to fetch contacts for export:', error);
      throw error;
    }
  }

  /**
   * Fetch groups
   */
  static async fetchGroups(filters = {}) {
    try {
      const response = await api.get('/groups', { params: filters });
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch groups for export:', error);
      throw error;
    }
  }

  /**
   * Fetch activities
   */
  static async fetchActivities(filters = {}) {
    try {
      const params = { ...filters, limit: 10000 };
      const response = await api.get('/analytics/activities', { params });
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch activities for export:', error);
      throw error;
    }
  }

  /**
   * Fetch analytics data
   */
  static async fetchAnalytics(filters = {}) {
    try {
      const response = await api.get('/analytics/dashboard', { params: filters });
      return response.data || {};
    } catch (error) {
      console.error('Failed to fetch analytics for export:', error);
      throw error;
    }
  }

  /**
   * Export data to CSV format
   */
  static async exportToCSV(data, filename) {
    return new Promise((resolve, reject) => {
      try {
        let csvData = [];
        
        if (Array.isArray(data)) {
          // Convert array of objects to CSV
          csvData = Papa.unparse(data, {
            header: true,
            delimiter: ',',
            quotes: true,
            escapeFormulae: true // Security: escape formulas
          });
        } else if (typeof data === 'object') {
          // For single object or nested data
          csvData = Papa.unparse([data], {
            header: true,
            delimiter: ',',
            quotes: true,
            escapeFormulae: true
          });
        }

        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, `${filename}.csv`);
        
        toast.success(`Exported ${Array.isArray(data) ? data.length : 1} records as CSV`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Export data to JSON format
   */
  static async exportToJSON(data, filename) {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      saveAs(blob, `${filename}.json`);
      
      toast.success(`Exported data as JSON`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Export data to Excel format (using CSV for simplicity)
   * In production, you would use a library like xlsx
   */
  static async exportToExcel(data, filename) {
    try {
      // Convert to CSV first (simplified Excel export)
      const csvData = Papa.unparse(data, {
        header: true,
        delimiter: ',',
        quotes: true,
        escapeFormulae: true
      });

      const blob = new Blob([csvData], { 
        type: 'application/vnd.ms-excel' 
      });
      saveAs(blob, `${filename}.xls`);
      
      toast.success(`Exported ${data.length} records as Excel`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Export data to PDF format (placeholder)
   * In production, use a library like jspdf or pdfmake
   */
  static async exportToPDF(data, filename, dataType) {
    try {
      // Create a simple PDF using html2pdf or similar
      const content = this.generatePDFContent(data, dataType);
      
      // This is a simplified version - in production, use a proper PDF library
      const blob = new Blob([content], { type: 'application/pdf' });
      saveAs(blob, `${filename}.pdf`);
      
      toast.success(`Generated PDF report`);
    } catch (error) {
      // Fallback to JSON if PDF generation fails
      console.warn('PDF generation failed, falling back to JSON:', error);
      await this.exportToJSON(data, filename);
    }
  }

  /**
   * Generate PDF content
   */
  static generatePDFContent(data, dataType) {
    const timestamp = new Date().toLocaleString();
    let content = `%PDF-1.4\n`;
    content += `% Contact Management System Export\n`;
    content += `% Data Type: ${dataType}\n`;
    content += `% Generated: ${timestamp}\n\n`;
    
    // Simplified PDF content - in production, use a proper PDF generation library
    if (Array.isArray(data)) {
      content += `Total Records: ${data.length}\n\n`;
      data.forEach((item, index) => {
        content += `${index + 1}. ${JSON.stringify(item, null, 2)}\n\n`;
      });
    } else {
      content += JSON.stringify(data, null, 2);
    }
    
    return content;
  }

  /**
   * Format contact data for export
   */
  static formatContactData(contacts) {
    return contacts.map(contact => ({
      'ID': contact._id,
      'Name': contact.name,
      'Email': contact.email,
      'Phone': contact.phone,
      'Category': contact.category,
      'Status': contact.status,
      'Starred': contact.starred ? 'Yes' : 'No',
      'Tags': Array.isArray(contact.tags) ? contact.tags.join(', ') : '',
      'Groups': Array.isArray(contact.groups) ? contact.groups.length : 0,
      'Created Date': new Date(contact.createdAt).toLocaleDateString(),
      'Last Updated': new Date(contact.updatedAt).toLocaleDateString(),
      'Notes': contact.notes || '',
      'Message': contact.message || ''
    }));
  }

  /**
   * Format group data for export
   */
  static formatGroupData(groups) {
    return groups.map(group => ({
      'ID': group._id,
      'Name': group.name,
      'Description': group.description || '',
      'Color': group.color,
      'Icon': group.icon,
      'Contact Count': group.contactCount || 0,
      'Privacy': group.isPrivate ? 'Private' : 'Public',
      'Created Date': new Date(group.createdAt).toLocaleDateString()
    }));
  }

  /**
   * Format activity data for export
   */
  static formatActivityData(activities) {
    return activities.map(activity => ({
      'ID': activity._id,
      'Action': activity.action,
      'Entity Type': activity.entityType,
      'Entity Name': activity.entityName || '',
      'Performed By': activity.performedBy,
      'IP Address': activity.ipAddress || '',
      'Timestamp': new Date(activity.timestamp).toLocaleString(),
      'Changes': activity.changes ? JSON.stringify(activity.changes) : ''
    }));
  }

  /**
   * Track export activity
   */
  static async trackExport(dataType, format, count) {
    try {
      await api.post('/analytics/export', {
        dataType,
        format,
        count,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Failed to track export:', error);
    }
  }

  /**
   * Get export history
   */
  static async getExportHistory(limit = 10) {
    try {
      const response = await api.get('/analytics/exports', { params: { limit } });
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch export history:', error);
      return [];
    }
  }

  /**
   * Get export statistics
   */
  static async getExportStats() {
    try {
      const response = await api.get('/analytics/export-stats');
      return response.data || {};
    } catch (error) {
      console.error('Failed to fetch export stats:', error);
      return {};
    }
  }

  /**
   * Generate download link for large exports
   */
  static async generateDownloadLink(dataType, filters = {}, format = this.FORMATS.CSV) {
    try {
      const response = await api.post('/exports/generate', {
        dataType,
        filters,
        format
      });
      
      if (response.url) {
        return response.url;
      }
      
      throw new Error('No download URL generated');
    } catch (error) {
      console.error('Failed to generate download link:', error);
      throw error;
    }
  }

  /**
   * Check if export is available (for large datasets)
   */
  static async checkExportAvailability(dataType, filters = {}) {
    try {
      const response = await api.get('/exports/availability', {
        params: { dataType, ...filters }
      });
      return response.data || { available: true, estimatedSize: 0 };
    } catch (error) {
      console.error('Failed to check export availability:', error);
      return { available: false, estimatedSize: 0 };
    }
  }

  /**
   * Get export templates
   */
  static getExportTemplates() {
    return {
      'Basic Contact List': {
        fields: ['Name', 'Email', 'Phone', 'Category'],
        description: 'Simple contact information'
      },
      'Full Contact Details': {
        fields: ['Name', 'Email', 'Phone', 'Category', 'Status', 'Tags', 'Notes'],
        description: 'Complete contact information'
      },
      'Contact Analytics': {
        fields: ['Name', 'Category', 'Status', 'Created Date', 'Last Contacted'],
        description: 'Contact statistics and timeline'
      },
      'Group Report': {
        fields: ['Group Name', 'Contact Count', 'Description', 'Created Date'],
        description: 'Group membership report'
      }
    };
  }

  /**
   * Validate export parameters
   */
  static validateExportParams(dataType, format, filters) {
    const errors = [];
    
    if (!this.DATA_TYPES[dataType.toUpperCase()]) {
      errors.push(`Invalid data type: ${dataType}`);
    }
    
    if (!this.FORMATS[format.toUpperCase()]) {
      errors.push(`Invalid format: ${format}`);
    }
    
    // Validate date filters
    if (filters.startDate || filters.endDate) {
      const start = filters.startDate ? new Date(filters.startDate) : null;
      const end = filters.endDate ? new Date(filters.endDate) : null;
      
      if (start && isNaN(start.getTime())) {
        errors.push('Invalid start date');
      }
      
      if (end && isNaN(end.getTime())) {
        errors.push('Invalid end date');
      }
      
      if (start && end && start > end) {
        errors.push('Start date cannot be after end date');
      }
    }
    
    return errors;
  }
}

export default ExportService;