// Advanced Calendar Service with Smart Scheduling
import type { AcademicEvent } from '../types';
import dayjs from 'dayjs';

interface CalendarEvent extends AcademicEvent {
  conflicts?: string[];
  suggestedTime?: Date;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface SmartScheduleOptions {
  preferredTimes?: { start: string; end: string }[];
  avoidTimes?: { start: string; end: string }[];
  maxDailyEvents?: number;
  bufferTime?: number; // minutes between events
  prioritizeType?: AcademicEvent['type'];
}

interface ScheduleConflict {
  event1: AcademicEvent;
  event2: AcademicEvent;
  conflictType: 'time_overlap' | 'same_course' | 'overload' | 'location';
  severity: 'high' | 'medium' | 'low';
  suggestion: string;
}

class AdvancedCalendarService {
  // Smart scheduling with conflict detection
  generateSmartSchedule(
    events: AcademicEvent[], 
    options: SmartScheduleOptions = {}
  ): CalendarEvent[] {
    const {
      preferredTimes = [
        { start: '09:00', end: '12:00' },
        { start: '14:00', end: '17:00' },
        { start: '19:00', end: '21:00' }
      ],
      maxDailyEvents = 6,
      bufferTime = 30,
      prioritizeType = 'deadline'
    } = options;

    // Sort events by priority and deadline proximity
    const sortedEvents = [...events].sort((a, b) => {
      // Priority weight
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityWeight[a.priority || 'medium'];
      const bPriority = priorityWeight[b.priority || 'medium'];
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      
      // Type priority
      if (a.type === prioritizeType && b.type !== prioritizeType) return -1;
      if (a.type !== prioritizeType && b.type === prioritizeType) return 1;
      
      // Deadline proximity
      return dayjs(a.startTime).diff(dayjs(b.startTime));
    });

    const scheduledEvents: CalendarEvent[] = [];
    const dailyEventCounts: { [date: string]: number } = {};

    for (const event of sortedEvents) {
      const dateKey = dayjs(event.startTime).format('YYYY-MM-DD');
      const currentDayCount = dailyEventCounts[dateKey] || 0;

      let calendarEvent: CalendarEvent = { ...event };
      
      // Check for conflicts
      const conflicts = this.detectConflicts(event, scheduledEvents);
      if (conflicts.length > 0) {
        calendarEvent.conflicts = conflicts.map(c => c.suggestion);
        
        // Try to reschedule if there are conflicts
        const suggestedTime = this.findOptimalTime(
          event, 
          scheduledEvents, 
          preferredTimes, 
          bufferTime
        );
        
        if (suggestedTime) {
          calendarEvent.suggestedTime = suggestedTime;
        }
      }

      // Check daily event limit
      if (currentDayCount >= maxDailyEvents) {
        const nextAvailableDay = this.findNextAvailableDay(
          dayjs(event.startTime), 
          dailyEventCounts, 
          maxDailyEvents
        );
        
        calendarEvent.suggestedTime = dayjs(event.startTime)
          .date(nextAvailableDay.date())
          .month(nextAvailableDay.month())
          .year(nextAvailableDay.year())
          .toDate();
      }

      // Calculate difficulty based on workload and complexity
      calendarEvent.difficulty = this.calculateEventDifficulty(event, scheduledEvents);

      scheduledEvents.push(calendarEvent);
      dailyEventCounts[dateKey] = currentDayCount + 1;
    }

    return scheduledEvents;
  }

  // Advanced conflict detection
  detectConflicts(newEvent: AcademicEvent, existingEvents: AcademicEvent[]): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];
    const newEventTime = dayjs(newEvent.startTime);
    const eventDuration = newEvent.estimatedTime ? newEvent.estimatedTime * 60 : 120; // minutes

    for (const existingEvent of existingEvents) {
      const existingTime = dayjs(existingEvent.startTime);
      const existingDuration = existingEvent.estimatedTime ? existingEvent.estimatedTime * 60 : 120;

      // Time overlap conflict
      const newEventEnd = newEventTime.add(eventDuration, 'minute');
      const existingEventEnd = existingTime.add(existingDuration, 'minute');

      if (
        (newEventTime.isBefore(existingEventEnd) && newEventEnd.isAfter(existingTime)) ||
        (existingTime.isBefore(newEventEnd) && existingEventEnd.isAfter(newEventTime))
      ) {
        conflicts.push({
          event1: newEvent,
          event2: existingEvent,
          conflictType: 'time_overlap',
          severity: 'high',
          suggestion: `Thời gian trùng với "${existingEvent.title}". Hãy chọn thời gian khác.`
        });
      }

      // Same course conflict (same day)
      if (
        newEvent.course && 
        existingEvent.course === newEvent.course && 
        newEventTime.isSame(existingTime, 'day') &&
        newEvent.id !== existingEvent.id
      ) {
        conflicts.push({
          event1: newEvent,
          event2: existingEvent,
          conflictType: 'same_course',
          severity: 'medium',
          suggestion: `Cùng môn học với "${existingEvent.title}" trong ngày. Có thể gộp lại.`
        });
      }

      // Daily overload conflict
      const sameDay = existingEvents.filter(e => 
        dayjs(e.startTime).isSame(newEventTime, 'day')
      );
      
      if (sameDay.length >= 5) {
        conflicts.push({
          event1: newEvent,
          event2: existingEvent,
          conflictType: 'overload',
          severity: 'medium',
          suggestion: `Ngày này đã có ${sameDay.length} sự kiện. Cân nhắc chuyển sang ngày khác.`
        });
      }
    }

    return conflicts;
  }

  // Find optimal time slot
  private findOptimalTime(
    event: AcademicEvent,
    existingEvents: AcademicEvent[],
    preferredTimes: { start: string; end: string }[],
    bufferTime: number
  ): Date | null {
    const eventDuration = (event.estimatedTime || 2) * 60; // minutes
    const startDate = dayjs(event.startTime);
    
    // Try next 14 days
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const targetDay = startDate.add(dayOffset, 'day');
      
      for (const timeSlot of preferredTimes) {
        const [startHour, startMinute] = timeSlot.start.split(':').map(Number);
        const [endHour, endMinute] = timeSlot.end.split(':').map(Number);
        
        const slotStart = targetDay.hour(startHour).minute(startMinute);
        const slotEnd = targetDay.hour(endHour).minute(endMinute);
        const slotDuration = slotEnd.diff(slotStart, 'minute');
        
        if (slotDuration < eventDuration) continue;
        
        // Check for conflicts in this slot
        const hasConflict = existingEvents.some(existing => {
          const existingStart = dayjs(existing.startTime);
          const existingDuration = (existing.estimatedTime || 2) * 60;
          const existingEnd = existingStart.add(existingDuration, 'minute');
          
          const proposedEnd = slotStart.add(eventDuration, 'minute');
          
          return (
            (slotStart.isBefore(existingEnd.add(bufferTime, 'minute')) && 
             proposedEnd.isAfter(existingStart.subtract(bufferTime, 'minute')))
          );
        });
        
        if (!hasConflict) {
          return slotStart.toDate();
        }
      }
    }
    
    return null;
  }

  // Find next available day with capacity
  private findNextAvailableDay(
    startDate: dayjs.Dayjs,
    dailyEventCounts: { [date: string]: number },
    maxDailyEvents: number
  ): dayjs.Dayjs {
    let currentDate = startDate.add(1, 'day');
    
    for (let i = 0; i < 30; i++) {
      const dateKey = currentDate.format('YYYY-MM-DD');
      const eventCount = dailyEventCounts[dateKey] || 0;
      
      if (eventCount < maxDailyEvents) {
        return currentDate;
      }
      
      currentDate = currentDate.add(1, 'day');
    }
    
    return startDate.add(1, 'day'); // Fallback
  }

  // Calculate event difficulty
  private calculateEventDifficulty(
    event: AcademicEvent, 
    scheduledEvents: AcademicEvent[]
  ): 'easy' | 'medium' | 'hard' {
    let difficultyScore = 0;
    
    // Base score by type
    const typeScores = {
      'class': 1,
      'deadline': 3,
      'project': 4,
      'personal': 1
    };
    difficultyScore += typeScores[event.type] || 2;
    
    // Priority weight
    const priorityScores = { low: 0, medium: 1, high: 2 };
    difficultyScore += priorityScores[event.priority || 'medium'];
    
    // Time pressure (closer deadline = harder)
    const daysUntilEvent = dayjs(event.startTime).diff(dayjs(), 'day');
    if (daysUntilEvent <= 1) difficultyScore += 2;
    else if (daysUntilEvent <= 7) difficultyScore += 1;
    
    // Workload context (same day events)
    const sameDayEvents = scheduledEvents.filter(e => 
      dayjs(e.startTime).isSame(dayjs(event.startTime), 'day')
    );
    if (sameDayEvents.length >= 4) difficultyScore += 1;
    
    // Duration consideration
    if (event.estimatedTime && event.estimatedTime > 3) difficultyScore += 1;
    
    if (difficultyScore >= 6) return 'hard';
    if (difficultyScore >= 3) return 'medium';
    return 'easy';
  }

  // Generate study schedule recommendations
  generateStudySchedule(
    events: AcademicEvent[],
    studyHoursPerDay: number = 4
  ): { date: string; subjects: string[]; totalHours: number; recommendations: string[] }[] {
    const schedule = [];
    const courses = [...new Set(events.map(e => e.course).filter(Boolean))];
    const now = dayjs();
    
    for (let i = 0; i < 30; i++) {
      const date = now.add(i, 'day');
      const dateStr = date.format('YYYY-MM-DD');
      
      // Get events for this day
      const dayEvents = events.filter(e => 
        dayjs(e.startTime).isSame(date, 'day')
      );
      
      // Calculate available study time
      const eventHours = dayEvents.reduce((total, event) => 
        total + (event.estimatedTime || 1), 0
      );
      const availableStudyTime = Math.max(0, studyHoursPerDay - eventHours);
      
      // Prioritize subjects based on upcoming deadlines
      const prioritizedSubjects = courses.sort((a, b) => {
        const aDeadlines = events.filter(e => 
          e.course === a && 
          e.type === 'deadline' && 
          dayjs(e.startTime).isAfter(date) &&
          dayjs(e.startTime).isBefore(date.add(7, 'day'))
        );
        
        const bDeadlines = events.filter(e => 
          e.course === b && 
          e.type === 'deadline' && 
          dayjs(e.startTime).isAfter(date) &&
          dayjs(e.startTime).isBefore(date.add(7, 'day'))
        );
        
        return bDeadlines.length - aDeadlines.length;
      });
      
      // Generate recommendations
      const recommendations = [];
      if (availableStudyTime >= 2) {
        recommendations.push(`Có ${availableStudyTime} giờ để học. Tập trung vào ${prioritizedSubjects[0] || 'ôn tập'}.`);
      } else if (availableStudyTime > 0) {
        recommendations.push(`Thời gian học hạn chế (${availableStudyTime}h). Ôn tập nhanh các khái niệm chính.`);
      } else {
        recommendations.push('Ngày bận rộn. Có thể ôn tập trong khoảng thời gian nghỉ ngắn.');
      }
      
      if (date.day() === 0 || date.day() === 6) {
        recommendations.push('Cuối tuần - thời gian tốt để học sâu và làm project.');
      }
      
      schedule.push({
        date: dateStr,
        subjects: prioritizedSubjects.slice(0, 2).filter((subject): subject is string => Boolean(subject)),
        totalHours: availableStudyTime,
        recommendations
      });
    }
    
    return schedule;
  }

  // Export calendar data in various formats
  exportCalendar(events: AcademicEvent[], format: 'ics' | 'json' | 'csv' = 'json'): string {
    switch (format) {
      case 'ics':
        return this.generateICS(events);
      case 'csv':
        return this.generateCSV(events);
      default:
        return JSON.stringify(events, null, 2);
    }
  }

  private generateICS(events: AcademicEvent[]): string {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Smart Academic Planner//EN',
      'CALSCALE:GREGORIAN'
    ];

    events.forEach(event => {
      const start = dayjs(event.startTime);
      const end = start.add(event.estimatedTime || 1, 'hour');
      
      icsContent.push(
        'BEGIN:VEVENT',
        `DTSTART:${start.format('YYYYMMDD[T]HHmmss')}`,
        `DTEND:${end.format('YYYYMMDD[T]HHmmss')}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:Type: ${event.type}\\nPriority: ${event.priority}${event.course ? `\\nCourse: ${event.course}` : ''}`,
        `UID:${event.id}@smartplanner.com`,
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');
    return icsContent.join('\r\n');
  }

  private generateCSV(events: AcademicEvent[]): string {
    const headers = ['Title', 'Type', 'Start Time', 'Priority', 'Status', 'Course', 'Estimated Time'];
    const rows = [headers.join(',')];
    
    events.forEach(event => {
      const row = [
        `"${event.title}"`,
        event.type,
        dayjs(event.startTime).format('YYYY-MM-DD HH:mm'),
        event.priority || 'medium',
        event.status,
        `"${event.course || ''}"`,
        event.estimatedTime || 1
      ];
      rows.push(row.join(','));
    });
    
    return rows.join('\n');
  }
}

export const calendarService = new AdvancedCalendarService();
