import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isToday, isPast, isFuture, startOfDay, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

export function isOverdue(dateStr: string | undefined, completed: boolean): boolean {
  if (!dateStr || completed) return false;
  const date = parseISO(dateStr);
  return isPast(startOfDay(date)) && !isToday(date);
}

export function isDueToday(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  return isToday(parseISO(dateStr));
}

export function isUpcoming(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  const date = parseISO(dateStr);
  return isFuture(startOfDay(date)) && !isToday(date);
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function getTabTitle(overdueCount: number): string {
  if (overdueCount > 0) {
    return `(${overdueCount}) FocusDesk`;
  }
  return "FocusDesk";
}
