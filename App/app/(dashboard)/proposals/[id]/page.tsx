'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Trash2, Plus } from 'lucide-react';
import { ProjectsApi } from '@/lib/api';
import { toast } from 'sonner';

interface ProposalItem {
  id: string;
  description: string;
  amount: number;
}

interface ProposalData {
  title: string;
  description: string;
  items: ProposalItem[];
}

const defaultProposalData: ProposalData = {
  title: 'Untitled Proposal',
  description: '[Proposal Title]\n[Section Sub-heading]\n[Start typing your paragraph here...]',
  items: [
    { id: '1', description: 'Concept Development & Scouting', amount: 500000 }
  ]
};

export default function ProposalPreviewPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [proposal, setProposal] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [proposalData, setProposalData] = useState<ProposalData>(defaultProposalData);
  const [isSavingProposal, setIsSavingProposal] = useState(false);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const data = await ProjectsApi.getProposal(id as string);
        setProposal(data);
        setProject(data.project);

        if (data.content) {
          try {
            const parsed = JSON.parse(data.content);
            if (parsed && typeof parsed === 'object') {
              setProposalData(parsed);
            }
          } catch(e) {
            setProposalData({
              ...defaultProposalData,
              description: data.content || ''
            });
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProposal();
  }, [id]);

  const handleSaveProposal = async () => {
    if (!proposal || !project) return;
    
    try {
      setIsSavingProposal(true);
      const contentString = JSON.stringify(proposalData);
      await ProjectsApi.updateProposal(project.id, proposal.id, contentString);
      toast.success('Proposal updated successfully');
    } catch (e) {
      toast.error('Failed to save proposal');
    } finally {
      setIsSavingProposal(false);
    }
  };

  const updateProposalData = (updates: Partial<ProposalData>) => {
    setProposalData(prev => ({ ...prev, ...updates }));
  };

  const addProposalItem = () => {
    setProposalData(prev => ({
      ...prev,
      items: [...prev.items, { id: Math.random().toString(), description: '', amount: 0 }]
    }));
  };

  const updateProposalItem = (id: string, field: keyof ProposalItem, value: any) => {
    setProposalData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const removeProposalItem = (id: string) => {
    setProposalData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8 bg-gray-50/50">
        <div className="text-gray-500 font-medium flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading proposal...
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 bg-gray-50/50 gap-4">
        <div className="text-gray-500 font-medium">Proposal not found.</div>
        <button onClick={() => router.push('/proposals')} className="text-blue-600 hover:underline">Go back to Proposals</button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-screen print:!min-h-0 bg-gray-100 pb-12 print:!p-0 print:!bg-white print:!block">
      
      {/* Top action bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-6 print:hidden shadow-sm">
        <div className="flex items-center gap-4 shrink-0">
          <button 
            onClick={() => router.push('/proposals')}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2 md:gap-3">
              Edit Proposal 
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium font-mono border border-gray-200">
                {proposal.id.slice(0,8).toUpperCase()}
              </span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSaveProposal}
            disabled={isSavingProposal}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white border border-transparent text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-70"
          >
            {isSavingProposal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSavingProposal ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="mt-8 px-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-12 max-w-4xl mx-auto min-h-[800px]">
          {/* Header */}
          <div className="flex justify-between items-start mb-16">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{project?.client?.company?.name || 'Avatec Interactives'}</h2>
              <div className="text-sm text-gray-500 space-y-1">
                <div>{project?.client?.company?.email || 'helpdesk@avatecinteractives.dev'}</div>
                <div>{project?.client?.company?.phone || '08035212521'}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">Proposal / Estimate</div>
              <div className="text-3xl font-bold text-gray-900 mb-4">#{project?.projectRef || 'PRJ-092'}</div>
              <div className="text-sm text-gray-900 font-semibold">{project?.client?.name || 'Arakunrin Cole'}</div>
              <div className="text-xs text-gray-500 mt-1">Client Recipient</div>
            </div>
          </div>

          <hr className="border-gray-100 mb-16" />

          {/* Main Content Editor */}
          <div className="mb-16">
            <input
              type="text"
              value={proposalData.title}
              onChange={(e) => updateProposalData({ title: e.target.value })}
              className="w-full text-4xl font-bold text-gray-900 mb-8 border-none p-0 focus:ring-0 placeholder-gray-300 bg-transparent"
              placeholder="Proposal Title"
            />
            <textarea
              value={proposalData.description}
              onChange={(e) => updateProposalData({ description: e.target.value })}
              className="w-full min-h-[200px] text-gray-700 text-base leading-relaxed border-none p-0 focus:ring-0 resize-none bg-transparent"
              placeholder="Start typing your paragraph here..."
            />
          </div>

          {/* Investment Section */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Investment</h3>
            
            <table className="w-full text-sm text-left mb-4">
              <thead className="border-b-2 border-gray-900">
                <tr>
                  <th className="py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Description</th>
                  <th className="py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs text-right w-48">Amount</th>
                  <th className="py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {proposalData.items.map((item) => (
                  <tr key={item.id} className="group">
                    <td className="py-4">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateProposalItem(item.id, 'description', e.target.value)}
                        className="w-full border-none p-0 focus:ring-0 bg-transparent font-medium text-gray-900"
                        placeholder="Item description"
                      />
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end font-bold text-gray-900">
                        <span>₦</span>
                        <input
                          type="number"
                          value={item.amount || ''}
                          onChange={(e) => updateProposalItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-24 text-right border-none p-0 focus:ring-0 bg-transparent font-bold ml-1"
                          placeholder="0.00"
                        />
                      </div>
                    </td>
                    <td className="py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => removeProposalItem(item.id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <button 
              onClick={addProposalItem}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
