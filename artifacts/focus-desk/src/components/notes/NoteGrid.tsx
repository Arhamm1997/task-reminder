import { AnimatePresence } from 'framer-motion';
import { NoteCard } from './NoteCard';
import { StickyNote } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Note } from '@/types';

interface NoteGridProps {
  notes: Note[];
}

export function NoteGrid({ notes }: NoteGridProps) {
  if (notes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
        data-testid="note-grid-empty"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <StickyNote className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-semibold text-base mb-1">No notes yet</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Create your first note to start building your second brain.
        </p>
      </motion.div>
    );
  }

  return (
    <div
      data-testid="note-grid"
      className="columns-1 sm:columns-2 lg:columns-3 gap-3 space-y-3"
    >
      <AnimatePresence mode="popLayout">
        {notes.map(note => (
          <div key={note.id} className="break-inside-avoid mb-3">
            <NoteCard note={note} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
