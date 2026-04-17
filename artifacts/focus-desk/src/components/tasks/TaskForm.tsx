import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { X, MessageCircle, AlertCircle, Trash2 } from 'lucide-react';
import { Link } from 'wouter';
import { useState } from 'react';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useTaskStore } from '@/store/taskStore';
import { useNoteStore } from '@/store/noteStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useToast } from '@/hooks/use-toast';
import type { Task } from '@/types';
import { motion } from 'framer-motion';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']),
  category: z.enum(['work', 'personal', 'shopping', 'other']),
  dueDate: z.string().optional(),
  reminderTime: z.string().optional(),
  reminderDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
}

export function TaskForm({ task, onClose }: TaskFormProps) {
  const { addTask, updateTask } = useTaskStore();
  const notes = useNoteStore(s => s.notes);
  const isWhatsAppConfigured = useSettingsStore(s => s.isConfigured)();
  const { toast } = useToast();
  const [attachedNoteIds, setAttachedNoteIds] = useState<string[]>(task?.noteIds ?? []);
  const [selectedNoteId, setSelectedNoteId] = useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      priority: task?.priority ?? 'medium',
      category: task?.category ?? 'work',
      dueDate: task?.dueDate ?? '',
      reminderTime: task?.reminderTime ?? '',
      reminderDate: task?.reminderDate ?? '',
    },
  });

  const onSubmit = (data: FormData) => {
    if (task) {
      updateTask(task.id, {
        ...data,
        noteIds: attachedNoteIds,
        reminderSent: data.reminderTime !== task.reminderTime ? false : task.reminderSent,
      });
      toast({ title: 'Task updated' });
    } else {
      addTask({ ...data, completed: false, reminderSent: false, noteIds: attachedNoteIds });
      toast({ title: 'Task created' });
    }
    onClose();
  };

  const attachNote = () => {
    if (selectedNoteId && !attachedNoteIds.includes(selectedNoteId)) {
      setAttachedNoteIds([...attachedNoteIds, selectedNoteId]);
      setSelectedNoteId('');
    }
  };

  const detachNote = (noteId: string) => {
    setAttachedNoteIds(attachedNoteIds.filter(id => id !== noteId));
  };

  const attachedNotes = notes.filter(n => attachedNoteIds.includes(n.id));
  const availableNotes = notes.filter(n => !attachedNoteIds.includes(n.id));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="font-semibold text-base">{task ? 'Edit Task' : 'New Task'}</h2>
          <button
            data-testid="close-task-form"
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-5 space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input data-testid="task-title-input" placeholder="What needs to be done?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      data-testid="task-description-input"
                      placeholder="Add details..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="task-priority-select">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="task-category-select">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="shopping">Shopping</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="task-due-date-input"
                        type="date"
                        min={format(new Date(), 'yyyy-MM-dd')}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reminderDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reminder Date</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="task-reminder-date-input"
                        type="date"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Reminder time with WhatsApp indicator */}
            <FormField
              control={form.control}
              name="reminderTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Remind me at
                    {isWhatsAppConfigured && (
                      <span className="flex items-center gap-1 text-xs text-green-500 font-normal">
                        <MessageCircle className="h-3 w-3" />
                        WhatsApp reminder active
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      data-testid="task-reminder-input"
                      type="datetime-local"
                      {...field}
                    />
                  </FormControl>
                  {!isWhatsAppConfigured && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                      Setup WhatsApp in{' '}
                      <Link href="/settings" onClick={onClose} className="text-primary underline">
                        Settings
                      </Link>{' '}
                      to get WhatsApp reminders
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Attached Notes */}
            <div className="pt-4 border-t border-border">
              <label className="text-sm font-medium mb-2 block">Attached Notes</label>

              {/* Attached notes list */}
              {attachedNotes.length > 0 && (
                <div className="space-y-2 mb-3">
                  {attachedNotes.map(note => (
                    <div
                      key={note.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-xs"
                    >
                      <span className="truncate">
                        {note.title || note.body.substring(0, 30)}
                      </span>
                      <button
                        type="button"
                        onClick={() => detachNote(note.id)}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Attach note dropdown */}
              {availableNotes.length > 0 && (
                <div className="flex gap-2">
                  <Select value={selectedNoteId} onValueChange={setSelectedNoteId}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select a note to attach..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableNotes.map(note => (
                        <SelectItem key={note.id} value={note.id}>
                          {note.title || note.body.substring(0, 40)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    onClick={attachNote}
                    disabled={!selectedNoteId}
                    className="h-8 text-xs px-2"
                  >
                    Attach
                  </Button>
                </div>
              )}

              {notes.length === 0 && (
                <p className="text-xs text-muted-foreground">No notes created yet</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                data-testid="task-form-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-testid="task-form-submit"
              >
                {task ? 'Save Changes' : 'Create Task'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </motion.div>
  );
}
