'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  CheckCircle2, 
  FileText, 
  MessageSquare, 
  AlertCircle,
  ChevronDown,
  FileBox,
  Users,
  Download,
  Heart,
  ThumbsUp,
  Smile,
  Hash,
  Image as ImageIcon
} from 'lucide-react';

interface ChannelMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderType: 'TEAM' | 'CLIENT';
  content: string;
  attachmentUrl?: string;
  visibility: 'INTERNAL' | 'CLIENT_VISIBLE';
  messageType: 'TEXT' | 'FILE' | 'REVIEW_REQUEST';
  reviewStatus?: 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED';
  topic?: string;
  reactions?: { emoji: string; count: number; userReacted: boolean }[];
  createdAt: string;
}

interface ProjectChannelProps {
  projectId: string;
  isClientView?: boolean;
}

// Mock members
const MEMBERS = [
  { id: 't1', name: 'Diana Taylor', role: 'Project Manager', type: 'TEAM', avatar: 'https://ui-avatars.com/api/?name=Diana+Taylor' },
  { id: 't2', name: 'Daniel Anderson', role: 'Developer', type: 'TEAM', avatar: 'https://ui-avatars.com/api/?name=Daniel+Anderson' },
  { id: 'c1', name: 'Acme Client', role: 'Client', type: 'CLIENT', avatar: 'https://ui-avatars.com/api/?name=Acme+Client' },
];

const TOPICS = ['General', 'Design', 'Payments', 'Milestones'];

// Mock messages for MVP
const MOCK_MESSAGES: ChannelMessage[] = [
  {
    id: 'm1',
    senderId: 't1',
    senderName: 'Diana Taylor',
    senderAvatar: 'https://ui-avatars.com/api/?name=Diana+Taylor',
    senderType: 'TEAM',
    content: 'Homepage mockups are 90% done...\n@Acme Client take a look',
    topic: 'Design',
    visibility: 'CLIENT_VISIBLE',
    messageType: 'TEXT',
    reactions: [{ emoji: '❤️', count: 2, userReacted: true }],
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: 'm2',
    senderId: 't2',
    senderName: 'Daniel Anderson',
    senderAvatar: 'https://ui-avatars.com/api/?name=Daniel+Anderson',
    senderType: 'TEAM',
    content: 'Keep me updated on the deposit @Diana Taylor',
    topic: 'Payments',
    visibility: 'INTERNAL',
    messageType: 'TEXT',
    createdAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
  },
  {
    id: 'm3',
    senderId: 't1',
    senderName: 'Diana Taylor',
    senderAvatar: 'https://ui-avatars.com/api/?name=Diana+Taylor',
    senderType: 'TEAM',
    content: 'Here is the UI kit draft.',
    topic: 'Design',
    attachmentUrl: 'ui-kit-v1.pdf',
    visibility: 'CLIENT_VISIBLE',
    messageType: 'FILE',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  }
];

export default function ProjectChannel({ projectId, isClientView = false }: ProjectChannelProps) {
  const [messages, setMessages] = useState<ChannelMessage[]>(MOCK_MESSAGES);
  const [draft, setDraft] = useState('');
  const [visibility, setVisibility] = useState<'INTERNAL' | 'CLIENT_VISIBLE'>('CLIENT_VISIBLE');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('ALL');
  const [isTopicDropdownOpen, setIsTopicDropdownOpen] = useState(false);
  
  // Modals for Members
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  
  const [isAddingNewClientContact, setIsAddingNewClientContact] = useState(false);
  const [teamInviteInput, setTeamInviteInput] = useState('');
  
  // Info Panel Tabs
  const [infoTab, setInfoTab] = useState<'info' | 'files' | 'members'>('info');

  // Mentions logic
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Filter messages
  const visibleMessages = messages.filter(m => {
    if (isClientView && m.visibility === 'INTERNAL') return false;
    if (selectedTopicFilter !== 'ALL' && m.topic !== selectedTopicFilter) return false;
    return true;
  });

  const handleDraftChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDraft(val);

    // Simple mention trigger logic
    const lastWord = val.split(' ').pop();
    if (lastWord && lastWord.startsWith('@')) {
      setShowMentions(true);
      setMentionQuery(lastWord.substring(1).toLowerCase());
    } else {
      setShowMentions(false);
    }
  };

  const handleSelectMention = (name: string) => {
    const words = draft.split(' ');
    words.pop(); // remove the incomplete @name
    const newDraft = words.join(' ') + (words.length > 0 ? ' ' : '') + `@${name} `;
    setDraft(newDraft);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const filteredMembersForMention = MEMBERS.filter(m => m.name.toLowerCase().includes(mentionQuery));

  const handleSend = () => {
    if (!draft.trim()) return;

    // Optional: detect topic if we implemented a composer dropdown, default to General for now
    const newMessage: ChannelMessage = {
      id: `m${Date.now()}`,
      senderId: isClientView ? 'c1' : 't1',
      senderName: isClientView ? 'Acme Client' : 'Diana Taylor',
      senderAvatar: `https://ui-avatars.com/api/?name=${isClientView ? 'Acme+Client' : 'Diana+Taylor'}`,
      senderType: isClientView ? 'CLIENT' : 'TEAM',
      content: draft,
      visibility: isClientView ? 'CLIENT_VISIBLE' : visibility,
      messageType: 'TEXT',
      topic: selectedTopicFilter === 'ALL' ? 'General' : selectedTopicFilter,
      createdAt: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setDraft('');
    setShowMentions(false);
  };

  const toggleReaction = (messageId: string, emoji: string = '👍') => {
    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m;
      const reactions = m.reactions ? [...m.reactions] : [];
      const existing = reactions.find(r => r.emoji === emoji);
      if (existing) {
        if (existing.userReacted) {
          existing.count -= 1;
          existing.userReacted = false;
        } else {
          existing.count += 1;
          existing.userReacted = true;
        }
      } else {
        reactions.push({ emoji, count: 1, userReacted: true });
      }
      return { ...m, reactions: reactions.filter(r => r.count > 0) };
    }));
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[750px]">
      
      {/* LEFT COLUMN: Main Channel Feed */}
      <div className="flex-1 flex flex-col bg-gray-50/50 rounded-2xl border border-gray-200 overflow-hidden relative">
        
        {/* Channel Header with Topic Filter */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button 
                onClick={() => setIsTopicDropdownOpen(!isTopicDropdownOpen)}
                className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                {selectedTopicFilter === 'ALL' ? 'All Topics' : selectedTopicFilter}
                <ChevronDown className="w-4 h-4" />
              </button>
              {isTopicDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden z-10">
                  <button 
                    onClick={() => { setSelectedTopicFilter('ALL'); setIsTopicDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-gray-50 text-gray-900"
                  >
                    All Topics
                  </button>
                  <div className="h-px bg-gray-100 my-1"></div>
                  {TOPICS.map(topic => (
                    <button 
                      key={topic}
                      onClick={() => { setSelectedTopicFilter(topic); setIsTopicDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50 text-gray-600 flex items-center gap-2"
                    >
                      <Hash className="w-3.5 h-3.5 text-gray-400" />
                      {topic}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="text-gray-300">|</span>
            <span className="font-bold text-gray-900 text-sm">Website Redesign</span>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {visibleMessages.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-sm">No messages in this topic yet.</div>
          )}
          {visibleMessages.map(message => (
            <div key={message.id} className="flex items-start gap-4 group">
              <img src={message.senderAvatar} alt={message.senderName} className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm" />
              
              <div className="flex-1 max-w-2xl">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-bold text-gray-900 text-sm">{message.senderName}</span>
                  <span className="text-[11px] text-gray-400 font-medium">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.topic && (
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded ml-2">
                      {message.topic}
                    </span>
                  )}
                  {!isClientView && message.visibility === 'INTERNAL' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase ml-1">
                      <AlertCircle className="w-3 h-3" /> Internal
                    </span>
                  )}
                </div>
                
                {/* Message Body Content */}
                <div className={`p-4 rounded-2xl border text-sm leading-relaxed whitespace-pre-wrap ${message.visibility === 'INTERNAL' ? 'bg-amber-50/50 border-amber-100 text-amber-900' : 'bg-white border-gray-200 text-gray-800'}`}>
                  
                  {/* Parse basic @mentions visually */}
                  {message.content.split(/(@\w+\s\w+|@\w+)/g).map((part, i) => {
                    if (part.startsWith('@')) {
                      return <span key={i} className="font-bold text-blue-600 bg-blue-50 px-1 py-0.5 rounded">{part}</span>;
                    }
                    return part;
                  })}

                  {message.messageType === 'FILE' && message.attachmentUrl && (
                    <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50/50">
                      <div className="flex items-center gap-3 mb-2 sm:mb-0">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{message.attachmentUrl}</div>
                          <div className="text-xs text-gray-500">PDF • 2.4 MB</div>
                        </div>
                      </div>
                      <button className="text-xs font-bold bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5" /> Open
                      </button>
                    </div>
                  )}
                </div>

                {/* Reactions & Action Bar */}
                <div className="mt-1.5 flex items-center gap-2">
                  {message.reactions && message.reactions.map((r, i) => (
                    <button 
                      key={i} 
                      onClick={() => toggleReaction(message.id, r.emoji)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold transition-colors ${r.userReacted ? 'bg-[#A5D149]/20 border-[#A5D149] text-[#346E3A]' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                    >
                      <span>{r.emoji}</span>
                      <span>{r.count}</span>
                    </button>
                  ))}
                  
                  {/* Hover Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button 
                      onClick={() => toggleReaction(message.id, '👍')}
                      className="p-1 rounded text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => toggleReaction(message.id, '❤️')}
                      className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <Heart className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Composer */}
        <div className="p-4 bg-white border-t border-gray-200 relative">
          
          {/* Mentions Popover */}
          {showMentions && filteredMembersForMention.length > 0 && (
            <div className="absolute bottom-full left-4 mb-2 w-64 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-20">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Members
              </div>
              <div className="max-h-48 overflow-y-auto p-1">
                {filteredMembersForMention.map(member => (
                  <button
                    key={member.id}
                    onClick={() => handleSelectMention(member.name)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-left"
                  >
                    <img src={member.avatar} alt="" className="w-6 h-6 rounded-full bg-gray-100" />
                    <div>
                      <div className="text-sm font-bold text-gray-900">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isClientView && (
            <div className="flex items-center gap-4 mb-3 px-2">
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input 
                  type="radio" 
                  checked={visibility === 'CLIENT_VISIBLE'} 
                  onChange={() => setVisibility('CLIENT_VISIBLE')}
                  className="w-3.5 h-3.5 text-[#A5D149] border-gray-300 focus:ring-[#A5D149]"
                />
                <span className={visibility === 'CLIENT_VISIBLE' ? 'text-gray-900' : 'text-gray-400'}>Client Visible</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input 
                  type="radio" 
                  checked={visibility === 'INTERNAL'} 
                  onChange={() => setVisibility('INTERNAL')}
                  className="w-3.5 h-3.5 text-amber-600 border-gray-300 focus:ring-amber-600"
                />
                <span className={visibility === 'INTERNAL' ? 'text-amber-700' : 'text-gray-400'}>Internal Note (Team Only)</span>
              </label>
            </div>
          )}
          
          <div className={`flex items-end gap-3 rounded-xl border p-2 transition-colors ${visibility === 'INTERNAL' && !isClientView ? 'border-amber-300 bg-amber-50/30 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500' : 'border-gray-200 bg-white focus-within:border-[#A5D149] focus-within:ring-1 focus-within:ring-[#A5D149]'}`}>
            <button className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors shrink-0">
              <Paperclip className="w-5 h-5" />
            </button>
            
            <textarea 
              ref={textareaRef}
              value={draft}
              onChange={handleDraftChange}
              placeholder={visibility === 'INTERNAL' && !isClientView ? "Type an internal note to the team... (use @ to tag)" : "Message the client... (use @ to tag)"}
              className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none py-2.5 text-sm text-gray-900 focus:outline-none placeholder:text-gray-400"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            
            <button 
              onClick={handleSend}
              disabled={!draft.trim()}
              className="p-2.5 bg-[#FBDF4B] text-gray-900 rounded-lg hover:bg-[#F3D53C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-sm"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Info Panel */}
      <div className="w-full md:w-[320px] bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col shrink-0">
        
        {/* Panel Tabs */}
        <div className="flex bg-gray-50/50 border-b border-gray-200 p-1.5 gap-1 shrink-0">
          <button 
            onClick={() => setInfoTab('info')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${infoTab === 'info' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Info
          </button>
          <button 
            onClick={() => setInfoTab('files')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${infoTab === 'files' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Files (3)
          </button>
          <button 
            onClick={() => setInfoTab('members')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${infoTab === 'members' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Members (3)
          </button>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {infoTab === 'info' && (
            <div className="space-y-6">
              {/* Main Info */}
              <div>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Main Info</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Client</span>
                    <div className="flex items-center gap-2">
                      <img src="https://ui-avatars.com/api/?name=Acme+Client" alt="Acme Corp" className="w-5 h-5 rounded-full" />
                      <span className="text-sm font-semibold text-gray-900">Acme Corp</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Date of creation</span>
                    <span className="text-sm font-medium text-gray-900">Aug 12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Status</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      Ongoing
                    </span>
                  </div>
                </div>
              </div>

              {/* Linked Threads */}
              <div className="pt-5 border-t border-gray-100">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Linked Records</h4>
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-left transition-colors border border-transparent hover:border-gray-200">
                    <div className="flex items-center gap-2">
                      <FileBox className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-700">Quotation #Q-001</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 rounded">Sent</span>
                  </button>
                  <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-left transition-colors border border-transparent hover:border-gray-200">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-700">Invoice #INV-042</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 rounded">Paid</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {infoTab === 'files' && (
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Recent Files</h4>
              
              <div className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white transition-colors cursor-pointer group">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-900 truncate">ui-kit-v1.pdf</div>
                  <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                    <span>PDF</span>
                    <span>•</span>
                    <span>2.4 MB</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white transition-colors cursor-pointer group">
                <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-900 truncate">hero-image-final.jpg</div>
                  <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                    <span>JPG</span>
                    <span>•</span>
                    <span>4.1 MB</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {infoTab === 'members' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Project Members</h4>
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 rounded">{MEMBERS.length}</span>
              </div>
              
              <div className="space-y-3">
                {MEMBERS.map(member => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full bg-gray-100" />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 leading-tight">{member.name}</div>
                        <div className="text-[11px] text-gray-500">{member.role}</div>
                      </div>
                    </div>
                    {member.type === 'CLIENT' ? (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded uppercase">Client</span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#346E3A] bg-[#A5D149]/20 border border-[#A5D149]/30 px-1.5 py-0.5 rounded uppercase">Team</span>
                    )}
                  </div>
                ))}
              </div>
              
              {!isClientView && (
                <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col gap-2">
                  <button 
                    onClick={() => setShowAddTeamModal(true)}
                    className="w-full py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-black transition-colors"
                  >
                    + Add Team Member
                  </button>
                  <button 
                    onClick={() => setShowAddClientModal(true)}
                    className="w-full py-2 bg-white text-gray-700 border border-gray-200 text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    + Invite Client Contact
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Add Team Member</h3>
            <p className="text-sm text-gray-500 mb-6">Assign an existing teammate or invite via email.</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email or Username</label>
                <input 
                  type="text" 
                  placeholder="e.g. john@example.com or @johndoe"
                  value={teamInviteInput}
                  onChange={(e) => setTeamInviteInput(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#A5D149] focus:ring-1 focus:ring-[#A5D149] placeholder:text-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1.5">If they aren't on your team yet, we'll send them an invite link.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Project Role</label>
                <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#A5D149] focus:ring-1 focus:ring-[#A5D149]">
                  <option value="PROJECT_MANAGER">Project Manager</option>
                  <option value="CONTRACTOR">Contractor</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowAddTeamModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900">Cancel</button>
              <button 
                onClick={() => setShowAddTeamModal(false)} 
                disabled={!teamInviteInput.trim()}
                className="px-4 py-2 text-sm font-semibold bg-[#FBDF4B] text-gray-900 rounded-lg hover:bg-[#F3D53C] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add / Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Invite Client Contact</h3>
            <p className="text-sm text-gray-500 mb-6">Invite someone from the client's team to collaborate.</p>
            
            {isAddingNewClientContact ? (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Name</label>
                  <input type="text" placeholder="Full name" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#A5D149] focus:ring-1 focus:ring-[#A5D149]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                  <input type="email" placeholder="email@company.com" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#A5D149] focus:ring-1 focus:ring-[#A5D149]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Project Role</label>
                  <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#A5D149] focus:ring-1 focus:ring-[#A5D149]">
                    <option value="PRIMARY_CONTACT">Primary Contact (Can Accept/Pay)</option>
                    <option value="VIEWER">Viewer (Read-only & Comment)</option>
                  </select>
                </div>
                <button 
                  onClick={() => setIsAddingNewClientContact(false)}
                  className="text-xs font-bold text-gray-500 hover:text-gray-900 mt-2 block"
                >
                  ← Back to existing contacts
                </button>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Select Contact</label>
                  <select 
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#A5D149] focus:ring-1 focus:ring-[#A5D149]"
                    onChange={(e) => {
                      if (e.target.value === 'new') {
                        setIsAddingNewClientContact(true);
                      }
                    }}
                  >
                    <option value="c1">Acme Client (Primary)</option>
                    <option value="new" className="font-bold text-indigo-600">+ Add new company contact...</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Project Role</label>
                  <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#A5D149] focus:ring-1 focus:ring-[#A5D149]">
                    <option value="PRIMARY_CONTACT">Primary Contact (Can Accept/Pay)</option>
                    <option value="VIEWER">Viewer (Read-only & Comment)</option>
                  </select>
                </div>
              </div>
            )}
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => {
                  setShowAddClientModal(false);
                  setIsAddingNewClientContact(false);
                }} 
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowAddClientModal(false);
                  setIsAddingNewClientContact(false);
                }} 
                className="px-4 py-2 text-sm font-semibold bg-[#FBDF4B] text-gray-900 rounded-lg hover:bg-[#F3D53C]"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
