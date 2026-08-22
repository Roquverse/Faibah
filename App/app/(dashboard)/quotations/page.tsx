import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreHorizontal, FileText, CheckCircle2, XCircle, Clock, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { QuotationsApi } from '@/lib/api';
import NewQuotationModal from '@/components/dashboard/NewQuotationModal';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchQuotations = async () => {
    try {
      const data = await QuotationsApi.getAll();
      setQuotations(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"><FileText className="w-3.5 h-3.5" /> Draft</span>;
      case 'SENT': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700"><Clock className="w-3.5 h-3.5" /> Sent</span>;
      case 'ACCEPTED': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700"><CheckCircle2 className="w-3.5 h-3.5" /> Accepted</span>;
      case 'REJECTED': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
      default: return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="p-8 w-full font-sans flex flex-col">
      
      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Pipeline Value</div>
          <div className="text-2xl font-bold text-gray-900">₦1,970,000</div>
          <div className="text-xs text-gray-400 mt-2">Active Drafts & Sent</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-1">Conversion Rate</div>
          <div className="text-2xl font-bold text-gray-900">42%</div>
          <div className="text-xs text-green-600 font-medium mt-2">+5% from last month</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-1">Avg. Time to Accept</div>
          <div className="text-2xl font-bold text-gray-900">3.2 Days</div>
          <div className="text-xs text-gray-400 mt-2">Across rolling 90 days</div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
          <p className="text-sm text-gray-500 mt-1">Global view of all your sent quotes and their statuses.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search quotations..." 
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-64"
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[#FBDF4B] text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#F3D53C] transition-colors border border-transparent">
            <Plus className="w-4 h-4" />
            New Quotation
          </button>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex-1 min-h-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-4">Quote ID</th>
              <th className="px-6 py-4">Client & Project</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Value</th>
              <th className="px-6 py-4 text-right">Date Created</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {quotations.map(quote => {
              const totalAmount = quote.items?.reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;
              const formattedTotal = totalAmount + (totalAmount * ((quote.taxRate || 0) / 100));

              return (
                <tr key={quote.id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                  <td className="px-6 py-4 font-medium text-gray-900">{quote.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 mb-0.5 flex items-center gap-2">
                      {quote.client?.name || 'Unknown Client'}
                    </div>
                    <div className="text-xs text-gray-500">{quote.project?.name || 'No Project Linked'}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(quote.status)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    {quote.currency === 'NGN' ? '₦' : quote.currency === 'USD' ? '$' : quote.currency}
                    {formattedTotal.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    {new Date(quote.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {quote.status === 'SENT' && (
                        <button className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="Follow Up (Resend)">
                          Follow Up
                        </button>
                      )}
                      {quote.status === 'ACCEPTED' && (
                        <button className="px-3 py-1.5 text-xs font-bold text-gray-900 bg-[#FBDF4B] hover:bg-[#F3D53C] rounded-lg transition-colors border border-transparent" title="Convert to Invoice">
                          Convert
                        </button>
                      )}
                      <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {quotations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No quotations found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <NewQuotationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setIsModalOpen(false);
          fetchQuotations();
        }} 
      />

    </div>
  );
}
