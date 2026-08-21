import React from 'react';
import { Users, Activity, PieChart, DollarSign, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

const kpiData = [
  {
    title: 'Leads',
    value: '129',
    trend: '+2%',
    trendUp: true,
    comparison: 'vs last week',
    icon: <Users size={18} className="text-gray-700" />,
  },
  {
    title: 'CLV',
    value: '14d',
    trend: '-4%',
    trendUp: false,
    comparison: 'vs last week',
    icon: <Activity size={18} className="text-gray-700" />,
  },
  {
    title: 'Conversion Rate',
    value: '24%',
    trend: '+2%',
    trendUp: true,
    comparison: 'vs last week',
    icon: <PieChart size={18} className="text-gray-700" />,
  },
  {
    title: 'Revenue',
    value: '$1.4K',
    trend: '-4%',
    trendUp: false,
    comparison: 'vs last month',
    icon: <DollarSign size={18} className="text-gray-700" />,
  },
];

export function KpiCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {kpiData.map((kpi, idx) => (
        <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                {kpi.icon}
              </div>
              <span className="font-semibold text-gray-700 text-sm">{kpi.title}</span>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <Info size={16} />
            </button>
          </div>
          
          <div className="flex items-end justify-between mt-2">
            <div className="flex items-baseline gap-3">
              <h2 className="text-3xl font-bold text-gray-900">{kpi.value}</h2>
              <div className={`flex items-center text-xs font-semibold ${kpi.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                {kpi.trendUp ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
                {kpi.trend}
              </div>
            </div>
            <span className="text-xs text-gray-400 font-medium mb-1">{kpi.comparison}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
