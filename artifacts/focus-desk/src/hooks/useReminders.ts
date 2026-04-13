import { useEffect, useRef } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { parseISO, isAfter, isBefore, addMinutes } from 'date-fns';

export function useReminders() {
  const tasks = useTaskStore(s => s.tasks);
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const requestPermission = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    };
    requestPermission();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;

      const now = new Date();
      tasks.forEach(task => {
        if (task.completed || !task.reminderTime || notifiedRef.current.has(task.id)) return;

        try {
          const reminderDate = parseISO(task.reminderTime);
          const window5min = addMinutes(reminderDate, 1);
          if (isAfter(now, reminderDate) && isBefore(now, window5min)) {
            notifiedRef.current.add(task.id);
            new Notification('FocusDesk Reminder', {
              body: task.title,
              icon: '/favicon.ico',
              tag: task.id,
            });
          }
        } catch {
          // ignore parse errors
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [tasks]);
}
