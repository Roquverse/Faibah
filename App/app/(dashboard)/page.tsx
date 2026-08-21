'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, YAxis, CartesianGrid } from 'recharts';
import { Users, DollarSign, FolderGit2, CheckCircle2, ChevronRight, ChevronLeft, Phone, ArrowUpRight, ArrowDownRight, Briefcase, Search, Clock } from 'lucide-react';
import Image from 'next/image';
import { AppointmentsApi, CompanyApi, ProjectsApi } from '@/lib/api';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO, addMonths, subMonths } from 'date-fns';

type AppointmentType = 'MEETING' | 'CALL' | 'DEADLINE' | 'REMINDER';
interface Appointment {
 id: string;
 title: string;
 description: string;
 date: string;
 startTime: string;
 endTime: string;
 type: AppointmentType;
}

export default function OverviewPage() {
 const [currentDate, setCurrentDate] = useState(new Date());
 const [appointments, setAppointments] = useState<Appointment[]>([]);
 const [overview, setOverview] = useState<any>(null);
 const [activeProjectsList, setActiveProjectsList] = useState<any[]>([]);

 useEffect(() => {
   loadAppointments();
   loadOverview();
   loadActiveProjects();
 }, [currentDate]);

 const loadAppointments = async () => {
   try {
     const data = await AppointmentsApi.getAll();
     setAppointments(data);
   } catch (e) {
     console.error(e);
   }
 };

 const loadOverview = async () => {
   try {
     const data = await CompanyApi.getOverview();
     setOverview(data);
   } catch (e) {
     console.error(e);
   }
 };

 const loadActiveProjects = async () => {
   try {
     const data = await ProjectsApi.getAll();
     setActiveProjectsList(data.filter((p: any) => p.status === 'ONGOING' || p.status === 'AWAITING_PAYMENT'));
   } catch (e) {
     console.error(e);
   }
 };



 const monthStart = startOfMonth(currentDate);
 const monthEnd = endOfMonth(monthStart);
 const startDate = startOfWeek(monthStart);
 const endDate = endOfWeek(monthEnd);
 const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

 const getAppointmentsForDay = (day: Date) => {
 return appointments.filter(apt => isSameDay(parseISO(apt.date), day));
 };

 return (
 <div className="p-8 w-full space-y-8 font-sans">
 
 {/* Row 1: Stat Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 <StatCard title="Active Clients" value={overview?.activeClients || 0} icon={<Users className="w-4 h-4 text-gray-500" />} change="" isPositive={true} />
 <StatCard title="Total Revenue" value={`₦${((overview?.totalRevenue || 0) / 1000).toFixed(1)}K`} icon={<DollarSign className="w-4 h-4 text-gray-500" />} change="" isPositive={true} />
 <StatCard title="Active Projects" value={overview?.activeProjects || 0} icon={<FolderGit2 className="w-4 h-4 text-gray-500" />} change="" isPositive={false} />
 <StatCard title="Total Closed" value={overview?.totalClosed || 0} icon={<CheckCircle2 className="w-4 h-4 text-gray-500" />} change="" isPositive={true} />
 </div>

 {/* Row 2: Complex Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 
 {/* Left Col: Performance & Active Projects (Span 8) */}
 <div className="lg:col-span-8 space-y-8">
 
 <div className="flex flex-col lg:flex-row gap-8">
 {/* Performance Chart */}
 <div className="bg-white rounded-xl p-6 border border-gray-200 flex-1 min-w-0">
 <div className="flex items-center justify-between mb-8">
 <div>
 <h3 className="text-base font-semibold text-gray-900 tracking-tight">Performance</h3>
 <div className="flex items-center gap-4 mt-2">
 <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-900"></div><span className="text-xs font-medium text-gray-500">Revenue</span></div>
 <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-300"></div><span className="text-xs font-medium text-gray-500">Visit</span></div>
 </div>
 </div>
 <select className="text-sm font-medium text-gray-600 bg-transparent border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-gray-300">
 <option>Monthly</option>
 <option>Weekly</option>
 </select>
 </div>
 <div className="h-56 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <LineChart data={overview?.performanceData || []}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `${val/1000}k`} />
 <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: 'none' }} />
 <Line type="monotone" dataKey="revenue" stroke="#111827" strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: '#111827' }} activeDot={{ r: 5 }} />
 <Line type="monotone" dataKey="visit" stroke="#cbd5e1" strokeWidth={2} dot={false} />
 </LineChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Subscriptions */}
 <div className="w-full lg:w-80 shrink-0 space-y-4">
 <div className="flex items-center justify-between px-1">
 <h3 className="text-base font-semibold text-gray-900 tracking-tight">Subscriptions</h3>
 <button className="text-[11px] font-medium text-gray-500 hover:text-gray-900 transition-colors">View All</button>
 </div>

 {/* Closest Subscription */}
 <div className="bg-white rounded-xl p-5 border border-gray-200">
 <div className="flex items-center justify-between mb-4">
 <div>
 <h3 className="font-semibold text-gray-900 tracking-tight">Cloud Hosting</h3>
 <p className="text-xs font-medium text-gray-500">INV-092 • Acme Corp</p>
 </div>
 <button className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors"><ArrowUpRight className="w-4 h-4" /></button>
 </div>
 
 <div className="h-28 bg-gray-50 border border-gray-100 rounded-lg mb-4 flex flex-col justify-center px-4 relative">
 <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded bg-white border border-gray-200 text-gray-600 text-[10px] font-medium">
 <Clock className="w-3 h-3 text-[#FBDF4B]" /> 4 Days Left
 </div>
 <div className="text-xs font-medium text-gray-500 mb-1">Upcoming Charge</div>
 <div className="text-2xl font-semibold text-gray-900 tracking-tight">₦120,000</div>
 </div>

 <div className="flex justify-between text-center px-1">
 <div><div className="text-sm font-semibold text-gray-900 tracking-tight">Monthly</div><div className="text-[10px] font-medium text-gray-500 mt-0.5">Frequency</div></div>
 <div><div className="text-sm font-semibold text-gray-900 tracking-tight">Aug 24</div><div className="text-[10px] font-medium text-gray-500 mt-0.5">Due Date</div></div>
 <div><div className="text-sm font-semibold text-[#346E3A] tracking-tight">Active</div><div className="text-[10px] font-medium text-gray-500 mt-0.5">Status</div></div>
 </div>
 </div>

 {/* Other Subscriptions List */}
 <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
 <div className="divide-y divide-gray-100">
 <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
 <div>
 <div className="font-medium text-gray-900 text-sm tracking-tight mb-0.5">Maintenance Retainer</div>
 <div className="text-[11px] text-gray-500 font-medium">₦450,000 • Yearly</div>
 </div>
 <div className="text-right">
 <div className="text-xs font-semibold text-gray-900 mb-0.5 group-hover:text-[#346E3A] transition-colors">12 Days</div>
 <div className="text-[10px] text-gray-400 font-medium">Sep 1</div>
 </div>
 </div>

 <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
 <div>
 <div className="font-medium text-gray-900 text-sm tracking-tight mb-0.5">SEO Package</div>
 <div className="text-[11px] text-gray-500 font-medium">₦85,000 • Monthly</div>
 </div>
 <div className="text-right">
 <div className="text-xs font-semibold text-gray-900 mb-0.5 group-hover:text-[#346E3A] transition-colors">15 Days</div>
 <div className="text-[10px] text-gray-400 font-medium">Sep 4</div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Active Projects Table */}
 <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
 <div className="p-6 border-b border-gray-200 flex items-center justify-between min-w-[600px]">
 <h3 className="text-base font-semibold text-gray-900 tracking-tight">Active Projects</h3>
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
 <input type="text" placeholder="Search" className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm w-48 focus:outline-none focus:border-gray-300 transition-colors" />
 </div>
 </div>
 
 <table className="w-full text-left text-sm whitespace-nowrap min-w-[600px]">
 <thead className="bg-gray-50 text-gray-500 text-xs">
 <tr>
 <th className="px-6 py-3 font-medium">Project</th>
 <th className="px-6 py-3 font-medium">Type</th>
 <th className="px-6 py-3 font-medium">Value</th>
 <th className="px-6 py-3 font-medium">Team</th>
 <th className="px-6 py-3 font-medium">Progress</th>
 <th className="px-6 py-3 font-medium text-right">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-200">
 {activeProjectsList.length === 0 ? (
   <tr>
     <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">No active projects</td>
   </tr>
 ) : (
   activeProjectsList.map((project, idx) => (
     <tr key={project.id || idx} className="hover:bg-gray-50/50">
     <td className="px-6 py-4">
     <div className="font-medium text-gray-900">{project.name}</div>
     <div className="text-[11px] text-gray-500 mt-0.5">{project.client?.name || 'Unknown Client'}</div>
     </td>
     <td className="px-6 py-4 text-gray-600">Enterprise</td>
     <td className="px-6 py-4 font-medium text-gray-900">N/A</td>
     <td className="px-6 py-4">
     <div className="flex -space-x-1.5">
     <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(project.name)}&background=random`} className="w-6 h-6 rounded-full border border-white" />
     </div>
     </td>
     <td className="px-6 py-4">
     <div className="flex items-center gap-2">
     <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
     <div className="w-[50%] h-full bg-gray-900 rounded-full"></div>
     </div>
     <span className="text-[11px] font-medium text-gray-500">50%</span>
     </div>
     </td>
     <td className="px-6 py-4 text-right">
     <span className="text-[11px] font-medium text-[#346E3A]">{project.status}</span>
     </td>
     </tr>
   ))
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* Right Col: Reminder, Calendar, Contacts (Span 4) */}
 <div className="lg:col-span-4 space-y-6">
 
 {/* Reminders */}
 <div className="bg-white rounded-xl p-6 border border-gray-200 relative">
 <button className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 transition-colors"><ArrowUpRight className="w-4 h-4" /></button>
 <h3 className="text-base font-semibold text-gray-900 tracking-tight mb-6">Reminders</h3>
 
 <div className="space-y-4">
 <div className="flex items-start justify-between group cursor-pointer">
 <div>
 <div className="font-medium text-gray-900 text-sm mb-1">Follow-Ups</div>
 <div className="text-xs text-gray-500 mb-3">15 leads need follow up</div>
 <div className="flex -space-x-1.5">
 <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" className="w-6 h-6 rounded-full border border-white" />
 <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" className="w-6 h-6 rounded-full border border-white" />
 <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" className="w-6 h-6 rounded-full border border-white" />
 <div className="w-6 h-6 rounded-full bg-gray-100 border border-white flex items-center justify-center text-[9px] font-medium text-gray-600">+12</div>
 </div>
 </div>
 </div>

 <div className="h-px bg-gray-100"></div>

 <div className="flex items-start justify-between group cursor-pointer">
 <div>
 <div className="font-medium text-gray-900 text-sm mb-1">Visits</div>
 <div className="text-xs text-gray-500">2 Properties and 3 Leads</div>
 </div>
 </div>
 </div>
 </div>

 <div className="bg-white rounded-xl p-6 border border-gray-200">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-base font-semibold text-gray-900 tracking-tight">{format(currentDate, 'MMMM yyyy')}</h3>
 <div className="flex gap-2">
 <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors">
 <ChevronLeft className="w-4 h-4" />
 </button>
 <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors">
 <ChevronRight className="w-4 h-4" />
 </button>
 </div>
 </div>
 
 <div className="grid grid-cols-7 gap-y-3 mb-2 text-center text-[10px] font-medium text-gray-400 uppercase tracking-wider">
 <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
 </div>
 <div className="grid grid-cols-7 gap-y-1 text-center text-xs font-medium">
 {calendarDays.map((day, i) => {
 const dayAppointments = getAppointmentsForDay(day);
 const hasEvent = dayAppointments.length > 0;
 const isCurrentMonth = isSameMonth(day, monthStart);
 const isTodayDate = isToday(day);

 return (
 <div key={i} className="py-1 relative flex justify-center group">
 <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
 isTodayDate ? 'bg-[#346E3A] text-white font-semibold' : 
 !isCurrentMonth ? 'text-gray-300' : 'text-gray-700'
 }`}>
 {format(day, 'd')}
 </div>
 {hasEvent && !isTodayDate && <div className="absolute bottom-1 w-1 h-1 bg-[#FBDF4B] rounded-full"></div>}
 
 {/* Tooltip on Hover */}
 {hasEvent && (
 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-left p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{format(day, 'MMM d, yyyy')}</div>
 <div className="space-y-2">
 {dayAppointments.map(apt => (
 <div key={apt.id}>
 <div className="font-semibold text-xs text-white truncate">{apt.title}</div>
 <div className="text-[10px] text-gray-300">{apt.startTime} - {apt.endTime}</div>
 </div>
 ))}
 </div>
 <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
 </div>
 )}
 </div>
 );
 })}
 </div>
 </div>

 {/* Top Clients */}
 <div className="bg-white rounded-xl p-6 border border-gray-200 relative">
 <button className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 transition-colors"><ArrowUpRight className="w-4 h-4" /></button>
 <h3 className="text-base font-semibold text-gray-900 tracking-tight mb-6">Top Clients</h3>
 
 <div className="space-y-4">
 {(overview?.topClients || []).length > 0 ? overview.topClients.map((contact: any, i: number) => (
 <div key={i} className="flex items-center justify-between group cursor-pointer">
 <div className="flex items-center gap-3">
 <img src={contact.img} className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
 <div>
 <div className="font-medium text-gray-900 text-sm leading-tight">{contact.name}</div>
 <div className="text-[11px] font-medium text-gray-500 mt-0.5">{contact.company}</div>
 </div>
 </div>
 <button className="text-gray-400 hover:text-gray-900 transition-colors">
 <Phone className="w-3.5 h-3.5" />
 </button>
 </div>
 )) : (
   <div className="text-sm text-gray-500 text-center py-4">No clients yet</div>
 )}
 </div>
 </div>

 </div>
 </div>
 </div>
 );
}

function StatCard({ title, value, icon, change, isPositive }: any) {
 return (
 <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col justify-between h-[104px]">
 <div className="flex items-center justify-between mb-3">
 <span className="font-medium text-gray-500 text-xs tracking-tight">{title}</span>
 {icon}
 </div>
 <div className="flex items-baseline gap-2">
 <span className="text-2xl font-semibold text-gray-900 tracking-tight leading-none">{value}</span>
 <span className={`text-[11px] font-medium ${isPositive ? 'text-[#346E3A]' : 'text-gray-500'}`}>
 {change}
 </span>
 </div>
 </div>
 );
}
