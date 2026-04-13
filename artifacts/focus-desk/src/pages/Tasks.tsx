import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Focus } from 'lucide-react';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskForm } from '@/components/tasks/TaskForm';
import { useTaskStore } from '@/store/taskStore';
import { isDueToday, isOverdue, isUpcoming } from '@/lib/utils';
import type { TaskFilter } from '@/types';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export default function Tasks() {
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const tasks = useTaskStore(s => s.tasks);

  const counts: Record<TaskFilter, number> = {
    all: tasks.filter(t => !t.completed).length,
    today: tasks.filter(t => !t.completed && isDueToday(t.dueDate)).length,
    upcoming: tasks.filter(t => !t.completed && isUpcoming(t.dueDate)).length,
    completed: tasks.filter(t => t.completed).length,
    overdue: tasks.filter(t => isOverdue(t.dueDate, t.completed)).length,
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setFormOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className={cn('p-6 max-w-2xl mx-auto', focusMode && 'max-w-xl')}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <h1 className="text-xl font-semibold">Tasks</h1>
        <div className="flex items-center gap-2">
          <button
            data-testid="focus-mode-toggle"
            onClick={() => setFocusMode(v => !v)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              focusMode
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <Focus className="h-4 w-4" />
            {focusMode ? 'Exit Focus' : 'Focus Mode'}
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-testid="add-task-button"
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            New Task
          </motion.button>
        </div>
      </motion.div>

      {!focusMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 space-y-3"
        >
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              data-testid="task-search"
              type="search"
              placeholder="Search tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filters */}
          <TaskFilters active={filter} onChange={setFilter} counts={counts} />
        </motion.div>
      )}

      {focusMode && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-primary/10 rounded-xl border border-primary/20 text-sm text-primary font-medium"
        >
          Focus Mode — showing today's tasks only
        </motion.div>
      )}

      <TaskList filter={focusMode ? 'today' : filter} search={search} />

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        data-testid="fab-add-task-tasks-page"
        onClick={() => setFormOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-primary rounded-full shadow-lg flex items-center justify-center text-primary-foreground z-30 lg:hidden"
      >
        <Plus className="h-5 w-5" />
      </motion.button>

      <AnimatePresence>
        {formOpen && <TaskForm onClose={() => setFormOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
