// Advanced AI Service with Natural Language Processing
import type { AcademicEvent } from '../types';
import dayjs from 'dayjs';

interface ParsedEventData {
  confidence: number;
  event: Partial<AcademicEvent>;
  suggestions?: string[];
}

class AdvancedAIService {
  constructor() {
    // In production, this would be loaded from environment variables
    // For demo purposes, we simulate advanced AI processing
  }

  // Simulate advanced NLP parsing with high accuracy
  async parseNaturalLanguage(input: string): Promise<ParsedEventData> {
    const text = input.toLowerCase().trim();
    
    // Advanced pattern matching with ML-like confidence scoring
    const patterns = {
      // Vietnamese patterns
      deadline: {
        pattern: /(?:nộp|deadline|hạn chót|due|gửi|submit)\s+(.*?)(?:\s+(?:vào|lúc|ngày|deadline|trước|không muộn hơn)\s+(.+?))?$/i,
        confidence: 0.9
      },
      class: {
        pattern: /(?:lớp|học|class|môn|buổi học)\s+(.*?)(?:\s+(?:vào|lúc|ngày)\s+(.+?))?$/i,
        confidence: 0.85
      },
      project: {
        pattern: /(?:dự án|project|bài tập lớn|đồ án|thesis)\s+(.*?)(?:\s+(?:vào|lúc|ngày)\s+(.+?))?$/i,
        confidence: 0.9
      },
      meeting: {
        pattern: /(?:họp|meeting|gặp|thảo luận)\s+(.*?)(?:\s+(?:vào|lúc|ngày)\s+(.+?))?$/i,
        confidence: 0.8
      },
      exam: {
        pattern: /(?:thi|kiểm tra|exam|test)\s+(.*?)(?:\s+(?:vào|lúc|ngày)\s+(.+?))?$/i,
        confidence: 0.95
      }
    };

    // Advanced time parsing
    const timePatterns = {
      tomorrow: { pattern: /ngày mai|mai/i, confidence: 0.9 },
      nextWeek: { pattern: /tuần sau|tuần tới/i, confidence: 0.85 },
      today: { pattern: /hôm nay|today/i, confidence: 0.9 },
      specific_time: { pattern: /(\d{1,2}):?(\d{0,2})\s*(?:h|giờ|:|am|pm)?/i, confidence: 0.8 },
      specific_date: { pattern: /(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/i, confidence: 0.9 },
      relative_days: { pattern: /(\d+)\s*ngày\s*(?:nữa|sau)/i, confidence: 0.75 },
      day_names: { 
        pattern: /(thứ\s*hai|thứ\s*ba|thứ\s*tư|thứ\s*năm|thứ\s*sáu|thứ\s*bảy|chủ\s*nhật)/i, 
        confidence: 0.8 
      }
    };

    let bestMatch: { type: string; confidence: number; match: RegExpMatchArray | null } = {
      type: 'deadline',
      confidence: 0,
      match: null
    };

    // Find best pattern match
    for (const [type, { pattern, confidence }] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (match && confidence > bestMatch.confidence) {
        bestMatch = { type, confidence, match };
      }
    }

    if (bestMatch.confidence < 0.5) {
      return {
        confidence: 0,
        event: {},
        suggestions: [
          'Thử sử dụng từ khóa như: "nộp", "lớp", "họp", "thi"',
          'Ví dụ: "Nộp bài tập Toán vào thứ 3 lúc 5 giờ chiều"',
          'Chỉ định rõ thời gian: "ngày mai", "tuần sau", hoặc "25/12/2024"'
        ]
      };
    }

    const title = bestMatch.match?.[1]?.trim() || text;
    let dateTime = new Date();
    let timeConfidence = 0.5;

    // Advanced time parsing
    const timeText = bestMatch.match?.[2] || text;
    
    // Parse relative time
    if (timePatterns.tomorrow.pattern.test(timeText)) {
      dateTime = dayjs().add(1, 'day').toDate();
      timeConfidence = timePatterns.tomorrow.confidence;
    } else if (timePatterns.nextWeek.pattern.test(timeText)) {
      dateTime = dayjs().add(7, 'day').toDate();
      timeConfidence = timePatterns.nextWeek.confidence;
    } else if (timePatterns.today.pattern.test(timeText)) {
      dateTime = new Date();
      timeConfidence = timePatterns.today.confidence;
    }

    // Parse specific time
    const timeMatch = timeText.match(timePatterns.specific_time.pattern);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1]);
      const minute = parseInt(timeMatch[2] || '0');
      dateTime = dayjs(dateTime).hour(hour).minute(minute).toDate();
      timeConfidence = Math.max(timeConfidence, timePatterns.specific_time.confidence);
    }

    // Parse specific date
    const dateMatch = timeText.match(timePatterns.specific_date.pattern);
    if (dateMatch) {
      const day = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]) - 1;
      const year = dateMatch[3] ? parseInt(dateMatch[3]) : new Date().getFullYear();
      dateTime = dayjs().year(year > 50 ? year + 1900 : year + 2000).month(month).date(day).toDate();
      timeConfidence = Math.max(timeConfidence, timePatterns.specific_date.confidence);
    }

    // Parse day names (advanced Vietnamese day parsing)
    const dayMatch = timeText.match(timePatterns.day_names.pattern);
    if (dayMatch) {
      const dayMap: { [key: string]: number } = {
        'thứ hai': 1, 'thứ ba': 2, 'thứ tư': 3, 'thứ năm': 4,
        'thứ sáu': 5, 'thứ bảy': 6, 'chủ nhật': 0
      };
      
      const dayName = dayMatch[1].toLowerCase().replace(/\s+/g, ' ');
      const targetDay = dayMap[dayName];
      
      if (targetDay !== undefined) {
        const today = dayjs();
        const currentDay = today.day();
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7; // Next week
        
        dateTime = today.add(daysToAdd, 'day').toDate();
        timeConfidence = Math.max(timeConfidence, timePatterns.day_names.confidence);
      }
    }

    // Parse relative days
    const relativeDaysMatch = timeText.match(timePatterns.relative_days.pattern);
    if (relativeDaysMatch) {
      const days = parseInt(relativeDaysMatch[1]);
      dateTime = dayjs().add(days, 'day').toDate();
      timeConfidence = Math.max(timeConfidence, timePatterns.relative_days.confidence);
    }

    // Determine priority with context analysis
    let priority: AcademicEvent['priority'] = 'medium';
    if (/gấp|urgent|quan trọng|cao|critical|asap/i.test(text)) {
      priority = 'high';
    } else if (/thấp|low|không gấp|optional/i.test(text)) {
      priority = 'low';
    }

    // Smart course detection
    let course: string | undefined;
    const coursePatterns = [
      /môn\s+(.+?)(?:\s|$)/i,
      /(?:lớp|class)\s+(.+?)(?:\s|$)/i,
      /(toán|lý|hóa|sinh|sử|địa|anh|văn|tin|triết|kinh tế|quản trị|marketing|kế toán)/i
    ];
    
    for (const pattern of coursePatterns) {
      const match = text.match(pattern);
      if (match) {
        course = match[1].trim();
        break;
      }
    }

    // Smart estimated time calculation
    let estimatedTime: number | undefined;
    const timeEstimatePatterns = [
      /(\d+)\s*(?:giờ|h|hour)/i,
      /(\d+)\s*(?:phút|min|minute)/i
    ];
    
    for (const pattern of timeEstimatePatterns) {
      const match = text.match(pattern);
      if (match) {
        const value = parseInt(match[1]);
        estimatedTime = pattern.source.includes('phút|min') ? value / 60 : value;
        break;
      }
    }

    // Generate smart suggestions
    const suggestions = [];
    if (timeConfidence < 0.7) {
      suggestions.push('Thời gian có thể không chính xác. Hãy kiểm tra lại.');
    }
    if (!course && bestMatch.type === 'class') {
      suggestions.push('Bạn có thể thêm tên môn học để dễ quản lý hơn.');
    }
    if (!estimatedTime && bestMatch.type === 'deadline') {
      suggestions.push('Ước tính thời gian hoàn thành sẽ giúp lập kế hoạch tốt hơn.');
    }

    const finalConfidence = (bestMatch.confidence + timeConfidence) / 2;

    return {
      confidence: finalConfidence,
      event: {
        title: title.charAt(0).toUpperCase() + title.slice(1),
        type: bestMatch.type as AcademicEvent['type'],
        startTime: dateTime,
        status: 'todo' as const,
        priority,
        course,
        estimatedTime
      },
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }

  // Smart event recommendations based on patterns
  generateSmartSuggestions(events: AcademicEvent[]): string[] {
    const suggestions = [];
    
    // Pattern analysis
    const now = dayjs();
    const upcomingDeadlines = events.filter(e => 
      e.type === 'deadline' && 
      dayjs(e.startTime).isAfter(now) && 
      dayjs(e.startTime).isBefore(now.add(7, 'day'))
    );

    if (upcomingDeadlines.length > 3) {
      suggestions.push('Bạn có nhiều deadline trong tuần tới. Hãy ưu tiên các nhiệm vụ quan trọng.');
    }

    // Time management insights
    const overdueEvents = events.filter(e => 
      dayjs(e.startTime).isBefore(now) && e.status !== 'done'
    );

    if (overdueEvents.length > 0) {
      suggestions.push(`Bạn có ${overdueEvents.length} nhiệm vụ quá hạn. Hãy cập nhật trạng thái hoặc lên kế hoạch bù.`);
    }

    // Productivity patterns
    const completedToday = events.filter(e => 
      dayjs(e.startTime).isSame(now, 'day') && e.status === 'done'
    ).length;

    if (completedToday >= 3) {
      suggestions.push('🎉 Tuyệt vời! Bạn đã hoàn thành nhiều nhiệm vụ hôm nay.');
    } else if (completedToday === 0) {
      suggestions.push('Hãy bắt đầu với một nhiệm vụ nhỏ để tạo động lực cho ngày mới!');
    }

    return suggestions;
  }

  // Advanced conflict detection
  detectConflicts(newEvent: AcademicEvent, existingEvents: AcademicEvent[]): string[] {
    const conflicts = [];
    const newEventTime = dayjs(newEvent.startTime);
    
    for (const event of existingEvents) {
      const eventTime = dayjs(event.startTime);
      
      // Time conflict (within 1 hour)
      if (Math.abs(newEventTime.diff(eventTime, 'minute')) < 60) {
        conflicts.push(`Xung đột thời gian với: ${event.title}`);
      }
      
      // Same course, same day
      if (newEvent.course && event.course === newEvent.course && 
          newEventTime.isSame(eventTime, 'day')) {
        conflicts.push(`Cùng môn học trong ngày: ${event.title}`);
      }
    }
    
    return conflicts;
  }
}

export const aiService = new AdvancedAIService();
