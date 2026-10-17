"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Assignment } from '../types';
import { BarChart3, TrendingUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Props {
  assignments: Assignment[];
}

export const StudyStats: React.FC<Props> = ({ assignments }) => {
  const { theme } = useTheme();
  const total = assignments.length;
  const completed = assignments.filter(a => a.completed).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {[
        { label: 'Total Tasks', value: total, icon: <BarChart3 size={24} />, color: 'bg-indigo-100 text-indigo-600' },
        { label: 'Completed', value: completed, icon: <TrendingUp size={24} />, color: 'bg-green-100 text-green-600' },
        { label: 'Progress', value: `${percentage}%`, icon: <div className="font-bold text-xs">%{percentage}</div>, color: 'bg-amber-100 text-amber-600' },
      ].map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`p-4 rounded-2xl border shadow-sm flex items-center gap-4 transition-colors ${
            theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          }`}
        >
          <div className={`p-3 rounded-xl ${stat.color}`}>
            {stat.icon}
          </div>
          <div className="flex flex-col">
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
            <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{stat.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
