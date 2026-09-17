'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Download, Trash2, Printer, X, CheckCircle2, Building2, User, FileText } from 'lucide-react';
import { ReceiptsApi, InvoicesApi, CompanyApi } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type ColumnDef } from '@/components/shared/DataTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ShareDropdown from '@/components/shared/ShareDropdown';

type Receipt = {
  id: string;
  receiptRef?: string;
  amountPaid: number;
  paymentMethod?: string;
  paymentDate: string;
  invoiceId?: string;
  invoice?: {
    invoiceRef?: string;
    currency?: string;
    taxRate?: number | null;
    status?: string | null;
    dueDate?: string | null;
    createdAt?: string | null;
    client?: {
      name?: string | null;
      email?: string | null;
      whatsappNumber?: string | null;
      address?: string | null;
      city?: string | null;
      country?: string | null;
    } | null;
    items?: {
      amount?: number | null;
      quantity?: number | null;
      unitPrice?: number | null;
      description?: string | null;
    }[] | null;
    receipts?: { amountPaid?: number | null }[] | null;
  } | null;
};

export default function ReceiptsPage() {
  const [receipts, setReceipts]           = useState<Receipt[]>([]);
  const [invoices, setInvoices]           = useState<any[]>([]);
  const [company, setCompany]             = useState<any>(null);
  const [search, setSearch]               = useState('');
  const [loading, setLoading]             = useState(true);
  const [showCreate, setShowCreate]       = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [form, setForm] = useState({
    invoiceId: '', amountPaid: '', paymentMethod: 'Bank Transfer',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [r, i, c] = await Promise.all([
        ReceiptsApi.getAll(),
        InvoicesApi.getAll(),
        CompanyApi.getProfile().catch(() => null),
      ]);
      setReceipts(r ?? []); setInvoices(i ?? []); setCompany(c ?? null);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.invoiceId || !form.amountPaid) return;
    setIsSubmitting(true);
    try {
      await ReceiptsApi.create({ invoiceId: form.invoiceId, amountPaid: parseFloat(form.amountPaid), paymentMethod: form.paymentMethod, paymentDate: form.paymentDate });
      setShowCreate(false);
      setForm({ invoiceId: '', amountPaid: '', paymentMethod: 'Bank Transfer', paymentDate: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (e) { console.error(e); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this receipt?')) return;
    await ReceiptsApi.delete(id);
    if (selectedReceipt?.id === id) setSelectedReceipt(null);
    fetchData();
  };

  const filtered = receipts.filter(r => {
    const q = search.toLowerCase();
    return !q || (r.receiptRef ?? '').toLowerCase().includes(q)
      || (r.invoice?.client?.name ?? '').toLowerCase().includes(q)
      || (r.invoice?.invoiceRef ?? '').toLowerCase().includes(q);
  });

  const columns: ColumnDef<Receipt>[] = [
    {
      key: 'receiptRef', header: 'Receipt Ref',
      render: r => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-green-100 text-green-700 shrink-0"><CheckCircle2 size={12} /></div>
          <span className="font-mono text-xs font-semibold text-gray-900">
            {r.receiptRef ?? `RCP-${r.id.slice(0, 6).toUpperCase()}`}
          </span>
        </div>
      ),
    },
    {
      key: 'client', header: 'Client & Invoice',
      render: r => (
        <div>
          <div className="font-semibold text-sm text-gray-900">{r.invoice?.client?.name ?? 'Client'}</div>
          <div className="text-xs text-gray-400">Invoice #{r.invoice?.invoiceRef ?? r.invoiceId?.slice(0, 6).toUpperCase()}</div>
        </div>
      ),
    },
    {
      key: 'amountPaid', header: 'Amount', headerClassName: 'text-right',
      render: r => (
        <div className="text-right font-bold text-green-600">
          {r.invoice?.currency === 'USD' ? '$' : '₦'}{Number(r.amountPaid).toLocaleString()}
        </div>
      ),
    },
    {
      key: 'paymentMethod', header: 'Method', headerClassName: 'text-right',
      render: r => (
        <div className="flex justify-end">
          <span className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-700">{r.paymentMethod ?? 'Bank Transfer'}</span>
        </div>
      ),
    },
    {
      key: 'paymentDate', header: 'Date', headerClassName: 'text-right',
      render: r => <div className="text-right text-sm text-gray-500">{new Date(r.paymentDate).toLocaleDateString()}</div>,
    },
    {
      key: 'actions', header: '',
      render: r => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={e => { e.stopPropagation(); setSelectedReceipt(r); }} className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" title="View / Print">
            <Download size={14} />
          </button>
          <button onClick={e => handleDelete(r.id, e)} className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Receipts"
        description="Record, view, and print payment receipts for your clients."
        action={{ label: 'Record Receipt', onClick: () => setShowCreate(true), icon: <Plus size={15} /> }}
      />

      <div className="p-6 space-y-6">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search receipts..." className="pl-9" />
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyTitle="No receipts yet"
          emptyDescription="Record a receipt when a client payment is confirmed."
          emptyAction={{ label: 'Record Receipt', onClick: () => setShowCreate(true) }}
          onRowClick={r => setSelectedReceipt(r)}
        />
      </div>

      {/* Record Modal */}
      {showCreate && (() => {
        const selectedInv = invoices.find(i => i.id === form.invoiceId);
        const invSubtotal = selectedInv?.items?.reduce((s: number, item: any) => s + (item.amount || 0), 0) || 0;
        const invTax = invSubtotal * ((selectedInv?.taxRate || 0) / 100);
        const invTotal = invSubtotal + invTax;
        const invPrevPaid = selectedInv?.receipts?.reduce((s: number, r: any) => s + (r.amountPaid || 0), 0) || 0;
        const invEnteredPaid = Math.max(0, parseFloat(form.amountPaid) || 0);
        const invEffectivePaid = invPrevPaid + invEnteredPaid;
        const invBalance = Math.max(0, invTotal - invEffectivePaid);
        const invSym = selectedInv?.currency === 'USD' ? '$' : '₦';

        return (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-bold text-gray-900">Record Payment Receipt</h3>
                <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Invoice</label>
                  <select required value={form.invoiceId}
                    onChange={e => {
                      const inv = invoices.find(i => i.id === e.target.value);
                      const sub = inv?.items?.reduce((s: number, item: any) => s + (item.amount || 0), 0) || 0;
                      const tot = sub + (sub * ((inv?.taxRate || 0) / 100));
                      const pd = inv?.receipts?.reduce((s: number, r: any) => s + (r.amountPaid || 0), 0) || 0;
                      const rem = Math.max(0, tot - pd);
                      setForm({ ...form, invoiceId: e.target.value, amountPaid: rem > 0 ? String(rem) : (tot > 0 ? String(tot) : '') });
                    }}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#FFBA00]"
                  >
                    <option value="">Select Invoice...</option>
                    {invoices.map(inv => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceRef ?? `INV-${inv.id.slice(0, 6)}`} — {inv.client?.name ?? 'Client'} ({inv.status})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedInv && (
                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs space-y-2">
                    <div className="flex justify-between items-center text-gray-500">
                      <span>Total Invoice Amount:</span>
                      <span className="font-bold text-gray-900">{invSym}{invTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <div className="flex flex-col">
                        <span className="text-[11px] text-gray-500">Amount Paid</span>
                        <span className="font-bold text-green-600 text-sm">
                          {invSym}{invEffectivePaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        {invPrevPaid > 0 && invEnteredPaid > 0 && (
                          <span className="text-[10px] text-gray-400">
                            ({invSym}{invEnteredPaid.toLocaleString()} new + {invSym}{invPrevPaid.toLocaleString()} prev)
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[11px] text-gray-500">Balance Remaining</span>
                        <span className="font-bold text-red-600 text-sm">
                          {invSym}{invBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Amount Paid</label>
                  <input type="number" required step="0.01" min="0.01" placeholder="0.00" value={form.amountPaid}
                    onChange={e => setForm({ ...form, amountPaid: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FFBA00]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Method</label>
                    <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FFBA00]">
                      {['Bank Transfer','Paystack','Card','Cash','Cheque'].map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Date</label>
                    <input type="date" required value={form.paymentDate} onChange={e => setForm({ ...form, paymentDate: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FFBA00]" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
                  <Button size="sm" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Recording...' : 'Record Receipt'}</Button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* View / Print Modal — Full Professional Receipt */}
      {selectedReceipt && (() => {
        const inv = selectedReceipt.invoice;
        const sym = inv?.currency === 'USD' ? '$' : inv?.currency === 'NGN' ? '₦' : (inv?.currency ?? '₦');
        const formatCurrency = (n: number) => `${sym}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        const subtotal = inv?.items?.reduce((s, item) => s + (item.amount || 0), 0) ?? 0;
        const tax      = subtotal * ((inv?.taxRate || 0) / 100);
        const invTotal = subtotal + tax;
        const totalPaid = inv?.receipts?.reduce((s, r) => s + (r.amountPaid || 0), 0) ?? Number(selectedReceipt.amountPaid);
        const balance  = Math.max(0, invTotal - totalPaid);
        const isFullyPaid = balance === 0 && invTotal > 0;
        const paidPct = invTotal > 0 ? Math.min(100, Math.round((totalPaid / invTotal) * 100)) : (isFullyPaid ? 100 : 0);

        const rcpRef   = selectedReceipt.receiptRef ?? `RCP-${selectedReceipt.id.slice(0, 6).toUpperCase()}`;
        const rcpDate  = new Date(selectedReceipt.paymentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            {/* Toolbar — print:hidden */}
            <div className="absolute top-4 right-4 flex items-center gap-2 print:hidden z-10">
              <ShareDropdown
                itemType="Receipt"
                itemRef={rcpRef}
                publicUrl={typeof window !== 'undefined' ? `${window.location.origin}/portal/receipts/${selectedReceipt.id}` : ''}
                client={inv?.client}
                triggerClassName="!bg-white !text-gray-700 !border-gray-200 hover:!bg-gray-50 !py-1.5"
              />
              <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0C3B2E] text-white rounded-lg text-xs font-bold hover:bg-[#082B21] transition-colors">
                <Printer size={13} /> Print / PDF
              </button>
              <button onClick={() => setSelectedReceipt(null)} className="p-1.5 bg-white text-gray-500 hover:text-gray-800 rounded-lg shadow">
                <X size={18} />
              </button>
            </div>

            {/* Receipt Document */}
            <div className="bg-white w-full max-w-[820px] max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl print:!shadow-none print:!rounded-none print:!max-h-none print:!overflow-visible font-sans">
              <div className="p-10 print:p-8 relative">

                {/* Watermark */}
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04] rotate-[-30deg] text-[110px] font-black tracking-widest uppercase ${
                  isFullyPaid ? 'text-green-700' : 'text-yellow-600'
                }`}>
                  {isFullyPaid ? 'PAID' : 'PARTIAL'}
                </div>

                {/* ── Header ── */}
                <div className="flex justify-between items-start mb-10">
                  {/* Brand */}
                  <div className="flex items-center gap-3">
                    {company?.logoUrl ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center">
                        <img src={company.logoUrl} alt={company.name} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-[#0C3B2E] rounded-xl flex items-center justify-center shrink-0">
                        <span className="text-[#FFBA00] font-black text-xl">
                          {company?.name ? company.name.charAt(0).toUpperCase() : 'F'}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="font-extrabold text-xl text-gray-900 leading-tight">{company?.name ?? 'Faibah'}</div>
                      <div className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase">{company?.workType ?? 'Digital Agency'}</div>
                    </div>
                  </div>

                  {/* Receipt badge */}
                  <div className="bg-[#0C3B2E] text-white p-5 rounded-2xl shadow-lg min-w-[200px]">
                    <div className="text-[10px] font-bold text-green-300 uppercase tracking-widest mb-1">Payment Receipt</div>
                    <div className="font-black text-lg tracking-tight">{rcpRef}</div>
                    <div className="text-xs text-green-200 mt-1">{rcpDate}</div>
                    <div className="mt-3 pt-3 border-t border-green-700/40 flex items-center justify-between">
                      <span className="text-xs text-green-300">Status</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isFullyPaid ? 'bg-green-400 text-green-900' : 'bg-[#FFBA00] text-yellow-900'
                      }`}>
                        {isFullyPaid ? 'PAID' : 'PARTIAL'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Parties ── */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {/* Bill To */}
                  <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl flex items-start gap-4">
                    <div className="w-9 h-9 bg-[#0C3B2E]/10 text-[#0C3B2E] rounded-xl flex items-center justify-center shrink-0">
                      <User size={18} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Received From</div>
                      <div className="font-bold text-gray-900 text-base">{inv?.client?.name ?? 'Valued Client'}</div>
                      {inv?.client?.email && <div className="text-xs text-gray-500 mt-0.5">{inv.client.email}</div>}
                      {inv?.client?.whatsappNumber && <div className="text-xs text-gray-500">{inv.client.whatsappNumber}</div>}
                      {inv?.client?.address && <div className="text-xs text-gray-400 mt-1">{inv.client.address}</div>}
                      {(inv?.client?.city || inv?.client?.country) && (
                        <div className="text-xs text-gray-400">{[inv?.client?.city, inv?.client?.country].filter(Boolean).join(', ')}</div>
                      )}
                    </div>
                  </div>

                  {/* From */}
                  <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl flex items-start gap-4">
                    <div className="w-9 h-9 bg-[#0C3B2E]/10 text-[#0C3B2E] rounded-xl flex items-center justify-center shrink-0">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Issued By</div>
                      <div className="font-bold text-gray-900 text-base">{company?.name ?? 'Faibah Agency'}</div>
                      {company?.companyEmail && <div className="text-xs text-gray-500 mt-0.5">{company.companyEmail}</div>}
                      {company?.companyPhone && <div className="text-xs text-gray-500">{company.companyPhone}</div>}
                      {company?.address && <div className="text-xs text-gray-400 mt-1">{company.address}</div>}
                      {(company?.city || company?.country) && (
                        <div className="text-xs text-gray-400">{[company?.city, company?.country].filter(Boolean).join(', ')}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Receipt & Invoice meta */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[{
                    label: 'Invoice Ref',
                    value: inv?.invoiceRef ? `#${inv.invoiceRef}` : `#${selectedReceipt.invoiceId?.slice(0,8).toUpperCase() ?? '—'}`,
                  }, {
                    label: 'Payment Method',
                    value: selectedReceipt.paymentMethod ?? 'Bank Transfer',
                  }, {
                    label: 'Payment Date',
                    value: rcpDate,
                  }].map(({ label, value }) => (
                    <div key={label} className="bg-[#0C3B2E]/5 border border-[#0C3B2E]/10 rounded-xl p-3.5">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
                      <div className="font-semibold text-gray-900 text-sm">{value}</div>
                    </div>
                  ))}
                </div>

                {/* ── Items Table ── */}
                {inv?.items && inv.items.length > 0 && (
                  <div className="mb-8 rounded-2xl overflow-hidden border border-gray-100">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#0C3B2E] text-white">
                        <tr>
                          <th className="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider w-10">#</th>
                          <th className="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider">Item &amp; Description</th>
                          <th className="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-center">Qty</th>
                          <th className="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-right">Rate</th>
                          <th className="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {inv.items.map((item, idx) => {
                          const parts = item.description ? item.description.split('|||') : ['Service'];
                          const itemName    = parts[0];
                          const itemDetails = parts.length > 1 ? parts.slice(1).join('') : '';
                          return (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                              <td className="px-5 py-4 text-gray-400 font-semibold text-xs">{String(idx + 1).padStart(2, '0')}</td>
                              <td className="px-5 py-4">
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                    <FileText size={14} />
                                  </div>
                                  <div>
                                    <div className="font-bold text-gray-900 text-sm">{itemName}</div>
                                    {itemDetails && <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{itemDetails}</div>}
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-center text-gray-700 font-medium">{item.quantity ?? 1}</td>
                              <td className="px-5 py-4 text-right text-gray-700 font-medium">{formatCurrency(item.unitPrice ?? 0)}</td>
                              <td className="px-5 py-4 text-right font-bold text-[#0C3B2E]">{formatCurrency(item.amount ?? 0)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* ── Totals + Payment Summary ── */}
                <div className="flex gap-6 mb-8">
                  {/* Payment progress */}
                  <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col items-center justify-center gap-3">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Progress</div>
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center shadow-inner"
                      style={{ background: `conic-gradient(#0C3B2E ${paidPct}%, #e5e7eb ${paidPct}%)` }}
                    >
                      <div className="w-14 h-14 bg-gray-50 rounded-full flex flex-col items-center justify-center">
                        <span className="font-black text-[#0C3B2E] text-base leading-none">{paidPct}%</span>
                        <span className="text-[9px] font-semibold text-gray-500">{isFullyPaid ? 'Paid' : 'Partial'}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5 w-full">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#0C3B2E]"></div>
                        <span className="text-gray-500 flex-1">Paid</span>
                        <span className="font-bold text-gray-900">{paidPct}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                        <span className="text-gray-500 flex-1">Remaining</span>
                        <span className="font-bold text-gray-900">{100 - paidPct}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="flex-[2] flex flex-col justify-end">
                    <div className="space-y-2.5 px-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">VAT ({inv?.taxRate ?? 0}%)</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(tax)}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                        <span className="font-bold text-gray-900">Invoice Total</span>
                        <span className="font-bold text-gray-900">{formatCurrency(invTotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">This Payment</span>
                        <span className="font-semibold text-green-700">{formatCurrency(Number(selectedReceipt.amountPaid))}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Paid to Date</span>
                        <span className="font-semibold text-green-700">{formatCurrency(totalPaid)}</span>
                      </div>
                    </div>
                    <div className={`p-5 rounded-xl flex justify-between items-center shadow-md ${
                      isFullyPaid
                        ? 'bg-green-600'
                        : 'bg-[#0C3B2E]'
                    }`}>
                      <div>
                        <div className="text-xs text-white/70 font-medium">Balance Remaining</div>
                        <div className="text-2xl font-black text-white">
                          {isFullyPaid ? 'Fully Paid' : formatCurrency(balance)}
                        </div>
                      </div>
                      {isFullyPaid && (
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                          <CheckCircle2 size={22} className="text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Bank Details ── */}
                {(company?.bankName || company?.accountNumber) && (
                  <div className="border-t border-gray-100 pt-6 mb-6">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">Bank Details</div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      {company?.bankName && (
                        <div><span className="font-semibold text-gray-700">Bank:</span> <span className="text-gray-600">{company.bankName}</span></div>
                      )}
                      {company?.accountName && (
                        <div><span className="font-semibold text-gray-700">Account Name:</span> <span className="text-gray-600">{company.accountName}</span></div>
                      )}
                      {company?.accountNumber && (
                        <div><span className="font-semibold text-gray-700">Account No:</span> <span className="text-gray-600">{company.accountNumber}</span></div>
                      )}
                      {company?.routingNumber && (
                        <div><span className="font-semibold text-gray-700">Routing:</span> <span className="text-gray-600">{company.routingNumber}</span></div>
                      )}
                      {company?.swiftCode && (
                        <div><span className="font-semibold text-gray-700">SWIFT:</span> <span className="text-gray-600">{company.swiftCode}</span></div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Footer ── */}
                <div className="border-t border-gray-100 pt-5 flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    This is an official computer-generated receipt.<br />
                    <span className="font-semibold text-gray-500">Thank you for your business!</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-400 font-medium">Receipt #{rcpRef}</div>
                    <div className="text-[10px] text-gray-300">Generated by Faibah Platform</div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
