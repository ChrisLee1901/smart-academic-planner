import { notifications } from '@mantine/notifications';
import type { AcademicEvent } from '../types';

// Standardized integration event interface
export interface IntegrationEvent {
  type: 'task' | 'goal' | 'habit' | 'pomodoro';
  action: 'created' | 'updated' | 'deleted' | 'completed';
  data: any;
  timestamp: Date;
  source: string;
}

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
  
  // Cache for performance optimization
  private dataCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly CACHE_TTL = 60000; // 1 minute cache
  
  // Batch update queue
  private updateQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;

  private constructor() {
    this.loadData();
    this.setupEventListeners();
  }

  static getInstance(): IntegrationService {
    if (!IntegrationService.instance) {
      IntegrationService.instance = new IntegrationService();
    }
    return IntegrationService.instance;
  }

  private setupEventListeners() {
    // Listen for store updates to invalidate cache
    window.addEventListener('integration', ((event: CustomEvent<IntegrationEvent>) => {
      this.handleIntegrationEvent(event);
    }) as EventListener);
  }

  private handleIntegrationEvent(event: CustomEvent<IntegrationEvent>) {
    const { type } = event.detail;
    // Invalidate related cache
    this.invalidateCache(`${type}s`);
    this.invalidateCache('stats');
  }

  private setCache(key: string, data: any, ttl: number = this.CACHE_TTL) {
    this.dataCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private getCache(key: string): any | null {
    const cached = this.dataCache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.dataCache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private invalidateCache(key: string) {
    this.dataCache.delete(key);
  }

  // Safe data access methods with error handling
  private async safeGetData<T>(key: string, fallback: T[] = [] as T[]): Promise<T[]> {
    try {
      // Check cache first
      const cached = this.getCache(key);
      if (cached) return cached;

      const data = localStorage.getItem(key);
      if (!data) return fallback;
      
      const parsed = JSON.parse(data);
      
      // Validate data structure
      if (!Array.isArray(parsed)) {
        console.warn(`Invalid data structure for ${key}, using fallback`);
        return fallback;
      }
      
      // Cache the result
      this.setCache(key.replace('academic-planner-', ''), parsed);
      return parsed;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      this.dispatchIntegrationEvent({
        type: 'task',
        action: 'updated',
        data: { error: `Failed to read ${key}` },
        timestamp: new Date(),
        source: 'IntegrationService'
      });
      return fallback;
    }
  }

  private async safeSaveData(key: string, data: any): Promise<boolean> {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      // Update cache
      this.setCache(key.replace('academic-planner-', ''), data);
      return true;
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      notifications.show({
        title: '⚠️ Lỗi lưu dữ liệu',
        message: 'Không thể lưu dữ liệu. Vui lòng thử lại.',
        color: 'red'
      });
      return false;
    }
  }

  // Standardized event dispatch
  private dispatchIntegrationEvent(event: IntegrationEvent) {
    window.dispatchEvent(new CustomEvent('integration', { detail: event }));
  }

  // Batch processing for performance
  private async addToUpdateQueue(updateFn: () => Promise<void>) {
    this.updateQueue.push(updateFn);
    
    if (!this.isProcessingQueue) {
      this.isProcessingQueue = true;
      
      // Process queue after a short delay to batch updates
      setTimeout(async () => {
        try {
          await this.processUpdateQueue();
        } catch (error) {
          console.error('Error processing update queue:', error);
        } finally {
          this.isProcessingQueue = false;
        }
      }, 100);
    }
  }

  private async processUpdateQueue() {
    const queue = [...this.updateQueue];
    this.updateQueue = [];
    
    for (const updateFn of queue) {
      try {
        await updateFn();
      } catch (error) {
        console.error('Error in batch update:', error);
      }
    }
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

  private async updateTaskActualTime(taskId: string, hours: number) {
    try {
      const events = await this.safeGetData<AcademicEvent>('academic-planner-events');
      const updatedEvents = events.map((event) => {
        if (event.id === taskId) {
          return {
            ...event,
            actualTime: (event.actualTime || 0) + hours
          };
        }
        return event;
      });

      const success = await this.safeSaveData('academic-planner-events', updatedEvents);
      if (success) {
        // Dispatch standardized event
        this.dispatchIntegrationEvent({
          type: 'task',
          action: 'updated',
          data: { taskId, addedTime: hours },
          timestamp: new Date(),
          source: 'IntegrationService.updateTaskActualTime'
        });
      }
    } catch (error) {
      console.error('Error updating task actual time:', error);
      notifications.show({
        title: '⚠️ Lỗi cập nhật',
        message: 'Không thể cập nhật thời gian thực tế cho nhiệm vụ',
        color: 'red'
      });
    }
  }

  private async updateAcademicGoals(session: PomodoroSession) {
    await this.addToUpdateQueue(async () => {
      try {
        const goals = await this.safeGetData<Goal>('academic-planner-goals');
        const today = new Date().toDateString();

        const updatedGoals = goals.map((goal) => {
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

        const success = await this.safeSaveData('academic-planner-goals', updatedGoals);
        if (success) {
          // Dispatch event to notify Goal Tracker
          this.dispatchIntegrationEvent({
            type: 'goal',
            action: 'updated',
            data: { sessionId: session.id },
            timestamp: new Date(),
            source: 'IntegrationService.updateAcademicGoals'
          });
        }
      } catch (error) {
        console.error('Error updating academic goals:', error);
        notifications.show({
          title: '⚠️ Lỗi cập nhật mục tiêu',
          message: 'Không thể cập nhật tiến độ mục tiêu học tập',
          color: 'red'
        });
      }
    });
  }

  private async updateRelatedHabits(session: PomodoroSession) {
    await this.addToUpdateQueue(async () => {
      try {
        const habits = await this.safeGetData<Habit>('academic-planner-habits');
        const habitRecords = await this.safeGetData('academic-planner-habit-records');
        const today = new Date().toISOString().split('T')[0];

        // Check for productivity/learning habits that should be marked as completed
        const productivityHabits = habits.filter((habit) => 
          habit.pomodoroIntegration?.enabled && 
          (habit.category === 'productivity' || habit.category === 'learning')
        );

        let recordsUpdated = false;
        const newRecords = [...habitRecords];

        for (const habit of productivityHabits) {
          const requiredSessions = habit.pomodoroIntegration?.requiredSessions || 1;
          const todaySessions = this.pomodoroSessions.filter(s => 
            s.mode === 'focus' && s.completedAt.toDateString() === new Date().toDateString()
          );

          if (todaySessions.length >= requiredSessions) {
            // Check if habit is already completed today
            const existingRecord = newRecords.find((record: any) => 
              record.habitId === habit.id && record.date === today
            );

            if (!existingRecord) {
              newRecords.push({
                habitId: habit.id,
                date: today,
                completed: true,
                notes: `Auto-completed after ${todaySessions.length} Pomodoro sessions`
              });
              recordsUpdated = true;
            }
          }
        }

        if (recordsUpdated) {
          const success = await this.safeSaveData('academic-planner-habit-records', newRecords);
          if (success) {
            // Dispatch event to notify Habit Tracker
            this.dispatchIntegrationEvent({
              type: 'habit',
              action: 'updated',
              data: { sessionId: session.id, updatedHabits: productivityHabits.length },
              timestamp: new Date(),
              source: 'IntegrationService.updateRelatedHabits'
            });
          }
        }
      } catch (error) {
        console.error('Error updating related habits:', error);
        notifications.show({
          title: '⚠️ Lỗi cập nhật thói quen',
          message: 'Không thể cập nhật thói quen từ phiên Pomodoro',
          color: 'red'
        });
      }
    });
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

  private async updateGoalsFromTaskCompletion(task: AcademicEvent) {
    try {
      const goals = await this.safeGetData<Goal>('academic-planner-goals');

      const updatedGoals = goals.map((goal) => {
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

      const success = await this.safeSaveData('academic-planner-goals', updatedGoals);
      if (success) {
        this.dispatchIntegrationEvent({
          type: 'goal',
          action: 'updated',
          data: { taskId: task.id, taskTitle: task.title },
          timestamp: new Date(),
          source: 'IntegrationService.updateGoalsFromTaskCompletion'
        });
      }
    } catch (error) {
      console.error('Error updating goals from task completion:', error);
      throw error;
    }
  }

  private async updateHabitsFromTaskCompletion(task: AcademicEvent) {
    // For academic task completion, mark learning/productivity habits as progressed
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const habitRecords = await this.safeGetData('academic-planner-habit-records');
      const habits = await this.safeGetData<Habit>('academic-planner-habits');

      // Find learning habits that aren't completed today
      const learningHabits = habits.filter((habit) => 
        habit.category === 'learning' || habit.category === 'productivity'
      );

      const newRecords = [...habitRecords];
      let recordsUpdated = false;

      for (const habit of learningHabits) {
        const existingRecord = newRecords.find((record: any) => 
          record.habitId === habit.id && record.date === today
        );

        if (!existingRecord) {
          newRecords.push({
            habitId: habit.id,
            date: today,
            completed: true,
            notes: `Auto-completed from task: ${task.title}`
          });
          recordsUpdated = true;
        }
      }

      if (recordsUpdated) {
        const success = await this.safeSaveData('academic-planner-habit-records', newRecords);
        if (success) {
          this.dispatchIntegrationEvent({
            type: 'habit',
            action: 'updated',
            data: { taskId: task.id, updatedHabits: learningHabits.length },
            timestamp: new Date(),
            source: 'IntegrationService.updateHabitsFromTaskCompletion'
          });
        }
      }
    } catch (error) {
      console.error('Error updating habits from task completion:', error);
      throw error;
    }
  }

  // Analytics and Statistics
  async getIntegratedStats(): Promise<IntegratedStats> {
    try {
      // Check cache first
      const cached = this.getCache('stats');
      if (cached) return cached;

      const today = new Date().toDateString();

      // Calculate focus time from pomodoro sessions
      const todayFocusSessions = this.pomodoroSessions.filter(s => 
        s.mode === 'focus' && s.completedAt.toDateString() === today
      );
      const todayFocusTime = todayFocusSessions.reduce((sum, s) => sum + s.duration, 0);

      // Get completed tasks safely
      const events = await this.safeGetData<AcademicEvent>('academic-planner-events');
      const todayTasksCompleted = events.filter((event) => 
        event.status === 'done' && 
        new Date(event.startTime).toDateString() === today
      ).length;

      // Get completed habits safely
      const habitRecords = await this.safeGetData('academic-planner-habit-records');
      const todayHabitsCompleted = habitRecords.filter((record: any) => 
        record.date === new Date().toISOString().split('T')[0] && record.completed
      ).length;

      // Calculate weekly goal progress safely
      const goals = await this.safeGetData<Goal>('academic-planner-goals');
      const weeklyGoals = goals.filter((goal) => goal.type === 'weekly');
      const weeklyGoalProgress = weeklyGoals.length > 0 
        ? weeklyGoals.reduce((sum, goal) => sum + (goal.current / goal.target * 100), 0) / weeklyGoals.length 
        : 0;

      // Calculate productivity score (weighted average)
      const productivityScore = Math.round(
        (todayFocusTime / 120 * 30) + // Max 30 points for 2+ hours focus
        (todayTasksCompleted * 20) + // 20 points per task
        (todayHabitsCompleted * 15) + // 15 points per habit
        (weeklyGoalProgress * 0.35) // Up to 35 points for goal progress
      );

      const stats: IntegratedStats = {
        todayFocusTime,
        todayTasksCompleted,
        todayHabitsCompleted,
        weeklyGoalProgress,
        productivityScore: Math.min(productivityScore, 100)
      };

      // Cache the result
      this.setCache('stats', stats, 30000); // 30 second cache for stats

      return stats;
    } catch (error) {
      console.error('Error calculating integrated stats:', error);
      // Return fallback stats
      return {
        todayFocusTime: 0,
        todayTasksCompleted: 0,
        todayHabitsCompleted: 0,
        weeklyGoalProgress: 0,
        productivityScore: 0
      };
    }
  }

  // Get available tasks for Pomodoro selection
  async getAvailableTasks(): Promise<Array<{value: string, label: string, estimatedTime?: number}>> {
    try {
      const events = await this.safeGetData<AcademicEvent>('academic-planner-events');
      return events
        .filter((event) => event.status !== 'done')
        .map((event) => ({
          value: event.id,
          label: `${event.title} ${event.course ? `(${event.course})` : ''}`,
          estimatedTime: event.estimatedTime
        }));
    } catch (error) {
      console.error('Error getting available tasks:', error);
      return [];
    }
  }

  // Task Completion Integration with improved error handling
  async completeTask(task: AcademicEvent) {
    if (!this.integrationEnabled) return;

    try {
      // Update related goals
      await this.updateGoalsFromTaskCompletion(task);

      // Update productivity habits
      await this.updateHabitsFromTaskCompletion(task);

      // Dispatch integration event to notify dashboard
      this.dispatchIntegrationEvent({
        type: 'task',
        action: 'completed',
        data: { taskId: task.id, taskTitle: task.title },
        timestamp: new Date(),
        source: 'IntegrationService.completeTask'
      });

      notifications.show({
        title: '🎉 Tích hợp cập nhật',
        message: 'Hoàn thành nhiệm vụ đã được đồng bộ với mục tiêu và thói quen!',
        color: 'blue',
        autoClose: 4000
      });
    } catch (error) {
      console.error('Error in task completion integration:', error);
      notifications.show({
        title: '⚠️ Lỗi tích hợp',
        message: 'Không thể đồng bộ hoàn thành nhiệm vụ với hệ thống',
        color: 'red'
      });
    }
  }
  // Settings
  setIntegrationEnabled(enabled: boolean) {
    this.integrationEnabled = enabled;
    localStorage.setItem('academic-planner-integration-enabled', JSON.stringify(enabled));
    
    this.dispatchIntegrationEvent({
      type: 'task',
      action: 'updated',
      data: { integrationEnabled: enabled },
      timestamp: new Date(),
      source: 'IntegrationService.setIntegrationEnabled'
    });
  }

  isIntegrationEnabled(): boolean {
    return this.integrationEnabled;
  }

  // Clear cache when needed
  clearCache() {
    this.dataCache.clear();
  }

  // Get cache statistics for debugging
  getCacheStats() {
    return {
      size: this.dataCache.size,
      keys: Array.from(this.dataCache.keys())
    };
  }
}

export const integrationService = IntegrationService.getInstance();
