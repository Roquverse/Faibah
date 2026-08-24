import React from 'react';
import { MoreVertical, ChevronLeft, ChevronRight, ChevronRight as ChevronRightIcon } from 'lucide-react';

export function CalendarWidget() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-base font-bold text-gray-900">Calendar</h2>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical size={18} />
        </button>
      </div>

      {/* Mini Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <button className="text-gray-400 hover:text-gray-600">
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-bold text-gray-900">October 2025</span>
        <button className="text-gray-400 hover:text-gray-600">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1 text-center mb-6">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-[10px] font-semibold text-gray-400 mb-2">{day}</div>
        ))}
        {/* Mock dates */}
        {[5, 6, 7].map(d => <div key={d} className="text-sm font-medium text-gray-700 py-1">{d}</div>)}
        
        {/* Active date */}
        <div className="text-sm font-bold text-white bg-purple-600 rounded-full w-7 h-7 flex items-center justify-center mx-auto shadow-sm shadow-purple-200">8</div>
        
        {[9, 10, 11].map(d => <div key={d} className="text-sm font-medium text-gray-700 py-1">{d}</div>)}
      </div>

      <div className="h-px w-full bg-gray-100 mb-6"></div>

      {/* Meetings List */}
      <div className="flex-1 space-y-4">
        
        {/* Meeting 1 */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-gray-900">Mesh Weekly Meeting</h4>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex -space-x-2">
                <img src="https://i.pravatar.cc/150?img=11" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                <img src="https://i.pravatar.cc/150?img=12" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                <div className="w-6 h-6 rounded-full border-2 border-white bg-purple-100 text-purple-600 text-[10px] font-bold flex items-center justify-center z-10">+7</div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-gray-500 mb-2">9:00 am - 10:00 am</div>
            <button className="flex items-center gap-1 text-xs font-semibold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-50">
              On Google Meet <ChevronRightIcon size={12} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Meeting 2 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div>
            <h4 className="text-sm font-bold text-gray-900">Gamification Demo</h4>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex -space-x-2">
                <img src="https://i.pravatar.cc/150?img=33" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                <img src="https://i.pravatar.cc/150?img=44" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                <img src="https://i.pravatar.cc/150?img=55" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-gray-500 mb-2">10:45 am - 11:45 am</div>
            <button className="flex items-center gap-1 text-xs font-semibold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-50">
              On Slack <ChevronRightIcon size={12} className="text-gray-400" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
