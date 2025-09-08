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
