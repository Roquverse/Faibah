'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, Eye, PenTool, Calculator, Loader2, LayoutGrid, CheckCircle2 } from 'lucide-react';
import { ProjectsApi, InvoicesApi, CompanyApi } from '@/lib/api';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false, loading: () => <p className="text-gray-400 py-8">Loading editor...</p> });

interface LineItem {
  id: string;
  description: string;
  quantity: number | string;
  rate: number | string;
  isSubscription?: boolean;
  subscriptionFrequency?: string;
  subscriptionDate?: string;
}

type TabMode = 'proposal' | 'financials' | 'preview';

const cleanNumber = (val: any): number => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]+/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

export default function ProposalEditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabMode>('proposal');
  const [proposal, setProposal] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Proposal content states
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalHTML, setProposalHTML] = useState('');
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: 'Project Deliverable', quantity: 1, rate: 0, isSubscription: false, subscriptionFrequency: 'MONTHLY', subscriptionDate: '' }
  ]);
  const [taxRate, setTaxRate] = useState<number | string>(7.5);
  const [deposit, setDeposit] = useState<number | string>(50);

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + (cleanNumber(item.quantity) * cleanNumber(item.rate)), 0);
  const numericTax = cleanNumber(taxRate);
  const taxAmount = (subtotal * numericTax) / 100;
  const total = subtotal + taxAmount;
  const numericDeposit = cleanNumber(deposit);
  const depositAmount = (total * numericDeposit) / 100;

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        setLoading(true);
        const [data, companyProfile] = await Promise.all([
          ProjectsApi.getProposal(id as string),
          CompanyApi.getProfile().catch(() => null),
        ]);

        setProposal(data);
        const proj = data.project;
        setProject(proj);

        // Resolve company
        const comp = proj?.client?.company || companyProfile;
        setCompany(comp);

        // Resolve invoice attached to this project
        const inv = proj?.invoices?.[0] || null;
        setInvoice(inv);

        // Hydrate proposal content
        if (data.content) {
          try {
            const parsed = JSON.parse(data.content);
            if (parsed && typeof parsed === 'object') {
              const title = parsed.proposalTitle || parsed.title || proj?.name || 'Untitled Proposal';
              const html = parsed.proposalHTML || parsed.description || '';

              let parsedItems: LineItem[] = [];
              if (Array.isArray(parsed.items) && parsed.items.length > 0) {
                parsedItems = parsed.items.map((it: any, idx: number) => {
                  const qty = cleanNumber(it.quantity) || 1;
                  const rate = cleanNumber(it.rate ?? it.unitPrice ?? (it.amount ? it.amount / qty : 0));
                  return {
                    id: it.id || String(Date.now() + idx),
                    description: it.description || '',
                    quantity: qty,
                    rate: rate,
                    isSubscription: !!it.isSubscription,
                    subscriptionFrequency: it.subscriptionFrequency || 'MONTHLY',
                    subscriptionDate: it.subscriptionDate || '',
                  };
                });
              } else if (inv?.items?.length > 0) {
                parsedItems = inv.items.map((it: any, idx: number) => ({
                  id: it.id || String(Date.now() + idx),
                  description: it.description || '',
                  quantity: it.quantity || 1,
                  rate: it.unitPrice || 0,
                  isSubscription: false,
                  subscriptionFrequency: 'MONTHLY',
                  subscriptionDate: '',
                }));
              }

              setProposalTitle(title);
              setProposalHTML(html);
              if (parsedItems.length > 0) setItems(parsedItems);

              if (parsed.financials) {
                if (parsed.financials.taxRate !== undefined) setTaxRate(parsed.financials.taxRate);
                if (parsed.financials.deposit !== undefined) setDeposit(parsed.financials.deposit);
              } else if (inv?.taxRate !== undefined) {
                setTaxRate(inv.taxRate);
              }
            }
          } catch {
            setProposalTitle(proj?.name || 'Untitled Proposal');
            setProposalHTML(data.content || '');
          }
        } else if (inv?.items?.length > 0) {
          setProposalTitle(proj?.name || 'Untitled Proposal');
          setItems(inv.items.map((it: any, idx: number) => ({
            id: it.id || String(Date.now() + idx),
            description: it.description || '',
            quantity: it.quantity || 1,
            rate: it.unitPrice || 0,
            isSubscription: false,
            subscriptionFrequency: 'MONTHLY',
            subscriptionDate: '',
          })));
          if (inv.taxRate !== undefined) setTaxRate(inv.taxRate);
        }
      } catch (err) {
        console.error('Failed to load proposal:', err);
        toast.error('Failed to load proposal');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProposal();
  }, [id]);

  const addItem = () => {
    setItems(prev => [
      ...prev,
      { id: Date.now().toString(), description: '', quantity: 1, rate: 0, isSubscription: false, subscriptionFrequency: 'MONTHLY', subscriptionDate: '' }
    ]);
  };

  const removeItem = (itemId: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(i => i.id !== itemId));
    }
  };

  const updateItem = (itemId: string, field: keyof LineItem, value: any) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, [field]: value } : i));
  };

  const handleSaveProposal = async () => {
    if (!proposal || !project) return;
    setIsSaving(true);

    try {
      const invoiceItems = items.map(item => {
        const qty = Math.round(cleanNumber(item.quantity)) || 1;
        const rate = cleanNumber(item.rate);
        return {
          description: item.description || 'Project Deliverable',
          quantity: qty,
          unitPrice: rate,
          amount: qty * rate,
          isSubscription: item.isSubscription || false,
          subscriptionFrequency: item.subscriptionFrequency,
          subscriptionDate: item.subscriptionDate ? new Date(item.subscriptionDate).toISOString() : undefined,
        };
      });

      const updatedContent = JSON.stringify({
        proposalTitle,
        title: proposalTitle,
        proposalHTML,
        description: proposalHTML,
        items,
        financials: {
          subtotal,
          taxRate: cleanNumber(taxRate),
          taxAmount,
          total,
          deposit: cleanNumber(deposit),
          depositAmount
        }
      });

      // 1. Update Proposal in database
      await ProjectsApi.updateProposal(project.id, proposal.id, updatedContent);

      // 2. If an invoice exists on this project, sync line items and taxRate
      if (invoice?.id) {
        try {
          const updatedInvoice = await InvoicesApi.update(invoice.id, {
            taxRate: cleanNumber(taxRate),
            items: invoiceItems,
          });
          if (updatedInvoice) setInvoice(updatedInvoice);
        } catch (invErr) {
          console.error('Failed to sync invoice items:', invErr);
        }
      }

      toast.success('Proposal and invoice saved successfully');
    } catch (err: any) {
      console.error('Failed to save proposal:', err);
      toast.error(err?.message || 'Failed to save proposal');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-12 bg-gray-50/50">
        <div className="text-gray-500 font-medium flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" /> Loading proposal and invoice details...
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-12 bg-gray-50/50 gap-4">
        <div className="text-gray-500 font-medium">Proposal not found.</div>
        <button onClick={() => router.push('/proposals')} className="text-indigo-600 font-semibold hover:underline">
          Go back to Proposals
        </button>
      </div>
    );
  }

  const invoiceRef = invoice?.invoiceRef || (invoice ? `INV-${invoice.id.slice(0, 4).toUpperCase()}` : (project?.id ? `PRJ-${project.id.slice(0, 4).toUpperCase()}` : 'PRJ-001'));
  const clientName = project?.client?.name || 'Client Recipient';
  const companyName = company?.name || 'Avatec Interactives';
  const companyEmail = company?.companyEmail || company?.email || 'helpdesk@avatecinteractives.dev';
  const companyPhone = company?.companyPhone || company?.phone || '08035212521';

  return (
    <div className="min-h-full font-sans pb-24 relative bg-[#F8F9FA] dark:bg-slate-950">
      
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <button 
          onClick={() => router.push('/proposals')} 
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors text-sm font-semibold w-full md:w-1/4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Proposals
        </button>

        {/* Tab Navigation */}
        <div className="flex items-center bg-gray-100 dark:bg-slate-800/60 p-1 rounded-xl w-full md:w-1/2 justify-center overflow-x-auto">
          <button 
            onClick={() => setActiveTab('proposal')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'proposal' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
          >
            <PenTool className="w-4 h-4" />
            Proposal
          </button>
          <button 
            onClick={() => setActiveTab('financials')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'financials' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
          >
            <Calculator className="w-4 h-4" />
            Financials
          </button>
          <button 
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'preview' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 w-full md:w-1/4">
          <button 
            onClick={handleSaveProposal}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 px-5 h-10 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-sm"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Document Canvas */}
      <div className="max-w-[920px] mx-auto mt-8 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-8 md:p-14 relative shadow-sm">
        
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-8 sm:gap-4 mb-12 pb-8 border-b border-gray-100 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-2 break-words">{companyName}</h2>
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <p>{companyEmail}</p>
              <p>{companyPhone}</p>
            </div>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Proposal / Estimate</div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">#{invoiceRef}</h1>
            <div className="p-3 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-left w-64 sm:ml-auto">
              <div className="text-sm font-bold text-gray-900 dark:text-white">{clientName}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Client Recipient</div>
            </div>
          </div>
        </div>

        {/* -------------------- PROPOSAL TAB -------------------- */}
        {activeTab === 'proposal' && (
          <div className="animate-in fade-in duration-300">
            <style dangerouslySetInnerHTML={{__html: `
              .quill-custom .ql-toolbar {
                border: none !important;
                border-bottom: 1px solid #f3f4f6 !important;
                padding: 12px 0 !important;
                margin-bottom: 24px !important;
              }
              .dark .quill-custom .ql-toolbar {
                border-bottom-color: #334155 !important;
              }
              .quill-custom .ql-container {
                border: none !important;
              }
              .quill-custom .ql-editor {
                padding: 0 !important;
                min-height: 450px;
                color: #1f2937;
              }
              .dark .quill-custom .ql-editor {
                color: #f1f5f9;
              }
              .quill-custom .ql-editor h1 { font-size: 2rem; font-weight: 800; margin-top: 1.5rem; margin-bottom: 0.75rem; }
              .quill-custom .ql-editor h2 { font-size: 1.5rem; font-weight: 700; margin-top: 2rem; margin-bottom: 0.75rem; }
              .quill-custom .ql-editor h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; }
              .quill-custom .ql-editor p { font-size: 1.05rem; line-height: 1.75; margin-bottom: 1.25rem; }
              .quill-custom .ql-editor ul, .quill-custom .ql-editor ol { padding-left: 1.5rem; margin-bottom: 1.25rem; }
              .quill-custom .ql-editor li { font-size: 1.05rem; line-height: 1.75; margin-bottom: 0.5rem; }
              .quill-custom .ql-editor table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
              .quill-custom .ql-editor td { border: 1px solid #e5e7eb; padding: 10px; }
            `}} />

            <input 
              type="text"
              value={proposalTitle}
              onChange={(e) => setProposalTitle(e.target.value)}
              className="w-full text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight bg-transparent focus:outline-none mb-6 placeholder:text-gray-300"
              placeholder="Enter Proposal Title..."
            />

            <div className="w-full h-px bg-gray-100 dark:bg-slate-800 mb-6"></div>

            <div className="editor-container quill-custom">
              <ReactQuill 
                theme="snow" 
                value={proposalHTML} 
                onChange={setProposalHTML} 
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['link', 'clean']
                  ]
                }}
                className="bg-transparent min-h-[450px]"
              />
            </div>

            <div className="flex items-center gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-slate-800">
              <button 
                onClick={() => setProposalHTML(prev => prev + '<br/><h2>New Section Title</h2><p>Start typing your content here...</p>')} 
                className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:text-indigo-400 px-3.5 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Section
              </button>
              <button 
                onClick={() => setProposalHTML(prev => prev + '<br/><h2>Project Milestones</h2><table width="100%"><tbody><tr><td><strong>Milestone</strong></td><td><strong>Description</strong></td><td><strong>Timeline</strong></td></tr><tr><td>Phase 1</td><td>Initial Setup</td><td>Week 1</td></tr></tbody></table>')} 
                className="flex items-center gap-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 px-3.5 py-2 rounded-lg transition-colors"
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Add Table
              </button>
            </div>
          </div>
        )}

        {/* -------------------- FINANCIALS TAB -------------------- */}
        {activeTab === 'financials' && (
          <div className="animate-in fade-in duration-300 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Investment & Deliverables</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">These line items sync directly with your project invoice.</p>

              <div className="border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden mb-4">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 text-gray-500 uppercase font-semibold text-xs">
                      <th className="py-3.5 px-4 w-1/2">Description</th>
                      <th className="py-3.5 px-4 w-20 text-center">Qty</th>
                      <th className="py-3.5 px-4 w-36 text-right">Rate (₦)</th>
                      <th className="py-3.5 px-4 w-36 text-right">Amount (₦)</th>
                      <th className="py-3.5 px-4 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {items.map(item => {
                      const qty = cleanNumber(item.quantity);
                      const rate = cleanNumber(item.rate);
                      const lineAmt = qty * rate;
                      return (
                        <tr key={item.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-4">
                            <input 
                              type="text" 
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              placeholder="Deliverable description"
                              className="w-full bg-transparent font-medium text-gray-900 dark:text-white focus:outline-none"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input 
                              type="number" 
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                              className="w-full bg-transparent text-center font-medium text-gray-900 dark:text-white focus:outline-none"
                              min="1"
                            />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <input 
                              type="number" 
                              value={item.rate}
                              onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
                              className="w-full bg-transparent text-right font-medium text-gray-900 dark:text-white focus:outline-none"
                            />
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-gray-900 dark:text-white">
                            ₦{lineAmt.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <button 
                onClick={addItem}
                className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Deliverable
              </button>
            </div>

            {/* Financial Summary */}
            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-slate-800">
              <div className="w-80 space-y-3">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    Tax Rate:
                    <input 
                      type="number" 
                      value={taxRate} 
                      onChange={(e) => setTaxRate(e.target.value)} 
                      className="w-14 px-1.5 py-0.5 border border-gray-200 dark:border-slate-700 rounded text-center text-xs font-semibold focus:outline-none bg-transparent"
                    />%
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">₦{taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    Required Deposit:
                    <input 
                      type="number" 
                      value={deposit} 
                      onChange={(e) => setDeposit(e.target.value)} 
                      className="w-14 px-1.5 py-0.5 border border-gray-200 dark:border-slate-700 rounded text-center text-xs font-semibold focus:outline-none bg-transparent"
                    />%
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">₦{depositAmount.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-slate-700 pt-3 flex justify-between text-base font-bold text-gray-900 dark:text-white">
                  <span>Total Amount:</span>
                  <span className="text-xl text-indigo-600 dark:text-indigo-400">₦{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- PREVIEW TAB -------------------- */}
        {activeTab === 'preview' && (
          <div className="animate-in fade-in duration-300 space-y-10">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
                {proposalTitle || 'Untitled Proposal'}
              </h1>
              <div 
                className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: proposalHTML || '<p className="text-gray-400">No proposal content written yet.</p>' }}
              />
            </div>

            <div className="pt-8 border-t border-gray-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Investment Summary</h3>
              <div className="border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden mb-6">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 text-gray-500 uppercase font-semibold text-xs">
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4 text-center w-20">Qty</th>
                      <th className="py-3 px-4 text-right w-36">Rate</th>
                      <th className="py-3 px-4 text-right w-36">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {items.map(item => {
                      const qty = cleanNumber(item.quantity);
                      const rate = cleanNumber(item.rate);
                      return (
                        <tr key={item.id}>
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{item.description || 'Deliverable'}</td>
                          <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">{qty}</td>
                          <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">₦{rate.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-bold text-gray-900 dark:text-white">₦{(qty * rate).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="w-72 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">₦{subtotal.toLocaleString()}</span>
                  </div>
                  {numericTax > 0 && (
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Tax ({numericTax}%):</span>
                      <span className="font-semibold text-gray-900 dark:text-white">₦{taxAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 dark:border-slate-700 pt-2 flex justify-between text-base font-bold text-gray-900 dark:text-white">
                    <span>Total:</span>
                    <span className="text-lg text-indigo-600 dark:text-indigo-400">₦{total.toLocaleString()}</span>
                  </div>
                  {numericDeposit > 0 && numericDeposit < 100 && (
                    <div className="flex justify-between text-xs text-amber-600 font-semibold pt-1">
                      <span>Deposit Due ({numericDeposit}%):</span>
                      <span>₦{depositAmount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
