import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2, Bell, Tag, AlertCircle, Check, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatDate, isOverdue } from '@/lib/utils';
import { PRIORITY_COLORS, CATEGORY_LABELS } from '@/lib/constants';
import { useTaskStore } from '@/store/taskStore';
import { useNoteStore } from '@/store/noteStore';
import { useToast } from '@/hooks/use-toast';
import type { Task } from '@/types';
import { TaskForm } from './TaskForm';
import { Button } from '@/components/ui/button';

interface TaskCardProps {
  task: Task;
  onDelete?: (id: string) => void;
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
  const { toggleComplete } = useTaskStore();
  const notes = useNoteStore(s => s.notes);
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [checked, setChecked] = useState(task.completed);

  const attachedNotes = notes.filter(n => task.noteIds?.includes(n.id));

  const overdue = isOverdue(task.dueDate, task.completed);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleToggle = () => {
    setChecked(!checked);
    toggleComplete(task.id);
    if (!task.completed) {
      toast({ title: 'Task completed!', description: task.title });
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(task.id);
    }
  };

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={style}
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
        exit={{ opacity: 0, x: -20, height: 0 }}
        transition={{ duration: 0.18 }}
        data-testid={`task-card-${task.id}`}
        className={cn(
          'group flex items-start gap-3 p-3.5 rounded-xl border bg-card cursor-default select-none transition-all duration-200',
          overdue && !task.completed ? 'border-destructive/30 bg-destructive/5' : 'border-border hover:border-border',
          isDragging ? 'shadow-xl z-10' : 'hover:shadow-sm',
          task.completed && 'opacity-60'
        )}
      >
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none"
          data-testid={`task-drag-handle-${task.id}`}
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Checkbox */}
        <button
          data-testid={`task-checkbox-${task.id}`}
          onClick={handleToggle}
          className={cn(
            'mt-0.5 w-4 h-4 rounded-sm border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200',
            task.completed
              ? 'bg-primary border-primary'
              : 'border-muted-foreground/50 hover:border-primary'
          )}
        >
          <AnimatePresence>
            {task.completed && (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="w-2.5 h-2.5 text-primary-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </motion.svg>
            )}
          </AnimatePresence>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                'text-sm font-medium leading-tight',
                task.completed && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </p>
            <div className="flex items-center gap-1 flex-shrink-0">
              {!task.completed && (
                <button
                  data-testid={`task-done-${task.id}`}
                  onClick={handleToggle}
                  className="p-1 rounded-md text-green-600 hover:bg-green-600/10 transition-colors"
                  title="Mark as done"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                data-testid={`task-edit-${task.id}`}
                onClick={() => setEditOpen(true)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                data-testid={`task-delete-${task.id}`}
                onClick={handleDelete}
                className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {/* Priority */}
            <span className={cn('text-xs font-medium', PRIORITY_COLORS[task.priority])}>
              {task.priority}
            </span>

            {/* Category */}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Tag className="h-3 w-3" />
              {CATEGORY_LABELS[task.category]}
            </span>

            {/* Due date */}
            {task.dueDate && (
              <span className={cn(
                'flex items-center gap-1 text-xs',
                overdue ? 'text-destructive font-medium' : 'text-muted-foreground'
              )}>
                {overdue && <AlertCircle className="h-3 w-3" />}
                {formatDate(task.dueDate)}
              </span>
            )}

            {/* Reminder */}
            {task.reminderTime && (
              <span className={cn(
                'flex items-center gap-1 text-xs',
                task.reminderSent ? 'text-green-600 dark:text-green-400 font-medium' : 'text-muted-foreground'
              )}>
                <Bell className="h-3 w-3" />
                {task.reminderSent ? 'Message sent' : 'Reminder set'}
              </span>
            )}

            {/* Attached notes count */}
            {attachedNotes.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                <FileText className="h-3 w-3" />
                {attachedNotes.length} note{attachedNotes.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {editOpen && (
          <TaskForm task={task} onClose={() => setEditOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
