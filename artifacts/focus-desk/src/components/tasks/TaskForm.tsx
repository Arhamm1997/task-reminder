import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { X, MessageCircle, AlertCircle } from 'lucide-react';
import { Link } from 'wouter';
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
  const isWhatsAppConfigured = useSettingsStore(s => s.isConfigured)();
  const { toast } = useToast();

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
        reminderSent: data.reminderTime !== task.reminderTime ? false : task.reminderSent,
      });
      toast({ title: 'Task updated' });
    } else {
      addTask({ ...data, completed: false, reminderSent: false });
      toast({ title: 'Task created' });
    }
    onClose();
  };

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

            <div className="flex justify-end gap-2 pt-1">
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
