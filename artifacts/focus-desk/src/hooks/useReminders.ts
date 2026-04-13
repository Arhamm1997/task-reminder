import { useEffect, useRef } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { useSettingsStore } from '@/store/settingsStore';
import { parseISO, isAfter, isBefore, addMinutes, format } from 'date-fns';

export function useReminders() {
  const tasks = useTaskStore(s => s.tasks);
  const markReminderSent = useTaskStore(s => s.markReminderSent);
  const sendWhatsApp = useSettingsStore(s => s.sendWhatsApp);
  const isConfigured = useSettingsStore(s => s.isConfigured);
  const browserNotifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const requestPermission = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    };
    requestPermission();
  }, []);

  useEffect(() => {
    const check = () => {
      const now = new Date();

      tasks.forEach(task => {
        if (task.completed || !task.reminderTime || task.reminderSent) return;

        try {
          const reminderDate = parseISO(task.reminderTime);
          const windowEnd = addMinutes(reminderDate, 1);

          if (isAfter(now, reminderDate) && isBefore(now, windowEnd)) {
            const alreadyBrowserNotified = browserNotifiedRef.current.has(task.id);

            // Browser notification
            if (!alreadyBrowserNotified && 'Notification' in window && Notification.permission === 'granted') {
              browserNotifiedRef.current.add(task.id);
              new Notification('FocusDesk Reminder', {
                body: task.title,
                icon: '/favicon.ico',
                tag: task.id,
              });
            }

            // WhatsApp notification — only send once (reminderSent guard)
            if (isConfigured()) {
              const dueDateFormatted = task.dueDate
                ? format(parseISO(task.dueDate), 'MMM d, yyyy')
                : 'No due date';

              const message =
                `🔔 FocusDesk Reminder!\n\nTask: ${task.title}\nPriority: ${task.priority}\nDue: ${dueDateFormatted}\n\nOpen app to mark complete.`;

              markReminderSent(task.id);

              sendWhatsApp(message).catch(() => {
                // silently swallow network errors
              });
            } else {
              // No WhatsApp configured — still mark sent so browser notification doesn't repeat indefinitely
              markReminderSent(task.id);
            }
          }
        } catch {
          // ignore parse errors
        }
      });
    };

    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [tasks, markReminderSent, sendWhatsApp, isConfigured]);
}
