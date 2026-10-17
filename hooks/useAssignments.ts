import { useState, useEffect, useRef } from 'react';
import { Assignment } from '../types';

export function useAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const assignmentsRef = useRef<Assignment[]>([]);

  // 1. INITIAL LOAD: Run once on mount
  useEffect(() => {
    const saved = localStorage.getItem('assignments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setAssignments(parsed);
        }
      } catch (e) {
        console.error("Failed to parse assignments from localStorage", e);
      }
    }

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // 2. SYNC STATE TO REF: Keep the ref updated for the timer
  useEffect(() => {
    assignmentsRef.current = assignments;
  }, [assignments]);

  // 3. PERSISTENCE: Save to localStorage every time assignments change
  useEffect(() => {
    localStorage.setItem('assignments', JSON.stringify(assignments));
  }, [assignments]);

  // 4. CROSS-TAB SYNC: Listen for extension updates
  useEffect(() => {
    const handleExternalSync = (event: StorageEvent) => {
      if (event.key === 'external_assignment_sync' && event.newValue) {
        try {
          const newAssignment = JSON.parse(event.newValue);
          setAssignments(prev => {
            if (prev.find(a => a.id === newAssignment.id)) return prev;
            return [...prev, newAssignment];
          });
        } catch (e) {
          console.error("Sync error", e);
        }
      }
    };

    window.addEventListener('storage', handleExternalSync);
    return () => window.removeEventListener('storage', handleExternalSync);
  }, []);

  // 5. REMINDERS: Background check every minute
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date().getTime();
      const oneHourInMs = 60 * 60 * 1000;
      const currentList = assignmentsRef.current;

      currentList.forEach(assignment => {
        if (assignment.completed) return;
        const deadline = new Date(assignment.deadline).getTime();
        const timeLeft = deadline - now;
        if (timeLeft > 0 && timeLeft <= oneHourInMs && timeLeft > (oneHourInMs - 60000)) {
          const notificationKey = `notified_${assignment.id}_${Math.floor(deadline / (1000 * 60))}`;
          if (!localStorage.getItem(notificationKey)) {
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Assignment Reminder! ⏰', {
                body: `${assignment.title} is due in about 1 hour!`,
                icon: '/favicon.ico'
              });
            }
            localStorage.setItem(notificationKey, 'true');
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, []);

  const addAssignment = (assignment: Omit<Assignment, 'id' | 'completed'>) => {
    const newAssignment: Assignment = {
      ...assignment,
      id: crypto.randomUUID(),
      completed: false,
    };
    setAssignments(prev => [...prev, newAssignment]);
  };

  const updateAssignmentFile = (id: string, filePath: string) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, filePath } : a));
  };

  const toggleComplete = (id: string) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, completed: !a.completed } : a));
  };

  const deleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
  };

  const reorderAssignments = (startIndex: number, endIndex: number) => {
    setAssignments(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  return { assignments, addAssignment, toggleComplete, deleteAssignment, updateAssignmentFile, reorderAssignments };
}
