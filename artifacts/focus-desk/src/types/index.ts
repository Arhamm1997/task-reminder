export type Priority = 'high' | 'medium' | 'low';
export type Category = 'work' | 'personal' | 'shopping' | 'other';
export type NoteColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple' | 'white';
export type TaskFilter = 'all' | 'today' | 'upcoming' | 'completed' | 'overdue';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  category: Category;
  dueDate?: string;
  reminderTime?: string;
  reminderDate?: string;
  reminderSent: boolean;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  order: number;
}

export interface Note {
  id: string;
  title?: string;
  body: string;
  color: NoteColor;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppSettings {
  phone: string;
  apikey: string;
}
