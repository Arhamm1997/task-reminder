import { useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNoteStore } from '@/store/noteStore';
import { useToast } from '@/hooks/use-toast';
import { NOTE_COLORS, NOTE_COLOR_SWATCH } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { NoteColor } from '@/types';
import { Button } from '@/components/ui/button';

interface NoteFormProps {
  onClose: () => void;
}

const COLORS: NoteColor[] = ['white', 'yellow', 'green', 'blue', 'pink', 'purple'];

export function NoteForm({ onClose }: NoteFormProps) {
  const { addNote } = useNoteStore();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [color, setColor] = useState<NoteColor>('white');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    addNote({ title: title || undefined, body, color, pinned: false });
    toast({ title: 'Note created' });
    onClose();
  };

  const colorConfig = NOTE_COLORS[color];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={cn(
        'w-full max-w-md rounded-xl border shadow-2xl overflow-hidden',
        colorConfig.bg,
        colorConfig.border
      )}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-inherit">
          <h2 className="font-semibold text-base">New Note</h2>
          <button
            data-testid="close-note-form"
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <input
            data-testid="note-title-input"
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground/60"
          />
          <textarea
            data-testid="note-body-input"
            placeholder="Write your note here..."
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={5}
            autoFocus
            className="note-font w-full bg-transparent text-sm outline-none resize-none placeholder:text-muted-foreground/60 leading-relaxed"
          />

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Color:</span>
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                data-testid={`note-color-${c}`}
                onClick={() => setColor(c)}
                className={cn(
                  'w-5 h-5 rounded-full transition-all',
                  NOTE_COLOR_SWATCH[c],
                  color === c ? 'ring-2 ring-offset-1 ring-primary scale-110' : 'hover:scale-105'
                )}
                title={NOTE_COLORS[c].label}
              />
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} data-testid="note-form-cancel">
              Cancel
            </Button>
            <Button type="submit" data-testid="note-form-submit" disabled={!body.trim()}>
              Create Note
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
