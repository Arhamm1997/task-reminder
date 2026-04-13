import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import type { Note, NoteColor } from '@/types';

const SEED_NOTES: Note[] = [
  {
    id: 'seed-note-1',
    title: 'Weekly Goals',
    body: 'This week I want to:\n1. Finish the project proposal\n2. Exercise at least 3 times\n3. Read 30 pages of my book\n4. Call Mom on Sunday',
    color: 'green',
    pinned: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'seed-note-2',
    title: 'Ideas to explore',
    body: 'Build a time-tracking app for freelancers. Maybe integrate with invoicing tools? Could be really useful for people who bill by the hour.',
    color: 'blue',
    pinned: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

interface NoteState {
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
  getFilteredNotes: (search: string) => Note[];
}

export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      notes: SEED_NOTES,

      addNote: (noteData) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newNote: Note = {
          ...noteData,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set(state => ({ notes: [newNote, ...state.notes] }));
        return id;
      },

      updateNote: (id, updates) => {
        set(state => ({
          notes: state.notes.map(n =>
            n.id === id
              ? { ...n, ...updates, updatedAt: new Date().toISOString() }
              : n
          ),
        }));
      },

      deleteNote: (id) => {
        set(state => ({ notes: state.notes.filter(n => n.id !== id) }));
      },

      togglePin: (id) => {
        set(state => ({
          notes: state.notes.map(n =>
            n.id === id ? { ...n, pinned: !n.pinned, updatedAt: new Date().toISOString() } : n
          ),
        }));
      },

      getFilteredNotes: (search) => {
        const { notes } = get();
        let filtered = notes;
        if (search.trim()) {
          const q = search.toLowerCase();
          filtered = notes.filter(n =>
            (n.title || '').toLowerCase().includes(q) ||
            n.body.toLowerCase().includes(q)
          );
        }
        return filtered.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
      },
    }),
    {
      name: 'focusdesk-notes',
    }
  )
);

export type { Note, NoteColor };
