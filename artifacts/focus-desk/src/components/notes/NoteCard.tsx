import { useState, useRef, useEffect } from 'react';
import { Pin, PinOff, Trash2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { NOTE_COLORS } from '@/lib/constants';
import { useNoteStore } from '@/store/noteStore';
import { useToast } from '@/hooks/use-toast';
import type { Note } from '@/types';

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  const { updateNote, deleteNote, togglePin } = useNoteStore();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title ?? '');
  const [body, setBody] = useState(note.body);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const colorConfig = NOTE_COLORS[note.color];

  useEffect(() => {
    if (editing && bodyRef.current) {
      bodyRef.current.focus();
      const len = bodyRef.current.value.length;
      bodyRef.current.setSelectionRange(len, len);
    }
  }, [editing]);

  const handleSave = () => {
    updateNote(note.id, { title: title || undefined, body });
    setEditing(false);
  };

  const handleDelete = () => {
    deleteNote(note.id);
    toast({ title: 'Note deleted' });
  };

  const handleTogglePin = () => {
    togglePin(note.id);
    toast({ title: note.pinned ? 'Note unpinned' : 'Note pinned' });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, height: 0 }}
      transition={{ duration: 0.2 }}
      data-testid={`note-card-${note.id}`}
      className={cn(
        'group relative rounded-xl border p-4 cursor-pointer transition-all duration-200',
        colorConfig.bg,
        colorConfig.border,
        'hover:shadow-md'
      )}
    >
      {/* Note actions */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-100 z-10 pointer-events-auto">
        {editing ? (
          <motion.button
            whileTap={{ scale: 0.9 }}
            data-testid={`note-save-${note.id}`}
            onClick={handleSave}
            className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Check className="h-3.5 w-3.5" />
          </motion.button>
        ) : (
          <>
            <motion.button
              whileTap={{ scale: 0.9 }}
              data-testid={`note-pin-${note.id}`}
              onClick={handleTogglePin}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title={note.pinned ? "Unpin" : "Pin"}
            >
              <motion.div
                key={note.pinned ? "pinned" : "unpinned"}
                initial={{ rotate: -180, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
              >
                {note.pinned ? (
                  <PinOff className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <Pin className="h-3.5 w-3.5" />
                )}
              </motion.div>
            </motion.button>
            <button
              data-testid={`note-delete-${note.id}`}
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Pin indicator */}
      {note.pinned && !editing && (
        <div className="absolute top-2.5 left-2.5">
          <Pin className="h-3 w-3 text-primary rotate-45" />
        </div>
      )}

      <div
        className={cn('space-y-2', note.pinned && 'mt-2')}
        onClick={(e) => {
          if (!editing && e.target === e.currentTarget) {
            setEditing(true);
          }
        }}
      >
        {editing ? (
          <div className="space-y-2">
            <input
              data-testid={`note-title-edit-${note.id}`}
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground/60 border-b border-muted-foreground/20 pb-1"
            />
            <textarea
              ref={bodyRef}
              data-testid={`note-body-edit-${note.id}`}
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={8}
              className="note-font w-full bg-transparent text-sm outline-none resize-none placeholder:text-muted-foreground/60 leading-relaxed"
              placeholder="Write your note..."
            />
            <button
              onClick={handleSave}
              className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded hover:bg-primary/90 transition-colors font-medium"
            >
              Save
            </button>
          </div>
        ) : (
          <div onClick={() => setEditing(true)} className="cursor-pointer">
            {title && (
              <p className="text-sm font-semibold leading-tight mb-1 hover:bg-black/5 dark:hover:bg-white/5 px-1 py-0.5 rounded transition-colors">
                {title}
              </p>
            )}
            <p className="note-font text-sm leading-relaxed whitespace-pre-wrap line-clamp-[10] hover:bg-black/5 dark:hover:bg-white/5 px-1 py-0.5 rounded transition-colors">
              {note.body || (
                <span className="text-muted-foreground/60 italic">Empty note — click to edit</span>
              )}
            </p>
          </div>
        )}
      </div>

      {!editing && (
        <p className="text-xs text-muted-foreground/60 mt-3">
          {new Date(note.updatedAt).toLocaleDateString()}
        </p>
      )}
    </motion.div>
  );
}
