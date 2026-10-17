"use client";
import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Assignment } from '../types';
import { Clock, CheckCircle, Trash2, FileText, Upload } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Props {
  assignment: Assignment;
  index: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onFileUpload: (id: string, file: File) => void;
}

export const AssignmentCard: React.FC<Props> = ({ assignment, index, onToggle, onDelete, onFileUpload }) => {
  const { theme } = useTheme();

  const getTimeRemaining = () => {
    const diff = new Date(assignment.deadline).getTime() - new Date().getTime();
    if (diff < 0) return 'Overdue!';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    return `${days}d ${hours}h remaining`;
  };

  const priorityColor = {
    Low: 'bg-blue-100 text-blue-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    High: 'bg-red-100 text-red-700',
  }[assignment.priority];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileUpload(assignment.id, file);
  };

  return (
    <Draggable draggableId={assignment.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-4 mb-3 rounded-xl border transition-all ${assignment.completed ? (theme === 'dark' ? 'bg-slate-800/50 opacity-60' : 'bg-gray-50 opacity-60') : (theme === 'dark' ? 'bg-slate-800 shadow-sm hover:bg-slate-700' : 'bg-white shadow-sm hover:shadow-md')}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <button
                onClick={() => onToggle(assignment.id)}
                className={`mt-1 transition-colors ${assignment.completed ? 'text-green-500' : theme === 'dark' ? 'text-slate-600 hover:text-slate-400' : 'text-gray-300 hover:text-gray-400'}`}
              >
                <CheckCircle size={20} />
              </button>
              <div>
                <h3 className={`font-semibold ${assignment.completed ? 'line-through' : ''}`} style={{ color: assignment.completed ? '#64748b' : (theme === 'dark' ? '#f1f5f9' : '#1e293b') }}>
                  {assignment.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <span className={`font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{assignment.subject}</span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {getTimeRemaining()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded-md text-xs font-bold ${priorityColor}`}>
                {assignment.priority}
              </span>

              <div className="flex items-center gap-2 ml-2">
                {assignment.filePath ? (
                  <a
                    href={assignment.filePath}
                    target="_blank"
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="View File"
                  >
                    <FileText size={18} />
                  </a>
                ) : (
                  <label className={`p-2 rounded-lg cursor-pointer transition-colors ${theme === 'dark' ? 'text-slate-500 hover:bg-slate-700' : 'text-gray-400 hover:bg-gray-100'}`} title="Upload File">
                    <Upload size={18} />
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>

              <button
                onClick={() => onDelete(assignment.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
