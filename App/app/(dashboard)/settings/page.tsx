'use client';

import React, { useState, useEffect } from 'react';
import { Save, Building2, CreditCard, Users, Bell, Loader2 } from 'lucide-react';
import { CompanyApi, UploadApi } from '@/lib/api';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('business');
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await CompanyApi.getProfile();
      setCompany(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!company) return;
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const updated = await CompanyApi.updateProfile({
        name: company.name,
        workType: company.workType,
        defaultCurrency: company.defaultCurrency,
        taxRate: company.taxRate ? parseFloat(company.taxRate) : null,
        requireDeposit: company.requireDeposit,
        depositPercent: company.depositPercent ? parseFloat(company.depositPercent) : null,
        teamSize: company.teamSize,
      });
      setCompany(updated);
      
      // Dispatch a custom event to notify Sidebar/Header of the update
      window.dispatchEvent(new Event('company-updated'));
      setSuccessMsg('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      setErrorMsg(error.message || 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-8 w-full max-w-6xl mx-auto font-sans">
      
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your business profile, billing, and team preferences.</p>
        </div>
        
        {/* Floating Toast Messages */}
        <div className="flex flex-col gap-2 min-w-[250px]">
          {successMsg && (
            <div className="px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
              {errorMsg}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          <button 
            onClick={() => setActiveTab('business')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'business' ? 'bg-gray-50 text-[#346E3A]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <Building2 className="w-4 h-4" />
            Business Profile
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'billing' ? 'bg-gray-50 text-[#346E3A]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <CreditCard className="w-4 h-4" />
            Billing & Defaults
          </button>
          <button 
            onClick={() => setActiveTab('team')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'team' ? 'bg-gray-50 text-[#346E3A]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <Users className="w-4 h-4" />
            Team Settings
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'notifications' ? 'bg-gray-50 text-[#346E3A]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <Bell className="w-4 h-4" />
            Notifications
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            
            {activeTab === 'business' && (
              <div className="p-8 space-y-8 animate-in fade-in">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-1">Business Profile</h3>
                  <p className="text-sm text-gray-500">Update your company details, contact information, and registration.</p>
                </div>
                
                <div className="space-y-6 max-w-2xl">
                  {/* Logo Upload */}
                    <div className="flex items-start gap-6 pb-6 border-b border-gray-100">
                      <div className="w-24 h-24 shrink-0 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden relative group">
                        <div className="text-gray-400 text-xs font-medium uppercase tracking-wider text-center p-2 group-hover:opacity-0 transition-opacity">Upload Logo</div>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                setIsSaving(true);
                                const result = await UploadApi.uploadImage(file);
                                if (result?.url) {
                                  setCompany({ ...company, logoUrl: result.url });
                                }
                              } catch (error: any) {
                                setErrorMsg('Failed to upload logo.');
                              } finally {
                                setIsSaving(false);
                              }
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        {company?.logoUrl && (
                          <img src={company.logoUrl} className="absolute inset-0 w-full h-full object-cover z-0" alt="Company Logo" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-1">Company Logo</h4>
                        <p className="text-sm text-gray-500 max-w-md">Upload a high-resolution logo to be featured on your dashboard, proposals, and invoices. Recommended size is 256x256px.</p>
                      </div>
                    </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Business Name</label>
                      <input 
                        type="text" 
                        value={company?.name || ''} 
                        onChange={(e) => setCompany({...company, name: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all bg-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Industry</label>
                      <select 
                        value={company?.workType || ''}
                        onChange={(e) => setCompany({...company, workType: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all bg-white"
                      >
                        <option value="Software Development">Software Development</option>
                        <option value="Design Agency">Design Agency</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Consulting">Consulting</option>
                      </select>
                    </div>
                  </div>

                  {/* Contact Info (Mocked since not in Prisma Model yet) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Company Email</label>
                      <input type="email" defaultValue="hello@faiba.pro" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all bg-white" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                      <input type="tel" defaultValue="+234 800 000 0000" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all bg-white" />
                    </div>
                  </div>

                  {/* Extended Info */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Website</label>
                    <input type="url" defaultValue="https://faiba.pro" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all bg-white" />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Business Address</label>
                    <textarea rows={3} defaultValue="123 Innovation Drive, Lekki Phase 1, Lagos" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all bg-white resize-none"></textarea>
                  </div>

                  <div className="w-1/2">
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Tax ID / Registration</label>
                    <input type="text" defaultValue="RC-1234567" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all bg-white" />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-[#FBDF4B] text-gray-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#F3D740] transition-colors disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="p-8 space-y-8 animate-in fade-in">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-1">Billing & Defaults</h3>
                  <p className="text-sm text-gray-500">Configure your default currency, tax rates, and deposit requirements.</p>
                </div>
                
                <div className="space-y-6 max-w-lg">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Default Currency</label>
                      <select 
                        value={company?.defaultCurrency || 'NGN'}
                        onChange={(e) => setCompany({...company, defaultCurrency: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all bg-white"
                      >
                        <option value="NGN">NGN (₦)</option>
                        <option value="USD">USD ($)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Default Tax Rate (%)</label>
                      <input 
                        type="number" 
                        value={company?.taxRate || 0}
                        onChange={(e) => setCompany({...company, taxRate: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all bg-white" 
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2 pb-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center w-5 h-5">
                        <input 
                          type="checkbox" 
                          checked={company?.requireDeposit || false}
                          onChange={(e) => setCompany({...company, requireDeposit: e.target.checked})}
                          className="peer appearance-none w-5 h-5 border border-gray-200 rounded bg-white checked:bg-[#346E3A] checked:border-[#346E3A] transition-colors" 
                        />
                        <div className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 text-white">
                           <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Require upfront deposit by default</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Default Deposit (%)</label>
                    <input 
                      type="number" 
                      value={company?.depositPercent || 0}
                      onChange={(e) => setCompany({...company, depositPercent: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all bg-white" 
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-[#FBDF4B] text-gray-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#F3D740] transition-colors disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="p-8 animate-in fade-in">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-1">Team Settings</h3>
                <p className="text-sm text-gray-500 mb-8">Manage your team size and structure.</p>
                
                <div className="max-w-lg mb-8">
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Team Size</label>
                  <select 
                    value={company?.teamSize || ''}
                    onChange={(e) => setCompany({...company, teamSize: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all bg-white"
                  >
                    <option value="Just me (Solo)">Just me (Solo)</option>
                    <option value="2-5 people">2-5 people</option>
                    <option value="6-15 people">6-15 people</option>
                    <option value="15+ people">15+ people</option>
                  </select>
                </div>

                <div className="p-6 bg-[#F8F9FA] rounded-xl border border-gray-200 border-dashed text-center">
                  <p className="text-sm text-gray-600 mb-4 font-medium">To invite team members and assign roles, upgrade to the Agency plan.</p>
                  <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-900 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors">
                    Upgrade Plan
                  </button>
                </div>
                
                <div className="pt-6 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-[#FBDF4B] text-gray-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#F3D740] transition-colors disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="p-8 animate-in fade-in">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-1">Notifications</h3>
                <p className="text-sm text-gray-500 mb-8">Choose how you want to receive updates.</p>
                
                <div className="space-y-6">
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5 mt-0.5">
                      <input type="checkbox" defaultChecked className="peer appearance-none w-5 h-5 border border-gray-200 rounded bg-white checked:bg-[#346E3A] checked:border-[#346E3A] transition-colors" />
                      <div className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 text-white">
                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                    </div>
                    <div>
                      <span className="block text-sm font-semibold text-gray-900 group-hover:text-[#346E3A] transition-colors">Email Notifications</span>
                      <span className="block text-xs text-gray-500 mt-1">Receive updates when invoices are paid or quotes are accepted.</span>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5 mt-0.5">
                      <input type="checkbox" className="peer appearance-none w-5 h-5 border border-gray-200 rounded bg-white checked:bg-[#346E3A] checked:border-[#346E3A] transition-colors" />
                      <div className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 text-white">
                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                    </div>
                    <div>
                      <span className="block text-sm font-semibold text-gray-900 group-hover:text-[#346E3A] transition-colors">WhatsApp Notifications</span>
                      <span className="block text-xs text-gray-500 mt-1">Get instant alerts on your WhatsApp number.</span>
                    </div>
                  </label>
                </div>
                
                <div className="pt-8 mt-8 border-t border-gray-100 flex justify-end">
                  <button className="flex items-center gap-2 bg-[#FBDF4B] text-gray-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#F3D740] transition-colors">
                    <Save className="w-4 h-4" />
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
