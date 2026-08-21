import React from 'react';
import { MoreVertical } from 'lucide-react';

export function LeadsManagementWidget() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-base font-bold text-gray-900">Leads Management</h2>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical size={18} />
        </button>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-100 pb-2">
        <button className="text-sm font-semibold text-gray-900 border-b-2 border-purple-600 pb-2 -mb-[9px]">Status</button>
        <button className="text-sm font-medium text-gray-400 pb-2">Sources</button>
        <button className="text-sm font-medium text-gray-400 pb-2">Qualification</button>
      </div>

      <div className="space-y-5">
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600 w-24">Qualified</span>
          <div className="flex-1 bg-gray-100 rounded-full h-3.5 ml-2 overflow-hidden flex">
            <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-full rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600 w-24">Contacted</span>
          <div className="flex-1 bg-gray-100 rounded-full h-3.5 ml-2 overflow-hidden flex">
            <div className="bg-gradient-to-r from-purple-400 to-purple-500 h-full rounded-full opacity-80" style={{ width: '65%' }}></div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600 w-24">Lost</span>
          <div className="flex-1 bg-gray-100 rounded-full h-3.5 ml-2 overflow-hidden flex">
            <div className="bg-gradient-to-r from-purple-400 to-purple-500 h-full rounded-full opacity-60" style={{ width: '20%' }}></div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600 w-24">Won</span>
          <div className="flex-1 bg-gray-100 rounded-full h-3.5 ml-2 overflow-hidden flex">
            <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-full rounded-full" style={{ width: '70%' }}></div>
          </div>
        </div>

      </div>
    </div>
  );
}
