'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  MessageSquare,
  FileText,
  Clock
} from 'lucide-react';

export default function ClientMessagesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Messages</h1>
          <p className="text-gray-500 mt-1">Unified inbox for all your project channels.</p>
        </div>
      </div>

      <div className="flex gap-4 shrink-0">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search messages..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow shadow-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Link href="/portal/projects/1" key={i} className={`flex gap-4 p-5 hover:bg-gray-50 transition-colors ${i === 1 ? 'bg-indigo-50/30' : ''}`}>
                <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0 overflow-hidden border border-gray-200 shadow-sm">
                  <img src={i % 2 === 0 ? "https://ui-avatars.com/api/?name=Neuvant+Studios" : "https://ui-avatars.com/api/?name=Diana+Taylor"} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm truncate">
                        {i % 2 === 0 ? 'Neuvant Studios' : 'Diana Taylor'}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded">
                        {i % 2 === 0 ? 'Agency' : 'Project Manager'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      {i === 1 ? 'Just now' : `${i} hours ago`}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 mb-2">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Website Redesign Project
                  </div>
                  
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {i === 3 
                      ? "I've attached the final invoice for milestone 1. Please review and process the payment when you have a moment." 
                      : "Here is the latest mockup for the homepage, take a look when you have a minute. We've incorporated the feedback regarding the hero section."}
                  </p>

                  {i === 3 && (
                    <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100 w-fit">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-semibold text-gray-900">Invoice-INV-001.pdf</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
