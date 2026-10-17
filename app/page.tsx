"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAssignments } from '../hooks/useAssignments';
import { AssignmentCard } from '../components/AssignmentCard';
import { AssignmentForm } from '../components/AssignmentForm';
import { StudyStats } from '../components/StudyStats';
import { PomodoroTimer } from '../components/timer/PomodoroTimer';
import { StudyBot } from '../components/chatbot/StudyBot';
import { LayoutDashboard, CheckCircle2, Clock, Sun, Moon, ClipboardPaste, FileUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';

export default function Home() {
  const { assignments, addAssignment, toggleComplete, deleteAssignment, updateAssignmentFile, reorderAssignments } = useAssignments();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const { theme, toggleTheme } = useTheme();
  const [showPasteInput, setShowPasteInput] = useState(false);
  const [pasteValue, setPasteValue] = useState('');

  const filtered = assignments.filter(a => {
    if (filter === 'pending') return !a.completed;
    if (filter === 'completed') return a.completed;
    return true;
  });

  const handleFileUpload = async (id: string, file: File) => {
    const fileURL = URL.createObjectURL(file);
    updateAssignmentFile(id, fileURL);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    if (filter === 'all') {
      reorderAssignments(result.source.index, result.destination.index);
    }
  };

  const processPaste = () => {
    try {
      const data = JSON.parse(pasteValue);
      if (Array.isArray(data)) {
        data.forEach(item => {
          addAssignment({
            title: item.title,
            deadline: item.deadline,
            subject: item.subject || 'Imported',
            priority: item.priority || 'Medium',
            category: item.category || 'CPLT'
          });
        });
        setShowPasteInput(false);
        setPasteValue('');
        alert(`${data.length} assignments imported successfully!`);
      } else if (data.title && data.deadline) {
        addAssignment({
          title: data.title,
          deadline: data.deadline,
          subject: data.subject || 'Imported',
          priority: data.priority || 'Medium',
          category: data.category || 'CPLT'
        });
        setShowPasteInput(false);
        setPasteValue('');
        alert('Assignment imported successfully!');
      } else {
        alert('Invalid assignment data.');
      }
    } catch (err) {
      alert('Invalid data format. Please paste the JSON code copied from the extension.');
    }
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').map(row => row.split(','));
      const imported = rows.slice(1).filter(row => row.length >= 2).map(row => ({
        title: row[0]?.trim(),
        deadline: row[1]?.trim(),
        subject: row[2]?.trim() || 'Imported',
        priority: 'Medium',
        category: 'CPLT'
      }));
      imported.forEach(item => {
        if (item.title && item.deadline) addAssignment(item);
      });
      alert(`Imported ${imported.length} assignments from CSV!`);
    };
    reader.readAsText(file);
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 font-sans transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-indigo-50 text-slate-900'} relative overflow-hidden`}>
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[120px] -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px] -z-10" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto relative z-10"
      >
        <header className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
              <LayoutDashboard size={32} />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Assignment क्रिया</h1>
              <p className="text-slate-500">deadline khtm toh खेल खत्म</p>
            </div>
          </motion.div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className={`p-3 rounded-full transition-all backdrop-blur-md ${theme === 'dark' ? 'bg-slate-800/50 text-yellow-400 hover:bg-slate-700/50 border border-slate-700' : 'bg-white/50 text-slate-600 hover:bg-white/80 border border-white/50 shadow-sm'}`}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>
        </header>

        <div className="grid grid-cols-1">
          <div className="lg:col-span-2">
            <StudyStats assignments={assignments} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <AssignmentForm onAdd={addAssignment} />
            </motion.div>

            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { id: 'all', label: 'All', icon: <LayoutDashboard size={16}/> },
                { id: 'pending', label: 'Pending', icon: <Clock size={16}/> },
                { id: 'completed', label: 'Completed', icon: <CheckCircle2 size={16}/> },
              ].map(btn => (
                <button
                  key={btn.id}
                  onClick={() => setFilter(btn.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all backdrop-blur-md ${
                    filter === btn.id ? 'bg-indigo-600 text-white shadow-md' : theme === 'dark' ? 'bg-slate-800/40 text-slate-300 hover:bg-slate-700/60 border border-slate-700' : 'bg-white/40 text-slate-600 hover:bg-white/60 border border-white/50'
                  }`}
                >
                  {btn.icon} {btn.label}
                </button>
              ))}
              <button
                onClick={() => setShowPasteInput(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all backdrop-blur-md ${
                  theme === 'dark' ? 'bg-amber-600/20 text-amber-400 hover:bg-amber-600/40 border border-amber-600/50' : 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200'
                }`}
              >
                <ClipboardPaste size={16} /> <span>Paste from ERP</span>
              </button>
              <label className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all backdrop-blur-md cursor-pointer ${
                theme === 'dark' ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 border border-emerald-600/50' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200'
              }`}>
                <FileUp size={16} /> <span>Import CSV/Excel</span>
                <input type="file" className="hidden" accept=".csv, .txt" onChange={handleCSVImport} />
              </label>
            </div>

            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-center py-12 ${theme === 'dark' ? 'text-slate-500 bg-slate-800/30 border-slate-700' : 'text-slate-400 bg-white/30 border-white/50'} rounded-2xl border backdrop-blur-md`}
                  >
                    <p>No assignments found. Time to relax! ☕</p>
                  </motion.div>
                ) : (
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="assignments">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                          {filtered.sort((a,b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                            .map((a, index) => (
                              <AssignmentCard
                                key={a.id}
                                index={index}
                                assignment={a}
                                onToggle={toggleComplete}
                                onDelete={deleteAssignment}
                                onFileUpload={handleFileUpload}
                              />
                            ))
                          }
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showPasteInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`p-6 rounded-3xl shadow-2xl w-full max-w-md border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
            >
              <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Import Assignment</h3>
              <p className="text-sm text-slate-500 mb-4">The browser blocked automatic pasting. Please paste the data you copied from the extension below:</p>
              <textarea
                className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 mb-4 h-32 transition-colors ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-black'
                }`}
                value={pasteValue}
                onChange={e => setPasteValue(e.target.value)}
                placeholder='{"title": "Maths HW", ...}'
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowPasteInput(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={processPaste}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30"
                >
                  Import Task
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <StudyBot />
    </div>
  );
}
