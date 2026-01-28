import React, { useState } from 'react';
import { FaTrash, FaUser } from 'react-icons/fa';

function ContactItem({ contact, onContactDeleted }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      setIsDeleting(true);
      try {
        const response = await fetch(`/api/contacts/${contact._id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          onContactDeleted(contact._id);
        } else {
          console.error('Failed to delete contact');
        }
      } catch (error) {
        console.error('Error deleting contact:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="contact-item">
      <div className="contact-cell">
        <div className="contact-avatar">
          <FaUser />
        </div>
        <div className="contact-info">
          <div className="contact-name">{contact.name}</div>
          <div className="contact-date">Added: {formatDate(contact.createdAt)}</div>
        </div>
      </div>
      <div className="contact-cell">
        <a href={`mailto:${contact.email}`} className="contact-email">
          {contact.email}
        </a>
      </div>
      <div className="contact-cell">
        <a href={`tel:${contact.phone}`} className="contact-phone">
          {contact.phone}
        </a>
      </div>
      <div className="contact-cell">
        <div className="contact-message">
          {contact.message || <em>No message</em>}
        </div>
      </div>
      <div className="contact-cell actions">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="delete-btn"
          title="Delete contact"
        >
          <FaTrash />
          {isDeleting ? ' Deleting...' : ' Delete'}
        </button>
      </div>
    </div>
  );
}

export default ContactItem;