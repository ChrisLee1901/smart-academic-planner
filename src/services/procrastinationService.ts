import type { AcademicEvent } from '../types';
import dayjs from '../utils/dayjs';

interface ProcrastinationPattern {
  userId: string;
  overallCoefficient: number; // How much longer tasks take vs estimated (e.g., 2.5 = takes 2.5x longer)
  typeCoefficients: Record<string, number>; // Coefficients by task type
  priorityCoefficients: Record<string, number>; // Coefficients by priority level
  dayOfWeekPattern: Record<number, number>; // Performance by day of week (0=Sunday)
  timeOfDayPattern: Record<number, number>; // Performance by hour of day
  lastUpdated: Date;
}

export class ProcrastinationAnalysisService {
  private static readonly STORAGE_KEY = 'procrastination_patterns';
  private static readonly MIN_SAMPLES = 3; // Minimum completed tasks before reliable predictions

  // Calculate procrastination coefficient from historical data
  static calculateProcrastinationCoefficient(events: AcademicEvent[]): ProcrastinationPattern {
    const completedEvents = events.filter(event => 
      event.status === 'done' && 
      event.estimatedTime && 
      event.actualTime &&
      event.estimatedTime > 0 &&
      event.actualTime > 0
    );

    if (completedEvents.length < this.MIN_SAMPLES) {
      // Return default pattern for new users
      return this.getDefaultPattern();
    }

    // Calculate overall coefficient
    const overallCoefficient = this.calculateOverallCoefficient(completedEvents);

    // Calculate coefficients by task type
    const typeCoefficients = this.calculateTypeCoefficients(completedEvents);

    // Calculate coefficients by priority
    const priorityCoefficients = this.calculatePriorityCoefficients(completedEvents);

    // Calculate day of week patterns
    const dayOfWeekPattern = this.calculateDayOfWeekPattern(completedEvents);

    // Calculate time of day patterns
    const timeOfDayPattern = this.calculateTimeOfDayPattern(completedEvents);

    const pattern: ProcrastinationPattern = {
      userId: 'default',
      overallCoefficient,
      typeCoefficients,
      priorityCoefficients,
      dayOfWeekPattern,
      timeOfDayPattern,
      lastUpdated: new Date()
    };

    // Save to localStorage
    this.savePattern(pattern);
    
    return pattern;
  }

  private static calculateOverallCoefficient(events: AcademicEvent[]): number {
    const ratios = events.map(event => (event.actualTime! / event.estimatedTime!));
    const average = ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
    
    // Cap at reasonable bounds (0.5x to 5x)
    return Math.max(0.5, Math.min(5.0, average));
  }

  private static calculateTypeCoefficients(events: AcademicEvent[]): Record<string, number> {
    const types = ['deadline', 'project', 'class', 'personal'];
    const coefficients: Record<string, number> = {};

    types.forEach(type => {
      const typeEvents = events.filter(event => event.type === type);
      if (typeEvents.length > 0) {
        const ratios = typeEvents.map(event => event.actualTime! / event.estimatedTime!);
        const average = ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
        coefficients[type] = Math.max(0.5, Math.min(5.0, average));
      } else {
        // Default coefficients based on typical patterns
        const defaults = {
          deadline: 1.8, // Tend to underestimate deadline pressure
          project: 2.2,  // Projects often take longer than expected
          class: 1.1,    // Classes are usually well-estimated
          personal: 1.5  // Personal tasks often get delayed
        };
        coefficients[type] = defaults[type as keyof typeof defaults] || 1.5;
      }
    });

    return coefficients;
  }

  private static calculatePriorityCoefficients(events: AcademicEvent[]): Record<string, number> {
    const priorities = ['low', 'medium', 'high'];
    const coefficients: Record<string, number> = {};

    priorities.forEach(priority => {
      const priorityEvents = events.filter(event => event.priority === priority);
      if (priorityEvents.length > 0) {
        const ratios = priorityEvents.map(event => event.actualTime! / event.estimatedTime!);
        const average = ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
        coefficients[priority] = Math.max(0.5, Math.min(5.0, average));
      } else {
        // Default coefficients - CORRECTED LOGIC
        const defaults = {
          low: 2.5,    // Low priority tasks get procrastinated the most
          medium: 1.8, // Medium priority is average procrastination
          high: 1.1    // High priority gets focused attention, less procrastination
        };
        coefficients[priority] = defaults[priority as keyof typeof defaults] || 1.8;
      }
    });

    return coefficients;
  }

  private static calculateDayOfWeekPattern(events: AcademicEvent[]): Record<number, number> {
    const pattern: Record<number, number> = {};
    
    for (let day = 0; day < 7; day++) {
      const dayEvents = events.filter(event => dayjs(event.startTime).day() === day);
      if (dayEvents.length > 0) {
        const ratios = dayEvents.map(event => event.actualTime! / event.estimatedTime!);
        const average = ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
        pattern[day] = Math.max(0.5, Math.min(3.0, average));
      } else {
        // Default pattern: weekends tend to be less productive
        pattern[day] = day === 0 || day === 6 ? 1.8 : 1.3;
      }
    }

    return pattern;
  }

  private static calculateTimeOfDayPattern(events: AcademicEvent[]): Record<number, number> {
    const pattern: Record<number, number> = {};
    
    for (let hour = 0; hour < 24; hour++) {
      const hourEvents = events.filter(event => dayjs(event.startTime).hour() === hour);
      if (hourEvents.length > 0) {
        const ratios = hourEvents.map(event => event.actualTime! / event.estimatedTime!);
        const average = ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
        pattern[hour] = Math.max(0.5, Math.min(3.0, average));
      } else {
        // Default pattern based on typical productivity curves
        const defaults: Record<number, number> = {
          0: 2.5, 1: 2.8, 2: 3.0, 3: 3.0, 4: 2.8, 5: 2.5, // Late night - very low productivity
          6: 2.0, 7: 1.8, 8: 1.5, 9: 1.2, 10: 1.1, 11: 1.0, // Morning - improving
          12: 1.3, 13: 1.5, 14: 1.2, 15: 1.0, 16: 1.1, // Afternoon - good
          17: 1.3, 18: 1.4, 19: 1.2, 20: 1.1, 21: 1.3, // Evening - decent
          22: 1.8, 23: 2.2 // Late evening - declining
        };
        pattern[hour] = defaults[hour] || 1.5;
      }
    }

    return pattern;
  }

  private static getDefaultPattern(): ProcrastinationPattern {
    return {
      userId: 'default',
      overallCoefficient: 1.8, // Typical procrastination factor
      typeCoefficients: {
        deadline: 1.8,
        project: 2.2,
        class: 1.1,
        personal: 1.5
      },
      priorityCoefficients: {
        low: 2.5,    // Low priority = high procrastination
        medium: 1.8, // Medium priority = average procrastination  
        high: 1.1    // High priority = low procrastination
      },
      dayOfWeekPattern: {
        0: 1.8, 1: 1.3, 2: 1.2, 3: 1.2, 4: 1.3, 5: 1.4, 6: 1.7
      },
      timeOfDayPattern: {
        0: 2.5, 1: 2.8, 2: 3.0, 3: 3.0, 4: 2.8, 5: 2.5,
        6: 2.0, 7: 1.8, 8: 1.5, 9: 1.2, 10: 1.1, 11: 1.0,
        12: 1.3, 13: 1.5, 14: 1.2, 15: 1.0, 16: 1.1,
        17: 1.3, 18: 1.4, 19: 1.2, 20: 1.1, 21: 1.3,
        22: 1.8, 23: 2.2
      },
      lastUpdated: new Date()
    };
  }

  // Calculate realistic deadline for a specific task
  static calculateRealisticDeadline(
    event: AcademicEvent, 
    pattern?: ProcrastinationPattern
  ): Date {
    if (!pattern) {
      const storedPattern = this.loadPattern();
      pattern = storedPattern || this.getDefaultPattern();
    }

    const officialDeadline = dayjs(event.startTime);
    const estimatedHours = event.estimatedTime || 2;

    // Get relevant coefficients
    const typeCoefficient = pattern.typeCoefficients[event.type] || pattern.overallCoefficient;
    const priorityCoefficient = pattern.priorityCoefficients[event.priority || 'medium'] || 1.8;
    const dayCoefficient = pattern.dayOfWeekPattern[officialDeadline.day()] || 1.3;
    const hourCoefficient = pattern.timeOfDayPattern[officialDeadline.hour()] || 1.5;

    // Calculate weighted combined procrastination factor
    // Priority has highest weight since it directly affects focus level
    const combinedCoefficient = (
      priorityCoefficient * 0.4 +   // Priority affects focus the most
      typeCoefficient * 0.35 +      // Task type is very important  
      dayCoefficient * 0.15 +       // Day of week matters
      hourCoefficient * 0.1         // Hour has least impact
    );

    // Calculate realistic time needed (how much longer it will actually take)
    const realisticHours = estimatedHours * combinedCoefficient;
    const additionalBufferHours = realisticHours - estimatedHours;

    // Set realistic deadline earlier by the buffer amount
    // The worse the procrastination coefficient, the earlier we need to start
    const realisticDeadline = officialDeadline.subtract(additionalBufferHours, 'hour');

    // Safety constraints
    const now = dayjs();
    const maxEarlyDeadline = officialDeadline.subtract(7, 'day'); // Max 1 week early
    
    // Don't set realistic deadline in the past
    if (realisticDeadline.isBefore(now)) {
      return now.add(1, 'hour').toDate(); // At least 1 hour from now
    }
    
    // Don't set realistic deadline too far in advance
    if (realisticDeadline.isBefore(maxEarlyDeadline)) {
      return maxEarlyDeadline.toDate();
    }

    return realisticDeadline.toDate();
  }

  // Smart notification timing based on procrastination patterns
  static getOptimalStartTime(
    event: AcademicEvent,
    pattern?: ProcrastinationPattern
  ): Date {
    const realisticDeadline = this.calculateRealisticDeadline(event, pattern);
    const estimatedHours = event.estimatedTime || 2;
    
    // Add 25% buffer for breaks and unexpected issues
    const workTimeNeeded = estimatedHours * 1.25;
    
    return dayjs(realisticDeadline).subtract(workTimeNeeded, 'hour').toDate();
  }

  // Get procrastination insights for analytics
  static getProcrastinationInsights(events: AcademicEvent[]): {
    trend: 'improving' | 'stable' | 'worsening';
    averageDelay: number;
    worstTaskType: string;
    bestTaskType: string;
    recommendations: string[];
  } {
    const pattern = this.calculateProcrastinationCoefficient(events);
    
    // Determine trend (simplified)
    const recentEvents = events.filter(event => 
      event.status === 'done' && 
      dayjs(event.startTime).isAfter(dayjs().subtract(14, 'day'))
    );
    
    const olderEvents = events.filter(event => 
      event.status === 'done' && 
      dayjs(event.startTime).isBefore(dayjs().subtract(14, 'day')) &&
      dayjs(event.startTime).isAfter(dayjs().subtract(30, 'day'))
    );

    let trend: 'improving' | 'stable' | 'worsening' = 'stable';
    if (recentEvents.length > 0 && olderEvents.length > 0) {
      const recentCoeff = this.calculateOverallCoefficient(recentEvents);
      const olderCoeff = this.calculateOverallCoefficient(olderEvents);
      
      if (recentCoeff < olderCoeff - 0.2) trend = 'improving';
      else if (recentCoeff > olderCoeff + 0.2) trend = 'worsening';
    }

    // Find worst and best task types
    const typeEntries = Object.entries(pattern.typeCoefficients);
    const worstTaskType = typeEntries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
    const bestTaskType = typeEntries.reduce((a, b) => a[1] < b[1] ? a : b)[0];

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (pattern.overallCoefficient > 2.0) {
      recommendations.push("Thử chia nhỏ tasks thành các phần nhỏ hơn để dễ quản lý");
    }
    
    if (pattern.typeCoefficients.project > 2.5) {
      recommendations.push("Dự án thường mất nhiều thời gian hơn dự kiến - hãy thêm 50% buffer time");
    }
    
    if (pattern.priorityCoefficients.low > 2.0) {
      recommendations.push("Tasks ưu tiên thấp thường bị trì hoãn - hãy set deadline sớm hơn");
    }

    // Check for weekend procrastination
    const weekendAvg = (pattern.dayOfWeekPattern[0] + pattern.dayOfWeekPattern[6]) / 2;
    if (weekendAvg > 1.8) {
      recommendations.push("Cuối tuần năng suất thấp - nên lên kế hoạch làm việc vào weekdays");
    }

    return {
      trend,
      averageDelay: (pattern.overallCoefficient - 1.0) * 100, // % delay
      worstTaskType,
      bestTaskType,
      recommendations
    };
  }

  private static savePattern(pattern: ProcrastinationPattern): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pattern));
    } catch (error) {
      console.error('Failed to save procrastination pattern:', error);
    }
  }

  private static loadPattern(): ProcrastinationPattern | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load procrastination pattern:', error);
    }
    return null;
  }

  // Update pattern when a task is completed
  static updatePatternOnTaskCompletion(events: AcademicEvent[]): void {
    // Recalculate and save updated pattern
    this.calculateProcrastinationCoefficient(events);
  }
}
