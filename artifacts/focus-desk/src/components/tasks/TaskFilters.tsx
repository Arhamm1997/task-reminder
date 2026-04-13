import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FILTERS } from '@/lib/constants';
import type { TaskFilter } from '@/types';

interface TaskFiltersProps {
  active: TaskFilter;
  onChange: (filter: TaskFilter) => void;
  counts: Record<TaskFilter, number>;
}

export function TaskFilters({ active, onChange, counts }: TaskFiltersProps) {
  return (
    <div className="flex items-center gap-1 flex-wrap" data-testid="task-filters">
      {(Object.entries(FILTERS) as [TaskFilter, string][]).map(([key, label]) => (
        <button
          key={key}
          data-testid={`filter-${key}`}
          onClick={() => onChange(key)}
          className={cn(
            'relative px-3 py-1.5 text-sm rounded-lg font-medium transition-colors',
            active === key
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {active === key && (
            <motion.span
              layoutId="filter-pill"
              className="absolute inset-0 bg-primary/10 rounded-lg border border-primary/20"
            />
          )}
          <span className="relative">
            {label}
            {counts[key] > 0 && (
              <span className={cn(
                'ml-1.5 text-xs px-1.5 py-0.5 rounded-full',
                key === 'overdue'
                  ? 'bg-destructive/15 text-destructive'
                  : 'bg-muted text-muted-foreground'
              )}>
                {counts[key]}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
