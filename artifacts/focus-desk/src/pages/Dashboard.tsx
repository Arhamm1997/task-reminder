import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { CheckSquare, StickyNote, Clock, AlertCircle, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';
import { AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/store/taskStore';
import { useNoteStore } from '@/store/noteStore';
import { getGreeting, isDueToday, isOverdue } from '@/lib/utils';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskForm } from '@/components/tasks/TaskForm';
import { NoteForm } from '@/components/notes/NoteForm';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const tasks = useTaskStore(s => s.tasks);
  const notes = useNoteStore(s => s.notes);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [noteFormOpen, setNoteFormOpen] = useState(false);

  const todayTasks = tasks.filter(t => !t.completed && isDueToday(t.dueDate));
  const completedToday = tasks.filter(t => t.completed && t.completedAt && isDueToday(t.completedAt));
  const overdueTasks = tasks.filter(t => isOverdue(t.dueDate, t.completed));
  const pendingNotes = notes.filter(n => !n.pinned).length;

  const stats = [
    {
      label: 'Total tasks',
      value: tasks.filter(t => !t.completed).length,
      icon: CheckSquare,
      color: 'text-primary',
      bg: 'bg-primary/10',
      testId: 'stat-total-tasks',
    },
    {
      label: 'Due today',
      value: todayTasks.length,
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      testId: 'stat-due-today',
    },
    {
      label: 'Completed today',
      value: completedToday.length,
      icon: CheckSquare,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      testId: 'stat-completed-today',
    },
    {
      label: 'Overdue',
      value: overdueTasks.length,
      icon: AlertCircle,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      testId: 'stat-overdue',
    },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-sm text-muted-foreground mb-1">
          {format(new Date(), "EEEE, MMMM d")}
        </p>
        <h1 className="text-2xl font-semibold" data-testid="greeting">
          {getGreeting()} 👋
        </h1>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
      >
        {stats.map(stat => (
          <motion.div
            key={stat.label}
            variants={item}
            data-testid={stat.testId}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Today's tasks */}
      <motion.div variants={item} initial="hidden" animate="show" className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Today's tasks</h2>
          <Link href="/tasks" className="text-xs text-primary hover:underline">
            View all
          </Link>
        </div>

        {todayTasks.length === 0 ? (
          <div className="py-8 text-center rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground text-sm">No tasks due today 🎉</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayTasks.slice(0, 5).map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {todayTasks.length > 5 && (
              <Link href="/tasks?filter=today" className="text-sm text-primary hover:underline text-center block pt-1">
                +{todayTasks.length - 5} more
              </Link>
            )}
          </div>
        )}
      </motion.div>

      {/* Notes summary */}
      <motion.div variants={item} initial="hidden" animate="show">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Recent notes</h2>
          <Link href="/notes" className="text-xs text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {notes.slice(0, 4).map(note => (
            <Link key={note.id} href="/notes">
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:shadow-sm transition-all"
              >
                {note.title && <p className="text-sm font-semibold mb-1">{note.title}</p>}
                <p className="note-font text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {note.body}
                </p>
              </motion.div>
            </Link>
          ))}
          {notes.length === 0 && (
            <div className="py-8 text-center rounded-xl border border-dashed border-border col-span-2">
              <p className="text-muted-foreground text-sm">No notes yet. Create your first one!</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick add buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-30">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          data-testid="fab-add-note"
          onClick={() => setNoteFormOpen(true)}
          className="w-12 h-12 bg-card border border-border rounded-full shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <StickyNote className="h-5 w-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          data-testid="fab-add-task"
          onClick={() => setTaskFormOpen(true)}
          className="w-12 h-12 bg-primary rounded-full shadow-lg flex items-center justify-center text-primary-foreground"
        >
          <Plus className="h-5 w-5" />
        </motion.button>
      </div>

      <AnimatePresence>
        {taskFormOpen && <TaskForm onClose={() => setTaskFormOpen(false)} />}
        {noteFormOpen && <NoteForm onClose={() => setNoteFormOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
