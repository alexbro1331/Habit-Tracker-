
export type HabitType = 'daily' | 'weekly';

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  type: HabitType;
  daysOfWeek?: number[]; // 0 for Sunday, ..., 6 for Saturday
  reminders?: string[]; // "HH:MM" format
  completions: Record<string, string>; // key: "YYYY-MM-DD", value: emoji
  createdAt: string;
}

export type Screen = 'dashboard' | 'analytics' | 'settings';
