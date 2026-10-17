"use client";
import React, { useState } from 'react';
import { Assignment } from '../types';
import { PlusCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Props {
  onAdd: (a: Omit<Assignment, 'id' | 'completed'>) => void;
}

export const AssignmentForm: React.FC<Props> = ({ onAdd }) => {
  const { theme } = useTheme();
  const [form, setForm] = useState({
    title: '',
    subject: '',
    deadline: '',
    priority: 'Medium' as any,
    category: 'CPLT' as any
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.deadline) return;
    onAdd(form);
    setForm({ title: '', subject: '', deadline: '', priority: 'Medium', category: 'CPLT' });
  };

  const inputClass = `p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
    theme === 'dark'
      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
      : 'bg-white border-slate-200 text-black placeholder-slate-400'
  }`;

  return (
    <form onSubmit={handleSubmit} className={`p-6 rounded-2xl shadow-sm border mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 transition-colors ${
      theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
    }`}>
      <input
        className={inputClass}
        placeholder="Assignment Title"
        value={form.title}
        onChange={e => setForm({...form, title: e.target.value})}
      />
      <input
        className={inputClass}
        placeholder="Subject"
        value={form.subject}
        onChange={e => setForm({...form, subject: e.target.value})}
      />
      <input
        type="datetime-local"
        className={inputClass}
        value={form.deadline}
        onChange={e => setForm({...form, deadline: e.target.value})}
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          className={inputClass}
          value={form.priority}
          onChange={e => setForm({...form, priority: e.target.value as any})}
        >
          <option value="Low">Low Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="High">High Priority</option>
        </select>
        <select
          className={inputClass}
          value={form.category}
          onChange={e => setForm({...form, category: e.target.value as any})}
        >
          <option value="CPLT">CPLT</option>
          <option value="FOA">FOA</option>
          <option value="MATHS">MATHS</option>
          <option value="PHYSICS">PHYSICS</option>
          <option value="CS">CS</option>
        </select>
      </div>
      <button className="md:col-span-2 bg-indigo-600 text-white p-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
        <PlusCircle size={20} /> Add Assignment
      </button>
    </form>
  );
};
