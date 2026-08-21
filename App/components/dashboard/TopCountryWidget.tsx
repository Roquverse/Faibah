import React from 'react';
import { MoreVertical, ArrowRight } from 'lucide-react';

const countries = [
  { rank: 1, name: 'Australia', flag: '🇦🇺', percentage: '48%' },
  { rank: 2, name: 'Malaysia', flag: '🇲🇾', percentage: '33%' },
  { rank: 3, name: 'Indonesia', flag: '🇮🇩', percentage: '25%' },
  { rank: 4, name: 'Singapore', flag: '🇸🇬', percentage: '17%' },
];

export function TopCountryWidget() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full flex flex-col justify-between relative">
      
      {/* Mock Map Background */}
      <div className="absolute top-6 left-6 w-1/2 h-3/4 rounded-xl bg-purple-50 flex items-center justify-center overflow-hidden border border-purple-100">
        <div className="w-full h-full relative">
          {/* Abstract blobs to simulate map dots/shape of SE Asia & Australia */}
          <div className="absolute top-1/2 left-1/3 w-8 h-8 bg-purple-400 rounded-full blur-md opacity-50"></div>
          <div className="absolute top-2/3 left-1/2 w-16 h-12 bg-purple-600 rounded-2xl blur-sm opacity-80 transform rotate-12"></div>
          <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-purple-500 rounded-full blur-sm opacity-60"></div>
          
          <div className="absolute bottom-2 left-2 flex gap-1 bg-white/80 p-1 rounded">
            <div className="w-4 h-4 flex items-center justify-center text-[10px] text-gray-500 font-bold border border-gray-200 bg-white rounded-sm">+</div>
            <div className="w-4 h-4 flex items-center justify-center text-[10px] text-gray-500 font-bold border border-gray-200 bg-white rounded-sm">-</div>
          </div>
        </div>
      </div>

      <div className="relative z-10 ml-auto w-5/12 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base font-bold text-gray-900">Top Country</h2>
          <button className="text-gray-400 hover:text-gray-600 -mr-2">
            <MoreVertical size={18} />
          </button>
        </div>

        <div className="space-y-4 flex-1">
          {countries.map((c) => (
            <div key={c.name} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-400 w-2">{c.rank}</span>
                <span className="text-sm">{c.flag}</span>
                <span className="text-xs font-medium text-gray-700">{c.name}</span>
              </div>
              <span className="text-xs font-bold text-gray-900">{c.percentage}</span>
            </div>
          ))}
        </div>

        <button className="mt-4 flex items-center justify-center gap-1 w-full py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm">
          View more <ArrowRight size={14} className="text-gray-400" />
        </button>
      </div>

    </div>
  );
}
