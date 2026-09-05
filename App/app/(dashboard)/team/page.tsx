'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Mail, Shield, Trash2, Loader2, X, Send } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTierAccess } from '@/lib/permissions/useTierAccess';
import { redirect } from 'next/navigation';
import { CompanyApi } from '@/lib/api';
import { toast } from 'sonner';

export default function TeamPage() {
  const { canAccess, loading: tierLoading } = useTierAccess();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await CompanyApi.getTeamMembers();
      setMembers(data || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsInviting(true);
      await CompanyApi.inviteTeamMember(email, role);
      toast.success('Invitation sent successfully');
      setShowInviteModal(false);
      setEmail('');
      setRole('MEMBER');
      fetchMembers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  if (!tierLoading && !canAccess('team')) {
    redirect('/?upgrade=agency');
  }

  return (
    <div className="flex flex-col h-full relative">
      <PageHeader
        title="Team"
        description="Manage team members, roles and project access."
        action={{ label: 'Invite Member', onClick: () => setShowInviteModal(true), icon: <Plus size={15} /> }}
      />
      <div className="flex-1 p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : members.length === 0 ? (
          <EmptyState
            icon={<Users size={28} />}
            title="No team members yet"
            description="Invite team members to collaborate on projects, tasks and channels."
            action={{ label: 'Invite Member', onClick: () => setShowInviteModal(true) }}
          />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Member</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#0C3B2E]/10 flex items-center justify-center text-[#0C3B2E] font-bold text-xs">
                          {member.name?.[0] || member.email?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{member.name || 'Pending Invite'}</div>
                          <div className="text-gray-500 text-xs">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        <Shield className="w-3 h-3" />
                        {member.userType === 'ADMIN' ? 'Admin' : 'Member'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Invite Team Member</h3>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleInvite} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]/20 focus:border-[#0C3B2E] transition-shadow text-sm"
                    placeholder="colleague@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`cursor-pointer border rounded-lg p-3 flex flex-col gap-1 transition-colors ${role === 'MEMBER' ? 'border-[#0C3B2E] bg-[#0C3B2E]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-gray-900">Member</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${role === 'MEMBER' ? 'border-[#0C3B2E]' : 'border-gray-300'}`}>
                        {role === 'MEMBER' && <div className="w-2 h-2 rounded-full bg-[#0C3B2E]" />}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">Can view and edit projects they are added to.</span>
                    <input type="radio" name="role" value="MEMBER" className="sr-only" checked={role === 'MEMBER'} onChange={() => setRole('MEMBER')} />
                  </label>
                  
                  <label className={`cursor-pointer border rounded-lg p-3 flex flex-col gap-1 transition-colors ${role === 'ADMIN' ? 'border-[#0C3B2E] bg-[#0C3B2E]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-gray-900">Admin</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${role === 'ADMIN' ? 'border-[#0C3B2E]' : 'border-gray-300'}`}>
                        {role === 'ADMIN' && <div className="w-2 h-2 rounded-full bg-[#0C3B2E]" />}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">Full access to all projects, billing, and settings.</span>
                    <input type="radio" name="role" value="ADMIN" className="sr-only" checked={role === 'ADMIN'} onChange={() => setRole('ADMIN')} />
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting || !email}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0C3B2E] border border-transparent rounded-lg hover:bg-[#0C3B2E]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C3B2E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
