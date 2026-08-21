'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  Search, 
  Filter, 
  ArrowRight,
  MessageSquare
} from 'lucide-react';

export default function ClientProjectsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Projects</h1>
          <p className="text-gray-500 mt-1">All projects across the professionals you work with.</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow shadow-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Link href={`/portal/projects/${i}`} key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <Briefcase className="w-6 h-6" />
                </div>
                <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${i === 1 ? 'text-blue-700 bg-blue-50 border border-blue-100' : i === 2 ? 'text-green-700 bg-green-50 border border-green-100' : 'text-gray-600 bg-gray-100 border border-gray-200'}`}>
                  {i === 1 ? 'ONGOING' : i === 2 ? 'COMPLETED' : 'DRAFT'}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">Website Redesign Project</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-6">Complete overhaul of the company website including new branding assets and e-commerce integration.</p>
              
              <div className="flex items-center gap-2 text-sm text-gray-900 font-medium">
                <img src="https://ui-avatars.com/api/?name=Neuvant+Studios" className="w-6 h-6 rounded-full bg-gray-100" />
                Neuvant Studios
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              {i === 1 ? (
                <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs bg-amber-50 px-2.5 py-1 rounded-lg">
                  <MessageSquare className="w-4 h-4" /> 2 new messages
                </div>
              ) : (
                <div className="text-xs font-semibold text-gray-500">Updated 2 days ago</div>
              )}
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors shadow-sm">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
