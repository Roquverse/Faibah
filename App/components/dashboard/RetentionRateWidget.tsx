"use client";

import React from 'react';
import { MoreVertical } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jun', smes: 20, startups: 15, enterprises: 10 },
  { name: 'Jul', smes: 25, startups: 20, enterprises: 12 },
  { name: 'Aug', smes: 30, startups: 25, enterprises: 15 },
  { name: 'Sep', smes: 35, startups: 30, enterprises: 18 },
];

export function RetentionRateWidget() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-1">Retention Rate</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">95%</span>
            <span className="text-xs font-semibold text-green-500">+12% vs last month</span>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical size={18} />
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-500">
          <div className="w-2 h-2 rounded-full bg-purple-200"></div> SMEs
        </div>
        <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-500">
          <div className="w-2 h-2 rounded-full bg-purple-400"></div> Startups
        </div>
        <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-500">
          <div className="w-2 h-2 rounded-full bg-purple-600"></div> Enterprises
        </div>
      </div>

      <div className="flex-1 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barSize={24}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} dy={5} />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
            />
            {/* The stack order in recharts is bottom-up for the array items. In the design, it's 3 shades of purple. */}
            <Bar dataKey="smes" stackId="a" fill="#e9d5ff" radius={[0, 0, 4, 4]} />
            <Bar dataKey="startups" stackId="a" fill="#c084fc" />
            <Bar dataKey="enterprises" stackId="a" fill="#9333ea" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
