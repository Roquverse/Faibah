'use client';

import React, { useState } from 'react';
import {
  Building2, ArrowRight, UserCircle, Briefcase, Wrench,
  Package, LayoutDashboard, CreditCard, Mail, MessageCircle,
  Sparkles, CheckCircle2, ChevronRight, FileText
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type UserType = 'professional' | 'client' | null;
type WorkType = 'freelancer' | 'agency' | 'contractor' | 'other' | null;
type BillingModel = 'hourly' | 'fixed' | 'both';
type TeamSize = 'solo' | '2-5' | '6+';
type CommPref = 'whatsapp' | 'email' | 'both';

export default function OnboardingPage() {
  // Navigation State
  const [step, setStep] = useState(0); // 0 = Toggle, 1 = Basics, 2 = Work Type, etc.
  const [isLoading, setIsLoading] = useState(false);

  // Global State
  const [userType, setUserType] = useState<UserType>(null);

  // Professional State
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [workType, setWorkType] = useState<WorkType>(null);

  // Step 3a: Freelancer
  const [billingModel, setBillingModel] = useState<BillingModel>('fixed');
  const [hourlyRate, setHourlyRate] = useState('');
  const [requireDeposit, setRequireDeposit] = useState(false);
  const [depositPercent, setDepositPercent] = useState('50');

  // Step 3b: Agency
  const [teamSize, setTeamSize] = useState<TeamSize>('solo');
  const [assignRoles, setAssignRoles] = useState(false);

  // Step 3c: Contractor
  const [multipleMilestones, setMultipleMilestones] = useState(false);
  const [itemizeMaterials, setItemizeMaterials] = useState(false);

  // Step 4: Money Details
  const [currency, setCurrency] = useState('NGN');
  const [taxRegistered, setTaxRegistered] = useState(false);
  const [taxRate, setTaxRate] = useState('7.5');

  // Step 5: Comm Preference
  const [commPreference, setCommPreference] = useState<CommPref>('both');

  // Step 6: Quick Start
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [projectTitle, setProjectTitle] = useState('');

  // Client State (Scenario B)
  const [invoiceRef, setInvoiceRef] = useState('');
  const [clientPhoneOnly, setClientPhoneOnly] = useState('');

  const calculateTotalSteps = () => {
    if (userType === 'client') return 2; // Step 0, Step 1 (Client)
    return 6; // Pro: 0, 1, 2, 3, 4, 5, 6
  };

  const totalSteps = calculateTotalSteps();
  const progressPercent = step === 0 ? 0 : Math.min((step / totalSteps) * 100, 100);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleComplete = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        userType,
        businessName,
        phone,
        workType,
        billingModel,
        hourlyRate,
        requireDeposit,
        depositPercent,
        teamSize,
        assignRoles,
        multipleMilestones,
        itemizeMaterials,
        currency,
        taxRegistered,
        taxRate,
        commPreference,
        clientName,
        clientEmail,
        clientPhone,
        projectTitle,
        invoiceRef,
        clientPhoneOnly
      };

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
      const res = await fetch(`${API_URL}/users/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to save onboarding data');
      }

      const supabase = createClient();
      await supabase.auth.updateUser({
        data: { onboarding_completed: true }
      });

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      window.location.href = '/';
    }
  };

  // -------------------------------------------------------------
  // STEP 0: THE TOGGLE
  // -------------------------------------------------------------
  const renderStep0 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="rounded-full flex items-center justify-center mb-6">
          <img src="/logo.png" alt="" width={200} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
          How will you be using Faiba?
        </h1>
        <p className="text-[15px] text-gray-500">
          This helps us set up your workspace perfectly.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => {
            setUserType('professional');
            handleNext();
          }}
          className="flex flex-col items-center p-8 rounded-2xl border border-gray-200 hover:border-primary hover:bg-primary/10 transition-all group"
        >
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <div className="text-lg font-bold text-gray-900 mb-2">I'm a Professional</div>
          <div className="text-sm text-gray-500 text-center">I want to send quotes and invoices to clients</div>
        </button>

        <button
          onClick={() => {
            setUserType('client');
            handleNext();
          }}
          className="flex flex-col items-center p-8 rounded-2xl border border-gray-200 hover:border-purple-500 hover:bg-purple-50/30 transition-all group"
        >
          <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <UserCircle className="w-8 h-8 text-purple-600" />
          </div>
          <div className="text-lg font-bold text-gray-900 mb-2">I'm a Client</div>
          <div className="text-sm text-gray-500 text-center">I received a quote or invoice from someone on Faiba</div>
        </button>
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // CLIENT FLOW (Scenario B)
  // -------------------------------------------------------------
  const renderClientStep = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center text-center mb-10">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-6">
          <FileText className="w-6 h-6 text-purple-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
          Link an invoice
        </h1>
        <p className="text-[15px] text-gray-500">
          Track all your invoices from Faiba businesses in one place.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-2">
            Invoice or Quote Reference Number (Optional)
          </label>
          <input
            type="text"
            value={invoiceRef}
            onChange={(e) => setInvoiceRef(e.target.value)}
            placeholder="e.g. INV-2023-001"
            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-2">
            WhatsApp Number (Optional)
          </label>
          <input
            type="tel"
            value={clientPhoneOnly}
            onChange={(e) => setClientPhoneOnly(e.target.value)}
            placeholder="+234 800 000 0000"
            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
          <p className="text-xs text-gray-400 mt-2">So businesses can reach you faster.</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6">
        <button onClick={handleBack} className="text-[15px] text-gray-500 hover:text-gray-900 transition-colors">
          Back
        </button>
        <button
          onClick={handleComplete}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-gray-900 rounded-xl text-[15px] font-medium hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Finish Setup <CheckCircle2 className="w-4 h-4" /></>}
        </button>
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // PROFESSIONAL FLOW - Step 1: Basics
  // -------------------------------------------------------------
  const renderProStep1 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center text-center mb-10">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
          Tell us about your business
        </h1>
        <p className="text-[15px] text-gray-500">
          This is what your clients will see on invoices.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-2">Business Name</label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Acme Design Co."
            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-2">Phone / WhatsApp Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234 800 000 0000"
            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-6">
        <button onClick={handleBack} className="text-[15px] text-gray-500 hover:text-gray-900 transition-colors">Back</button>
        <button
          onClick={handleNext}
          disabled={!businessName.trim()}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-gray-900 rounded-xl text-[15px] font-medium hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // PROFESSIONAL FLOW - Step 2: Work Type
  // -------------------------------------------------------------
  const renderProStep2 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
          What kind of work do you do?
        </h1>
        <p className="text-[15px] text-gray-500">
          This helps us pre-configure your billing settings.
        </p>
      </div>

      <div className="grid gap-3">
        {[
          { id: 'freelancer', icon: UserCircle, title: 'Freelancer / Solo', desc: 'Design, dev, consulting, writing' },
          { id: 'agency', icon: Briefcase, title: 'Agency / Team', desc: 'Multiple people working under one business' },
          { id: 'contractor', icon: Wrench, title: 'Contractor / Trade', desc: 'Construction, events, repairs' },
          { id: 'other', icon: Package, title: 'Product-based / Other', desc: 'Selling physical goods or simple services' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setWorkType(item.id as WorkType);
              handleNext(); // Auto-advance on selection
            }}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${workType === item.id
              ? 'border-primary bg-primary/20'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
          >
            <div className={`p-2.5 rounded-lg ${workType === item.id ? 'bg-primary text-gray-900' : 'bg-gray-100 text-gray-500'}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4">
        <button onClick={handleBack} className="text-[15px] text-gray-500 hover:text-gray-900 transition-colors">Back</button>
        <button
          onClick={handleNext}
          disabled={!workType}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-gray-900 rounded-xl text-[15px] font-medium hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // PROFESSIONAL FLOW - Step 3: Branching Specifics
  // -------------------------------------------------------------
  const renderProStep3 = () => {

    // 3a Freelancer OR 3b Agency
    if (workType === 'freelancer' || workType === 'agency') {
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Billing Settings</h1>
            <p className="text-[15px] text-gray-500">How do you usually charge clients?</p>
          </div>

          <div className="space-y-6">
            {workType === 'agency' && (
              <>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-3">Team Size</label>
                  <div className="flex gap-2">
                    {['solo', '2-5', '6+'].map(size => (
                      <button
                        key={size}
                        onClick={() => setTeamSize(size as TeamSize)}
                        className={`flex-1 py-2 text-sm rounded-lg border transition-all ${teamSize === size ? 'border-primary bg-primary/20 text-gray-900 font-semibold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        {size === 'solo' ? 'Just me' : size}
                      </button>
                    ))}
                  </div>
                </div>
                {teamSize !== 'solo' && (
                  <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50">
                    <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${assignRoles ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}>
                      {assignRoles && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={assignRoles} onChange={(e) => setAssignRoles(e.target.checked)} />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Assign different roles to teammates</div>
                      <div className="text-xs text-gray-500 mt-1">Project managers, contractors, etc. You can invite them later.</div>
                    </div>
                  </label>
                )}
                <hr className="border-gray-100" />
              </>
            )}

            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-3">Primary Billing Model</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'hourly', label: 'Hourly' },
                  { id: 'fixed', label: 'Fixed Price' },
                  { id: 'both', label: 'Both' },
                ].map(model => (
                  <button
                    key={model.id}
                    onClick={() => setBillingModel(model.id as BillingModel)}
                    className={`py-2 text-sm rounded-lg border transition-all ${billingModel === model.id ? 'border-primary bg-primary/20 text-gray-900 font-semibold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {model.label}
                  </button>
                ))}
              </div>
            </div>

            {(billingModel === 'hourly' || billingModel === 'both') && (
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-2">Default Hourly Rate (Optional)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400 text-sm">₦</span>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:border-primary text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${requireDeposit ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}>
                {requireDeposit && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </div>
              <input type="checkbox" className="hidden" checked={requireDeposit} onChange={(e) => setRequireDeposit(e.target.checked)} />
              <div>
                <div className="text-sm font-medium text-gray-900">Require deposit before starting work</div>
                <div className="text-xs text-gray-500 mt-1">Pre-configure retainer requests.</div>
              </div>
            </label>

            {requireDeposit && (
              <div className="pl-8 animate-in fade-in slide-in-from-top-2">
                <label className="block text-xs font-medium text-gray-700 mb-2">Default Deposit %</label>
                <input
                  type="number"
                  value={depositPercent}
                  onChange={(e) => setDepositPercent(e.target.value)}
                  className="w-24 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-primary text-sm"
                  min="1" max="100"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-6">
            <button onClick={handleBack} className="text-[15px] text-gray-500 hover:text-gray-900 transition-colors">Back</button>
            <button onClick={handleNext} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-gray-900 rounded-xl text-[15px] font-medium hover:bg-primary/90 transition-all">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    // 3c Contractor
    if (workType === 'contractor') {
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Project Structure</h1>
            <p className="text-[15px] text-gray-500">How do you usually bill projects?</p>
          </div>

          <div className="space-y-5">
            <label className="flex items-start gap-4 cursor-pointer p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
              <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${multipleMilestones ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}>
                {multipleMilestones && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </div>
              <input type="checkbox" className="hidden" checked={multipleMilestones} onChange={(e) => setMultipleMilestones(e.target.checked)} />
              <div>
                <div className="text-sm font-semibold text-gray-900">Use payment milestones</div>
                <div className="text-xs text-gray-500 mt-1">E.g., deposit, midpoint, completion. We'll pre-configure the Milestone Lock feature for you.</div>
              </div>
            </label>

            <label className="flex items-start gap-4 cursor-pointer p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
              <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${itemizeMaterials ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}>
                {itemizeMaterials && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </div>
              <input type="checkbox" className="hidden" checked={itemizeMaterials} onChange={(e) => setItemizeMaterials(e.target.checked)} />
              <div>
                <div className="text-sm font-semibold text-gray-900">Itemize materials & labor</div>
                <div className="text-xs text-gray-500 mt-1">We'll adjust your invoice template to separate these line items.</div>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between pt-6">
            <button onClick={handleBack} className="text-[15px] text-gray-500 hover:text-gray-900 transition-colors">Back</button>
            <button onClick={handleNext} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-gray-900 rounded-xl text-[15px] font-medium hover:bg-primary/90 transition-all">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    // 3d Other -> Should skip this step logically, handled in navigation.
    return null;
  };

  // -------------------------------------------------------------
  // PROFESSIONAL FLOW - Step 4: Money Details
  // -------------------------------------------------------------
  const renderProStep4 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Money Details</h1>
        <p className="text-[15px] text-gray-500">Set your defaults (you can change per invoice)</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-2">Default Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-primary text-sm appearance-none"
          >
            <option value="NGN">NGN (₦) - Nigerian Naira</option>
            <option value="USD">USD ($) - US Dollar</option>
            <option value="GBP">GBP (£) - British Pound</option>
          </select>
        </div>

        <label className="flex items-start gap-3 cursor-pointer group">
          <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${taxRegistered ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}>
            {taxRegistered && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
          </div>
          <input type="checkbox" className="hidden" checked={taxRegistered} onChange={(e) => setTaxRegistered(e.target.checked)} />
          <div className="text-sm font-medium text-gray-900">I am Tax / VAT registered</div>
        </label>

        {taxRegistered && (
          <div className="pl-8 animate-in fade-in slide-in-from-top-2">
            <label className="block text-xs font-medium text-gray-700 mb-2">Default Tax Rate (%)</label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className="w-24 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-primary text-sm"
              step="0.1"
            />
          </div>
        )}

        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-900">Connect Paystack</div>
            <div className="text-xs text-gray-500 mt-1">Get paid directly on your invoices</div>
          </div>
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50">
            Connect
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6">
        <button onClick={handleBack} className="text-[15px] text-gray-500 hover:text-gray-900 transition-colors">Back</button>
        <button onClick={handleNext} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-gray-900 rounded-xl text-[15px] font-medium hover:bg-primary/90 transition-all">
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // PROFESSIONAL FLOW - Step 5: Comm Preference
  // -------------------------------------------------------------
  const renderProStep5 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Communication</h1>
        <p className="text-[15px] text-gray-500">How do you usually send documents to clients?</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { id: 'whatsapp', icon: MessageCircle, label: 'WhatsApp' },
          { id: 'email', icon: Mail, label: 'Email' },
          { id: 'both', icon: LayoutDashboard, label: 'Both' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setCommPreference(item.id as CommPref)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${commPreference === item.id
              ? 'border-primary bg-primary/20 text-gray-900'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
              }`}
          >
            <item.icon className="w-6 h-6 mb-2" />
            <span className="text-xs font-semibold">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between pt-6">
        <button onClick={handleBack} className="text-[15px] text-gray-500 hover:text-gray-900 transition-colors">Back</button>
        <button onClick={handleNext} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-gray-900 rounded-xl text-[15px] font-medium hover:bg-primary/90 transition-all">
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // PROFESSIONAL FLOW - Step 6: Quick Start
  // -------------------------------------------------------------
  const renderProStep6 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Quick Start</h1>
        <p className="text-[15px] text-gray-500">Let's set up your first client and project so you're ready to go.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="text-sm font-semibold text-gray-900 border-b pb-2">1. Add Client</div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text" placeholder="Client Name"
              value={clientName} onChange={(e) => setClientName(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-300 focus:outline-none focus:border-primary text-sm"
            />
            <input
              type="email" placeholder="Client Email"
              value={clientEmail} onChange={(e) => setClientEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-300 focus:outline-none focus:border-primary text-sm"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-semibold text-gray-900 border-b pb-2">2. Create Project</div>
          <input
            type="text" placeholder="e.g. Website Redesign"
            value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-300 focus:outline-none focus:border-primary text-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-6">
        <button onClick={handleComplete} className="text-[14px] text-gray-400 hover:text-gray-600 transition-colors">
          I'll do this later
        </button>
        <button onClick={handleComplete} disabled={isLoading} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-gray-900 rounded-xl text-[15px] font-medium hover:bg-primary/90 disabled:opacity-50 transition-all">
          {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Finish Setup <CheckCircle2 className="w-4 h-4" /></>}
        </button>
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // RENDER LOGIC
  // -------------------------------------------------------------
  const renderCurrentStep = () => {
    if (step === 0) return renderStep0();

    if (userType === 'client') {
      if (step === 1) return renderClientStep();
    }

    if (userType === 'professional') {
      if (step === 1) return renderProStep1();
      if (step === 2) return renderProStep2();
      if (step === 3) {
        if (workType === 'other') {
          // Skip billing specifics for 'other'
          setTimeout(() => setStep(4), 0);
          return null;
        }
        return renderProStep3();
      }
      if (step === 4) return renderProStep4();
      if (step === 5) return renderProStep5();
      if (step === 6) return renderProStep6();
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4 font-sans relative">

      {/* Progress Indicator */}
      {step > 0 && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      <div className="w-full max-w-[500px] bg-white rounded-3xl border border-gray-100 p-8 sm:p-12">
        {renderCurrentStep()}
      </div>
    </div>
  );
}
