'use client';

import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Video, Phone, Users, CheckCircle2, X } from 'lucide-react';
import { AppointmentsApi } from '@/lib/api';

type AppointmentType = 'MEETING' | 'CALL' | 'DEADLINE' | 'REMINDER';

interface Appointment {
 id: string;
 title: string;
 description: string;
 date: string;
 startTime: string;
 endTime: string;
 type: AppointmentType;
 link?: string;
}

export default function SchedulePage() {
 const [currentDate, setCurrentDate] = useState(new Date());
 const [appointments, setAppointments] = useState<Appointment[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [selectedDay, setSelectedDay] = useState<Date | null>(null);
 const [viewAppointment, setViewAppointment] = useState<Appointment | null>(null);

 // Form State
 const [formData, setFormData] = useState({
 title: '',
 description: '',
 startTime: '10:00',
 endTime: '11:00',
 type: 'MEETING' as AppointmentType,
 link: '',
 });

 useEffect(() => {
 loadAppointments();
 }, [currentDate]);

 const loadAppointments = async () => {
 try {
 const data = await AppointmentsApi.getAll();
 setAppointments(data);
 } catch (e) {
 console.error(e);
 } finally {
 setIsLoading(false);
 }
 };

 const handleSaveAppointment = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!selectedDay) return;
 try {
 await AppointmentsApi.create({
 ...formData,
 date: selectedDay.toISOString(),
 });
 setIsModalOpen(false);
 setFormData({ title: '', description: '', startTime: '10:00', endTime: '11:00', type: 'MEETING', link: '' });
 loadAppointments();
 } catch (e) {
 console.error(e);
 }
 };

 const deleteAppointment = async (id: string, e: React.MouseEvent) => {
 e.stopPropagation();
 try {
 await AppointmentsApi.delete(id);
 loadAppointments();
 } catch (e) {}
 };

 const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
 const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
 const goToToday = () => setCurrentDate(new Date());

 const monthStart = startOfMonth(currentDate);
 const monthEnd = endOfMonth(monthStart);
 const startDate = startOfWeek(monthStart);
 const endDate = endOfWeek(monthEnd);

 const dateFormat ="d";
 const days = eachDayOfInterval({ start: startDate, end: endDate });

 const getDayAppointments = (day: Date) => {
 return appointments.filter(app => isSameDay(parseISO(app.date), day)).sort((a, b) => a.startTime.localeCompare(b.startTime));
 };

 const getTypeStyles = (type: AppointmentType) => {
 switch (type) {
 case 'MEETING': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
 case 'CALL': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
 case 'DEADLINE': return 'bg-rose-50 text-rose-700 border-rose-200';
 case 'REMINDER': return 'bg-amber-50 text-amber-700 border-amber-200';
 default: return 'bg-gray-50 text-gray-700 border-gray-200';
 }
 };

 const getTypeIcon = (type: AppointmentType) => {
 switch (type) {
 case 'MEETING': return <Users className="w-3 h-3 mr-1" />;
 case 'CALL': return <Phone className="w-3 h-3 mr-1" />;
 case 'DEADLINE': return <Clock className="w-3 h-3 mr-1" />;
 case 'REMINDER': return <CheckCircle2 className="w-3 h-3 mr-1" />;
 default: return null;
 }
 };

 return (
 <div className="p-8 w-full font-sans">
 {/* Header */}
 <div className="flex justify-between items-center mb-8">
 <div>
 <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Schedule</h1>
 <p className="text-gray-500">Manage your agency appointments, calls, and deadlines.</p>
 </div>
 <div className="flex items-center gap-4">
 <button 
 onClick={goToToday}
 className="px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
 >
 Today
 </button>
 <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
 <button onClick={prevMonth} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors border-r border-gray-200">
 <ChevronLeft className="w-5 h-5" />
 </button>
 <div className="px-6 py-2 text-sm font-bold text-gray-900 min-w-[140px] text-center">
 {format(currentDate, 'MMMM yyyy')}
 </div>
 <button onClick={nextMonth} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors border-l border-gray-200">
 <ChevronRight className="w-5 h-5" />
 </button>
 </div>
 <button 
 onClick={() => {
 setSelectedDay(new Date());
 setIsModalOpen(true);
 }}
 className="flex items-center gap-2 px-5 py-2.5 bg-[#FBDF4B] text-gray-900 text-sm font-bold rounded-xl hover:bg-[#F3D53C] transition-colors border border-transparent"
 >
 <Plus className="w-4 h-4" />
 Add Event
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
 {/* Left Column: Calendar Grid */}
 <div className="xl:col-span-8 2xl:col-span-9 space-y-6">
 <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
 {/* Days Header */}
 <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
 <div key={day} className="py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
 {day}
 </div>
 ))}
 </div>

 {/* Days Grid */}
 <div className="grid grid-cols-7 auto-rows-[140px] divide-x divide-y divide-gray-100">
 {days.map((day) => {
 const dayApps = getDayAppointments(day);
 return (
 <div 
 key={day.toString()} 
 onClick={() => { setSelectedDay(day); setIsModalOpen(true); }}
 className={`p-2 transition-colors cursor-pointer group hover:bg-gray-50 ${!isSameMonth(day, monthStart) ? 'bg-gray-50/30' : ''}`}
 >
 <div className="flex justify-between items-start mb-2">
 <span className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
 isToday(day) ? 'bg-gray-900 text-white' : 
 !isSameMonth(day, monthStart) ? 'text-gray-400' : 'text-gray-700'
 }`}>
 {format(day, dateFormat)}
 </span>
 <Plus className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
 </div>

 <div className="space-y-1.5 overflow-y-auto max-h-[90px] pr-1 custom-scrollbar">
 {dayApps.map(app => (
 <div 
 key={app.id} 
 className={`group/app relative flex items-center px-2 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${getTypeStyles(app.type)}`}
 onClick={(e) => {
 e.stopPropagation(); // Prevent opening day modal
 setViewAppointment(app);
 }}
 >
 <div className="flex-1 truncate flex items-center">
 {getTypeIcon(app.type)}
 <span className="truncate">{app.title}</span>
 </div>
 <div className="ml-2 opacity-60 text-[10px] shrink-0 whitespace-nowrap">
 {app.startTime}
 </div>
 </div>
 ))}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </div>

 {/* Right Column: Sidebar */}
 <div className="xl:col-span-4 2xl:col-span-3 space-y-6">
 
 {/* 1. Today's Agenda (Expansion Detail) */}
 {viewAppointment ? (
 <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden flex flex-col h-[280px]">
 <div className={`p-5 border-b border-gray-100 flex items-center gap-3 ${getTypeStyles(viewAppointment.type).split(' ')[0]}`}>
 <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white text-gray-700 border border-gray-100`}>
 {getTypeIcon(viewAppointment.type)}
 </div>
 <div className="flex-1">
 <h2 className="text-sm font-bold text-gray-900 leading-tight line-clamp-1">{viewAppointment.title}</h2>
 <div className="text-[11px] font-semibold text-gray-600 mt-0.5">{viewAppointment.type}</div>
 </div>
 <button onClick={() => setViewAppointment(null)} className="text-gray-400 hover:text-gray-900 transition-colors p-1.5 rounded-full hover:bg-white/50">
 <X className="w-4 h-4" />
 </button>
 </div>
 
 <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-4">
 <div>
 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">When</div>
 <div className="text-xs font-semibold text-gray-900">
 {format(parseISO(viewAppointment.date), 'EEEE, MMM d')} • {viewAppointment.startTime} - {viewAppointment.endTime}
 </div>
 </div>

 {viewAppointment.description && (
 <div>
 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Notes</div>
 <div className="text-xs font-medium text-gray-700">{viewAppointment.description}</div>
 </div>
 )}
 </div>
 
 <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-2">
 {viewAppointment.link && (
 <a 
 href={viewAppointment.link.startsWith('http') ? viewAppointment.link : `https://${viewAppointment.link}`} 
 target="_blank" 
 rel="noopener noreferrer"
 className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors"
 >
 <Video className="w-3.5 h-3.5" />
 Join Call
 </a>
 )}
 <button 
 onClick={(e) => {
 deleteAppointment(viewAppointment.id, e);
 setViewAppointment(null);
 }}
 className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
 >
 Delete
 </button>
 </div>
 </div>
 ) : (
 <div className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col items-center justify-center text-center text-gray-400 h-[280px]">
 <CalendarIcon className="w-10 h-10 mb-4 text-gray-200" />
 <p className="text-xs font-medium max-w-[200px]">Select an event on the calendar to view its agenda and notes.</p>
 </div>
 )}

 {/* 2. Mini Month Picker */}
 <div className="bg-white rounded-3xl border border-gray-200 p-5">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-sm font-bold text-gray-900">{format(currentDate, 'MMMM yyyy')}</h3>
 <div className="flex gap-1">
 <button onClick={prevMonth} className="p-1 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-900"><ChevronLeft className="w-4 h-4" /></button>
 <button onClick={nextMonth} className="p-1 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-900"><ChevronRight className="w-4 h-4" /></button>
 </div>
 </div>
 <div className="grid grid-cols-7 gap-y-2 text-center">
 {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
 <div key={d} className="text-[10px] font-bold text-gray-400">{d}</div>
 ))}
 {days.map((day, i) => (
 <button 
 key={i}
 onClick={() => { setSelectedDay(day); setIsModalOpen(true); }}
 className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-semibold ${
 isToday(day) ? 'bg-gray-900 text-white' : 
 !isSameMonth(day, monthStart) ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'
 }`}
 >
 {format(day, 'd')}
 </button>
 ))}
 </div>
 </div>

 {/* 3. Quick-Add Shortcuts */}
 <div className="bg-white rounded-3xl border border-gray-200 p-5">
 <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Quick Add</h3>
 <div className="grid grid-cols-2 gap-2">
 {(['MEETING', 'CALL', 'DEADLINE', 'REMINDER'] as AppointmentType[]).map(type => (
 <button
 key={type}
 onClick={() => {
 setFormData({ title: '', description: '', startTime: '10:00', endTime: '11:00', type, link: '' });
 setSelectedDay(new Date());
 setIsModalOpen(true);
 }}
 className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-gray-200 text-[11px] font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
 >
 {getTypeIcon(type)}
 {type}
 </button>
 ))}
 </div>
 </div>

 {/* 4. Upcoming (List View) */}
 <div className="bg-white rounded-3xl border border-gray-200 p-5">
 <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Upcoming Schedule</h3>
 <div className="space-y-3">
 {appointments.filter(a => parseISO(a.date) >= new Date(new Date().setHours(0,0,0,0))).length === 0 ? (
   <div className="text-sm text-gray-500 text-center py-4">No upcoming events</div>
 ) : (
   appointments
     .filter(a => parseISO(a.date) >= new Date(new Date().setHours(0,0,0,0)))
     .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
     .slice(0, 3)
     .map(app => (
       <div key={app.id} className="flex gap-3 items-start group cursor-pointer" onClick={() => setViewAppointment(app)}>
         <div className="w-10 flex flex-col items-center shrink-0">
           <span className="text-[10px] font-bold text-gray-400 uppercase">{format(parseISO(app.date), 'MMM')}</span>
           <span className="text-sm font-extrabold text-gray-900">{format(parseISO(app.date), 'dd')}</span>
         </div>
         <div className={`flex-1 p-2.5 rounded-xl border ${getTypeStyles(app.type)}`}>
           <div className="text-xs font-bold mb-0.5 line-clamp-1">{app.title}</div>
           <div className="text-[10px] opacity-70">{app.startTime} - {app.endTime}</div>
         </div>
       </div>
     ))
 )}
 </div>
 </div>

 </div>
 </div>

 {/* Add Event Modal (Still needed for full creation) */}
 {isModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
 <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
 <div className="flex justify-between items-center p-6 border-b border-gray-100">
 <h2 className="text-xl font-bold text-gray-900">Add New Event</h2>
 <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
 <X className="w-5 h-5" />
 </button>
 </div>
 
 <form onSubmit={handleSaveAppointment} className="p-6 space-y-6">
 
 <div>
 <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Event Title</label>
 <input 
 type="text" 
 required
 value={formData.title}
 onChange={(e) => setFormData({...formData, title: e.target.value})}
 className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none transition-all"
 placeholder="e.g. Design Sync with Nike"
 />
 </div>
 
 {(formData.type === 'MEETING' || formData.type === 'CALL') && (
 <div>
 <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Meeting Link (Optional)</label>
 <input 
 type="url" 
 value={formData.link}
 onChange={(e) => setFormData({...formData, link: e.target.value})}
 className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none transition-all"
 placeholder="e.g. https://zoom.us/j/123456789"
 />
 </div>
 )}
 
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Start Time</label>
 <input 
 type="time" 
 required
 value={formData.startTime}
 onChange={(e) => setFormData({...formData, startTime: e.target.value})}
 className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none transition-all"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">End Time</label>
 <input 
 type="time" 
 required
 value={formData.endTime}
 onChange={(e) => setFormData({...formData, endTime: e.target.value})}
 className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none transition-all"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Event Type</label>
 <div className="grid grid-cols-2 gap-2">
 {(['MEETING', 'CALL', 'DEADLINE', 'REMINDER'] as AppointmentType[]).map(type => (
 <button
 key={type}
 type="button"
 onClick={() => setFormData({...formData, type})}
 className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
 formData.type === type 
 ? getTypeStyles(type)
 : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
 }`}
 >
 {type}
 </button>
 ))}
 </div>
 </div>

 <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
 <button 
 type="button" 
 onClick={() => setIsModalOpen(false)}
 className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
 >
 Cancel
 </button>
 <button 
 type="submit"
 className="px-6 py-2.5 bg-[#FBDF4B] text-gray-900 text-sm font-bold rounded-xl hover:bg-[#F3D53C] transition-colors border border-transparent"
 >
 Save Event
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 
 <style dangerouslySetInnerHTML={{__html: `
 .custom-scrollbar::-webkit-scrollbar {
 width: 4px;
 }
 .custom-scrollbar::-webkit-scrollbar-track {
 background: transparent;
 }
 .custom-scrollbar::-webkit-scrollbar-thumb {
 background-color: #e5e7eb;
 border-radius: 10px;
 }
 `}} />
 </div>
 );
}
