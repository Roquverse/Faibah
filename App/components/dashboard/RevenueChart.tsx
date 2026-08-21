"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { ChevronDown, MoreVertical } from 'lucide-react';

const data = [
  { name: 'Mar', value: 23000, target: 15000 },
  { name: 'Apr', value: 16000, target: 14000 },
  { name: 'May', value: 20000, target: 17000 },
  { name: 'Jun', value: 13000, target: 11000 },
  { name: 'Jul', value: 20000, target: 18000 },
  { name: 'Aug', value: 6000, target: 5000 },
  { name: 'Sept', value: 20000, target: 19000 },
  { name: 'Oct', value: 16000, target: 15000 },
  { name: 'Nov', value: 19000, target: 18000 },
  { name: 'Des', value: 9000, target: 8000 },
  { name: 'Jan', value: 6000, target: 5000 },
  { name: 'Feb', value: 7000, target: 6000 },
];

export function RevenueChart() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <h2 className="text-base font-bold text-gray-900">Revenue</h2>
            <ChevronDown size={16} className="text-gray-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">$32.209</span>
            <span className="text-xs font-semibold text-green-500">+22% vs last month</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-50 border border-gray-100 rounded-lg p-1">
            {['1 D', '1 W', '1 M', '6 M', '1 Y', 'ALL'].map((period, i) => (
              <button 
                key={period} 
                className={`px-3 py-1 text-xs font-semibold rounded-md ${period === '1 Y' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => `${value / 1000}k`} />
            <Tooltip 
              cursor={{ fill: '#f9fafb' }} 
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            
            {/* The bar chart uses a light purple background with a solid purple top border/fill in the design.
                We simulate this with a solid light color and stroke for simplicity, or just a solid purple like the image.
                Actually the image has a white bar with purple top edge, or very light purple. */}
            <Bar dataKey="value" fill="#f3e8ff" radius={[4, 4, 0, 0]} barSize={32} stroke="#a855f7" strokeWidth={2} strokeDasharray="0 0 0 1" />
            
            <Line type="monotone" dataKey="target" stroke="#e5e7eb" strokeWidth={2} dot={{ r: 3, fill: '#d1d5db', strokeWidth: 0 }} strokeDasharray="5 5" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
