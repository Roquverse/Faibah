"use client";

import React, { useState, useEffect } from 'react';
import { formatDuration, intervalToDuration } from 'date-fns';
import { Play, Square } from 'lucide-react';

interface TimeTrackerProps {
  taskId: string;
  userId: string;
  initialTimeLogs?: Array<{ startTime: string; endTime: string | null }>;
}

export function TimeTracker({ taskId, userId, initialTimeLogs = [] }: TimeTrackerProps) {
  const [isActive, setIsActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // Calculate initial elapsed time
    let total = 0;
    let currentlyActive = false;

    for (const log of initialTimeLogs) {
      const start = new Date(log.startTime).getTime();
      const end = log.endTime ? new Date(log.endTime).getTime() : Date.now();
      total += (end - start);

      if (!log.endTime) {
        currentlyActive = true;
      }
    }

    setElapsed(Math.floor(total / 1000));
    setIsActive(currentlyActive);
  }, [initialTimeLogs]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const handleStart = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
      await fetch(`${API_URL}/tasks/${taskId}/time-logs/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      setIsActive(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStop = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
      await fetch(`${API_URL}/tasks/${taskId}/time-logs/stop`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      setIsActive(false);
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (seconds: number) => {
    const d = intervalToDuration({ start: 0, end: seconds * 1000 });
    return `${String(d.hours || 0).padStart(2, '0')}:${String(d.minutes || 0).padStart(2, '0')}:${String(d.seconds || 0).padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-2 text-sm bg-gray-100 p-2 rounded-md">
      <span className="font-mono font-medium text-gray-700 w-16">{formatTime(elapsed)}</span>
      {!isActive ? (
        <button onClick={handleStart} className="text-green-600 hover:text-green-800" title="Start Timer">
          <Play size={16} />
        </button>
      ) : (
        <button onClick={handleStop} className="text-red-600 hover:text-red-800" title="Stop Timer">
          <Square size={16} />
        </button>
      )}
    </div>
  );
}
