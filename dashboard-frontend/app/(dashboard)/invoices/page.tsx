'use client';

import React, { useState } from 'react';
import { Search, Plus, MoreHorizontal, FileText, CheckCircle2, XCircle, Clock, Copy, Send, Download } from 'lucide-react';
import Link from 'next/link';

interface Invoice {
  id: string;
  projectTitle: string;
  client: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';
  amount: string;
  dueDate: string;
  daysOverdue?: number;
  sourceQuotationId?: string;
}

const mockInvoices: Invoice[] = [
  { id: 'INV-022', projectTitle: 'Website Redesign', client: 'Acme Corp', status: 'PAID', amount: '₦180,000', dueDate: 'Oct 30, 2023', sourceQuotationId: 'Q-001' },
  { id: 'INV-023', projectTitle: 'Mobile App MVP', client: 'Soylent Corp', status: 'SENT', amount: '₦1,850,000', dueDate: 'Nov 12, 2023', daysOverdue: 5 },
  { id: 'INV-024', projectTitle: 'Brand Identity', client: 'Globex Inc', status: 'DRAFT', amount: '₦120,000', dueDate: 'Nov 15, 2023' },
  { id: 'INV-025', projectTitle: 'SEO Audit', client: 'Initech', status: 'CANCELLED', amount: '₦80,000', dueDate: 'Nov 20, 2023' },
];

export default function InvoicesPage() {
  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'DRAFT': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"><FileText className="w-3.5 h-3.5" /> Draft</span>;
      case 'SENT': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700"><Clock className="w-3.5 h-3.5" /> Sent</span>;
      case 'PAID': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700"><CheckCircle2 className="w-3.5 h-3.5" /> Paid</span>;
      case 'CANCELLED': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700"><XCircle className="w-3.5 h-3.5" /> Cancelled</span>;
    }
  };

  return (
    <div className="p-8 w-full font-sans flex flex-col">
      
      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 shrink-0">
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-1">Outstanding Total</div>
          <div className="text-2xl font-bold text-gray-900">₦2,350,000</div>
          <div className="text-xs text-gray-400 mt-2">Unpaid Sent Invoices</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-1">Overdue Total</div>
          <div className="text-2xl font-bold text-red-600">₦450,000</div>
          <div className="text-xs text-red-500 mt-2">Action Required</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-1">Avg. Days to Payment</div>
          <div className="text-2xl font-bold text-gray-900">14 Days</div>
          <div className="text-xs text-gray-400 mt-2">Historical Average</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-1">This Month Collected</div>
          <div className="text-2xl font-bold text-green-600">₦850,000</div>
          <div className="text-xs text-green-600 mt-2">+12% vs last month</div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">Global view of all your receivables and payments.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-64"
            />
          </div>
          <button className="flex items-center gap-2 bg-[#FBDF4B] text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#F3D53C] transition-colors border border-transparent">
            <Plus className="w-4 h-4" />
            New Invoice
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex-1 min-h-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-4">Invoice ID</th>
              <th className="px-6 py-4">Client & Project</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4 text-right">Due Date</th>
              <th className="px-6 py-4 text-right">Days Overdue</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockInvoices.map(invoice => (
              <tr key={invoice.id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                <td className="px-6 py-4 font-medium text-gray-900">{invoice.id}</td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900 mb-0.5 flex items-center gap-2">
                    {invoice.client}
                    {invoice.sourceQuotationId && (
                      <Link href={`/quotations/${invoice.sourceQuotationId}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600 hover:bg-gray-200 transition-colors">
                        &larr; from Quotation #{invoice.sourceQuotationId}
                      </Link>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{invoice.projectTitle}</div>
                </td>
                <td className="px-6 py-4 text-center">
                  {getStatusBadge(invoice.status)}
                </td>
                <td className="px-6 py-4 text-right font-bold text-gray-900">{invoice.amount}</td>
                <td className="px-6 py-4 text-right text-gray-500">{invoice.dueDate}</td>
                <td className="px-6 py-4 text-right">
                  {invoice.daysOverdue ? (
                    <span className={`text-sm font-semibold text-red-500`}>
                      {invoice.daysOverdue} days
                    </span>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {invoice.status === 'SENT' && (
                      <>
                        <button className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="Send Reminder">
                          Reminder
                        </button>
                        <button className="px-3 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors" title="Mark Paid Manually">
                          Mark Paid
                        </button>
                      </>
                    )}
                    <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
