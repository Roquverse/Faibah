'use client';

import React, { useState, useEffect } from 'react';
import { Search, Download, CreditCard, Filter, ArrowDownLeft } from 'lucide-react';
import { PaymentsApi } from '@/lib/api';

export default function PaymentsPage() {
  const [data, setData] = useState<{
    totalReceived: number;
    receivedThisMonth: number;
    pendingClearance: number;
    payments: any[];
  }>({
    totalReceived: 0,
    receivedThisMonth: 0,
    pendingClearance: 0,
    payments: [],
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const res = await PaymentsApi.getAll();
      if (res) {
        setData({
          totalReceived: res.totalReceived || 0,
          receivedThisMonth: res.receivedThisMonth || 0,
          pendingClearance: res.pendingClearance || 0,
          payments: res.payments || [],
        });
      }
    } catch (e) {
      console.error('Error fetching payments:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPayments = data.payments.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.id?.toLowerCase().includes(q) ||
      p.client?.toLowerCase().includes(q) ||
      p.invoice?.toLowerCase().includes(q) ||
      p.method?.toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    if (data.payments.length === 0) return;
    const headers = ['Transaction ID', 'Date', 'Client', 'Invoice', 'Method', 'Amount'];
    const rows = data.payments.map(p => [
      p.id,
      p.date,
      `"${p.client}"`,
      p.invoice,
      p.method,
      `"${p.amount}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Faiba_Payments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-8 w-full font-sans flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">Ledger of all received payments across your projects.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-auto hidden md:block">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search payments..." 
              className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#346E3A]/20 transition-all w-full sm:w-64"
            />
          </div>
          
          <button 
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 bg-[#FBDF4B] text-gray-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#F3D53C] transition-colors border border-transparent shrink-0 w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Received (All Time)</div>
          <div className="text-2xl font-extrabold text-gray-900">
            ₦{data.totalReceived.toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Received This Month</div>
          <div className="text-2xl font-extrabold text-emerald-600">
            ₦{data.receivedThisMonth.toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pending Clearance</div>
            <div className="text-2xl font-extrabold text-amber-600">
              ₦{data.pendingClearance.toLocaleString()}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Invoice</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayments.map(payment => (
                <tr key={payment.rawId || payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-emerald-100 text-emerald-700">
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                    </div>
                    {payment.id}
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-medium">{payment.date}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{payment.client}</td>
                  <td className="px-6 py-4 text-[#346E3A] font-bold">{payment.invoice}</td>
                  <td className="px-6 py-4 text-gray-500 font-medium">
                    <span className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-700">
                      {payment.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-extrabold text-emerald-600">+{payment.amount}</td>
                </tr>
              ))}
              {filteredPayments.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">
                    No payment transactions recorded yet.
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
