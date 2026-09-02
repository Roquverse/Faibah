'use client';

import React, { useState } from 'react';
import { ArrowLeft, Save, Send, Plus, Trash2, Calendar, FileText, CheckCircle2, Eye, PenTool, Calculator, Sparkles, Loader2, X, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProjectsApi, CompanyApi, ClientsApi, InvoicesApi, AiApi } from '@/lib/api';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false, loading: () => <p>Loading editor...</p> });

interface LineItem {
 id: string;
 description: string;
 quantity: number | string;
 rate: number | string;
 isSubscription?: boolean;
 subscriptionFrequency?: string;
 subscriptionDate?: string;
}

interface Client {
 id: string;
 name: string;
 currency: string;
}

type TabMode = 'proposal' | 'financials' | 'preview';

export default function NewProjectProposal() {
 const router = useRouter();
 const [activeTab, setActiveTab] = useState<TabMode>('proposal');
 const [isSending, setIsSending] = useState(false);

 // AI State
 const [isAiModalOpen, setIsAiModalOpen] = useState(false);
 const [aiPrompt, setAiPrompt] = useState('');
 const [isGenerating, setIsGenerating] = useState(false);
 const [aiError, setAiError] = useState('');

 // Data State
 const [company, setCompany] = useState<any>(null);
 const [clients, setClients] = useState<Client[]>([]);
 const [selectedClientId, setSelectedClientId] = useState<string>('');

 // Proposal State
 const [proposalTitle, setProposalTitle] = useState('');
 const [proposalHTML, setProposalHTML] = useState(`
 <h1>[Proposal Title]</h1>
 <h2>[Section Sub-heading]</h2>
 <p>[Start typing your paragraph here...]</p>
 `);
 const [sanitizedHTML, setSanitizedHTML] = useState('');

 React.useEffect(() => {
   import('dompurify').then((DOMPurify) => {
     setSanitizedHTML(DOMPurify.default.sanitize(proposalHTML));
   });
 }, [proposalHTML]);

 React.useEffect(() => {
 async function loadData() {
 try {
 const [compData, clientData] = await Promise.all([
 CompanyApi.getProfile(),
 ClientsApi.getAll()
 ]);
 setCompany(compData);
 setClients(clientData);
 if (clientData && clientData.length > 0) {
 setSelectedClientId(clientData[0].id);
 }
 } catch (err) {
 console.error('Failed to load data', err);
 }
 }
 loadData();
 }, []);

 // Financials State
 const [items, setItems] = useState<LineItem[]>([
 { id: '1', description: 'Concept Development & Scouting', quantity: 1, rate: 500000, isSubscription: false, subscriptionFrequency: 'MONTHLY', subscriptionDate: '' },
 { id: '2', description: '2-Day On-Site Photography & Video', quantity: 1, rate: 2500000, isSubscription: false, subscriptionFrequency: 'MONTHLY', subscriptionDate: '' },
 { id: '3', description: 'Post-Production Editing', quantity: 1, rate: 750000, isSubscription: false, subscriptionFrequency: 'MONTHLY', subscriptionDate: '' },
 ]);
 const [taxRate, setTaxRate] = useState<number | string>(7.5);
 const [deposit, setDeposit] = useState<number | string>(50);

 // Calculations
 const numericTax = taxRate === '' ? 0 : Number(taxRate);
 const numericDep = deposit === '' ? 0 : Number(deposit);
 const subtotal = items.reduce((acc, item) => acc + ((Number(item.quantity) || 0) * (Number(item.rate) || 0)), 0);
 const taxAmount = (subtotal * (isNaN(numericTax) ? 0 : numericTax)) / 100;
 const total = subtotal + taxAmount;
 const depositAmount = (total * (isNaN(numericDep) ? 0 : numericDep)) / 100;

 const formatCurrency = (amount: number) => {
 return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
 };

 const addItem = () => setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, rate: 0, isSubscription: false, subscriptionFrequency: 'MONTHLY', subscriptionDate: '' }]);
 const removeItem = (id: string) => { if (items.length > 1) setItems(items.filter(item => item.id !== id)); };
 const updateItem = (id: string, field: keyof LineItem, value: string | number | boolean) => {
 setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
 };

 const handleGenerateAI = async () => {
 if (!aiPrompt.trim()) return;
 setIsGenerating(true);
 setAiError('');

 try {
      const data = await AiApi.generateProposal(aiPrompt);

      if (data.proposalTitle) setProposalTitle(data.proposalTitle);
      if (data.proposalHTML) setProposalHTML(data.proposalHTML);
      if (data.items && data.items.length > 0) setItems(data.items);
      
      // Optimistically decrement tokens locally
      setCompany((prev: any) => prev ? { ...prev, aiTokens: prev.aiTokens - 1 } : prev);
      
      setIsAiModalOpen(false);
      setAiPrompt('');
    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTopUpTokens = async () => {
    try {
      const result = await AiApi.topUpTokens(5);
      setCompany((prev: any) => prev ? { ...prev, aiTokens: result.aiTokens } : prev);
    } catch (err) {
      console.error('Failed to top up tokens', err);
    }
  };

  const handleSend = async () => {
    if (isSending) return;
    setIsSending(true);
    try {
      // 1. Create Project
      const project = await ProjectsApi.create({ clientId: selectedClientId || '', name: proposalTitle || 'Untitled Project' });
      
      // 2. Prepare JSON content
      const content = JSON.stringify({ proposalTitle: proposalTitle || 'Untitled Project', proposalHTML, items, financials: { subtotal, taxRate, taxAmount, total, deposit, depositAmount } });
      
      // 3. Create Proposal attached to project
      if (project?.id) {
        await ProjectsApi.createProposal(project.id, content);
      }
      
      // 4. Create Invoice separated for Invoices & Client views
      const invoiceItems = items.map(item => ({
        description: item.description || 'Project Deliverable',
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.rate) || 0,
        amount: (Number(item.quantity) || 1) * (Number(item.rate) || 0),
        isSubscription: item.isSubscription || false,
        subscriptionFrequency: item.subscriptionFrequency,
        subscriptionDate: item.subscriptionDate ? new Date(item.subscriptionDate).toISOString() : undefined,
      }));

      await InvoicesApi.create({
        clientId: selectedClientId || project?.clientId,
        projectId: project?.id,
        currency: 'NGN',
        taxRate,
        dueDate: new Date(Date.now() + 14 * 86400 * 1000),
        items: invoiceItems,
      });

      // 5. Update Project status to ONGOING
      if (project?.id) {
        await ProjectsApi.updateStatus(project.id, 'ONGOING');
      }

      // 6. Redirect to projects
      router.push('/projects');
    } catch (error) {
      console.error('Failed to send/accept proposal:', error);
      alert('Failed to process proposal. Make sure a client is selected and backend is running.');
    } finally {
      setIsSending(false);
    }
  };

 return (
 <div className="min-h-full font-sans pb-24 relative">
 
 {/* Floating Action Bar */}
 <div className="sticky top-0 z-40 bg-[#F8F9FA]/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
 <Link href="/projects" className="flex items-center justify-center md:justify-start gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors text-sm font-semibold w-full md:w-1/4">
 <ArrowLeft className="w-4 h-4" />
 Back to Projects
 </Link>
 
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

 <div className="flex items-center justify-center md:justify-end gap-3 w-full md:w-1/4">
 <button 
 onClick={() => setIsAiModalOpen(true)}
 className="flex items-center justify-center whitespace-nowrap gap-2 px-4 h-10 rounded-xl text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors"
 >
 <Sparkles className="w-4 h-4" />
 Generate with AI
 </button>
 <button 
 onClick={handleSend}
 disabled={isSending}
 className="flex items-center justify-center whitespace-nowrap gap-2 px-5 h-10 rounded-xl text-sm font-bold text-gray-900 bg-[#FFBA00] hover:bg-[#E6A700] transition-colors disabled:opacity-50"
 >
 {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
 {isSending ? 'Sending...' : 'Send'}
 </button>
 </div>
 </div>

 {/* AI Generate Modal */}
 {isAiModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
 <div className="bg-white w-full max-w-xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
 <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
 <Sparkles className="w-5 h-5" />
 </div>
 <div>
 <h3 className="font-bold text-gray-900">Generate with Gemini AI</h3>
 <p className="text-xs text-gray-500">Describe the project and let AI write the proposal.</p>
 </div>
 </div>
 <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-indigo-100 rounded-lg shadow-sm">
                    <span className="text-sm font-bold text-indigo-600">{company?.aiTokens || 0}</span>
                    <span className="text-xs font-semibold text-gray-500">Tokens</span>
                  </div>
                  <button onClick={() => setIsAiModalOpen(false)} className="text-gray-400 hover:text-gray-900 p-2">
                    <X className="w-5 h-5" />
                  </button>
                </div>
 </div>
 
 <div className="p-6">
 <textarea 
 rows={4}
 value={aiPrompt}
 onChange={(e) => setAiPrompt(e.target.value)}
 placeholder="e.g. Write a proposal for a 3-month SEO campaign for a dental clinic in Lagos, including monthly technical audits, content writing, and backlink building. Price it around ₦1,500,000 total."
 className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 resize-none transition-all"
 disabled={isGenerating}
 />
 
 {aiError && (
 <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
 {aiError}
 </div>
 )}
 </div>

 <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center gap-3">
                {company?.aiTokens <= 0 ? (
                  <button 
                    onClick={handleTopUpTokens}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Buy Tokens (Mock Top-Up)
                  </button>
                ) : (
                  <div /> // Spacer
                )}
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsAiModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                    disabled={isGenerating}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleGenerateAI}
                    disabled={isGenerating || !aiPrompt.trim() || company?.aiTokens <= 0}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </div>
 </div>
 </div>
 )}

 {/* Document Canvas */}
 <div className="max-w-[900px] mx-auto mt-8 bg-white border border-gray-200 rounded-2xl p-12 md:p-16 relative overflow-hidden">
 
 {/* Document Header (Always visible in edit modes, styled differently in preview) */}
 {activeTab !== 'preview' && (
 <div className="flex flex-col sm:flex-row justify-between items-start gap-8 sm:gap-4 mb-16 pb-12 border-b border-gray-100">
 <div>
 <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-4 break-words">{company?.name || 'Loading Company...'}</h2>
 <div className="text-sm text-gray-500 space-y-1">
 <p>{company?.companyEmail || 'hello@company.com'}</p>
 <p>{company?.companyPhone || '+234 000 000 0000'}</p>
 </div>
 </div>
 <div className="text-left sm:text-right w-full sm:w-auto">
 <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Proposal / Estimate</div>
 <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tighter mb-6 break-words">#PRJ-092</h1>
 <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-left w-64">
 <select 
 className="w-full bg-transparent text-sm font-bold text-gray-900 focus:outline-none mb-1 cursor-pointer"
 value={selectedClientId}
 onChange={(e) => setSelectedClientId(e.target.value)}
 >
 {clients.length === 0 && <option value="">Loading Clients...</option>}
 {clients.map(c => (
 <option key={c.id} value={c.id}>{c.name}</option>
 ))}
 </select>
 <div className="w-full bg-transparent text-xs text-gray-500 mt-1">Client Recipient</div>
 </div>
 </div>
 </div>
 )}

 {/* -------------------- PROPOSAL TAB -------------------- */}
 {activeTab === 'proposal' && (
 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
 <style dangerouslySetInnerHTML={{__html: `
 .quill-custom .ql-toolbar {
 border: none !important;
 border-bottom: 1px solid var(--surface-03, #f3f4f6) !important;
 padding: 12px 0 !important;
 margin-bottom: 32px !important;
 font-family: inherit !important;
 }
 .dark .quill-custom .ql-stroke {
 stroke: var(--foreground) !important;
 }
 .dark .quill-custom .ql-fill {
 fill: var(--foreground) !important;
 }
 .dark .quill-custom .ql-picker {
 color: var(--foreground) !important;
 }
 .dark .quill-custom .ql-picker-options {
 background-color: var(--surface-01) !important;
 border-color: var(--surface-03) !important;
 }
 .quill-custom .ql-container {
 border: none !important;
 font-family: inherit !important;
 }
 .quill-custom .ql-editor {
 padding: 0 !important;
 min-height: 500px;
 color: var(--foreground, #1f2937);
 }
 .quill-custom .ql-editor.ql-blank::before {
 left: 0 !important;
 font-style: normal !important;
 color: var(--muted, #9ca3af) !important;
 }
 .quill-custom .ql-editor h1 {
 font-size: 2.25rem;
 font-weight: 800;
 margin-top: 2rem;
 margin-bottom: 1rem;
 letter-spacing: -0.025em;
 line-height: 1.2;
 }
 .quill-custom .ql-editor h2 {
 font-size: 1.75rem;
 font-weight: 700;
 margin-top: 2.5rem;
 margin-bottom: 1rem;
 letter-spacing: -0.025em;
 line-height: 1.3;
 }
 .quill-custom .ql-editor p {
 font-size: 1.125rem;
 line-height: 1.8;
 margin-bottom: 1.5rem;
 color: var(--foreground, #374151);
 }
 .quill-custom .ql-editor ul, .quill-custom .ql-editor ol {
 padding-left: 1.5rem;
 margin-bottom: 1.5rem;
 }
 .quill-custom .ql-editor li {
 font-size: 1.125rem;
 line-height: 1.8;
 margin-bottom: 0.5rem;
 color: var(--foreground, #374151);
 }
 .quill-custom .ql-editor table {
 width: 100%;
 border-collapse: collapse;
 margin-bottom: 1.5rem;
 table-layout: fixed;
 }
 .quill-custom .ql-editor td {
 border: 1px solid var(--surface-03, #e5e7eb);
 padding: 12px;
 text-align: left;
 }
 .quill-custom .ql-editor tr:first-child td {
 background-color: var(--surface-02, #f9fafb);
 }
 `}} />
 
 <input 
 type="text"
 value={proposalTitle}
 onChange={(e) => setProposalTitle(e.target.value)}
 className="w-full text-3xl sm:text-4xl md:text-[3.5rem] font-extrabold text-gray-900 tracking-tighter leading-tight bg-transparent focus:outline-none mb-8 placeholder:text-gray-300"
 placeholder="Enter Proposal Title..."
 />
 
 <div className="w-full h-px bg-gray-100 mb-8"></div>
 
 <div className="editor-container quill-custom">
 <ReactQuill 
 theme="snow" 
 value={proposalHTML} 
 onChange={setProposalHTML} 
 modules={{
 toolbar: [
 [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
 [{ 'font': [] }],
 [{ 'size': [] }],
 ['bold', 'italic', 'underline', 'strike', 'blockquote'],
 [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
 [{ 'align': [] }],
 ['link', 'image'],
 ['clean']
 ]
 }}
 className="bg-white min-h-[500px]"
 />
 </div>
 
 <div className="flex items-center gap-4 mt-8">
 <button 
 onClick={() => setProposalHTML(prev => prev + '<br/><h2>New Section Title</h2><p>Start typing your content here...</p>')} 
 className="flex items-center gap-2 text-sm font-bold text-[#0C3B2E] hover:text-[#082B21] transition-colors py-2 px-4 bg-green-50 rounded-lg border border-green-100"
 >
 <Plus className="w-4 h-4" />
 Add Text Section
 </button>
 
 <button 
 onClick={() => setProposalHTML(prev => prev + '<br/><h2>Project Milestones</h2><table width="100%"><tbody><tr><td width="33%"><strong>Milestone</strong></td><td width="33%"><strong>Description</strong></td><td width="33%"><strong>Timeline</strong></td></tr><tr><td><br/></td><td><br/></td><td><br/></td></tr><tr><td><br/></td><td><br/></td><td><br/></td></tr></tbody></table><p><br/></p>')} 
 className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors py-2 px-4 bg-indigo-50 rounded-lg border border-indigo-100"
 >
 <LayoutGrid className="w-4 h-4" />
 Add Table
 </button>
 </div>
 </div>
 )}

 {/* -------------------- FINANCIALS TAB -------------------- */}
 {activeTab === 'financials' && (
 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="flex items-center gap-2 mb-8">
 <FileText className="w-4 h-4 text-gray-400" />
 <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Financial Breakdown</span>
 </div>

 <div className="space-y-6 mb-8">
 {items.map((item) => (
 <div key={item.id} className="group p-4 sm:p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-gray-200 hover:shadow-md transition-all relative">
 <div className="mb-4">
 <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
 <textarea rows={1} value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} placeholder="Item description..." className="w-full bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-indigo-500 rounded-xl p-3 text-sm font-medium text-gray-900 focus:outline-none resize-none leading-snug transition-all" />
 </div>
 
 <div className="flex flex-wrap items-end gap-4">
 <div className="flex-1 min-w-[100px]">
 <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Qty</label>
 <input type="number" placeholder="0" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} className="w-full bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-indigo-500 rounded-xl p-3 text-sm font-medium text-gray-900 focus:outline-none transition-all" />
 </div>
 <div className="flex-1 min-w-[120px]">
 <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Rate (₦)</label>
 <input type="number" placeholder="0" value={item.rate} onChange={(e) => updateItem(item.id, 'rate', e.target.value)} className="w-full bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-indigo-500 rounded-xl p-3 text-sm font-medium text-gray-900 focus:outline-none transition-all" />
 </div>
 <div className="w-full sm:w-32 flex flex-col justify-end">
 <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 sm:text-right">Amount</label>
 <span className="text-base font-bold text-gray-900 sm:text-right py-2">{formatCurrency((Number(item.quantity) || 0) * (Number(item.rate) || 0))}</span>
 </div>
 </div>

 <div className="mt-6 pt-4 border-t border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <label className="flex items-center gap-2 cursor-pointer group/sub w-fit">
 <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${item.isSubscription ? 'bg-indigo-600 border-indigo-600' : 'bg-gray-100 border-gray-200 group-hover/sub:border-indigo-300'}`}>
 {item.isSubscription && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
 </div>
 <input type="checkbox" checked={item.isSubscription} onChange={(e) => updateItem(item.id, 'isSubscription', e.target.checked)} className="hidden" />
 <span className="text-sm font-bold text-gray-600 group-hover/sub:text-gray-900 transition-colors">Recurring Subscription</span>
 </label>
 
 <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold w-fit">
 <Trash2 className="w-4 h-4" />
 <span className="sm:hidden">Remove Item</span>
 </button>
 </div>
 
 {item.isSubscription && (
 <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl animate-in slide-in-from-top-2 fade-in duration-200">
 <div className="flex-1 w-full">
 <label className="block text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Frequency</label>
 <select value={item.subscriptionFrequency} onChange={(e) => updateItem(item.id, 'subscriptionFrequency', e.target.value)} className="w-full bg-white border border-indigo-200 hover:border-indigo-300 focus:border-indigo-500 rounded-lg p-3 text-sm font-medium text-gray-900 focus:outline-none transition-all">
 <option value="WEEKLY">Weekly</option>
 <option value="MONTHLY">Monthly</option>
 <option value="YEARLY">Yearly</option>
 </select>
 </div>
 <div className="flex-1 w-full">
 <label className="block text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Start Date</label>
 <input type="date" value={item.subscriptionDate} onChange={(e) => updateItem(item.id, 'subscriptionDate', e.target.value)} className="w-full bg-white border border-indigo-200 hover:border-indigo-300 focus:border-indigo-500 rounded-lg p-3 text-sm font-medium text-gray-900 focus:outline-none transition-all" required={item.isSubscription} />
 </div>
 </div>
 )}
 </div>
 ))}
 </div>
 
 <button onClick={addItem} className="flex items-center gap-2 text-sm font-bold text-[#0C3B2E] hover:text-[#082B21] transition-colors py-2 mb-12">
 <Plus className="w-4 h-4" /> Add Line Item
 </button>

 {/* Totals Section */}
 <div className="flex justify-end mb-16">
 <div className="w-72 space-y-4">
 <div className="flex justify-between items-center text-sm font-medium text-gray-500">
 <span>Subtotal</span>
 <span className="text-gray-900">{formatCurrency(subtotal)}</span>
 </div>
 <div className="flex justify-between items-center text-sm font-medium text-gray-500">
 <div className="flex items-center gap-2">
 <span>Tax</span>
 <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100">
 <input type="number" placeholder="0" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="w-12 bg-transparent text-xs text-right focus:outline-none" />
 <span className="text-xs">%</span>
 </div>
 </div>
 <span className="text-gray-900">{formatCurrency(taxAmount)}</span>
 </div>
 
 <div className="pt-4 border-t-2 border-gray-900 flex justify-between items-end">
 <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">Total</span>
 <span className="text-2xl font-bold text-gray-900 tracking-tighter">{formatCurrency(total)}</span>
 </div>

 <div className="pt-4 flex justify-between items-center text-sm font-bold text-[#0C3B2E]">
 <div className="flex items-center gap-2">
 <span>Upfront Deposit</span>
 <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded border border-green-100">
 <input type="number" placeholder="0" value={deposit} onChange={(e) => setDeposit(e.target.value)} className="w-12 bg-transparent text-xs text-right focus:outline-none text-[#0C3B2E]" />
 <span className="text-xs">%</span>
 </div>
 </div>
 <span>{formatCurrency(depositAmount)}</span>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* -------------------- CLIENT PREVIEW TAB -------------------- */}
 {activeTab === 'preview' && (
 <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
 
 {/* Read-Only Document Header */}
 <div className="flex flex-col sm:flex-row justify-between items-start gap-8 sm:gap-4 mb-16 pb-12 border-b border-gray-100">
 <div>
 <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-4 break-words">{company?.name || 'Loading Company...'}</h2>
 <div className="text-sm text-gray-500 space-y-1">
 <p>{company?.companyEmail || 'hello@company.com'}</p>
 <p>{company?.companyPhone || '+234 000 000 0000'}</p>
 </div>
 </div>
 <div className="text-left sm:text-right w-full sm:w-auto">
 <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Proposal / Estimate</div>
 <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tighter mb-6 break-words">#PRJ-092</h1>
 <div className="text-left sm:text-right">
 <div className="text-sm font-bold text-gray-900 mb-1 break-words">
 {clients.find(c => c.id === selectedClientId)?.name || 'Client Name'}
 </div>
 <div className="text-xs text-gray-500 mt-1">Client Recipient</div>
 </div>
 </div>
 </div>

 {/* Read-Only Title */}
 <div className="mb-16">
 <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-12">
 {proposalTitle || 'Untitled Proposal'}
 </h1>
 </div>

 {/* Read-Only Proposal Text */}
 <div className="mb-16 pb-16 border-b border-gray-100">
 <div 
 className="quill-custom"
 >
 <div 
 className="ql-editor"
 dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
 />
 </div>
 </div>

 {/* Read-Only Financials */}
 <div>
 <h3 className="text-2xl font-bold text-gray-900 mb-8">Investment</h3>
 <table className="w-full mb-8">
 <thead>
 <tr className="border-b-2 border-gray-900">
 <th className="text-left py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Description</th>
 <th className="text-right py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 {items.map(item => (
 <tr key={item.id}>
 <td className="py-4 text-sm font-medium text-gray-900">{item.description}</td>
 <td className="py-4 text-right text-sm font-bold text-gray-900">{formatCurrency((Number(item.quantity) || 0) * (Number(item.rate) || 0))}</td>
 </tr>
 ))}
 </tbody>
 </table>

 <div className="flex justify-end">
 <div className="w-72 space-y-4">
 <div className="flex justify-between items-center text-sm font-medium text-gray-500">
 <span>Subtotal</span>
 <span className="text-gray-900">{formatCurrency(subtotal)}</span>
 </div>
 <div className="flex justify-between items-center text-sm font-medium text-gray-500">
 <span>Tax ({taxRate}%)</span>
 <span className="text-gray-900">{formatCurrency(taxAmount)}</span>
 </div>
 <div className="pt-4 border-t-2 border-gray-900 flex justify-between items-end">
 <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">Total</span>
 <span className="text-2xl font-bold text-gray-900 tracking-tighter">{formatCurrency(total)}</span>
 </div>
 <div className="pt-4 flex justify-between items-center text-sm font-bold text-[#0C3B2E]">
 <span>Required Deposit ({deposit}%)</span>
 <span>{formatCurrency(depositAmount)}</span>
 </div>
 </div>
 </div>
 </div>

 {/* Sticky Accept Footer (Client View) */}
 <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-white via-white to-transparent pointer-events-none z-10" />
 <div className="absolute bottom-8 left-0 w-full flex justify-center sm:justify-end px-6 sm:px-12 z-20 pointer-events-auto">
 <button 
   onClick={handleSend}
   disabled={isSending}
   className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-gray-900 bg-[#FFBA00] hover:bg-[#E6A700] transition-all hover:-translate-y-1 border border-transparent cursor-pointer disabled:opacity-50"
 >
   {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5 text-gray-900" />}
   {isSending ? 'Accepting Proposal...' : 'Accept Proposal'}
 </button>
 </div>
 
 </div>
 )}

 </div>
 </div>
 );
}
