import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Edit2, Shield, User } from 'lucide-react';
import { ClientsApi } from '@/lib/api';

interface EditClientSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string | null;
  onClientUpdated: () => void;
}

export default function EditClientSlideOver({ isOpen, onClose, clientId, onClientUpdated }: EditClientSlideOverProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'contacts'>('details');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Client Data
  const [clientData, setClientData] = useState<any>(null);
  
  // Contact Form State
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    isPrimary: false
  });

  useEffect(() => {
    if (isOpen && clientId) {
      fetchClientData();
      setActiveTab('details');
      setShowContactForm(false);
    }
  }, [isOpen, clientId]);

  const fetchClientData = async () => {
    if (!clientId) return;
    try {
      setIsLoading(true);
      const data = await ClientsApi.getById(clientId);
      setClientData(data);
    } catch (err) {
      console.error('Failed to fetch client:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateClient = async () => {
    if (!clientId || !clientData) return;
    try {
      setIsSaving(true);
      await ClientsApi.update(clientId, {
        companyName: clientData.companyName,
        name: clientData.name,
        email: clientData.email,
        whatsappNumber: clientData.whatsappNumber,
        country: clientData.country,
        city: clientData.city,
        address: clientData.address,
        taxId: clientData.taxId,
        notes: clientData.notes,
        preferredChannel: clientData.preferredChannel,
      });
      onClientUpdated();
      // Show success toast here usually
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveContact = async () => {
    if (!clientId) return;
    try {
      setIsSaving(true);
      if (editingContactId) {
        await ClientsApi.updateContact(clientId, editingContactId, contactForm);
      } else {
        await ClientsApi.addContact(clientId, contactForm);
      }
      await fetchClientData();
      setShowContactForm(false);
      setEditingContactId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!clientId) return;
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      await ClientsApi.deleteContact(clientId, contactId);
      await fetchClientData();
    } catch (err) {
      console.error(err);
    }
  };

  const openNewContact = () => {
    setContactForm({ name: '', email: '', phone: '', role: '', isPrimary: false });
    setEditingContactId(null);
    setShowContactForm(true);
  };

  const openEditContact = (contact: any) => {
    setContactForm({
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      role: contact.role || '',
      isPrimary: contact.isPrimary || false
    });
    setEditingContactId(contact.id);
    setShowContactForm(true);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity" 
        onClick={onClose}
      />
      
      {/* Slide-over */}
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isLoading ? 'Loading...' : (clientData?.companyName || clientData?.name || 'Edit Client')}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Manage details and contacts</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 pt-2">
          <button 
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'details' ? 'border-[#6D9773] text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Company Details
          </button>
          <button 
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'contacts' ? 'border-[#6D9773] text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Team / Contacts
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : activeTab === 'details' && clientData ? (
            <div className="space-y-5">
              
              {clientData.clientType === 'BUSINESS' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Company Name</label>
                  <input 
                    type="text" 
                    value={clientData.companyName || ''}
                    onChange={(e) => setClientData({...clientData, companyName: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#6D9773] focus:ring-1 focus:ring-[#6D9773]" 
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Primary Name (Legacy)</label>
                <input 
                  type="text" 
                  value={clientData.name || ''}
                  onChange={(e) => setClientData({...clientData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#6D9773] focus:ring-1 focus:ring-[#6D9773]" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  value={clientData.email || ''}
                  onChange={(e) => setClientData({...clientData, email: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#6D9773] focus:ring-1 focus:ring-[#6D9773]" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Phone / WhatsApp</label>
                <input 
                  type="tel" 
                  value={clientData.whatsappNumber || ''}
                  onChange={(e) => setClientData({...clientData, whatsappNumber: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#6D9773] focus:ring-1 focus:ring-[#6D9773]" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Country</label>
                  <input 
                    type="text" 
                    value={clientData.country || ''}
                    onChange={(e) => setClientData({...clientData, country: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#6D9773] focus:ring-1 focus:ring-[#6D9773]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">City</label>
                  <input 
                    type="text" 
                    value={clientData.city || ''}
                    onChange={(e) => setClientData({...clientData, city: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#6D9773] focus:ring-1 focus:ring-[#6D9773]" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Tax ID / VAT</label>
                <input 
                  type="text" 
                  value={clientData.taxId || ''}
                  onChange={(e) => setClientData({...clientData, taxId: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#6D9773] focus:ring-1 focus:ring-[#6D9773]" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Notes</label>
                <textarea 
                  value={clientData.notes || ''}
                  onChange={(e) => setClientData({...clientData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#6D9773] focus:ring-1 focus:ring-[#6D9773]" 
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={handleUpdateClient}
                  disabled={isSaving}
                  className="px-6 py-2 bg-[#FFBA00] text-gray-900 text-sm font-bold rounded-lg hover:bg-[#E6A700] flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </div>
          ) : activeTab === 'contacts' && clientData ? (
            
            showContactForm ? (
              <div className="space-y-5 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{editingContactId ? 'Edit Contact' : 'New Contact'}</h3>
                  <button onClick={() => setShowContactForm(false)} className="text-gray-400 hover:text-gray-900"><X className="w-4 h-4"/></button>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Name *</label>
                  <input 
                    type="text" 
                    value={contactForm.name}
                    onChange={e => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#6D9773]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Email</label>
                  <input 
                    type="email" 
                    value={contactForm.email}
                    onChange={e => setContactForm({...contactForm, email: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#6D9773]" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Phone</label>
                    <input 
                      type="tel" 
                      value={contactForm.phone}
                      onChange={e => setContactForm({...contactForm, phone: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#6D9773]" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Role/Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Marketing Lead"
                      value={contactForm.role}
                      onChange={e => setContactForm({...contactForm, role: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#6D9773]" 
                    />
                  </div>
                </div>
                
                <label className="flex items-center gap-2 cursor-pointer mt-2">
                  <input 
                    type="checkbox" 
                    checked={contactForm.isPrimary}
                    onChange={e => setContactForm({...contactForm, isPrimary: e.target.checked})}
                    className="rounded border-gray-300 text-[#6D9773] focus:ring-[#6D9773]" 
                  />
                  <span className="text-sm font-semibold text-gray-700">Set as Primary Contact</span>
                </label>

                <div className="flex gap-2 justify-end pt-4">
                  <button onClick={() => setShowContactForm(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
                  <button 
                    onClick={handleSaveContact} 
                    disabled={isSaving || !contactForm.name}
                    className="px-4 py-2 text-sm font-bold bg-gray-900 text-white rounded-lg hover:bg-black disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Contact'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <button 
                  onClick={openNewContact}
                  className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Additional Contact
                </button>

                <div className="space-y-3">
                  {clientData.contacts?.map((contact: any) => (
                    <div key={contact.id} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex items-start justify-between group">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900">{contact.name}</h4>
                          {contact.isPrimary && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase">
                              <Shield className="w-3 h-3" /> Primary
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                          {contact.role && <div>{contact.role}</div>}
                          {contact.email && <div>{contact.email}</div>}
                          {contact.phone && <div>{contact.phone}</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditContact(contact)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteContact(contact.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {clientData.contacts?.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No additional contacts found.
                    </div>
                  )}
                </div>
              </div>
            )

          ) : null}
        </div>
      </div>
    </>
  );
}
