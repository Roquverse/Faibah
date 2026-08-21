'use client';

import React from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Bell, 
  Shield, 
  Briefcase,
  MoreHorizontal
} from 'lucide-react';

export default function ClientProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Profile & Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and your team's access to projects.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Personal Info & Notifications */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <img src="https://ui-avatars.com/api/?name=Acme+Client&size=120" alt="Avatar" className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-gray-100" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Acme Client</h3>
              <p className="text-sm text-gray-500">acme@example.com</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <User className="w-4 h-4 text-gray-400" />
                Acme Corp
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Mail className="w-4 h-4 text-gray-400" />
                acme@example.com
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Phone className="w-4 h-4 text-gray-400" />
                +1 (555) 012-3456
              </div>
            </div>

            <button className="w-full mt-6 py-2 bg-gray-100 text-gray-900 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors">
              Edit Profile
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-400" />
              Notifications
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-600" />
                <div>
                  <div className="text-sm font-bold text-gray-900">Email Alerts</div>
                  <div className="text-xs text-gray-500">Get emails for quotes and invoices</div>
                </div>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-600" />
                <div>
                  <div className="text-sm font-bold text-gray-900">WhatsApp Messages</div>
                  <div className="text-xs text-gray-500">Receive urgent channel updates via WhatsApp</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: People on my team */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">People on my team</h2>
                <p className="text-sm text-gray-500 mt-1">Manage colleagues who have access to your projects.</p>
              </div>
              <button className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-colors shadow-sm">
                + Invite Colleague
              </button>
            </div>
            
            <div className="p-0 flex-1">
              <div className="divide-y divide-gray-100">
                
                {/* Contact 1 */}
                <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img src="https://ui-avatars.com/api/?name=Acme+Client" className="w-12 h-12 rounded-full bg-gray-100 shadow-sm border border-gray-200" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-gray-900">Acme Client</span>
                        <span className="inline-flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase border border-blue-100">You</span>
                      </div>
                      <div className="text-sm text-gray-500">acme@example.com</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 w-full sm:w-auto mt-4 sm:mt-0">
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Projects</div>
                      <div className="flex items-center gap-1">
                        <span className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold border border-indigo-100" title="Website Redesign">W</span>
                        <span className="w-6 h-6 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center text-xs font-bold border border-rose-100" title="Mobile App">M</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Role</div>
                      <span className="text-sm font-semibold text-gray-700">Primary Contact</span>
                    </div>
                  </div>
                </div>

                {/* Contact 2 */}
                <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img src="https://ui-avatars.com/api/?name=Jackson+Benett" className="w-12 h-12 rounded-full bg-gray-100 shadow-sm border border-gray-200" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-gray-900">Jackson Benett</span>
                      </div>
                      <div className="text-sm text-gray-500">jackson@example.com</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 w-full sm:w-auto mt-4 sm:mt-0">
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Projects</div>
                      <div className="flex items-center gap-1">
                        <span className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold border border-indigo-100" title="Website Redesign">W</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Role</div>
                      <span className="text-sm font-semibold text-gray-700">Viewer</span>
                    </div>
                    <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
