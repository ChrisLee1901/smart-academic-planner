export type UrgencyLevel = 'critical' | 'urgent' | 'upcoming' | 'normal' | 'completed';

export interface UrgencyInfo {
  level: UrgencyLevel;
  color: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  shouldPulse: boolean;
  gradient?: string;
}

export function getUrgencyLevel(startTime: string, status: string): UrgencyLevel {
  if (status === 'done') return 'completed';
  
  const now = new Date();
  const eventTime = new Date(startTime);
  const hoursUntil = (eventTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  const daysUntil = hoursUntil / 24;
  
  if (hoursUntil < 0) return 'critical'; // Overdue
  if (hoursUntil < 6) return 'critical';  // Less than 6 hours
  if (daysUntil < 1) return 'urgent';     // Less than 1 day
  if (daysUntil < 3) return 'upcoming';   // Less than 3 days
  
  return 'normal';
}

export function getUrgencyInfo(urgencyLevel: UrgencyLevel): UrgencyInfo {
  switch (urgencyLevel) {
    case 'critical':
      return {
        level: 'critical',
        color: '#ff6b6b',
        backgroundColor: 'rgba(255, 107, 107, 0.04)',
        borderColor: 'rgba(255, 107, 107, 0.2)',
        textColor: '#e55353',
        shouldPulse: true,
        gradient: 'linear-gradient(135deg, rgba(255, 107, 107, 0.06) 0%, rgba(255, 118, 117, 0.03) 100%)'
      };
    
    case 'urgent':
      return {
        level: 'urgent',
        color: '#ffa726',
        backgroundColor: 'rgba(255, 167, 38, 0.04)',
        borderColor: 'rgba(255, 167, 38, 0.2)',
        textColor: '#f57c00',
        shouldPulse: false,
        gradient: 'linear-gradient(135deg, rgba(255, 167, 38, 0.06) 0%, rgba(255, 183, 77, 0.03) 100%)'
      };
    
    case 'upcoming':
      return {
        level: 'upcoming',
        color: '#42a5f5',
        backgroundColor: 'rgba(66, 165, 245, 0.04)',
        borderColor: 'rgba(66, 165, 245, 0.2)',
        textColor: '#1976d2',
        shouldPulse: false,
        gradient: 'linear-gradient(135deg, rgba(66, 165, 245, 0.06) 0%, rgba(100, 181, 246, 0.03) 100%)'
      };
    
    case 'completed':
      return {
        level: 'completed',
        color: '#66bb6a',
        backgroundColor: 'rgba(102, 187, 106, 0.04)',
        borderColor: 'rgba(102, 187, 106, 0.2)',
        textColor: '#388e3c',
        shouldPulse: false,
        gradient: 'linear-gradient(135deg, rgba(102, 187, 106, 0.06) 0%, rgba(129, 199, 132, 0.03) 100%)'
      };
    
    default: // normal
      return {
        level: 'normal',
        color: '#78909c',
        backgroundColor: 'rgba(120, 144, 156, 0.04)',
        borderColor: 'rgba(120, 144, 156, 0.2)',
        textColor: '#546e7a',
        shouldPulse: false,
        gradient: 'linear-gradient(135deg, rgba(120, 144, 156, 0.06) 0%, rgba(144, 164, 174, 0.03) 100%)'
      };
  }
}

export function getUrgencyMessage(urgencyLevel: UrgencyLevel, daysUntil: number): string {
  switch (urgencyLevel) {
    case 'critical':
      if (daysUntil < 0) {
        return `⚠️ Đã quá hạn ${Math.abs(Math.ceil(daysUntil))} ngày`;
      }
      return '🚨 KHẨN CẤP - Dưới 6 giờ!';
    
    case 'urgent':
      return '⏰ GẤP - Dưới 1 ngày';
    
    case 'upcoming':
      return '📅 Sắp tới - Dưới 3 ngày';
    
    case 'completed':
      return '✅ Đã hoàn thành';
    
    default:
      return '📝 Bình thường';
  }
}