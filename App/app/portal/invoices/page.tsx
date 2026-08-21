'use client';

import React from 'react';
import { 
  Search, 
  Filter, 
  DownloadCloud,
  FileText,
  Building
} from 'lucide-react';

export default function ClientInvoicesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Invoices</h1>
          <p className="text-gray-500 mt-1">All invoices across all your projects and vendors.</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search invoices..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow shadow-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice / Date</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Professional / Project</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3, 4].map((i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${i === 1 ? 'bg-amber-100 text-amber-600' : i === 2 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">#INV-{1000 + i}</div>
                        <div className="text-xs text-gray-500 font-medium">Issued Oct 12, 2023</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <img src="https://ui-avatars.com/api/?name=Neuvant+Studios" className="w-5 h-5 rounded-full bg-gray-100" />
                      Neuvant Studios
                    </div>
                    <div className="text-xs text-gray-500 font-medium flex items-center gap-1.5 mt-1">
                      <Building className="w-3.5 h-3.5" /> Website Redesign
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-extrabold text-gray-900">
                      $2,500.00
                    </div>
                    <div className="text-xs text-gray-500 font-medium">USD</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${i === 1 ? 'text-amber-700 bg-amber-50 border border-amber-200' : i === 2 ? 'text-blue-700 bg-blue-50 border border-blue-200' : 'text-gray-600 bg-gray-100 border border-gray-200'}`}>
                      {i === 1 ? 'DUE IN 3 DAYS' : i === 2 ? 'AWAITING PAYMENT' : 'PAID'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <DownloadCloud className="w-4 h-4" />
                      </button>
                      {(i === 1 || i === 2) ? (
                        <button className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                          Pay Now
                        </button>
                      ) : (
                        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                          View
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
