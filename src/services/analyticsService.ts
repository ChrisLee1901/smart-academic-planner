// Advanced Analytics Service with ML-like insights
import type { AcademicEvent } from '../types';
import dayjs from '../utils/dayjs';

interface AnalyticsData {
  productivity: {
    daily: number[];
    weekly: number[];
    monthly: number[];
    trends: string[];
  };
  patterns: {
    peakHours: { hour: number; count: number }[];
    courseworkDistribution: { course: string; count: number; completion: number }[];
    priorityEffectiveness: { priority: string; avgCompletionTime: number }[];
  };
  predictions: {
    overloadDays: string[];
    recommendedStudyTimes: string[];
    burnoutRisk: number;
  };
  insights: string[];
}

interface PerformanceMetrics {
  completionRate: number;
  averageDelay: number;
  productivityScore: number;
  timeManagementRating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  improvementAreas: string[];
}

class AdvancedAnalyticsService {
  // Calculate comprehensive analytics with ML-like insights
  generateAdvancedAnalytics(events: AcademicEvent[]): AnalyticsData {
    // Productivity analysis
    const productivity = this.calculateProductivityMetrics(events);
    
    // Pattern recognition
    const patterns = this.identifyPatterns(events);
    
    // Predictive analytics
    const predictions = this.generatePredictions(events);
    
    // AI-generated insights
    const insights = this.generateInsights(events, productivity, patterns);
    
    return {
      productivity,
      patterns,
      predictions,
      insights
    };
  }

  private calculateProductivityMetrics(events: AcademicEvent[]) {
    const now = dayjs();
    
    // Daily productivity (last 30 days)
    const daily = [];
    for (let i = 29; i >= 0; i--) {
      const day = now.subtract(i, 'day');
      const dayEvents = events.filter(e => 
        dayjs(e.startTime).isSame(day, 'day') && e.status === 'done'
      );
      daily.push(dayEvents.length);
    }
    
    // Weekly productivity (last 12 weeks)
    const weekly = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = now.subtract(i, 'week').startOf('week');
      const weekEnd = weekStart.endOf('week');
      const weekEvents = events.filter(e => {
        const eventTime = dayjs(e.startTime);
        return eventTime.isAfter(weekStart) && 
               eventTime.isBefore(weekEnd) && 
               e.status === 'done';
      });
      weekly.push(weekEvents.length);
    }
    
    // Monthly productivity (last 12 months)
    const monthly = [];
    for (let i = 11; i >= 0; i--) {
      const month = now.subtract(i, 'month');
      const monthEvents = events.filter(e => 
        dayjs(e.startTime).isSame(month, 'month') && e.status === 'done'
      );
      monthly.push(monthEvents.length);
    }
    
    // Trend analysis
    const trends = this.analyzeTrends(daily, weekly, monthly);
    
    return { daily, weekly, monthly, trends };
  }

  private identifyPatterns(events: AcademicEvent[]) {
    // Peak hours analysis
    const hourCounts: { [hour: number]: number } = {};
    events.forEach(event => {
      const hour = dayjs(event.startTime).hour();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    const peakHours = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Coursework distribution
    const courseData: { [course: string]: { count: number; completed: number } } = {};
    events.forEach(event => {
      if (event.course) {
        if (!courseData[event.course]) {
          courseData[event.course] = { count: 0, completed: 0 };
        }
        courseData[event.course].count++;
        if (event.status === 'done') {
          courseData[event.course].completed++;
        }
      }
    });
    
    const courseworkDistribution = Object.entries(courseData)
      .map(([course, data]) => ({
        course,
        count: data.count,
        completion: data.count > 0 ? (data.completed / data.count) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);
    
    // Priority effectiveness
    const priorityData: { [priority: string]: { totalTime: number; count: number } } = {};
    events.filter(e => e.status === 'done').forEach(event => {
      const priority = event.priority || 'medium';
      if (!priorityData[priority]) {
        priorityData[priority] = { totalTime: 0, count: 0 };
      }
      priorityData[priority].count++;
      
      // Estimate completion time based on when event was marked done
      const estimatedTime = event.estimatedTime || 2; // Default 2 hours
      priorityData[priority].totalTime += estimatedTime;
    });
    
    const priorityEffectiveness = Object.entries(priorityData)
      .map(([priority, data]) => ({
        priority,
        avgCompletionTime: data.count > 0 ? data.totalTime / data.count : 0
      }));
    
    return {
      peakHours,
      courseworkDistribution,
      priorityEffectiveness
    };
  }

  private generatePredictions(events: AcademicEvent[]) {
    const now = dayjs();
    
    // Predict overload days (next 14 days)
    const overloadDays = [];
    for (let i = 0; i < 14; i++) {
      const day = now.add(i, 'day');
      const dayEvents = events.filter(e => 
        dayjs(e.startTime).isSame(day, 'day') && e.status !== 'done'
      );
      
      if (dayEvents.length > 3) {
        overloadDays.push(day.format('DD/MM/YYYY'));
      }
    }
    
    // Recommend study times based on past performance
    const completedEvents = events.filter(e => e.status === 'done');
    const hourSuccess: { [hour: number]: number } = {};
    
    completedEvents.forEach(event => {
      const hour = dayjs(event.startTime).hour();
      hourSuccess[hour] = (hourSuccess[hour] || 0) + 1;
    });
    
    const bestHours = Object.entries(hourSuccess)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => {
        const h = parseInt(hour);
        return h < 12 ? `${h}:00 AM` : `${h-12 || 12}:00 PM`;
      });
    
    const recommendedStudyTimes = bestHours.length > 0 ? bestHours : 
      ['9:00 AM - 11:00 AM', '2:00 PM - 4:00 PM', '7:00 PM - 9:00 PM'];
    
    // Calculate burnout risk
    const recentEvents = events.filter(e => 
      dayjs(e.startTime).isAfter(now.subtract(7, 'day'))
    );
    const upcomingEvents = events.filter(e => 
      dayjs(e.startTime).isAfter(now) && 
      dayjs(e.startTime).isBefore(now.add(7, 'day'))
    );
    
    const workload = recentEvents.length + upcomingEvents.length;
    const burnoutRisk = Math.min(100, (workload / 20) * 100); // Scale to 0-100
    
    return {
      overloadDays,
      recommendedStudyTimes,
      burnoutRisk
    };
  }

  private generateInsights(
    events: AcademicEvent[], 
    productivity: any, 
    patterns: any
  ): string[] {
    const insights = [];
    const now = dayjs();
    
    // Productivity insights
    const recentProductivity = productivity.daily.slice(-7).reduce((a: number, b: number) => a + b, 0);
    const avgProductivity = productivity.daily.reduce((a: number, b: number) => a + b, 0) / 30;
    
    if (recentProductivity > avgProductivity * 7) {
      insights.push('🚀 Bạn đang có một tuần rất hiệu quả! Hãy duy trì nhịp độ này.');
    } else if (recentProductivity < avgProductivity * 7 * 0.5) {
      insights.push('⚠️ Hiệu suất giảm so với trung bình. Hãy xem xét điều chỉnh kế hoạch.');
    }
    
    // Time management insights
    const overdueEvents = events.filter(e => 
      dayjs(e.startTime).isBefore(now) && e.status !== 'done'
    );
    
    if (overdueEvents.length === 0) {
      insights.push('✅ Xuất sắc! Bạn không có nhiệm vụ nào quá hạn.');
    } else if (overdueEvents.length > 5) {
      insights.push('🔴 Nhiều nhiệm vụ quá hạn. Hãy ưu tiên hoàn thành hoặc điều chỉnh deadline.');
    }
    
    // Pattern insights
    if (patterns.peakHours.length > 0) {
      const bestHour = patterns.peakHours[0].hour;
      const timeStr = bestHour < 12 ? `${bestHour}:00 AM` : `${bestHour-12 || 12}:00 PM`;
      insights.push(`⏰ Thời gian hiệu quả nhất của bạn là ${timeStr}. Hãy lên lịch các công việc quan trọng vào giờ này.`);
    }
    
    // Course balance insights
    if (patterns.courseworkDistribution.length > 0) {
      const courses = patterns.courseworkDistribution;
      const topCourse = courses[0];
      const lowestCompletion = [...courses].sort((a: any, b: any) => a.completion - b.completion)[0];
      
      if (topCourse.count > courses[1]?.count * 2) {
        insights.push(`📚 Bạn đang tập trung quá nhiều vào ${topCourse.course}. Hãy cân bằng thời gian cho các môn khác.`);
      }
      
      if (lowestCompletion.completion < 50) {
        insights.push(`⚡ Môn ${lowestCompletion.course} có tỷ lệ hoàn thành thấp (${lowestCompletion.completion.toFixed(1)}%). Cần chú ý hơn.`);
      }
    }
    
    // Workload insights
    const upcomingWeek = events.filter(e => 
      dayjs(e.startTime).isAfter(now) && 
      dayjs(e.startTime).isBefore(now.add(7, 'day'))
    );
    
    if (upcomingWeek.length > 15) {
      insights.push('⚠️ Tuần tới có quá nhiều nhiệm vụ. Hãy xem xét hoãn lại một số công việc không cấp thiết.');
    } else if (upcomingWeek.length < 3) {
      insights.push('🌟 Tuần tới khá nhàn rỗi. Đây là cơ hội tốt để học trước hoặc ôn tập.');
    }
    
    return insights;
  }

  private analyzeTrends(daily: number[], weekly: number[], _monthly: number[]): string[] {
    const trends = [];
    
    // Daily trend
    const recentDaily = daily.slice(-7);
    const previousDaily = daily.slice(-14, -7);
    const recentAvg = recentDaily.reduce((a, b) => a + b, 0) / 7;
    const previousAvg = previousDaily.reduce((a, b) => a + b, 0) / 7;
    
    if (recentAvg > previousAvg * 1.2) {
      trends.push('Tăng trung bình hiệu suất hàng ngày');
    } else if (recentAvg < previousAvg * 0.8) {
      trends.push('Giảm hiệu suất hàng ngày');
    } else {
      trends.push('Hiệu suất hàng ngày ổn định');
    }
    
    // Weekly trend
    const recentWeekly = weekly.slice(-4);
    const isIncreasing = recentWeekly.every((val, i) => i === 0 || val >= recentWeekly[i-1]);
    const isDecreasing = recentWeekly.every((val, i) => i === 0 || val <= recentWeekly[i-1]);
    
    if (isIncreasing) {
      trends.push('Xu hướng tăng theo tuần');
    } else if (isDecreasing) {
      trends.push('Xu hướng giảm theo tuần');
    } else {
      trends.push('Hiệu suất theo tuần dao động');
    }
    
    return trends;
  }

  // Calculate performance metrics
  calculatePerformanceMetrics(events: AcademicEvent[]): PerformanceMetrics {
    const now = dayjs();
    const completedEvents = events.filter(e => e.status === 'done');
    const overdueEvents = events.filter(e => 
      dayjs(e.startTime).isBefore(now) && e.status !== 'done'
    );
    
    // Completion rate
    const totalRelevantEvents = events.filter(e => 
      dayjs(e.startTime).isBefore(now) || e.status === 'done'
    );
    const completionRate = totalRelevantEvents.length > 0 ? 
      (completedEvents.length / totalRelevantEvents.length) * 100 : 100;
    
    // Average delay calculation (simplified without completedAt field)
    const averageDelay = 0; // Would be calculated if we had completion timestamps
    
    // Productivity score (complex algorithm)
    const recentEvents = events.filter(e => 
      dayjs(e.startTime).isAfter(now.subtract(30, 'day'))
    );
    const recentCompleted = recentEvents.filter(e => e.status === 'done');
    const recentCompletionRate = recentEvents.length > 0 ? 
      (recentCompleted.length / recentEvents.length) * 100 : 100;
    
    const timelinessScore = Math.max(0, 100 - (averageDelay * 10));
    const productivityScore = (recentCompletionRate * 0.6) + (timelinessScore * 0.4);
    
    // Time management rating
    let timeManagementRating: PerformanceMetrics['timeManagementRating'];
    if (productivityScore >= 90) timeManagementRating = 'Excellent';
    else if (productivityScore >= 75) timeManagementRating = 'Good';
    else if (productivityScore >= 60) timeManagementRating = 'Fair';
    else timeManagementRating = 'Poor';
    
    // Improvement areas
    const improvementAreas = [];
    if (completionRate < 80) improvementAreas.push('Tăng tỷ lệ hoàn thành nhiệm vụ');
    if (averageDelay > 2) improvementAreas.push('Cải thiện việc đúng deadline');
    if (overdueEvents.length > 3) improvementAreas.push('Quản lý nhiệm vụ quá hạn');
    if (recentCompletionRate < 70) improvementAreas.push('Duy trì momentum làm việc');
    
    return {
      completionRate,
      averageDelay,
      productivityScore,
      timeManagementRating,
      improvementAreas
    };
  }

  // Export data for external analysis
  exportAnalyticsData(events: AcademicEvent[]): string {
    const analytics = this.generateAdvancedAnalytics(events);
    const performance = this.calculatePerformanceMetrics(events);
    
    const exportData = {
      timestamp: new Date().toISOString(),
      summary: performance,
      detailed: analytics,
      rawEvents: events.map(e => ({
        title: e.title,
        type: e.type,
        startTime: e.startTime,
        status: e.status,
        priority: e.priority,
        course: e.course
      }))
    };
    
    return JSON.stringify(exportData, null, 2);
  }
}

export const analyticsService = new AdvancedAnalyticsService();
