import { notifications } from '@mantine/notifications';
import type { AcademicEvent } from '../types';

export interface PomodoroSession {
  id: string;
  taskId?: string;
  mode: 'focus' | 'shortBreak' | 'longBreak';
  duration: number; // in minutes
  completedAt: Date;
  productivity: number; // 1-5 rating
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: 'academic' | 'personal' | 'fitness' | 'skill' | 'habit';
  type: 'daily' | 'weekly' | 'monthly' | 'one-time';
  target: number;
  current: number;
  unit: string;
  relatedTaskTypes?: string[]; // Which task types contribute to this goal
  autoUpdate: boolean; // Whether to auto-update from completed tasks
}

export interface Habit {
  id: string;
  name: string;
  category: 'health' | 'productivity' | 'learning' | 'personal' | 'social';
  relatedGoals?: string[]; // Goal IDs that this habit contributes to
  pomodoroIntegration?: {
    enabled: boolean;
    requiredSessions: number; // Number of pomodoro sessions to mark habit as done
  };
}

export interface IntegratedStats {
  todayFocusTime: number; // Total focus time from pomodoro
  todayTasksCompleted: number;
  todayHabitsCompleted: number;
  weeklyGoalProgress: number;
  productivityScore: number; // Calculated from all metrics
}

class IntegrationService {
  private static instance: IntegrationService;
  private pomodoroSessions: PomodoroSession[] = [];
  private integrationEnabled = true;

  private constructor() {
    this.loadData();
  }

  static getInstance(): IntegrationService {
    if (!IntegrationService.instance) {
      IntegrationService.instance = new IntegrationService();
    }
    return IntegrationService.instance;
  }

  private loadData() {
    try {
      const savedSessions = localStorage.getItem('academic-planner-pomodoro-sessions');
      if (savedSessions) {
        this.pomodoroSessions = JSON.parse(savedSessions).map((session: any) => ({
          ...session,
          completedAt: new Date(session.completedAt)
        }));
      }
    } catch (error) {
      console.error('Error loading integration data:', error);
    }
  }

  private saveData() {
    try {
      localStorage.setItem('academic-planner-pomodoro-sessions', JSON.stringify(this.pomodoroSessions));
    } catch (error) {
      console.error('Error saving integration data:', error);
    }
  }

  // Pomodoro Timer Integration
  completePomodoroSession(session: Omit<PomodoroSession, 'id' | 'completedAt'>) {
    const newSession: PomodoroSession = {
      ...session,
      id: Date.now().toString(),
      completedAt: new Date()
    };

    this.pomodoroSessions.push(newSession);
    this.saveData();

    if (this.integrationEnabled && session.mode === 'focus') {
      this.updateRelatedSystems(newSession);
    }

    return newSession;
  }

  private updateRelatedSystems(session: PomodoroSession) {
    // Update task actual time if taskId is provided
    if (session.taskId) {
      this.updateTaskActualTime(session.taskId, session.duration / 60); // Convert to hours
    }

    // Update academic goals
    this.updateAcademicGoals(session);

    // Check and update related habits
    this.updateRelatedHabits(session);

    // Show integration notification
    this.showIntegrationNotification(session);
  }

  private updateTaskActualTime(taskId: string, hours: number) {
    try {
      const events = JSON.parse(localStorage.getItem('academic-planner-events') || '[]');
      const updatedEvents = events.map((event: AcademicEvent) => {
        if (event.id === taskId) {
          return {
            ...event,
            actualTime: (event.actualTime || 0) + hours
          };
        }
        return event;
      });

      localStorage.setItem('academic-planner-events', JSON.stringify(updatedEvents));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('taskUpdated', { 
        detail: { taskId, addedTime: hours } 
      }));
    } catch (error) {
      console.error('Error updating task actual time:', error);
    }
  }

  private updateAcademicGoals(session: PomodoroSession) {
    try {
      const goals = JSON.parse(localStorage.getItem('academic-planner-goals') || '[]');
      const today = new Date().toDateString();

      const updatedGoals = goals.map((goal: Goal) => {
        if (goal.category === 'academic' && goal.autoUpdate) {
          if (goal.type === 'daily' && goal.unit === 'hours') {
            // Count focus time for daily hour-based goals
            const todaySessions = this.pomodoroSessions.filter(s => 
              s.mode === 'focus' && s.completedAt.toDateString() === today
            );
            const totalHours = todaySessions.reduce((sum, s) => sum + (s.duration / 60), 0);
            
            return {
              ...goal,
              current: totalHours,
              lastUpdated: new Date()
            };
          }
        }
        return goal;
      });

      localStorage.setItem('academic-planner-goals', JSON.stringify(updatedGoals));
      
      // Dispatch event to notify Goal Tracker
      window.dispatchEvent(new CustomEvent('goalsUpdated'));
    } catch (error) {
      console.error('Error updating academic goals:', error);
    }
  }

  private updateRelatedHabits(session: PomodoroSession) {
    try {
      const habits = JSON.parse(localStorage.getItem('academic-planner-habits') || '[]');
      const habitRecords = JSON.parse(localStorage.getItem('academic-planner-habit-records') || '[]');
      const today = new Date().toISOString().split('T')[0];

      // Check for productivity/learning habits that should be marked as completed
      const productivityHabits = habits.filter((habit: Habit) => 
        habit.pomodoroIntegration?.enabled && 
        (habit.category === 'productivity' || habit.category === 'learning')
      );

      productivityHabits.forEach((habit: Habit) => {
        const requiredSessions = habit.pomodoroIntegration?.requiredSessions || 1;
        const todaySessions = this.pomodoroSessions.filter(s => 
          s.mode === 'focus' && s.completedAt.toDateString() === new Date().toDateString()
        );

        if (todaySessions.length >= requiredSessions) {
          // Check if habit is already completed today
          const existingRecord = habitRecords.find((record: any) => 
            record.habitId === habit.id && record.date === today
          );

          if (!existingRecord) {
            habitRecords.push({
              habitId: habit.id,
              date: today,
              completed: true,
              notes: `Auto-completed after ${todaySessions.length} Pomodoro sessions`
            });

            localStorage.setItem('academic-planner-habit-records', JSON.stringify(habitRecords));
            
            // Dispatch event to notify Habit Tracker
            window.dispatchEvent(new CustomEvent('habitsUpdated', {
              detail: { habitName: habit.name }
            }));
          }
        }
      });
    } catch (error) {
      console.error('Error updating related habits:', error);
    }
  }

  private showIntegrationNotification(session: PomodoroSession) {
    const focusTime = session.duration;
    let message = `Hoàn thành ${focusTime} phút tập trung!`;

    if (session.taskId) {
      message += ' ✅ Đã cập nhật thời gian thực tế cho nhiệm vụ.';
    }

    notifications.show({
      title: '🎯 Tích hợp thành công',
      message,
      color: 'green',
      autoClose: 5000
    });
  }

  // Task Completion Integration
  completeTask(task: AcademicEvent) {
    if (!this.integrationEnabled) return;

    // Update related goals
    this.updateGoalsFromTaskCompletion(task);

    // Update productivity habits
    this.updateHabitsFromTaskCompletion(task);

    notifications.show({
      title: '🎉 Tích hợp cập nhật',
      message: 'Hoàn thành nhiệm vụ đã được đồng bộ với mục tiêu và thói quen!',
      color: 'blue',
      autoClose: 4000
    });
  }

  private updateGoalsFromTaskCompletion(task: AcademicEvent) {
    try {
      const goals = JSON.parse(localStorage.getItem('academic-planner-goals') || '[]');

      const updatedGoals = goals.map((goal: Goal) => {
        if (goal.autoUpdate && goal.category === 'academic') {
          // Check if task type matches goal criteria
          if (goal.relatedTaskTypes && goal.relatedTaskTypes.includes(task.type)) {
            let increment = 0;
            
            if (goal.unit === 'tasks') {
              increment = 1;
            } else if (goal.unit === 'hours' && task.actualTime) {
              increment = task.actualTime;
            }

            return {
              ...goal,
              current: Math.min(goal.current + increment, goal.target),
              lastUpdated: new Date()
            };
          }
        }
        return goal;
      });

      localStorage.setItem('academic-planner-goals', JSON.stringify(updatedGoals));
      window.dispatchEvent(new CustomEvent('goalsUpdated'));
    } catch (error) {
      console.error('Error updating goals from task completion:', error);
    }
  }

  private updateHabitsFromTaskCompletion(task: AcademicEvent) {
    // For academic task completion, mark learning/productivity habits as progressed
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const habitRecords = JSON.parse(localStorage.getItem('academic-planner-habit-records') || '[]');
      const habits = JSON.parse(localStorage.getItem('academic-planner-habits') || '[]');

      // Find learning habits that aren't completed today
      const learningHabits = habits.filter((habit: Habit) => 
        habit.category === 'learning' || habit.category === 'productivity'
      );

      learningHabits.forEach((habit: Habit) => {
        const existingRecord = habitRecords.find((record: any) => 
          record.habitId === habit.id && record.date === today
        );

        if (!existingRecord) {
          habitRecords.push({
            habitId: habit.id,
            date: today,
            completed: true,
            notes: `Auto-completed from task: ${task.title}`
          });
        }
      });

      localStorage.setItem('academic-planner-habit-records', JSON.stringify(habitRecords));
      window.dispatchEvent(new CustomEvent('habitsUpdated'));
    } catch (error) {
      console.error('Error updating habits from task completion:', error);
    }
  }

  // Analytics and Statistics
  getIntegratedStats(): IntegratedStats {
    const today = new Date().toDateString();
    const thisWeek = this.getWeekStart(new Date());

    // Calculate focus time from pomodoro sessions
    const todayFocusSessions = this.pomodoroSessions.filter(s => 
      s.mode === 'focus' && s.completedAt.toDateString() === today
    );
    const todayFocusTime = todayFocusSessions.reduce((sum, s) => sum + s.duration, 0);

    // Get completed tasks
    const events = JSON.parse(localStorage.getItem('academic-planner-events') || '[]');
    const todayTasksCompleted = events.filter((event: AcademicEvent) => 
      event.status === 'done' && 
      new Date(event.startTime).toDateString() === today
    ).length;

    // Get completed habits
    const habitRecords = JSON.parse(localStorage.getItem('academic-planner-habit-records') || '[]');
    const todayHabitsCompleted = habitRecords.filter((record: any) => 
      record.date === new Date().toISOString().split('T')[0] && record.completed
    ).length;

    // Calculate weekly goal progress
    const goals = JSON.parse(localStorage.getItem('academic-planner-goals') || '[]');
    const weeklyGoals = goals.filter((goal: Goal) => goal.type === 'weekly');
    const weeklyGoalProgress = weeklyGoals.length > 0 
      ? weeklyGoals.reduce((sum: number, goal: Goal) => sum + (goal.current / goal.target * 100), 0) / weeklyGoals.length 
      : 0;

    // Calculate productivity score (weighted average)
    const productivityScore = Math.round(
      (todayFocusTime / 120 * 30) + // Max 30 points for 2+ hours focus
      (todayTasksCompleted * 20) + // 20 points per task
      (todayHabitsCompleted * 15) + // 15 points per habit
      (weeklyGoalProgress * 0.35) // Up to 35 points for goal progress
    );

    return {
      todayFocusTime,
      todayTasksCompleted,
      todayHabitsCompleted,
      weeklyGoalProgress,
      productivityScore: Math.min(productivityScore, 100)
    };
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  // Settings
  setIntegrationEnabled(enabled: boolean) {
    this.integrationEnabled = enabled;
    localStorage.setItem('academic-planner-integration-enabled', JSON.stringify(enabled));
  }

  isIntegrationEnabled(): boolean {
    return this.integrationEnabled;
  }

  // Get available tasks for Pomodoro selection
  getAvailableTasks(): Array<{value: string, label: string, estimatedTime?: number}> {
    try {
      const events = JSON.parse(localStorage.getItem('academic-planner-events') || '[]');
      return events
        .filter((event: AcademicEvent) => event.status !== 'done')
        .map((event: AcademicEvent) => ({
          value: event.id,
          label: `${event.title} ${event.course ? `(${event.course})` : ''}`,
          estimatedTime: event.estimatedTime
        }));
    } catch (error) {
      console.error('Error getting available tasks:', error);
      return [];
    }
  }
}

export const integrationService = IntegrationService.getInstance();
