'use client';

import React from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

export default function ClientOverviewPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back, Acme</h1>
        <p className="text-gray-500 mt-1">Here's what's happening across your projects today.</p>
      </div>

      {/* Attention Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
          <div className="bg-amber-100 p-2.5 rounded-xl text-amber-600 shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-900 text-sm">Invoice Due Soon</h3>
            <p className="text-amber-700 text-sm mt-1">Invoice #INV-0142 for $2,500 is due in 3 days.</p>
            <button className="mt-3 text-xs font-bold bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors">
              Review & Pay
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
          <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-blue-900 text-sm">Quotation Awaiting Response</h3>
            <p className="text-blue-700 text-sm mt-1">Neuvant Studios sent a quotation for Mobile App Redesign.</p>
            <button className="mt-3 text-xs font-bold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              View Quotation
            </button>
          </div>
        </div>
      </div>

      {/* Snapshot Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="text-sm font-semibold text-gray-500 mb-1">Active Projects</div>
          <div className="text-3xl font-extrabold text-gray-900">3</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="text-sm font-semibold text-gray-500 mb-1">Total Paid (Lifetime)</div>
          <div className="text-3xl font-extrabold text-gray-900">$12,450</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="text-sm font-semibold text-gray-500 mb-1">Outstanding Balance</div>
          <div className="text-3xl font-extrabold text-gray-900">$2,500</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          <div className="bg-white border border-gray-200 rounded-2xl p-1 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-4 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 text-sm">Diana Taylor</span>
                      <span className="text-sm text-gray-500">posted in</span>
                      <span className="text-sm font-semibold text-indigo-600">Website Redesign</span>
                    </div>
                    <p className="text-sm text-gray-700">Here is the latest mockup for the homepage, take a look when you have a minute.</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      2 hours ago
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/portal/messages" className="block text-center py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors border-t border-gray-100">
              View all messages
            </Link>
          </div>
        </div>

        {/* My Projects Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">My Projects</h2>
            <Link href="/portal/projects" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All</Link>
          </div>
          
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Link href={`/portal/projects/${i}`} key={i} className="block bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900">Website Redesign</h3>
                  <span className="inline-flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    ONGOING
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <img src="https://ui-avatars.com/api/?name=Neuvant+Studios" className="w-5 h-5 rounded-full" />
                  Neuvant Studios
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded-lg">
                    <MessageSquare className="w-4 h-4" /> 2 new
                  </div>
                  <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
