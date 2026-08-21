'use client';

import React from 'react';
import { Search, Download, CreditCard, Filter, ArrowDownLeft } from 'lucide-react';

interface Payment {
  id: string;
  date: string;
  client: string;
  invoice: string;
  amount: string;
  method: string;
}

const mockPayments: Payment[] = [
  { id: 'PAY-001', date: 'Oct 30, 2023', client: 'Acme Corp', invoice: 'INV-022', amount: '₦180,000', method: 'Bank Transfer' },
  { id: 'PAY-002', date: 'Oct 28, 2023', client: 'Globex Inc', invoice: 'INV-021', amount: '₦450,000', method: 'Paystack' },
  { id: 'PAY-003', date: 'Oct 15, 2023', client: 'Initech', invoice: 'INV-019', amount: '₦2,100,000', method: 'Card' },
];

export default function PaymentsPage() {
  return (
    <div className="p-8 w-full font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">Ledger of all received payments across your projects.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search payments..." 
              className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 bg-white text-gray-900 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 bg-[#FBDF4B] text-gray-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#F3D53C] transition-colors border border-transparent shrink-0">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Received (All Time)</div>
          <div className="text-2xl font-bold text-gray-900">₦2,730,000</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-1">Received This Month</div>
          <div className="text-2xl font-bold text-gray-900">₦630,000</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Pending Clearance</div>
            <div className="text-2xl font-bold text-gray-900">₦0</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
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
            {mockPayments.map(payment => (
              <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-green-100 text-green-700">
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                  </div>
                  {payment.id}
                </td>
                <td className="px-6 py-4 text-gray-500">{payment.date}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{payment.client}</td>
                <td className="px-6 py-4 text-gray-900 font-bold hover:text-indigo-600 transition-colors cursor-pointer">{payment.invoice}</td>
                <td className="px-6 py-4 text-gray-500">{payment.method}</td>
                <td className="px-6 py-4 text-right font-bold text-green-600">+{payment.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
