'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, CreditCard, Users, Bell, Loader2,
  User, Shield, Palette, LayoutGrid, Globe, ChevronRight, Save
} from 'lucide-react';
import { CompanyApi, UploadApi, UsersApi } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Appearance State
  const { theme, setTheme } = useTheme();
  const [primaryColor, setPrimaryColor] = useState('#1C0A3E');

  // Notifications State (Mocked for UI)
  const [emailDigest, setEmailDigest] = useState(true);
  const [payrollAlerts, setPayrollAlerts] = useState(true);
  const [newApplicants, setNewApplicants] = useState(false);
  const [mentions, setMentions] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);

  useEffect(() => {
    loadProfile();
    // Load saved primary color
    const savedColor = localStorage.getItem('primaryColor');
    if (savedColor) {
      setPrimaryColor(savedColor);
    }
  }, []);

  const loadProfile = async () => {
    try {
      const [companyData, userData] = await Promise.all([
        CompanyApi.getProfile(),
        UsersApi.getProfile()
      ]);
      setCompany(companyData);
      setUser(userData);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    const sanitizedOld = oldPassword.trim();
    const sanitizedNew = newPassword.trim();
    const sanitizedConfirm = confirmPassword.trim();

    if (!sanitizedOld) {
      setErrorMsg('Please enter your current password');
      return;
    }
    if (sanitizedNew !== sanitizedConfirm) {
      setErrorMsg('New passwords do not match');
      return;
    }
    if (sanitizedNew.length < 8) {
      setErrorMsg('New password must be at least 8 characters');
      return;
    }

    try {
      setIsChangingPassword(true);
      const supabase = createClient();
      
      // Verify old password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: sanitizedOld,
      });

      if (signInError) {
        throw new Error('Incorrect current password');
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({ 
        password: sanitizedNew 
      });
      
      if (updateError) throw updateError;
      
      setSuccessMsg('Password updated successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSave = async () => {
    if (!company && activeTab !== 'notifications') return;
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      if (activeTab === 'profile') {
        const updated = await UsersApi.updateProfile({
          firstName: user.firstName?.trim() || '',
          lastName: user.lastName?.trim() || '',
          avatarUrl: user.avatarUrl,
        });
        setUser(updated);
      }

      if (activeTab === 'business' || activeTab === 'billing' || activeTab === 'team') {
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
        window.dispatchEvent(new Event('company-updated'));
      }
      if (activeTab === 'appearance') {
        localStorage.setItem('primaryColor', primaryColor);
      }
      
      setSuccessMsg('Settings saved successfully!');
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

  const TABS = [
    { id: 'profile', icon: User, label: 'My Profile' },
    { id: 'business', icon: Building2, label: 'Company' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'security', icon: Shield, label: 'Security' },
    { id: 'billing', icon: CreditCard, label: 'Billing & Plan' },
    { id: 'team', icon: Users, label: 'Team & Roles' },
    { id: 'appearance', icon: Palette, label: 'Appearance' },
  ];

  return (
    <div className="p-8 w-full font-sans min-h-screen bg-[#F8F9FA]">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your profile, workspace, and platform preferences.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {successMsg && (
            <div className="px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-right-4 mr-2">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-right-4 mr-2">
              {errorMsg}
            </div>
          )}
          
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-[#1C0A3E] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#2A105D] transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-[240px] shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-2 space-y-0.5">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-[#F4F1FA] text-gray-900' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className={`w-4 h-4 ${isActive ? 'text-gray-900' : 'text-gray-500'}`} />
                    {tab.label}
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-gray-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
            
            {activeTab === 'profile' && (
              <div className="animate-in fade-in max-w-3xl">
                <div className="mb-6">
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">My Profile</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage your personal information and login credentials.</p>
                </div>
                
                <div className="border border-gray-200 rounded-xl bg-white p-6 md:p-8 space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex items-start gap-6 pb-6 border-b border-gray-100">
                    <div className="w-20 h-20 shrink-0 bg-[#F4F1FA] rounded-full flex items-center justify-center overflow-hidden relative group">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-[#1C0A3E]" />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <span className="text-white text-[10px] font-bold uppercase tracking-wider">Change</span>
                      </div>
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
                                setUser({ ...user, avatarUrl: result.url });
                              }
                            } catch (error: any) {
                              setErrorMsg('Failed to upload avatar.');
                            } finally {
                              setIsSaving(false);
                            }
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                    </div>
                    <div className="pt-2">
                      <h4 className="text-sm font-bold text-gray-900 mb-1">Profile Photo</h4>
                      <p className="text-sm text-gray-500 max-w-md">Recommended size is 256x256px.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">First Name</label>
                      <input 
                        type="text" 
                        value={user?.firstName || ''}
                        onChange={(e) => setUser({...user, firstName: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all bg-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Last Name</label>
                      <input 
                        type="text" 
                        value={user?.lastName || ''}
                        onChange={(e) => setUser({...user, lastName: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all bg-white" 
                      />
                    </div>
                  </div>

                  <div className="pb-6 border-b border-gray-100">
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                    <input 
                      type="email" 
                      value={user?.email || ''}
                      readOnly
                      className="w-full md:w-1/2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed" 
                    />
                    <p className="text-xs text-gray-400 mt-2">Email is linked to your authentication provider.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="animate-in fade-in max-w-3xl">
                <div className="mb-6">
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">Notification Preferences</h3>
                  <p className="text-sm text-gray-500 mt-1">Choose how and when you'd like to be notified.</p>
                </div>
                
                <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                  
                  {/* Toggle Item */}
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-gray-900">Email digest</div>
                      <div className="text-sm text-gray-500 mt-1">Daily summary of key HR activity.</div>
                    </div>
                    <button 
                      onClick={() => setEmailDigest(!emailDigest)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailDigest ? 'bg-[#1C0A3E]' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${emailDigest ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                  {/* Toggle Item */}
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-gray-900">Payroll alerts</div>
                      <div className="text-sm text-gray-500 mt-1">Notify me before each payroll cycle.</div>
                    </div>
                    <button 
                      onClick={() => setPayrollAlerts(!payrollAlerts)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${payrollAlerts ? 'bg-[#1C0A3E]' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${payrollAlerts ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                  {/* Toggle Item */}
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-gray-900">New applicants</div>
                      <div className="text-sm text-gray-500 mt-1">Push notification when a new candidate applies.</div>
                    </div>
                    <button 
                      onClick={() => setNewApplicants(!newApplicants)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${newApplicants ? 'bg-[#1C0A3E]' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${newApplicants ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                  {/* Toggle Item */}
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-gray-900">Mentions</div>
                      <div className="text-sm text-gray-500 mt-1">Email me when teammates @mention me.</div>
                    </div>
                    <button 
                      onClick={() => setMentions(!mentions)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${mentions ? 'bg-[#1C0A3E]' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${mentions ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                  {/* Toggle Item */}
                  <div className="p-5 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-gray-900">Product updates</div>
                      <div className="text-sm text-gray-500 mt-1">Occasional emails about new features.</div>
                    </div>
                    <button 
                      onClick={() => setProductUpdates(!productUpdates)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${productUpdates ? 'bg-[#1C0A3E]' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${productUpdates ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                </div>
              </div>
            )}

            {activeTab === 'business' && (
              <div className="animate-in fade-in max-w-3xl">
                <div className="mb-6">
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">Business Profile</h3>
                  <p className="text-sm text-gray-500 mt-1">Update your company details, contact information, and registration.</p>
                </div>
                
                <div className="border border-gray-200 rounded-xl bg-white p-6 md:p-8 space-y-6">
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

                  {/* Contact Info */}
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
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="animate-in fade-in max-w-3xl">
                <div className="mb-6">
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">Billing & Defaults</h3>
                  <p className="text-sm text-gray-500 mt-1">Configure your default currency, tax rates, and deposit requirements.</p>
                </div>
                
                <div className="border border-gray-200 rounded-xl bg-white p-6 md:p-8 space-y-6">
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
              </div>
            )}

            {activeTab === 'team' && (
              <div className="animate-in fade-in max-w-3xl">
                <div className="mb-6">
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">Team Settings</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage your team size and structure.</p>
                </div>
                
                <div className="border border-gray-200 rounded-xl bg-white p-6 md:p-8">
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
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="animate-in fade-in max-w-3xl">
                <div className="mb-6">
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">Security</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage your account security and authentication methods.</p>
                </div>
                
                <div className="border border-gray-200 rounded-xl bg-white p-6 md:p-8 space-y-6">
                  <div className="pt-2">
                    <h4 className="text-sm font-bold text-gray-900 mb-4">Change Password</h4>
                    <div className="mb-6 max-w-md">
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Current Password</label>
                      <input 
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all bg-white" 
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 max-w-2xl">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">New Password</label>
                        <input 
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all bg-white" 
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                        <input 
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all bg-white" 
                        />
                      </div>
                    </div>
                    <button 
                      onClick={handlePasswordChange}
                      disabled={isChangingPassword || !oldPassword || !newPassword || !confirmPassword}
                      className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {isChangingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="animate-in fade-in max-w-3xl">
                <div className="mb-6">
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">Appearance</h3>
                  <p className="text-sm text-gray-500 mt-1">Customize how your dashboard looks and feels.</p>
                </div>
                
                <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                  
                  {/* Theme Section */}
                  <div className="p-6 md:p-8 border-b border-gray-100">
                    <h4 className="text-sm font-bold text-gray-900 mb-4">Interface Theme</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      {/* Light Theme */}
                      <div className="relative">
                        <input 
                          type="radio" 
                          name="theme" 
                          id="theme-light" 
                          className="peer sr-only" 
                          checked={theme === 'light'} 
                          onChange={() => setTheme('light')} 
                        />
                        <label htmlFor="theme-light" className="block cursor-pointer p-1 rounded-xl border-2 border-transparent peer-checked:border-[#1C0A3E] transition-all">
                          <div className="bg-[#F8F9FA] rounded-lg border border-gray-200 h-24 p-2 flex flex-col gap-2">
                            <div className="flex gap-2">
                              <div className="w-1/3 bg-white rounded shadow-sm h-full flex flex-col gap-1 p-1">
                                <div className="h-1 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-1 bg-gray-200 rounded w-full"></div>
                                <div className="h-1 bg-gray-200 rounded w-full"></div>
                              </div>
                              <div className="w-2/3 bg-white rounded shadow-sm h-full flex flex-col gap-1.5 p-2">
                                <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                                <div className="h-8 bg-gray-100 rounded w-full mt-auto"></div>
                              </div>
                            </div>
                          </div>
                          <div className="text-center mt-3 text-sm font-medium text-gray-900">Light Mode</div>
                        </label>
                      </div>

                      {/* Dark Theme */}
                      <div className="relative">
                        <input 
                          type="radio" 
                          name="theme" 
                          id="theme-dark" 
                          className="peer sr-only" 
                          checked={theme === 'dark'} 
                          onChange={() => setTheme('dark')} 
                        />
                        <label htmlFor="theme-dark" className="block cursor-pointer p-1 rounded-xl border-2 border-transparent peer-checked:border-[#1C0A3E] transition-all">
                          <div className="bg-[#1C0A3E] rounded-lg border border-gray-800 h-24 p-2 flex flex-col gap-2">
                            <div className="flex gap-2">
                              <div className="w-1/3 bg-[#2A105D] rounded shadow-sm h-full flex flex-col gap-1 p-1">
                                <div className="h-1 bg-white/20 rounded w-1/2"></div>
                                <div className="h-1 bg-white/20 rounded w-full"></div>
                                <div className="h-1 bg-white/20 rounded w-full"></div>
                              </div>
                              <div className="w-2/3 bg-[#2A105D] rounded shadow-sm h-full flex flex-col gap-1.5 p-2">
                                <div className="h-2 bg-white/20 rounded w-1/3"></div>
                                <div className="h-8 bg-white/10 rounded w-full mt-auto"></div>
                              </div>
                            </div>
                          </div>
                          <div className="text-center mt-3 text-sm font-medium text-gray-700">Dark Mode</div>
                        </label>
                      </div>

                      {/* System Theme */}
                      <div className="relative">
                        <input 
                          type="radio" 
                          name="theme" 
                          id="theme-system" 
                          className="peer sr-only" 
                          checked={theme === 'system'} 
                          onChange={() => setTheme('system')} 
                        />
                        <label htmlFor="theme-system" className="block cursor-pointer p-1 rounded-xl border-2 border-transparent peer-checked:border-[#1C0A3E] transition-all">
                          <div className="bg-gradient-to-r from-[#F8F9FA] to-[#1C0A3E] rounded-lg border border-gray-200 h-24 flex items-center justify-center">
                            <div className="bg-white/90 backdrop-blur rounded-lg p-2 shadow-sm flex items-center gap-2">
                              <Globe className="w-4 h-4 text-gray-700" />
                            </div>
                          </div>
                          <div className="text-center mt-3 text-sm font-medium text-gray-700">System</div>
                        </label>
                      </div>

                    </div>
                  </div>

                  {/* Primary Color */}
                  <div className="p-6 md:p-8">
                    <h4 className="text-sm font-bold text-gray-900 mb-1">Primary Color</h4>
                    <p className="text-sm text-gray-500 mb-4">Choose the main accent color for your dashboard.</p>
                    
                    <div className="flex flex-wrap gap-4">
                      {['#1C0A3E', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'].map((color) => (
                        <label key={color} className="relative cursor-pointer">
                          <input 
                            type="radio" 
                            name="primaryColor" 
                            value={color} 
                            className="peer sr-only" 
                            checked={primaryColor === color} 
                            onChange={() => {
                              setPrimaryColor(color);
                              document.documentElement.style.setProperty('--primary', color);
                              document.documentElement.style.setProperty('--color-primary', color);
                            }}
                          />
                          <div 
                            className="w-10 h-10 rounded-full border-2 border-transparent peer-checked:border-gray-900 peer-checked:p-0.5 transition-all flex items-center justify-center"
                          >
                            <div className="w-full h-full rounded-full" style={{ backgroundColor: color }}></div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
