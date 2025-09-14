import { useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { useEventStore } from '../store/eventStore';
import dayjs from '../utils/dayjs';

interface NotificationConfig {
  deadlineReminders: boolean;
  overdueAlerts: boolean;
  dailyDigest: boolean;
  motivationalMessages: boolean;
}

export function useNotificationSystem(config: NotificationConfig = {
  deadlineReminders: true,
  overdueAlerts: true,
  dailyDigest: true,
  motivationalMessages: true
}) {
  const { events } = useEventStore();

  // Check for deadline reminders
  useEffect(() => {
    if (!config.deadlineReminders) return;

    const checkDeadlines = () => {
      const now = dayjs();
      
      events.forEach(event => {
        if (event.type === 'deadline' && event.status !== 'done') {
          const eventTime = dayjs(event.startTime);
          const hoursUntil = eventTime.diff(now, 'hour');
          
          // 24 hours before deadline
          if (hoursUntil <= 24 && hoursUntil > 23) {
            notifications.show({
              id: `deadline-24h-${event.id}`,
              title: '⏰ Deadline sắp tới!',
              message: `"${event.title}" sẽ đến hạn trong 24 giờ nữa.`,
              color: 'yellow',
              autoClose: 8000,
            });
          }
          
          // 6 hours before deadline
          if (hoursUntil <= 6 && hoursUntil > 5) {
            notifications.show({
              id: `deadline-6h-${event.id}`,
              title: '🚨 Deadline cực gấp!',
              message: `"${event.title}" sẽ đến hạn trong ${hoursUntil} giờ nữa. Hãy hoàn thành ngay!`,
              color: 'red',
              autoClose: 10000,
            });
          }
          
          // 1 hour before deadline
          if (hoursUntil <= 1 && hoursUntil > 0) {
            notifications.show({
              id: `deadline-1h-${event.id}`,
              title: '🔥 DEADLINE CUỐI CÙNG!',
              message: `"${event.title}" sẽ đến hạn trong ít hơn 1 giờ nữa!`,
              color: 'red',
              autoClose: false, // Don't auto close
            });
          }
        }
      });
    };

    // Check immediately and then every hour
    checkDeadlines();
    const interval = setInterval(checkDeadlines, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, [events, config.deadlineReminders]);

  // Check for overdue tasks
  useEffect(() => {
    if (!config.overdueAlerts) return;

    const checkOverdue = () => {
      const now = dayjs();
      
      const overdueTasks = events.filter(event => 
        event.status !== 'done' && 
        dayjs(event.startTime).isBefore(now)
      );

      if (overdueTasks.length > 0) {
        notifications.show({
          id: 'overdue-summary',
          title: `📋 Bạn có ${overdueTasks.length} nhiệm vụ quá hạn`,
          message: `Hãy kiểm tra và cập nhật lại lịch trình của bạn.`,
          color: 'red',
          autoClose: 6000,
        });
      }
    };

    // Check every 6 hours
    const interval = setInterval(checkOverdue, 6 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [events, config.overdueAlerts]);

  // Daily digest (show at 8 AM)
  useEffect(() => {
    if (!config.dailyDigest) return;

    const showDailyDigest = () => {
      const now = dayjs();
      const today = now.startOf('day');
      
      // Check if it's around 8 AM (between 8:00-8:30)
      const hour = now.hour();
      const minute = now.minute();
      
      if (hour === 8 && minute < 30) {
        const todayEvents = events.filter(event =>
          dayjs(event.startTime).isSame(today, 'day')
        );
        
        const todoCount = todayEvents.filter(e => e.status === 'todo').length;
        const classCount = todayEvents.filter(e => e.type === 'class').length;
        const deadlineCount = todayEvents.filter(e => e.type === 'deadline').length;
        
        let message = `Chào buổi sáng! `;
        
        if (todayEvents.length === 0) {
          message += `Hôm nay bạn không có lịch trình nào. Thời gian tuyệt vời để học tự do!`;
        } else {
          message += `Hôm nay bạn có ${todayEvents.length} sự kiện. `;
          if (classCount > 0) message += `${classCount} buổi học, `;
          if (deadlineCount > 0) message += `${deadlineCount} deadline, `;
          if (todoCount > 0) message += `${todoCount} nhiệm vụ cần hoàn thành.`;
        }

        notifications.show({
          id: 'daily-digest',
          title: '🌅 Tóm tắt ngày hôm nay',
          message,
          color: 'blue',
          autoClose: 10000,
        });
      }
    };

    // Check every 30 minutes
    const interval = setInterval(showDailyDigest, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [events, config.dailyDigest]);

  // Motivational messages
  useEffect(() => {
    if (!config.motivationalMessages) return;

    const showMotivationalMessage = () => {
      const now = dayjs();
      const completedToday = events.filter(event =>
        event.status === 'done' &&
        dayjs(event.startTime).isSame(now, 'day')
      ).length;

      const motivationalMessages = [
        "🌟 Bạn đang làm rất tốt! Tiếp tục phát huy nhé!",
        "💪 Mỗi nhiệm vụ hoàn thành là một bước tiến!",
        "🎯 Tập trung vào mục tiêu, thành công sẽ đến!",
        "📚 Học tập là chìa khóa mở ra tương lai!",
        "⭐ Bạn có thể làm được nhiều hơn bạn nghĩ!",
        "🚀 Hãy biến những ước mơ thành hiện thực!",
        "🏆 Sự kiên trì sẽ dẫn đến thành công!",
        "🌈 Mỗi ngày là một cơ hội mới để tiến bộ!"
      ];

      // Show motivational message based on progress
      if (completedToday >= 3 && Math.random() < 0.3) {
        const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        
        notifications.show({
          id: 'motivational-message',
          title: '🎉 Chúc mừng!',
          message: `Bạn đã hoàn thành ${completedToday} nhiệm vụ hôm nay! ${randomMessage}`,
          color: 'green',
          autoClose: 6000,
        });
      }
    };

    // Show motivational messages occasionally (every 2 hours)
    const interval = setInterval(showMotivationalMessage, 2 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [events, config.motivationalMessages]);

  // Smart study reminders
  useEffect(() => {
    const showStudyReminder = () => {
      const now = dayjs();
      const hour = now.hour();
      
      // Show study reminders during productive hours
      if ((hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16) || (hour >= 19 && hour <= 21)) {
        const upcomingDeadlines = events.filter(event =>
          event.type === 'deadline' &&
          event.status !== 'done' &&
          dayjs(event.startTime).diff(now, 'day') <= 3
        );

        if (upcomingDeadlines.length > 0 && Math.random() < 0.2) {
          const urgentTask = upcomingDeadlines[0];
          notifications.show({
            id: 'study-reminder',
            title: '📖 Đã đến giờ học!',
            message: `Hãy dành thời gian cho "${urgentTask.title}" - deadline đang đến gần.`,
            color: 'blue',
            autoClose: 8000,
          });
        }
      }
    };

    // Check every hour
    const interval = setInterval(showStudyReminder, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [events]);

  // Productivity insights
  const sendProductivityInsight = () => {
    const now = dayjs();
    const last7Days = events.filter(event =>
      dayjs(event.startTime).isAfter(now.subtract(7, 'day')) &&
      event.status === 'done'
    );

    const completionRate = events.length > 0 ? (last7Days.length / events.length) * 100 : 0;
    
    if (completionRate >= 80) {
      notifications.show({
        title: '🏆 Excellent Performance!',
        message: `Tỷ lệ hoàn thành tuần qua của bạn là ${completionRate.toFixed(1)}%! Tuyệt vời!`,
        color: 'green',
        autoClose: 8000,
      });
    } else if (completionRate >= 60) {
      notifications.show({
        title: '👍 Good Progress!',
        message: `Tỷ lệ hoàn thành ${completionRate.toFixed(1)}%. Hãy cố gắng thêm một chút nữa!`,
        color: 'yellow',
        autoClose: 8000,
      });
    } else if (completionRate < 40) {
      notifications.show({
        title: '💡 Cải thiện hiệu suất',
        message: `Tỷ lệ hoàn thành ${completionRate.toFixed(1)}%. Hãy thử chia nhỏ nhiệm vụ và tập trung hơn!`,
        color: 'orange',
        autoClose: 10000,
      });
    }
  };

  return {
    sendProductivityInsight,
    showCustomNotification: (title: string, message: string, color: string = 'blue') => {
      notifications.show({
        title,
        message,
        color,
        autoClose: 6000,
      });
    }
  };
}
