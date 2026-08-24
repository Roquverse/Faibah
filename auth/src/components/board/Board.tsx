"use client";

import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { BoardColumn } from './BoardColumn';

const COLUMNS = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'DONE', title: 'Done' },
  { id: 'BILLING', title: 'Billing' },
];

export function Board({ clientId }: { clientId: string }) {
  const [boardData, setBoardData] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  // In a real app, you would get this from AuthContext
  const mockUserId = 'user_123'; 

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Fetch board by client
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
    fetch(`${API_URL}/boards/by-client/${clientId}`)
      .then(res => res.json())
      .then(data => {
        setBoardData(data);
        setTasks(data.tasks || []);
      })
      .catch(err => console.error(err));
  }, [clientId]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Find if overId is a column or another task
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    let newStatus = activeTask.status;
    let overTaskIndex = tasks.findIndex(t => t.id === overId);

    if (COLUMNS.find(c => c.id === overId)) {
      newStatus = overId;
    } else if (overTaskIndex !== -1) {
      newStatus = tasks[overTaskIndex].status;
    }

    if (activeTask.status !== newStatus) {
      // Optimistic update
      const updatedTasks = tasks.map(t => t.id === activeId ? { ...t, status: newStatus } : t);
      setTasks(updatedTasks);

      // Persist
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
        await fetch(`${API_URL}/tasks/${activeId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
      } catch (err) {
        // Revert on error
        setTasks(tasks);
        console.error(err);
      }
    } else if (activeId !== overId) {
      // Reorder within the same column
      const oldIndex = tasks.findIndex(t => t.id === activeId);
      const newIndex = tasks.findIndex(t => t.id === overId);
      setTasks(arrayMove(tasks, oldIndex, newIndex));
    }
  };

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    
    if (!title || !boardData) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId: boardData.id, title })
      });
      const newTask = await res.json();
      newTask.timeLogs = []; // init for UI
      setTasks([...tasks, newTask]);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error(err);
    }
  };

  if (!boardData) {
    return <div className="p-8 text-gray-500">Loading board... (Make sure backend is running)</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{boardData.name}</h1>
          <p className="text-gray-500">Currency: {boardData.currency}</p>
        </div>
        
        <form onSubmit={handleCreateTask} className="flex gap-2">
          <input 
            type="text" 
            name="title" 
            placeholder="New task title..." 
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" 
            required 
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
            Add Task
          </button>
        </form>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {COLUMNS.map(col => (
            <BoardColumn 
              key={col.id} 
              id={col.id} 
              title={col.title} 
              tasks={tasks.filter(t => t.status === col.id)} 
              userId={mockUserId} 
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
