import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import { isOverdue, isDueToday, isUpcoming } from '@/lib/utils';
import type { Task, Priority, Category, TaskFilter } from '@/types';
import { format } from 'date-fns';

const SEED_TASKS: Task[] = [
  {
    id: 'seed-task-1',
    title: 'Review Q2 project proposal',
    description: 'Go through the team\'s proposal document and leave detailed feedback on the budget section.',
    priority: 'high',
    category: 'work',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    reminderTime: '09:00',
    reminderDate: format(new Date(), 'yyyy-MM-dd'),
    completed: false,
    reminderSent: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    order: 0,
    noteIds: [],
  },
  {
    id: 'seed-task-2',
    title: 'Buy groceries',
    description: 'Milk, eggs, bread, vegetables, and some snacks for the week.',
    priority: 'medium',
    category: 'shopping',
    dueDate: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'),
    reminderTime: '14:30',
    reminderDate: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'),
    completed: false,
    reminderSent: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    order: 1,
    noteIds: [],
  },
  {
    id: 'seed-task-3',
    title: 'Read "Atomic Habits"',
    description: 'Continue reading from chapter 5.',
    priority: 'low',
    category: 'personal',
    dueDate: format(new Date(Date.now() + 604800000), 'yyyy-MM-dd'),
    completed: false,
    reminderSent: false,
    createdAt: new Date().toISOString(),
    order: 2,
    noteIds: [],
  },
];

interface TaskState {
  tasks: Task[];
  seeded: boolean;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'order'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  reorderTasks: (tasks: Task[]) => void;
  markReminderSent: (id: string) => void;
  getFilteredTasks: (filter: TaskFilter, search: string) => Task[];
  getOverdueCount: () => number;
  archiveOldCompleted: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: SEED_TASKS,
      seeded: true,

      addTask: (taskData) => {
        const tasks = get().tasks;
        const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order)) : -1;
        const newTask: Task = {
          ...taskData,
          reminderSent: taskData.reminderSent ?? false,
          id: generateId(),
          createdAt: new Date().toISOString(),
          order: maxOrder + 1,
        };
        set({ tasks: [...tasks, newTask] });
      },

      updateTask: (id, updates) => {
        set(state => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
        }));
      },

      deleteTask: (id) => {
        set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));
      },

      toggleComplete: (id) => {
        set(state => ({
          tasks: state.tasks.map(t => {
            if (t.id !== id) return t;
            return {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : undefined,
            };
          }),
        }));
      },

      markReminderSent: (id) => {
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === id ? { ...t, reminderSent: true } : t
          ),
        }));
      },

      reorderTasks: (tasks) => {
        set({ tasks });
      },

      getFilteredTasks: (filter, search) => {
        const { tasks } = get();
        let filtered = tasks;

        switch (filter) {
          case 'today':
            filtered = tasks.filter(t => !t.completed && isDueToday(t.dueDate));
            break;
          case 'upcoming':
            filtered = tasks.filter(t => !t.completed && isUpcoming(t.dueDate));
            break;
          case 'completed':
            filtered = tasks.filter(t => t.completed);
            break;
          case 'overdue':
            filtered = tasks.filter(t => isOverdue(t.dueDate, t.completed));
            break;
          default:
            filtered = tasks;
        }

        if (search.trim()) {
          const q = search.toLowerCase();
          filtered = filtered.filter(t =>
            t.title.toLowerCase().includes(q) ||
            (t.description || '').toLowerCase().includes(q)
          );
        }

        return filtered.sort((a, b) => {
          if (isOverdue(a.dueDate, a.completed) && !isOverdue(b.dueDate, b.completed)) return -1;
          if (!isOverdue(a.dueDate, a.completed) && isOverdue(b.dueDate, b.completed)) return 1;
          return a.order - b.order;
        });
      },

      getOverdueCount: () => {
        return get().tasks.filter(t => isOverdue(t.dueDate, t.completed)).length;
      },

      archiveOldCompleted: () => {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        set(state => ({
          tasks: state.tasks.filter(t => {
            if (!t.completed || !t.completedAt) return true;
            return new Date(t.completedAt).getTime() > sevenDaysAgo;
          }),
        }));
      },
    }),
    {
      name: 'focusdesk-tasks',
    }
  )
);

export type { Task, Priority, Category, TaskFilter };
