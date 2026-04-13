export const PRIORITY_LABELS = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
} as const;

export const PRIORITY_COLORS = {
  high: 'text-red-500',
  medium: 'text-yellow-500',
  low: 'text-blue-400',
} as const;

export const CATEGORY_LABELS = {
  work: 'Work',
  personal: 'Personal',
  shopping: 'Shopping',
  other: 'Other',
} as const;

export const NOTE_COLORS = {
  yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-700/40', label: 'Yellow' },
  green: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-700/40', label: 'Green' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-700/40', label: 'Blue' },
  pink: { bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-200 dark:border-pink-700/40', label: 'Pink' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-700/40', label: 'Purple' },
  white: { bg: 'bg-white dark:bg-card', border: 'border-border', label: 'Default' },
} as const;

export const NOTE_COLOR_SWATCH = {
  yellow: 'bg-yellow-300',
  green: 'bg-green-300',
  blue: 'bg-blue-300',
  pink: 'bg-pink-300',
  purple: 'bg-purple-300',
  white: 'bg-gray-200 dark:bg-gray-600',
} as const;

export const FILTERS = {
  all: 'All',
  today: 'Today',
  upcoming: 'Upcoming',
  completed: 'Completed',
  overdue: 'Overdue',
} as const;
