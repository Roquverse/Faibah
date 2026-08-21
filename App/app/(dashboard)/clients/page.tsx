'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreHorizontal, Filter, DownloadCloud, Columns, ChevronDown, CheckCircle2, Upload, User, Image, FileText, Receipt, Trash2, Mail, MessageCircle, MapPin, X, Check } from 'lucide-react';
import Link from 'next/link';
import { ClientsApi } from '@/lib/api';
import EditClientSlideOver from '@/components/dashboard/EditClientSlideOver';

interface Client {
  id: string;
  clientType: 'INDIVIDUAL' | 'BUSINESS';
  companyName: string | null;
  name: string;
  email: string | null;
  whatsappNumber: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  taxId: string | null;
  logoUrl: string | null;
  preferredChannel: 'WHATSAPP' | 'EMAIL' | 'BOTH' | null;
  referralSource: string | null;
  notes: string | null;
  currency: string;
  createdAt: string;

  // Computed from backend
  activeProjects: number;
  totalBilled: number;
  outstanding: number;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  
  // Modal State
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [clientType, setClientType] = useState<'INDIVIDUAL' | 'BUSINESS'>('INDIVIDUAL');
  const [companyName, setCompanyName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [taxId, setTaxId] = useState('');
  const [notes, setNotes] = useState('');
  const [preferredChannel, setPreferredChannel] = useState<'WHATSAPP' | 'EMAIL' | 'BOTH' | ''>('');
  const [referralSource, setReferralSource] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const data = await ClientsApi.getAll();
      setClients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveClient = async () => {
    try {
      setIsSaving(true);
      await ClientsApi.create({
        clientType,
        companyName: clientType === 'BUSINESS' ? companyName : null,
        firstName,
        lastName,
        email,
        whatsappNumber: phoneNumber ? `${phonePrefix} ${phoneNumber}`.trim() : null,
        country,
        city,
        address,
        taxId: clientType === 'BUSINESS' ? taxId : null,
        notes,
        preferredChannel: preferredChannel || null,
        referralSource
      });
      setIsNewClientModalOpen(false);
      fetchClients();
      
      // Reset form
      setClientType('INDIVIDUAL');
      setCompanyName('');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhoneNumber('');
      setNotes('');
      setTaxId('');
      setCountry('');
      setCity('');
      setAddress('');
      setPreferredChannel('');
      setReferralSource('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedClients.length === clients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clients.map(c => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedClients.includes(id)) {
      setSelectedClients(selectedClients.filter(cId => cId !== id));
    } else {
      setSelectedClients([...selectedClients, id]);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  return (
    <div className="p-8 w-full">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Clients</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <DownloadCloud className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={() => setIsNewClientModalOpen(true)}
            className="flex items-center gap-2 bg-[#FBDF4B] text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#F3D53C] transition-colors border border-transparent"
          >
            <Plus className="w-4 h-4" />
            New Client
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[300px]">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder="Search clients..." 
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-300 transition-colors"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Sort By: <span className="text-gray-900">Latest</span>
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Columns className="w-4 h-4" />
              Column
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {/* Main Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F8F9FA] border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 w-12">
                  <div className="flex items-center justify-center">
                    <button 
                      onClick={toggleSelectAll}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        selectedClients.length === clients.length && clients.length > 0
                          ? 'bg-indigo-600 border-indigo-600' 
                          : 'border-gray-300 hover:border-gray-400 bg-white'
                      }`}
                    >
                      {selectedClients.length === clients.length && clients.length > 0 && <Check className="w-3 h-3 text-white" />}
                    </button>
                  </div>
                </th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Country</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center">Active Projects</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">Total Billed</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">Outstanding</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Client Since</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    Loading clients...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    No clients found. Add a new client to get started.
                  </td>
                </tr>
              ) : clients.map((client) => (
                <tr 
                  key={client.id} 
                  className={`hover:bg-gray-50/50 transition-colors ${
                    selectedClients.includes(client.id) ? 'bg-indigo-50/30' : 'bg-white'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <button 
                        onClick={() => toggleSelect(client.id)}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          selectedClients.includes(client.id)
                            ? 'bg-indigo-600 border-indigo-600' 
                            : 'border-gray-300 hover:border-gray-400 bg-white'
                        }`}
                      >
                        {selectedClients.includes(client.id) && <Check className="w-3 h-3 text-white" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0 overflow-hidden">
                        {client.logoUrl ? (
                          <img src={client.logoUrl} alt={client.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-semibold text-gray-600 text-sm">
                            {client.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{client.name}</div>
                        {client.clientType === 'BUSINESS' && client.companyName && (
                          <div className="text-xs text-gray-500 mt-0.5">{client.companyName}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-sm text-gray-600 font-medium">
                      {client.whatsappNumber ? (
                        <div className="flex items-center gap-1.5">
                          <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                          {client.whatsappNumber}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic">No phone</span>
                      )}
                      {client.email ? (
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                          <Mail className="w-3.5 h-3.5" />
                          {client.email}
                        </div>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">
                    {client.country ? (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {client.country}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
                      {client.activeProjects}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium text-right">
                    {formatCurrency(client.totalBilled, client.currency)}
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    {client.outstanding > 0 ? (
                      <span className="text-red-600">{formatCurrency(client.outstanding, client.currency)}</span>
                    ) : (
                      <span className="text-gray-400">{formatCurrency(0, client.currency)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(client.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
                        <FileText className="w-3.5 h-3.5" /> Proposal
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
                        <Receipt className="w-3.5 h-3.5" /> Invoice
                      </button>
                      <button 
                        onClick={() => setEditingClientId(client.id)}
                        className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            Row Per Page
            <select className="border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-gray-300">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
            Entries
          </div>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 text-sm font-medium text-gray-400 hover:text-gray-900">&laquo;</button>
            <button className="px-3 py-1 text-sm font-medium text-gray-900 bg-gray-50 rounded-lg">1</button>
            <button className="px-3 py-1 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-lg">2</button>
            <button className="px-3 py-1 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-lg">3</button>
            <button className="px-3 py-1 text-sm font-medium text-gray-400 hover:text-gray-900">&raquo;</button>
          </div>
        </div>
      </div>

      {/* New Client Modal */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Create New Contact</h2>
              <button 
                onClick={() => setIsNewClientModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Type Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1 w-full max-w-sm">
                <button 
                  onClick={() => setClientType('INDIVIDUAL')}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors ${clientType === 'INDIVIDUAL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Individual
                </button>
                <button 
                  onClick={() => setClientType('BUSINESS')}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors ${clientType === 'BUSINESS' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Business
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                
                {clientType === 'BUSINESS' && (
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[13px] font-medium text-gray-700">Company Name *</label>
                    <input 
                      type="text" 
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Corporation" 
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-gray-400" 
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-gray-700">First name</label>
                  <input 
                    type="text" 
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="e.g. Sarah" 
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-gray-400" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-gray-700">Last name</label>
                  <input 
                    type="text" 
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="e.g. Jenkins" 
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-gray-400" 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-gray-700">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="sarah@example.com" 
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-gray-400" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-gray-700">WhatsApp Number</label>
                  <div className="flex gap-2">
                    <select 
                      value={phonePrefix}
                      onChange={e => setPhonePrefix(e.target.value)}
                      className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500"
                    >
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+234">+234</option>
                    </select>
                    <input 
                      type="tel" 
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      placeholder="(303) 555-0105" 
                      className="flex-1 px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-gray-400" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-gray-700">Country</label>
                  <div className="relative">
                    <select 
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 appearance-none"
                    >
                      <option value="">Select country...</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Nigeria">Nigeria</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {clientType === 'BUSINESS' && (
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-gray-700">Tax ID / VAT Number</label>
                    <input 
                      type="text" 
                      value={taxId}
                      onChange={e => setTaxId(e.target.value)}
                      placeholder="e.g. GB123456789" 
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-gray-400" 
                    />
                  </div>
                )}

                <div className={`space-y-1.5 ${clientType === 'INDIVIDUAL' ? 'col-span-1' : 'col-span-2'}`}>
                  <label className="text-[13px] font-medium text-gray-700">Notes</label>
                  <textarea 
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. Prefers WhatsApp over email" 
                    rows={2}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-gray-400 resize-none" 
                  />
                </div>

                {/* Optional Section */}
                <div className="col-span-2 mt-4 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">More Details (Optional)</h3>
                  
                  <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[13px] font-medium text-gray-700">Client Logo</label>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-200 border-dashed">
                          <Image className="w-5 h-5 text-gray-400" />
                        </div>
                        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                          Upload Image
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium text-gray-700">City</label>
                      <input 
                        type="text" 
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="e.g. New York" 
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-gray-400" 
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium text-gray-700">Preferred Channel</label>
                      <div className="relative">
                        <select 
                          value={preferredChannel}
                          onChange={e => setPreferredChannel(e.target.value as any)}
                          className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 appearance-none"
                        >
                          <option value="">Use Agency Default</option>
                          <option value="WHATSAPP">WhatsApp</option>
                          <option value="EMAIL">Email</option>
                          <option value="BOTH">Both</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[13px] font-medium text-gray-700">Billing Address</label>
                      <input 
                        type="text" 
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="123 Market St..." 
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-gray-400" 
                      />
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
              <button 
                onClick={() => setIsNewClientModalOpen(false)}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveClient}
                disabled={isSaving}
                className="px-8 py-2.5 bg-[#FBDF4B] text-gray-900 text-sm font-bold rounded-xl hover:bg-[#F3D53C] transition-colors border border-transparent disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Client'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Edit Client Slide-Over */}
      <EditClientSlideOver 
        isOpen={!!editingClientId}
        onClose={() => setEditingClientId(null)}
        clientId={editingClientId}
        onClientUpdated={fetchClients}
      />
    </div>
  );
}
