import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import { NoteGrid } from '@/components/notes/NoteGrid';
import { NoteForm } from '@/components/notes/NoteForm';
import { useNoteStore } from '@/store/noteStore';
import { Input } from '@/components/ui/input';

export default function Notes() {
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const getFilteredNotes = useNoteStore(s => s.getFilteredNotes);

  const notes = getFilteredNotes(search);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <h1 className="text-xl font-semibold">Notes</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          data-testid="add-note-button"
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          New Note
        </motion.button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative mb-5"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          data-testid="note-search"
          type="search"
          placeholder="Search notes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </motion.div>

      <NoteGrid notes={notes} />

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        data-testid="fab-add-note-notes-page"
        onClick={() => setFormOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-primary rounded-full shadow-lg flex items-center justify-center text-primary-foreground z-30 lg:hidden"
      >
        <Plus className="h-5 w-5" />
      </motion.button>

      <AnimatePresence>
        {formOpen && <NoteForm onClose={() => setFormOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
