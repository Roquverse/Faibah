'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Download, Trash2, Printer, X, CheckCircle2 } from 'lucide-react';
import { ReceiptsApi, InvoicesApi } from '@/lib/api';
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
    client?: { name?: string | null; email?: string | null; whatsappNumber?: string | null } | null;
  } | null;
};

export default function ReceiptsPage() {
  const [receipts, setReceipts]           = useState<Receipt[]>([]);
  const [invoices, setInvoices]           = useState<any[]>([]);
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
      const [r, i] = await Promise.all([ReceiptsApi.getAll(), InvoicesApi.getAll()]);
      setReceipts(r ?? []); setInvoices(i ?? []);
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
      {showCreate && (
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
                    const total = inv?.items?.reduce((s: number, item: any) => s + item.amount, 0);
                    setForm({ ...form, invoiceId: e.target.value, amountPaid: total ? String(total) : form.amountPaid });
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
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Amount Paid</label>
                <input type="number" required step="0.01" placeholder="0.00" value={form.amountPaid}
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
      )}

      {/* View / Print Modal — preserved exactly */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6 print:hidden">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Official Payment Receipt</span>
              <div className="flex items-center gap-2">
                <ShareDropdown
                  itemType="Receipt"
                  itemRef={selectedReceipt.receiptRef ?? `RCP-${selectedReceipt.id.slice(0, 6).toUpperCase()}`}
                  publicUrl={typeof window !== 'undefined' ? `${window.location.origin}/portal/receipts/${selectedReceipt.id}` : ''}
                  client={selectedReceipt.invoice?.client}
                  triggerClassName="!bg-white !text-gray-700 !border-gray-200 hover:!bg-gray-50 !py-1.5"
                />
                <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0C3B2E] text-white rounded-lg text-xs font-bold hover:bg-[#082B21] transition-colors">
                  <Printer size={13} /> Print / PDF
                </button>
                <button onClick={() => setSelectedReceipt(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"><X size={18} /></button>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-gray-200 pb-6">
                <div>
                  <div className="text-xl font-extrabold text-[#0C3B2E] tracking-tight">FAIBAH PLATFORM</div>
                  <div className="text-xs text-gray-500 mt-1">Payment Confirmation Receipt</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-gray-900">{selectedReceipt.receiptRef ?? `RCP-${selectedReceipt.id.slice(0, 6).toUpperCase()}`}</div>
                  <div className="text-xs text-gray-500 font-semibold mt-0.5">Date: {new Date(selectedReceipt.paymentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 font-semibold block mb-1">Received From:</span>
                  <span className="font-bold text-gray-900 text-sm block">{selectedReceipt.invoice?.client?.name ?? 'Valued Client'}</span>
                  <span className="text-gray-500">{selectedReceipt.invoice?.client?.email ?? ''}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block mb-1">Invoice Reference:</span>
                  <span className="font-bold text-gray-900 text-sm block">#{selectedReceipt.invoice?.invoiceRef ?? selectedReceipt.invoiceId?.slice(0, 8)}</span>
                  <span className="text-gray-500">Payment Method: {selectedReceipt.paymentMethod ?? 'Bank Transfer'}</span>
                </div>
              </div>
              <div className="bg-green-50/70 border border-green-200/80 p-6 rounded-2xl text-center">
                <div className="text-xs font-bold text-green-800 uppercase tracking-wider mb-1">Total Amount Received</div>
                <div className="text-3xl font-extrabold text-green-900">
                  {selectedReceipt.invoice?.currency === 'USD' ? '$' : '₦'}{Number(selectedReceipt.amountPaid).toLocaleString()}
                </div>
                <div className="inline-flex items-center gap-1 mt-3 px-3 py-1 bg-green-600 text-white text-[11px] font-bold rounded-full">
                  <CheckCircle2 size={12} /> Payment Successful
                </div>
              </div>
              <div className="pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
                Thank you for your business! This is an official computer-generated payment receipt.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
