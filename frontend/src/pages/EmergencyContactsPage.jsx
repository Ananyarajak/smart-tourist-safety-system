import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Modal from '../components/common/Modal';
import contactService from '../services/contactService';
import { PhoneCall, Plus, Trash2, Edit2, Star, User, Heart, AlertCircle, Check } from 'lucide-react';

const EmergencyContactsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: 'Family',
    email: '',
    isPrimary: false,
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const res = await contactService.getContacts();
      if (res.success) {
        setContacts(res.contacts);
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleOpenAdd = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      phone: '',
      relationship: 'Family',
      email: '',
      isPrimary: contacts.length === 0,
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEdit = (contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
      email: contact.email || '',
      isPrimary: contact.isPrimary,
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this emergency contact?')) return;
    try {
      await contactService.deleteContact(id);
      fetchContacts();
    } catch (err) {
      alert('Failed to delete contact: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.relationship) {
      setErrorMsg('Name, phone number, and relationship are required.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      if (editingContact) {
        await contactService.updateContact(editingContact._id, formData);
      } else {
        await contactService.createContact(formData);
      }
      setModalOpen(false);
      fetchContacts();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error saving emergency contact.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-content-wrapper">
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          pageTitle="Emergency Contacts"
        />

        <main className="main-body">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--navy-900)' }}>
                Emergency Contact Registry
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                These contacts receive automated SMS & voice alerts whenever you trigger an SOS broadcast
              </p>
            </div>

            <button onClick={handleOpenAdd} className="btn btn-teal" id="btn-add-contact">
              <Plus size={16} /> Add Emergency Contact
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {contacts.map((contact) => (
              <div
                key={contact._id}
                className="card"
                style={{
                  position: 'relative',
                  border: contact.isPrimary ? '2px solid #0d9488' : '1px solid var(--border-light)',
                }}
              >
                {contact.isPrimary && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      backgroundColor: '#ccfbf1',
                      color: '#0f766e',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                  >
                    <Star size={12} fill="#0d9488" color="#0d9488" /> PRIMARY SOS CONTACT
                  </span>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      backgroundColor: contact.isPrimary ? '#ccfbf1' : '#f1f5f9',
                      color: contact.isPrimary ? '#0d9488' : 'var(--navy-800)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <User size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-900)' }}>
                      {contact.name}
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: '#0d9488', fontWeight: 600 }}>
                      {contact.relationship}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--navy-800)' }}>
                    <PhoneCall size={15} color="#64748b" />
                    <strong>{contact.phone}</strong>
                  </div>
                  {contact.email && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      Email: {contact.email}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-light)',
                  }}
                >
                  <a
                    href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                    className="btn btn-teal btn-sm"
                    title={`Dial ${contact.phone}`}
                  >
                    <PhoneCall size={14} /> Call Now
                  </a>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleOpenEdit(contact)}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '0.35rem 0.65rem' }}
                      title="Edit Contact"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(contact._id)}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '0.35rem 0.65rem', color: '#dc2626', borderColor: '#fca5a5' }}
                      title="Delete Contact"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {contacts.length === 0 && !isLoading && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <Heart size={44} color="#dc2626" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
                No Emergency Contacts Added
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
                Adding at least one emergency contact ensures that immediate alerts and coordinates are dispatched to family or tour operators during an SOS broadcast.
              </p>
              <button onClick={handleOpenAdd} className="btn btn-teal">
                <Plus size={16} /> Add Your First Contact
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Contact Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingContact ? 'Edit Emergency Contact' : 'Add New Emergency Contact'}
        footer={
          <>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-teal"
              onClick={handleSubmit}
              disabled={isSaving}
              id="btn-save-contact"
            >
              {isSaving ? 'Saving...' : editingContact ? 'Save Changes' : 'Add Contact'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {errorMsg && (
            <div className="form-error" style={{ padding: '0.5rem', backgroundColor: '#fee2e2', borderRadius: '6px' }}>
              {errorMsg}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number (with country code) *</label>
            <input
              type="tel"
              className="form-input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1-415-555-0199"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Relationship *</label>
            <input
              type="text"
              className="form-input"
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              placeholder="e.g. Spouse, Parent, Sibling, Tour Guide, Friend"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address (Optional)</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@example.com"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.5rem' }}>
            <input
              type="checkbox"
              id="isPrimaryCheckbox"
              checked={formData.isPrimary}
              onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
              style={{ width: 16, height: 16, accentColor: '#0d9488' }}
            />
            <label htmlFor="isPrimaryCheckbox" style={{ fontSize: '0.85rem', color: 'var(--navy-900)', fontWeight: 600 }}>
              Designate as Primary Emergency Contact
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmergencyContactsPage;
