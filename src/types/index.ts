export interface AcademicEvent {
  id: string;
  title: string;
  type: 'deadline' | 'class' | 'project' | 'personal';
  course?: string;
  startTime: Date;
  endTime?: Date;
  status: 'todo' | 'in-progress' | 'done';
  estimatedTime?: number; // in hours
  actualTime?: number; // in hours
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  realisticDeadline?: Date; // AI-calculated deadline based on procrastination history
  procrastinationCoefficient?: number; // How much longer it actually takes vs estimated
}

export interface EventFormData {
  title: string;
  type: 'deadline' | 'class' | 'project' | 'personal';
  course?: string;
  startTime: Date;
  endTime?: Date;
  status: 'todo' | 'in-progress' | 'done';
  estimatedTime?: number;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
}

export interface Goal {
  id: string;
  name: string;
  description?: string;
  category: 'academic' | 'personal' | 'career' | 'health' | 'financial';
  priority: 'low' | 'medium' | 'high';
  status: 'not-started' | 'in-progress' | 'completed' | 'paused';
  currentProgress: number;
  targetValue: number;
  unit: string;
  deadline?: Date;
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: 'health' | 'productivity' | 'learning' | 'personal' | 'social';
  frequency: 'daily' | 'weekly' | 'custom';
  target: number; // times per frequency period
  color: string;
  icon: string;
  createdAt: Date;
  isActive: boolean;
}

export interface HabitRecord {
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  completedAt?: Date;
  notes?: string;
}
