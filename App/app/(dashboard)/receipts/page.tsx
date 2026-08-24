'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreHorizontal, FileText, Download } from 'lucide-react';
import { ReceiptsApi } from '@/lib/api';

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<any[]>([]);

  const fetchReceipts = async () => {
    try {
      const data = await ReceiptsApi.getAll();
      setReceipts(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  return (
    <div className="p-4 md:p-8 w-full font-sans flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receipts</h1>
          <p className="text-sm text-gray-500 mt-1">Global view of all recorded payments and receipts.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search receipts..." 
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex-1 min-h-0">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Receipt ID</th>
                <th className="px-6 py-4">Client & Invoice</th>
                <th className="px-6 py-4 text-right">Amount Paid</th>
                <th className="px-6 py-4 text-right">Payment Method</th>
                <th className="px-6 py-4 text-right">Payment Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {receipts.map(receipt => (
                <tr key={receipt.id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                  <td className="px-6 py-4 font-medium text-gray-900">{receipt.receiptRef || receipt.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 mb-0.5 flex items-center gap-2">
                      {receipt.invoice?.client?.name || 'Unknown Client'}
                    </div>
                    <div className="text-xs text-gray-500">Invoice #{receipt.invoice?.invoiceRef || receipt.invoice?.id?.slice(0, 8).toUpperCase()}</div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    {receipt.invoice?.currency === 'NGN' ? '₦' : receipt.invoice?.currency === 'USD' ? '$' : receipt.invoice?.currency}
                    {receipt.amountPaid.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-xs font-medium text-gray-700">
                      {receipt.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    {new Date(receipt.paymentDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-gray-400 hover:text-[#346E3A] hover:bg-green-50 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {receipts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No receipts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
