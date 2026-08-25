'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Plus, Folder, Hash, Search, Bell, Settings, 
  MoreVertical, Smile, Paperclip, Mic, Send, Info, Pin, File as FileIcon, Link as LinkIcon,
  ChevronRight, ChevronDown, User, Zap, Calendar, AtSign, Play, Square, Circle, X, Loader2
} from 'lucide-react';
import { ChannelsApi, ProjectsApi, UsersApi, UploadApi } from '@/lib/api';
import { io } from 'socket.io-client';

export default function ChannelsPage() {
  const [channels, setChannels] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  
  // Data for active pane
  const [activeChannelData, setActiveChannelData] = useState<any>(null);
  const [activeProjectMembers, setActiveProjectMembers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  
  // UI State
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [showRightPane, setShowRightPane] = useState(true);
  const [activeTab, setActiveTab] = useState<'info'|'pins'|'media'|'links'>('info');
  const [messageInput, setMessageInput] = useState('');
  
  // Local features state
  const [pinnedMessageIds, setPinnedMessageIds] = useState<string[]>([]);
  
  // Current User
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChannel, setNewChannel] = useState({ name: '', projectId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Advanced Input States
  const [showMentions, setShowMentions] = useState(false);
  const [pendingMentions, setPendingMentions] = useState<{id: string, type: 'TEAM' | 'CLIENT', name: string}[]>([]);
  const [showEmojis, setShowEmojis] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Invitation Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('CONTRACTOR');
  const [isInviting, setIsInviting] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const [channelsData, projectsData, userProfile, pendingInvs] = await Promise.all([
        ChannelsApi.getAll(),
        ProjectsApi.getAll(),
        UsersApi.getProfile().catch(() => null),
        ProjectsApi.getPendingInvitations().catch(() => [])
      ]);
      let filteredProjects = projectsData;
      let filteredChannels = channelsData;

      if (userProfile) {
        filteredProjects = projectsData.filter((p: any) => 
          p.members?.some((m: any) => m.userId === userProfile.id || m.clientContactId === userProfile.id)
        );
        const validProjectIds = filteredProjects.map((p: any) => p.id);
        filteredChannels = channelsData.filter((c: any) => validProjectIds.includes(c.projectId));
      }

      setChannels(filteredChannels);
      setProjects(filteredProjects);
      if (userProfile) setCurrentUser(userProfile);
      setPendingInvitations(pendingInvs || []);
      
      // Auto-expand all projects in sidebar
      const expanded: Record<string, boolean> = {};
      filteredProjects.forEach((p: any) => expanded[p.id] = true);
      setExpandedProjects(expanded);

      if (filteredChannels.length > 0) {
        let targetId = filteredChannels[0].id;
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const projectParam = params.get('project');
          if (projectParam) {
            const match = filteredChannels.find((c: any) => c.projectId === projectParam);
            if (match) targetId = match.id;
          }
        }
        setActiveChannelId(targetId);
      }
    } catch (error) {
      console.error('Failed to load channels', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !activeChannelData?.projectId) return;
    try {
      setIsInviting(true);
      const res = await ProjectsApi.inviteMember(activeChannelData.projectId, inviteEmail, inviteRole);
      alert(res.message || 'Invitation sent successfully!');
      setShowInviteModal(false);
      setInviteEmail('');
      const updatedMembers = await ProjectsApi.getMembers(activeChannelData.projectId);
      setActiveProjectMembers(updatedMembers);
    } catch (err: any) {
      alert(err.message || 'Failed to send invitation.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleAcceptInvitation = async (memberId: string) => {
    try {
      await ProjectsApi.acceptInvitation(memberId);
      setPendingInvitations(prev => prev.filter(inv => inv.id !== memberId));
      loadData();
    } catch (e) {
      alert('Failed to accept invitation.');
    }
  };

  const handleDeclineInvitation = async (memberId: string) => {
    try {
      await ProjectsApi.declineInvitation(memberId);
      setPendingInvitations(prev => prev.filter(inv => inv.id !== memberId));
    } catch (e) {
      alert('Failed to decline invitation.');
    }
  };

  // Fetch active channel details and messages
  useEffect(() => {
    if (!activeChannelId) return;

    const channel = channels.find(c => c.id === activeChannelId);
    if (!channel) return;
    setActiveChannelData(channel);

    const loadChannelContent = async () => {
      try {
        // Fetch detailed channel info with messages
        const detailedChannel = await ChannelsApi.getForProject(channel.projectId, channel.name);
        setMessages(detailedChannel.messages || []);
        
        // Fetch project members for the right sidebar
        const members = await ProjectsApi.getMembers(channel.projectId);
        setActiveProjectMembers(members);
      } catch (e) {
        console.error(e);
      }
    };

    loadChannelContent();

    // Setup Socket
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005');
    socket.emit('joinProject', channel.projectId);
    
    socket.on('new_message', (msg: any) => {
      if (msg.channelId === activeChannelId) {
        setMessages(prev => {
          // Avoid duplicate real messages
          if (prev.some(m => m.id === msg.id)) return prev;
          // Filter out matching optimistic messages
          const filtered = prev.filter(m => !(m.id.toString().startsWith('temp-') && m.content === msg.content && m.senderId === msg.senderId));
          return [...filtered, msg];
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [activeChannelId, channels]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannel.name.trim() || !newChannel.projectId) return;
    try {
      setIsSubmitting(true);
      const created = await ChannelsApi.create({
        channelName: newChannel.name.trim().toLowerCase().replace(/\s+/g, '-'),
        projectId: newChannel.projectId
      });
      setChannels(prev => [created, ...prev]);
      setShowCreateModal(false);
      setNewChannel({ name: '', projectId: '' });
      setActiveChannelId(created.id);
    } catch (error) {
      console.error('Failed to create channel', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeChannelData) return;
    const content = messageInput;
    setMessageInput('');
    
    try {
      // Optimistic update
      const tempMsg = {
        id: 'temp-' + Date.now(),
        content,
        createdAt: new Date().toISOString(),
        senderId: currentUser?.id || 'SYS',
        channelId: activeChannelId
      };
      setMessages(prev => [...prev, tempMsg]);

      await ChannelsApi.postMessage(activeChannelData.projectId, {
        channelName: activeChannelData.name,
        content,
        senderId: currentUser?.id || 'SYS',
        mentions: pendingMentions.length > 0 ? pendingMentions : undefined
      });
      setPendingMentions([]);
      // The socket will broadcast the real message back
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChannelData) return;
    
    try {
      setIsUploading(true);
      const isPdf = file.type === 'application/pdf';
      const result = await (isPdf ? UploadApi.uploadPdf(file) : UploadApi.uploadImage(file));
      
      await ChannelsApi.postMessage(activeChannelData.projectId, {
        channelName: activeChannelData.name,
        content: `Attached a file: ${file.name}`,
        senderId: currentUser?.id || 'SYS',
        attachmentUrl: result.url
      });
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojis(false);
  };

  const handleMentionSelect = (member: any) => {
    const name = member.user?.firstName ? `${member.user.firstName} ${member.user.lastName || ''}` : member.client?.name || 'Unknown';
    const type = member.user ? 'TEAM' : 'CLIENT';
    
    // Replace the trailing @ or just append
    if (messageInput.endsWith('@')) {
      setMessageInput(prev => prev.slice(0, -1) + `@${name} `);
    } else {
      setMessageInput(prev => prev + `@${name} `);
    }
    
    setPendingMentions(prev => {
      if (!prev.find(m => m.id === member.id)) {
        return [...prev, { id: member.id, type, name }];
      }
      return prev;
    });
    setShowMentions(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice-message-${Date.now()}.webm`, { type: 'audio/webm' });
        
        try {
          setIsUploading(true);
          const result = await UploadApi.uploadImage(audioFile); // generic upload handles audio
          
          if (activeChannelData) {
            await ChannelsApi.postMessage(activeChannelData.projectId, {
              channelName: activeChannelData.name,
              content: 'Voice Message',
              senderId: currentUser?.id || 'SYS',
              attachmentUrl: result.url
            });
          }
        } catch (error) {
          console.error("Failed to upload voice message:", error);
        } finally {
          setIsUploading(false);
        }

        // Stop all tracks
        const tracks = mediaRecorderRef.current?.stream.getTracks();
        tracks?.forEach(track => track.stop());
      };

      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleProjectExpand = (projectId: string) => {
    setExpandedProjects(prev => ({ ...prev, [projectId]: !prev[projectId] }));
  };

  // Group channels by project
  const channelsByProject = projects.reduce((acc, project) => {
    acc[project.id] = channels.filter(c => c.projectId === project.id);
    return acc;
  }, {} as Record<string, any[]>);

  // Derived state for right panel
  const displayMembers = activeProjectMembers.length > 0 ? activeProjectMembers : (currentUser ? [{ id: 'me', user: currentUser, role: 'Owner' }] : []);
  const pinnedMessagesList = messages.filter(m => pinnedMessageIds.includes(m.id));
  const mediaMessages = messages.filter(m => !!m.attachmentUrl);
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const linkMessages = messages.filter(m => m.content && m.content.match(linkRegex));

  return (
    <div className="flex-1 flex h-full font-sans bg-white dark:bg-slate-900 overflow-hidden text-sm">
      
      {/* Pane 1: Left Sidebar (Navigation) */}
      <div className="w-64 border-r border-gray-100 dark:border-slate-800 flex flex-col bg-[#F9FAFB] dark:bg-slate-800/50 shrink-0">
        <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 tracking-tight">Channels</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
          {/* Favorites */}
          <div>
            <div className="px-2 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Favorites</div>
            <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-600 hover:bg-gray-200/50 transition-colors">
              <span className="w-5 h-5 flex items-center justify-center text-yellow-500 text-lg">⭐</span>
              <span className="font-medium">general</span>
            </button>
          </div>

          {/* Grouped by Projects */}
          <div>
            <div className="px-2 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
              <span>Projects</span>
            </div>
            
            {projects.map(project => (
              <div key={project.id} className="mb-2">
                <button 
                  onClick={() => toggleProjectExpand(project.id)}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-gray-700 hover:bg-gray-200/50 rounded-lg group transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {expandedProjects[project.id] ? (
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    )}
                    <span className="font-bold text-[13px]">{project.name}</span>
                  </div>
                </button>
                
                {expandedProjects[project.id] && (
                  <div className="mt-1 ml-5 border-l border-gray-200 pl-2 space-y-0.5">
                    {channelsByProject[project.id]?.map((channel: any) => (
                      <button
                        key={channel.id}
                        onClick={() => setActiveChannelId(channel.id)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${activeChannelId === channel.id ? 'bg-[#346E3A]/10 text-[#346E3A] font-bold' : 'text-gray-600 hover:bg-gray-200/50 font-medium'}`}
                      >
                        <Hash className="w-3.5 h-3.5 opacity-50" />
                        <span className="truncate text-[13px]">{channel.name}</span>
                      </button>
                    ))}
                    {(!channelsByProject[project.id] || channelsByProject[project.id].length === 0) && (
                      <div className="px-2 py-1 text-xs text-gray-400 italic">No channels</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pane 2: Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 min-w-0">
        {/* Pending Channel Invitations Banner */}
        {pendingInvitations.length > 0 && (
          <div className="bg-amber-50 border-b border-amber-200 p-4 px-6 flex items-center justify-between z-30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-base">
                📩
              </div>
              <div>
                <div className="font-bold text-sm text-gray-900">
                  Channel Request for "{pendingInvitations[0].project?.name || 'Project'}"
                </div>
                <div className="text-xs text-gray-600">
                  You have been invited to join this project channel. Accept to become a member and start collaborating.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAcceptInvitation(pendingInvitations[0].id)}
                className="px-4 py-2 bg-[#346E3A] text-white rounded-lg text-xs font-bold hover:bg-[#2c5c31] transition-colors cursor-pointer"
              >
                Accept & Join
              </button>
              <button
                onClick={() => handleDeclineInvitation(pendingInvitations[0].id)}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-300 transition-colors cursor-pointer"
              >
                Decline
              </button>
            </div>
          </div>
        )}

        {activeChannelData ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-gray-900 font-bold text-base">
                  <Hash className="w-5 h-5 text-gray-400" />
                  {activeChannelData.name}
                </div>
                <div className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-semibold">
                  {activeChannelData.project?.name}
                </div>
              </div>
              <div className="flex items-center gap-4 text-gray-500">
                <div className="flex -space-x-2">
                  {activeProjectMembers.slice(0, 3).map((member: any) => (
                    <img key={member.id} src={`https://ui-avatars.com/api/?name=${member.user?.firstName || 'U'}&background=random`} className="w-7 h-7 rounded-full border-2 border-white" />
                  ))}
                  <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                    +{activeProjectMembers.length}
                  </div>
                </div>
                <button 
                  onClick={() => setShowRightPane(!showRightPane)}
                  className={`p-1.5 rounded-lg transition-colors ${showRightPane ? 'bg-gray-100 text-gray-900' : 'hover:bg-gray-100'}`}
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
                  <div className="w-16 h-16 bg-[#346E3A]/10 text-[#346E3A] rounded-full flex items-center justify-center mb-4">
                    <Hash className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to #{activeChannelData.name}</h3>
                  <p className="text-gray-500 text-sm">This is the start of the #{activeChannelData.name} channel. Discuss everything related to {activeChannelData.project?.name} here.</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isCurrentUser = msg.senderId === currentUser?.id;
                  const senderMember = activeProjectMembers.find(m => 
                    m.userId === msg.senderId || 
                    m.clientContactId === msg.senderId || 
                    m.id === msg.senderId ||
                    m.user?.id === msg.senderId ||
                    m.clientContact?.id === msg.senderId
                  );

                  let senderName = 'Member';
                  if (msg.senderId === 'SYS' || msg.senderType === 'SYSTEM') {
                    senderName = 'System';
                  } else if (isCurrentUser) {
                    senderName = 'You';
                  } else if (senderMember?.user?.firstName) {
                    senderName = `${senderMember.user.firstName} ${senderMember.user.lastName || ''}`.trim();
                  } else if (senderMember?.user?.email) {
                    senderName = senderMember.user.email.split('@')[0];
                  } else if (senderMember?.clientContact?.name) {
                    senderName = senderMember.clientContact.name;
                  } else if (activeChannelData?.project?.client?.name) {
                    senderName = activeChannelData.project.client.name;
                  }

                  const senderAvatar = isCurrentUser ? currentUser?.avatarUrl : (senderMember?.user?.avatarUrl);
                  const avatarLetter = senderName.charAt(0).toUpperCase();

                  const showHeader = i === 0 || messages[i-1].senderId !== msg.senderId || (new Date(msg.createdAt).getTime() - new Date(messages[i-1].createdAt).getTime() > 300000);
                  const isPinned = pinnedMessageIds.includes(msg.id);
                  
                  return (
                    <div key={msg.id} className={`flex gap-4 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} ${!showHeader ? 'mt-1' : ''} group relative ${isPinned ? 'bg-yellow-50/50 -mx-6 px-6 py-2 rounded' : ''}`}>
                      
                      {/* Message Actions (Hover) */}
                      <div className={`absolute ${isCurrentUser ? 'left-4' : 'right-4'} top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded-lg shadow-sm flex items-center z-10`}>
                        <button 
                          onClick={() => setPinnedMessageIds(prev => prev.includes(msg.id) ? prev.filter(id => id !== msg.id) : [...prev, msg.id])}
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                          title={isPinned ? "Unpin message" : "Pin message"}
                        >
                          <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                        </button>
                      </div>

                      {showHeader ? (
                        <div className="w-10 h-10 rounded-full bg-indigo-100 shrink-0 overflow-hidden flex items-center justify-center font-bold text-indigo-700">
                          {senderAvatar ? (
                            <img src={senderAvatar} className="w-full h-full object-cover" />
                          ) : (
                            <img src={`https://ui-avatars.com/api/?name=${avatarLetter}&background=random`} className="w-full h-full object-cover" />
                          )}
                        </div>
                      ) : (
                        <div className="w-10 shrink-0 opacity-0 group-hover:opacity-100 text-[10px] text-gray-400 text-center pt-2">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                      
                      <div className={`flex-1 flex flex-col ${isCurrentUser ? 'items-end pr-0 pl-12' : 'items-start pr-12 pl-0'} min-w-0`}>
                        {showHeader && (
                          <div className={`flex items-baseline gap-2 mb-1 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span className="font-bold text-gray-900">{senderName}</span>
                            <span className="text-[11px] font-medium text-gray-400">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}
                        <div className={`inline-block px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed max-w-[85%] ${isCurrentUser ? 'bg-[#346E3A] text-white rounded-tr-sm' : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-tl-sm'}`}>
                          {msg.content}
                          {msg.attachmentUrl && (
                            <div className="mt-2">
                              {msg.attachmentUrl.match(/\.(webm|mp3|wav|ogg)$/i) || msg.content === 'Voice Message' ? (
                                <audio controls src={msg.attachmentUrl} className="max-w-full h-10 outline-none" />
                              ) : msg.attachmentUrl.match(/\.(jpeg|jpg|gif|png)$/i) || msg.attachmentUrl.includes('/image/upload/') ? (
                                <img src={msg.attachmentUrl} alt="Attachment" className="max-w-xs max-h-64 object-cover rounded-lg border border-gray-200" />
                              ) : (
                                <a href={msg.attachmentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 w-fit hover:bg-gray-100 transition-colors">
                                  <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-gray-500 shadow-sm shrink-0">
                                    <FileIcon className="w-4 h-4" />
                                  </div>
                                  <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">View Attachment</div>
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 shrink-0">
              <div className="border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 shadow-sm focus-within:border-[#346E3A] focus-within:ring-1 focus-within:ring-[#346E3A] transition-all flex flex-col">
                <textarea 
                  rows={2}
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={`Message #${activeChannelData.name}...`}
                  className="w-full p-3 resize-none outline-none bg-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100"
                />
                <div className="flex items-center justify-between p-2 bg-gray-50/50 dark:bg-slate-700/50 rounded-b-xl border-t border-gray-100 dark:border-slate-700 relative">
                  
                  {/* Mentions Popover */}
                  {showMentions && (
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden z-10">
                      <div className="p-2 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700 text-xs font-bold text-gray-500 dark:text-gray-400">Mention someone</div>
                      <div className="max-h-48 overflow-y-auto p-1">
                        {activeProjectMembers.length === 0 ? (
                          <div className="p-3 text-xs text-gray-400 text-center">No members found</div>
                        ) : (
                          activeProjectMembers.map(member => (
                            <button
                              key={member.id}
                              onClick={() => handleMentionSelect(member)}
                              className="w-full text-left flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                              <div className="w-6 h-6 rounded-full bg-[#346E3A]/10 text-[#346E3A] flex items-center justify-center text-[10px] font-bold shrink-0">
                                {member.user?.firstName?.charAt(0) || member.client?.name?.charAt(0) || '?'}
                              </div>
                              <span className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                                {member.user?.firstName ? `${member.user.firstName} ${member.user.lastName || ''}` : member.client?.name}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Emojis Popover */}
                  {showEmojis && (
                    <div className="absolute bottom-full left-10 mb-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-2 z-10">
                      <div className="grid grid-cols-6 gap-1">
                        {['😀','😃','😄','😁','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯'].map(emoji => (
                          <button key={emoji} onClick={() => handleEmojiClick(emoji)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-lg flex items-center justify-center">
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <button onClick={() => setShowMentions(!showMentions)} className={`p-1.5 rounded transition-colors ${showMentions ? 'bg-[#346E3A]/10 text-[#346E3A]' : 'hover:bg-gray-200 dark:hover:bg-slate-600'}`} title="Mention"><AtSign className="w-4 h-4" /></button>
                    <button onClick={() => setShowEmojis(!showEmojis)} className={`p-1.5 rounded transition-colors ${showEmojis ? 'bg-[#346E3A]/10 text-[#346E3A]' : 'hover:bg-gray-200 dark:hover:bg-slate-600'}`} title="Emoji"><Smile className="w-4 h-4" /></button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*,application/pdf" />
                    <button 
                      onClick={() => fileInputRef.current?.click()} 
                      disabled={isUploading || isRecording}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-50"
                      title="Attach File"
                    >
                      {isUploading ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <Paperclip className="w-4 h-4" />}
                    </button>
                    
                    {isRecording ? (
                      <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-lg ml-1">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs font-medium font-mono">{formatTime(recordingTime)}</span>
                        <button onClick={stopRecording} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors ml-1" title="Stop & Send">
                          <Square className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={startRecording} disabled={isUploading} className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-50" title="Voice Message">
                        <Mic className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {messageInput.length > 0 && (
                      <button 
                        onClick={() => setMessageInput('')}
                        className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
                      >
                        Discard
                      </button>
                    )}
                    <button 
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      className="bg-black text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
              <div className="text-center mt-2 text-[11px] text-gray-400 font-medium">
                <strong>Return</strong> to send, <strong>Shift + Return</strong> to add a new line
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a channel to start messaging
          </div>
        )}
      </div>

      {/* Pane 3: Right Sidebar (Info/Media/Links) */}
      {showRightPane && activeChannelData && (
        <div className="w-72 border-l border-gray-100 dark:border-slate-800 flex flex-col bg-[#F9FAFB] dark:bg-slate-800/50 shrink-0 overflow-y-auto animate-in slide-in-from-right-8 duration-200">
          {/* Tabs */}
          <div className="flex items-center px-2 py-3 border-b border-gray-100">
            <button onClick={() => setActiveTab('info')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === 'info' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>Info</button>
            <button onClick={() => setActiveTab('pins')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === 'pins' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>Pins</button>
            <button onClick={() => setActiveTab('media')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === 'media' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>Media</button>
            <button onClick={() => setActiveTab('links')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === 'links' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>Links</button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === 'info' && (
              <div className="space-y-8">
                {/* Main Info */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 text-base">Main info</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-2"><User className="w-4 h-4" /> Creator</span>
                      <span className="font-medium text-gray-900">System</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Created</span>
                      <span className="font-medium text-gray-900">{new Date(activeChannelData.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-2"><Zap className="w-4 h-4" /> Status</span>
                      <span className="px-2 py-0.5 bg-[#A5D149]/20 text-[#346E3A] rounded text-xs font-bold uppercase tracking-wider">Active</span>
                    </div>
                  </div>
                </div>

                {/* Linked Threads placeholder */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 text-base">Linked threads</h3>
                  <div className="text-gray-400 italic text-xs">No linked threads yet.</div>
                </div>

                {/* Members */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 text-base">Members <span className="text-gray-400 font-normal">{displayMembers.length}</span></h3>
                    <div className="flex gap-2 text-gray-400">
                      <button onClick={() => setShowInviteModal(true)} className="hover:text-gray-900 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer" title="Add Member by Email"><Plus className="w-4 h-4" /></button>
                      <button className="hover:text-gray-900"><MoreVertical className="w-4 h-4" /></button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {displayMembers.map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <img src={`https://ui-avatars.com/api/?name=${member.user?.firstName || member.clientContact?.name || 'U'}&background=random`} className="w-8 h-8 rounded-full border border-gray-200" />
                          <div>
                            <div className="font-bold text-gray-900 text-[13px] leading-tight">
                              {member.user?.firstName ? `${member.user.firstName} ${member.user.lastName || ''}` : member.clientContact?.name || 'Unknown User'}
                              {member.user?.id === currentUser?.id && ' (You)'}
                            </div>
                            <div className="text-[11px] text-gray-500">{member.role || 'Member'}</div>
                          </div>
                        </div>
                        <div className="px-2 py-1 bg-[#346E3A]/10 text-[#346E3A] rounded text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                          {member.role || 'Member'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'pins' && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 mb-4 text-base">Pinned Messages</h3>
                {pinnedMessagesList.length === 0 ? (
                  <div className="text-gray-400 italic text-xs text-center py-10">No pinned messages in this channel.</div>
                ) : (
                  pinnedMessagesList.map(msg => (
                    <div key={msg.id} className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm text-xs group relative">
                      <button 
                        onClick={() => setPinnedMessageIds(prev => prev.filter(id => id !== msg.id))}
                        className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Unpin"
                      >
                        <Pin className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      </button>
                      <div className="text-gray-900 line-clamp-3 leading-relaxed mb-2 pr-6">{msg.content}</div>
                      <div className="text-[10px] text-gray-400 font-medium">{new Date(msg.createdAt).toLocaleDateString()} at {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'media' && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 mb-4 text-base">Media Shared</h3>
                {mediaMessages.length === 0 ? (
                  <div className="text-gray-400 italic text-xs text-center py-10">No media has been shared yet.</div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {mediaMessages.map(msg => (
                      <div key={msg.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        {/* Assuming images for demo; would check mime type normally */}
                        <img src={msg.attachmentUrl} alt="attachment" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'links' && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 mb-4 text-base">Shared Links</h3>
                {linkMessages.length === 0 ? (
                  <div className="text-gray-400 italic text-xs text-center py-10">No links have been shared yet.</div>
                ) : (
                  linkMessages.map(msg => {
                    const urls = msg.content.match(linkRegex) || [];
                    return urls.map((url: string, i: number) => (
                      <a key={`${msg.id}-${i}`} href={url} target="_blank" rel="noreferrer" className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                        <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <LinkIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-blue-600 truncate group-hover:underline mb-1">{url}</div>
                          <div className="text-[10px] text-gray-400 font-medium">Shared on {new Date(msg.createdAt).toLocaleDateString()}</div>
                        </div>
                      </a>
                    ));
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Create New Channel</h3>
            <p className="text-sm text-gray-500 mb-6">Channels are where your team communicates for a specific project.</p>
            
            <form onSubmit={handleCreateChannel} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Channel Name</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. design-feedback"
                    value={newChannel.name}
                    onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#346E3A] focus:ring-1 focus:ring-[#346E3A] placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Link to Project</label>
                <select 
                  required
                  value={newChannel.projectId}
                  onChange={(e) => setNewChannel({ ...newChannel, projectId: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#346E3A] focus:ring-1 focus:ring-[#346E3A]"
                >
                  <option value="">-- Select Project --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#346E3A] text-white rounded-lg text-sm font-bold hover:bg-[#2b592f] transition-colors disabled:opacity-50 mt-2"
              >
                {isSubmitting ? 'Creating...' : 'Create Channel'}
              </button>
            </form>

            <button 
              onClick={() => setShowCreateModal(false)}
              className="w-full py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">Add Member to Channel</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-6">
              Enter an email address to invite a member. If they are registered, a channel request will automatically appear on their channel page for approval.
            </p>
            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Member Email</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. colleague@company.com"
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-[#346E3A]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-[#346E3A]"
                >
                  <option value="CONTRACTOR">Contractor / Member</option>
                  <option value="PROJECT_MANAGER">Project Manager</option>
                  <option value="PRIMARY_CONTACT">Primary Contact</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="px-5 py-2 text-sm font-bold text-gray-900 bg-[#FBDF4B] hover:bg-[#F3D53C] rounded-xl flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {isInviting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
