'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreHorizontal, FileText, Download, Trash2, Printer, CheckCircle2, X, Building2, CreditCard } from 'lucide-react';
import { ReceiptsApi, InvoicesApi } from '@/lib/api';

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  // Form State
  const [newReceipt, setNewReceipt] = useState({
    invoiceId: '',
    amountPaid: '',
    paymentMethod: 'Bank Transfer',
    paymentDate: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [receiptsData, invoicesData] = await Promise.all([
        ReceiptsApi.getAll(),
        InvoicesApi.getAll(),
      ]);
      setReceipts(receiptsData || []);
      setInvoices(invoicesData || []);
    } catch (e) {
      console.error('Error loading receipts data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReceipt.invoiceId || !newReceipt.amountPaid) return;

    setIsSubmitting(true);
    try {
      await ReceiptsApi.create({
        invoiceId: newReceipt.invoiceId,
        amountPaid: parseFloat(newReceipt.amountPaid),
        paymentMethod: newReceipt.paymentMethod,
        paymentDate: newReceipt.paymentDate,
      });

      setShowCreateModal(false);
      setNewReceipt({
        invoiceId: '',
        amountPaid: '',
        paymentMethod: 'Bank Transfer',
        paymentDate: new Date().toISOString().split('T')[0],
      });
      fetchData();
    } catch (e) {
      console.error('Failed to create receipt:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReceipt = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this receipt record?')) return;

    try {
      await ReceiptsApi.delete(id);
      if (selectedReceipt?.id === id) setSelectedReceipt(null);
      fetchData();
    } catch (e) {
      console.error('Failed to delete receipt:', e);
    }
  };

  const filteredReceipts = receipts.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const ref = r.receiptRef?.toLowerCase() || '';
    const client = r.invoice?.client?.name?.toLowerCase() || '';
    const invoiceRef = r.invoice?.invoiceRef?.toLowerCase() || '';
    return ref.includes(q) || client.includes(q) || invoiceRef.includes(q);
  });

  return (
    <div className="p-4 md:p-8 w-full font-sans flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receipts</h1>
          <p className="text-sm text-gray-500 mt-1">Record, view, and print payment receipts for your clients.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search receipts..." 
              className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#346E3A] focus:ring-1 focus:ring-[#346E3A] w-full sm:w-64"
            />
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 bg-[#FBDF4B] text-gray-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#F3D53C] transition-colors shadow-xs border border-transparent shrink-0"
          >
            <Plus className="w-4 h-4" /> Record Receipt
          </button>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex-1 min-h-0 shadow-xs">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Receipt Ref</th>
                <th className="px-6 py-4">Client & Invoice</th>
                <th className="px-6 py-4 text-right">Amount Paid</th>
                <th className="px-6 py-4 text-right">Method</th>
                <th className="px-6 py-4 text-right">Payment Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReceipts.map(receipt => (
                <tr 
                  key={receipt.id} 
                  onClick={() => setSelectedReceipt(receipt)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    {receipt.receiptRef || `RCP-${receipt.id.slice(0, 6).toUpperCase()}`}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 mb-0.5">
                      {receipt.invoice?.client?.name || 'Client'}
                    </div>
                    <div className="text-xs text-gray-400 font-medium">
                      Invoice #{receipt.invoice?.invoiceRef || receipt.invoiceId?.slice(0, 6).toUpperCase()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-600">
                    {receipt.invoice?.currency === 'USD' ? '$' : '₦'}
                    {Number(receipt.amountPaid).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-xs font-bold text-gray-700">
                      {receipt.paymentMethod || 'Bank Transfer'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500 font-semibold">
                    {new Date(receipt.paymentDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReceipt(receipt);
                        }}
                        title="View / Download PDF"
                        className="p-1.5 text-gray-400 hover:text-[#346E3A] hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteReceipt(receipt.id, e)}
                        title="Delete Receipt"
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReceipts.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">
                    No receipts recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Receipt Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-gray-900">Record Payment Receipt</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReceipt} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Invoice</label>
                <select
                  required
                  value={newReceipt.invoiceId}
                  onChange={(e) => {
                    const inv = invoices.find(i => i.id === e.target.value);
                    const total = inv ? inv.items?.reduce((s: number, item: any) => s + item.amount, 0) : '';
                    setNewReceipt({ ...newReceipt, invoiceId: e.target.value, amountPaid: total ? String(total) : newReceipt.amountPaid });
                  }}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#346E3A]"
                >
                  <option value="">Select Invoice...</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceRef || `INV-${inv.id.slice(0, 6)}`} - {inv.client?.name || 'Client'} (Status: {inv.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Amount Paid</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  placeholder="0.00"
                  value={newReceipt.amountPaid}
                  onChange={(e) => setNewReceipt({ ...newReceipt, amountPaid: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#346E3A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={newReceipt.paymentMethod}
                    onChange={(e) => setNewReceipt({ ...newReceipt, paymentMethod: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#346E3A]"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Paystack">Paystack</option>
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={newReceipt.paymentDate}
                    onChange={(e) => setNewReceipt({ ...newReceipt, paymentDate: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#346E3A]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#FBDF4B] text-gray-900 font-bold rounded-lg text-xs hover:bg-[#F3D53C] transition-colors"
                >
                  {isSubmitting ? 'Recording...' : 'Record Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View & Printable Receipt Document Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Top Toolbar (Non-printable) */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6 print:hidden">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Official Payment Receipt</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#346E3A] text-white rounded-lg text-xs font-bold hover:bg-[#2a592f] transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / PDF
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Content */}
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-gray-200 pb-6">
                <div>
                  <div className="text-xl font-extrabold text-[#346E3A] tracking-tight">FAIBA PLATFORM</div>
                  <div className="text-xs text-gray-500 mt-1">Payment Confirmation Receipt</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-gray-900">
                    {selectedReceipt.receiptRef || `RCP-${selectedReceipt.id.slice(0, 6).toUpperCase()}`}
                  </div>
                  <div className="text-xs text-gray-500 font-semibold mt-0.5">
                    Date: {new Date(selectedReceipt.paymentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 font-semibold block mb-1">Received From:</span>
                  <span className="font-bold text-gray-900 text-sm block">
                    {selectedReceipt.invoice?.client?.name || 'Valued Client'}
                  </span>
                  <span className="text-gray-500">
                    {selectedReceipt.invoice?.client?.email || ''}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block mb-1">Invoice Reference:</span>
                  <span className="font-bold text-gray-900 text-sm block">
                    #{selectedReceipt.invoice?.invoiceRef || selectedReceipt.invoiceId?.slice(0, 8)}
                  </span>
                  <span className="text-gray-500">
                    Payment Method: {selectedReceipt.paymentMethod || 'Bank Transfer'}
                  </span>
                </div>
              </div>

              {/* Amount Box */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 p-6 rounded-2xl text-center">
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Total Amount Received</div>
                <div className="text-3xl font-extrabold text-emerald-900">
                  {selectedReceipt.invoice?.currency === 'USD' ? '$' : '₦'}
                  {Number(selectedReceipt.amountPaid).toLocaleString()}
                </div>
                <div className="inline-flex items-center gap-1 mt-3 px-3 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Payment Successful
                </div>
              </div>

              {/* Footer Note */}
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
