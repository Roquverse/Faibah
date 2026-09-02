'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreHorizontal, FileText, CheckCircle2, XCircle, Clock, Copy, Send, Download, Receipt, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { InvoicesApi } from '@/lib/api';
import NewInvoiceModal from '@/components/dashboard/NewInvoiceModal';
import GenerateReceiptModal from '@/components/dashboard/GenerateReceiptModal';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [invoiceToEdit, setInvoiceToEdit] = useState<any>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeleteInvoice = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await InvoicesApi.delete(id);
      fetchInvoices();
    } catch (e) {
      console.error(e);
      alert("Failed to delete invoice.");
    }
  };

  const fetchInvoices = async () => {
    try {
      const data = await InvoicesApi.getAll();
      setInvoices(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"><FileText className="w-3.5 h-3.5" /> Draft</span>;
      case 'SENT': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700"><Clock className="w-3.5 h-3.5" /> Sent</span>;
      case 'PAID': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700"><CheckCircle2 className="w-3.5 h-3.5" /> Paid</span>;
      case 'CANCELLED': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700"><XCircle className="w-3.5 h-3.5" /> Cancelled</span>;
      default: return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  // KPI Calculations
  const defaultCurrency = invoices.length > 0 ? (invoices[0].currency === 'NGN' ? '₦' : invoices[0].currency === 'USD' ? '$' : invoices[0].currency) : '₦';

  let outstandingTotal = 0;
  let overdueTotal = 0;
  let thisMonthCollected = 0;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  invoices.forEach(inv => {
    const total = (inv.items?.reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0) * (1 + (inv.taxRate || 0) / 100);
    
    if (inv.status === 'SENT') {
      outstandingTotal += total;
      if (inv.dueDate && new Date(inv.dueDate) < now) {
        overdueTotal += total;
      }
    } else if (inv.status === 'PAID') {
      // Use updatedAt as a proxy for payment date for now
      const updated = new Date(inv.updatedAt || inv.createdAt);
      if (updated >= startOfMonth) {
        thisMonthCollected += total;
      }
    }
  });

  const formatCurrency = (amt: number) => `${defaultCurrency}${amt.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="p-4 md:p-8 w-full font-sans flex flex-col">
      
      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 shrink-0">
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-1">Outstanding Total</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(outstandingTotal)}</div>
          <div className="text-xs text-gray-400 mt-2">Unpaid Sent Invoices</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-1">Overdue Total</div>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(overdueTotal)}</div>
          <div className="text-xs text-red-500 mt-2">Action Required</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-1">Avg. Days to Payment</div>
          <div className="text-2xl font-bold text-gray-900">0 Days</div>
          <div className="text-xs text-gray-400 mt-2">Historical Average</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-1">This Month Collected</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(thisMonthCollected)}</div>
          <div className="text-xs text-green-600 mt-2">In current month</div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">Global view of all your receivables and payments.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>
          <button onClick={() => setIsNewInvoiceOpen(true)} className="flex items-center justify-center gap-2 bg-[#FFBA00] text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#E6A700] transition-colors border border-transparent whitespace-nowrap w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            New Invoice
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-gray-200 flex-1 min-h-[500px] flex flex-col">
        <div className="overflow-visible flex-1 pb-32">
          <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-4">Invoice ID</th>
              <th className="px-6 py-4">Client & Project</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4 text-right">Due Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.map(invoice => {
              const totalAmount = invoice.items?.reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;
              const formattedTotal = totalAmount + (totalAmount * ((invoice.taxRate || 0) / 100));

              return (
                <tr key={invoice.id} className={`hover:bg-gray-50 transition-colors cursor-pointer group ${openDropdownId === invoice.id ? 'relative z-50' : ''}`}>
                  <td className="px-6 py-4 font-medium text-gray-900">{invoice.invoiceRef || invoice.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 mb-0.5 flex items-center gap-2">
                      {invoice.client?.name || 'Unknown Client'}
                    </div>
                    <div className="text-xs text-gray-500">{invoice.project?.name || 'No Project Linked'}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(invoice.status)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    {invoice.currency === 'NGN' ? '₦' : invoice.currency === 'USD' ? '$' : invoice.currency}
                    {formattedTotal.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                      <Link 
                        href={`/invoices/${invoice.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1" title="View Invoice">
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                      {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInvoice(invoice);
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1" title="Generate Receipt">
                          <Receipt className="w-3.5 h-3.5" /> Receipt
                        </button>
                      )}
                      
                      <div className="relative dropdown-container">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === invoice.id ? null : invoice.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        
                        {openDropdownId === invoice.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden" onClick={e => e.stopPropagation()}>
                            <button 
                              onClick={() => {
                                setInvoiceToEdit(invoice);
                                setIsNewInvoiceOpen(true);
                                setOpenDropdownId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-2 transition-colors"
                            >
                              <FileText className="w-4 h-4" /> Edit Invoice
                            </button>
                            <button 
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" /> Delete Invoice
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No invoices found.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      <NewInvoiceModal 
        isOpen={isNewInvoiceOpen} 
        invoiceToEdit={invoiceToEdit}
        onClose={() => {
          setIsNewInvoiceOpen(false);
          setInvoiceToEdit(null);
        }} 
        onSuccess={() => {
          setIsNewInvoiceOpen(false);
          setInvoiceToEdit(null);
          fetchInvoices();
        }} 
      />

      <GenerateReceiptModal
        isOpen={!!selectedInvoice}
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onSuccess={() => {
          setSelectedInvoice(null);
          // Ideally fetchInvoices should be called to see status updates if we handle them
          // fetchInvoices();
        }}
      />

    </div>
  );
}
