import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { AnimatePresence, motion } from 'framer-motion';
import { TaskCard } from './TaskCard';
import { useTaskStore } from '@/store/taskStore';
import { useToast } from '@/hooks/use-toast';
import type { Task, TaskFilter } from '@/types';
import { CheckSquare } from 'lucide-react';

interface TaskListProps {
  filter: TaskFilter;
  search: string;
  withNotesOnly?: boolean;
}

export function TaskList({ filter, search, withNotesOnly = false }: TaskListProps) {
  const { getFilteredTasks, reorderTasks, deleteTask } = useTaskStore();
  const { toast } = useToast();
  const [deletedTask, setDeletedTask] = useState<Task | null>(null);
  const [deleteTimer, setDeleteTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  let tasks = getFilteredTasks(filter, search);

  // Filter tasks with notes only if enabled
  if (withNotesOnly) {
    tasks = tasks.filter(t => t.noteIds && t.noteIds.length > 0);
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const allTasks = useTaskStore.getState().tasks;
    const oldIndex = allTasks.findIndex(t => t.id === active.id);
    const newIndex = allTasks.findIndex(t => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(allTasks, oldIndex, newIndex).map((t, i) => ({ ...t, order: i }));
      reorderTasks(reordered);
    }
  }, [reorderTasks]);

  const handleDelete = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (deleteTimer) clearTimeout(deleteTimer);
    setDeletedTask(task);
    deleteTask(id);

    const timer = setTimeout(() => {
      setDeletedTask(null);
      setDeleteTimer(null);
    }, 5000);
    setDeleteTimer(timer);

    toast({
      title: 'Task deleted',
      description: (
        <button
          className="text-primary underline text-sm"
          onClick={() => {
            if (deleteTimer) clearTimeout(deleteTimer);
            setDeletedTask(null);
            useTaskStore.getState().addTask({
              title: task.title,
              description: task.description,
              priority: task.priority,
              category: task.category,
              dueDate: task.dueDate,
              reminderTime: task.reminderTime,
              completed: task.completed,
              completedAt: task.completedAt,
            });
            toast({ title: 'Task restored' });
          }}
        >
          Undo
        </button>
      ),
      duration: 5000,
    });
  }, [tasks, deleteTask, deleteTimer, toast]);

  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
        data-testid="task-list-empty"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <CheckSquare className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-semibold text-base mb-1">
          {filter === 'completed' ? 'No completed tasks' : 'All clear!'}
        </h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          {filter === 'all'
            ? "You're all caught up. Add your first task to get started."
            : filter === 'today'
            ? "Nothing due today. Take a breather!"
            : filter === 'overdue'
            ? "No overdue tasks — great job staying on top of things!"
            : filter === 'completed'
            ? "Complete some tasks and they'll appear here."
            : "No upcoming tasks. You're ahead of schedule!"}
        </p>
      </motion.div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2" data-testid="task-list">
          <AnimatePresence mode="popLayout">
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>
    </DndContext>
  );
}
