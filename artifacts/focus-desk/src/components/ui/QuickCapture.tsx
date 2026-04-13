import { useState, useEffect, useRef } from 'react';
import { Plus, Zap } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

export function QuickCapture() {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const addTask = useTaskStore(s => s.addTask);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    addTask({
      title: trimmed,
      priority: 'medium',
      category: 'other',
      completed: false,
    });
    setValue('');
    toast({ title: 'Task added', description: trimmed });
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={false}
      animate={{ scale: focused ? 1.01 : 1 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-xl border bg-card transition-all duration-200',
        focused ? 'border-primary shadow-lg ring-1 ring-primary/20' : 'border-border'
      )}
    >
      <AnimatePresence mode="wait">
        {focused ? (
          <motion.div key="zap" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Zap className="h-4 w-4 text-primary flex-shrink-0" />
          </motion.div>
        ) : (
          <motion.div key="plus" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Plus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </motion.div>
        )}
      </AnimatePresence>
      <input
        ref={inputRef}
        data-testid="quick-capture-input"
        type="text"
        placeholder="Quick capture a task... (Ctrl+K)"
        value={value}
        onChange={e => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
      <AnimatePresence>
        {value && (
          <motion.button
            type="submit"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            data-testid="quick-capture-submit"
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors px-1"
          >
            Add
          </motion.button>
        )}
      </AnimatePresence>
    </motion.form>
  );
}
