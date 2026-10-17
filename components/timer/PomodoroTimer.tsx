"use client";
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';

export const PomodoroTimer: React.FC = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            alert("Time's up! Take a break. ☕");
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border mb-8 flex flex-col items-center justify-center text-center">
      <div className="flex items-center gap-2 text-indigo-600 font-bold mb-4">
        <Timer size={20} />
        <span>Focus Session</span>
      </div>
      <div className="text-6xl font-mono font-bold text-slate-800 mb-6">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="flex gap-4">
        <button
          onClick={toggleTimer}
          className={`p-3 rounded-full transition-all ${isActive ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'}`}
        >
          {isActive ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button
          onClick={resetTimer}
          className="p-3 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
        >
          <RotateCcw size={24} />
        </button>
      </div>
    </div>
  );
};
