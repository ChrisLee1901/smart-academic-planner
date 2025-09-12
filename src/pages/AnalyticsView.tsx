import { useMemo } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  Group,
  Badge,
  Paper,
  Grid,
  ThemeIcon,
  RingProgress,
  Progress,
  Alert,
  List
} from '@mantine/core';
import { 
  IconChartBar,
  IconClock,
  IconTrendingUp,
  IconTarget,
  IconCalendarTime,
  IconBrain,
  IconFlame,
  IconMoodSmile,
  IconMoodSad,
  IconAlertTriangle,
  IconCheckbox
} from '@tabler/icons-react';
import { useEventStore } from '../store/eventStore';
import { ProcrastinationAnalysisService } from '../services/procrastinationService';
import dayjs from 'dayjs';

interface ProductivityMetrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageTimeToComplete: number;
  bestWorkingHours: number[];
  productivityByType: Record<string, { completed: number; total: number }>;
  weeklyPattern: Record<string, number>;
  procrastinationScore: number;
  streakCount: number;
}

export function AnalyticsView() {
  const { events } = useEventStore();

  // Calculate comprehensive analytics
  const analytics = useMemo((): ProductivityMetrics => {
    const now = dayjs();
    const thirtyDaysAgo = now.subtract(30, 'day');
    
    // Filter events from last 30 days for analysis
    const recentEvents = events.filter(event => 
      dayjs(event.startTime).isAfter(thirtyDaysAgo)
    );

    const totalTasks = recentEvents.length;
    const completedTasks = recentEvents.filter(e => e.status === 'done').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Calculate average time to complete (mock calculation)
    const averageTimeToComplete = completedTasks > 0 ? 2.5 : 0; // hours

    // Best working hours analysis (mock AI analysis)
    const hourlyProductivity = Array.from({ length: 24 }, (_, hour) => {
      const completedInHour = recentEvents.filter(event => 
        event.status === 'done' && dayjs(event.startTime).hour() === hour
      ).length;
      return { hour, completed: completedInHour };
    });

    const bestWorkingHours = hourlyProductivity
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 3)
      .map(item => item.hour);

    // Productivity by type
    const types = ['deadline', 'project', 'class', 'personal'] as const;
    const productivityByType = types.reduce((acc, type) => {
      const typeEvents = recentEvents.filter(e => e.type === type);
      const completed = typeEvents.filter(e => e.status === 'done').length;
      acc[type] = { completed, total: typeEvents.length };
      return acc;
    }, {} as Record<string, { completed: number; total: number }>);

    // Weekly pattern
    const weekDays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const weeklyPattern = weekDays.reduce((acc, day, index) => {
      const dayEvents = recentEvents.filter(event => 
        dayjs(event.startTime).day() === index && event.status === 'done'
      ).length;
      acc[day] = dayEvents;
      return acc;
    }, {} as Record<string, number>);

    // Procrastination score (higher = more procrastination)
    const overdueTasks = recentEvents.filter(event => 
      dayjs(event.startTime).isBefore(now) && event.status !== 'done'
    ).length;
    const procrastinationScore = totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0;

    // Streak count (consecutive days with completed tasks)
    let streakCount = 0;
    let currentDate = now;
    while (streakCount < 30) {
      const hasCompletedTask = recentEvents.some(event => 
        dayjs(event.startTime).isSame(currentDate, 'day') && event.status === 'done'
      );
      if (hasCompletedTask) {
        streakCount++;
        currentDate = currentDate.subtract(1, 'day');
      } else {
        break;
      }
    }

    return {
      totalTasks,
      completedTasks,
      completionRate,
      averageTimeToComplete,
      bestWorkingHours,
      productivityByType,
      weeklyPattern,
      procrastinationScore,
      streakCount
    };
  }, [events]);

  // Get procrastination insights using AI service
  const procrastinationInsights = useMemo(() => {
    return ProcrastinationAnalysisService.getProcrastinationInsights(events);
  }, [events]);

  const getProductivityColor = (rate: number) => {
    if (rate >= 80) return 'green';
    if (rate >= 60) return 'yellow';
    if (rate >= 40) return 'orange';
    return 'red';
  };

  const getProcrastinationLevel = (score: number) => {
    if (score <= 20) return { label: 'Rất tốt', color: 'green' };
    if (score <= 40) return { label: 'Khá tốt', color: 'yellow' };
    if (score <= 60) return { label: 'Cần cải thiện', color: 'orange' };
    return { label: 'Cần chú ý', color: 'red' };
  };

  const formatHour = (hour: number) => {
    return hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
  };

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Paper p="lg" withBorder radius="md" bg="gradient-to-r from-indigo-50 to-purple-50">
          <Group gap="md">
            <ThemeIcon size={48} radius="md" variant="gradient" gradient={{ from: 'indigo', to: 'purple' }}>
              <IconChartBar size={24} />
            </ThemeIcon>
            <div>
              <Title order={1} c="indigo">Phân tích năng suất</Title>
              <Text c="dimmed" size="lg">
                Hiểu rõ thói quen làm việc và thời gian hiệu quả nhất của bạn
              </Text>
            </div>
          </Group>
        </Paper>

        {/* Key Metrics */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card padding="lg" withBorder ta="center">
              <RingProgress
                size={120}
                thickness={12}
                sections={[
                  { value: analytics.completionRate, color: getProductivityColor(analytics.completionRate) }
                ]}
                label={
                  <Text size="lg" fw={700} ta="center">
                    {Math.round(analytics.completionRate)}%
                  </Text>
                }
                mb="sm"
              />
              <Text fw={600} mb="xs">Tỷ lệ hoàn thành</Text>
              <Text size="sm" c="dimmed">
                {analytics.completedTasks}/{analytics.totalTasks} tasks (30 ngày)
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card padding="lg" withBorder ta="center">
              <ThemeIcon size={60} radius="xl" variant="light" color="blue" mb="sm">
                <IconFlame size={30} />
              </ThemeIcon>
              <Text size="xl" fw={700} c="blue">
                {analytics.streakCount}
              </Text>
              <Text fw={600} mb="xs">Chuỗi ngày</Text>
              <Text size="sm" c="dimmed">
                Hoàn thành task liên tiếp
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card padding="lg" withBorder ta="center">
              <ThemeIcon size={60} radius="xl" variant="light" color="orange" mb="sm">
                <IconClock size={30} />
              </ThemeIcon>
              <Text size="xl" fw={700} c="orange">
                {analytics.averageTimeToComplete}h
              </Text>
              <Text fw={600} mb="xs">Thời gian TB</Text>
              <Text size="sm" c="dimmed">
                Để hoàn thành 1 task
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card padding="lg" withBorder ta="center">
              <ThemeIcon 
                size={60} 
                radius="xl" 
                variant="light" 
                color={getProcrastinationLevel(analytics.procrastinationScore).color}
                mb="sm"
              >
                {analytics.procrastinationScore <= 40 ? <IconMoodSmile size={30} /> : <IconMoodSad size={30} />}
              </ThemeIcon>
              <Text size="lg" fw={700} c={getProcrastinationLevel(analytics.procrastinationScore).color}>
                {getProcrastinationLevel(analytics.procrastinationScore).label}
              </Text>
              <Text fw={600} mb="xs">Chỉ số trì hoãn</Text>
              <Text size="sm" c="dimmed">
                {Math.round(analytics.procrastinationScore)}% tasks quá hạn
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Charts and Detailed Analytics */}
        <Grid>
          {/* Weekly Pattern */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card padding="lg" withBorder>
              <Group gap="xs" mb="lg">
                <IconCalendarTime size={20} color="blue" />
                <Text fw={600} size="lg">Năng suất theo ngày trong tuần</Text>
              </Group>
              
              <Stack gap="sm">
                {Object.entries(analytics.weeklyPattern).map(([day, count]) => (
                  <Group key={day} justify="space-between">
                    <Text fw={500}>{day}</Text>
                    <Group gap="sm">
                      <Progress 
                        value={count * 10} 
                        color="blue" 
                        size="lg" 
                        style={{ width: 200 }}
                      />
                      <Badge variant="light">{count}</Badge>
                    </Group>
                  </Group>
                ))}
              </Stack>
            </Card>
          </Grid.Col>

          {/* Best Working Hours */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card padding="lg" withBorder>
              <Group gap="xs" mb="lg">
                <IconBrain size={20} color="purple" />
                <Text fw={600} size="lg">Giờ vàng của bạn</Text>
              </Group>
              
              <Stack gap="md">
                {analytics.bestWorkingHours.map((hour, index) => (
                  <Paper key={hour} p="md" withBorder radius="md" bg="purple.0">
                    <Group justify="space-between">
                      <div>
                        <Text fw={600} c="purple">
                          #{index + 1} Hiệu quả nhất
                        </Text>
                        <Text size="lg" fw={700}>
                          {formatHour(hour)}
                        </Text>
                      </div>
                      <ThemeIcon size={40} radius="xl" variant="light" color="purple">
                        <IconTrendingUp size={20} />
                      </ThemeIcon>
                    </Group>
                  </Paper>
                ))}
                
                <Alert color="purple" variant="light" mt="md">
                  <Text size="sm">
                    💡 <strong>AI Khuyến nghị:</strong> Lên lịch các task quan trọng vào những khung giờ này để đạt hiệu quả tối đa!
                  </Text>
                </Alert>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Productivity by Type */}
        <Card padding="lg" withBorder>
          <Group gap="xs" mb="lg">
            <IconTarget size={20} color="green" />
            <Text fw={600} size="lg">Hiệu suất theo loại task</Text>
          </Group>
          
          <Grid>
            {Object.entries(analytics.productivityByType).map(([type, data]) => {
              const rate = data.total > 0 ? (data.completed / data.total) * 100 : 0;
              const typeLabels = {
                deadline: 'Deadline',
                project: 'Dự án',
                class: 'Lớp học',
                personal: 'Cá nhân'
              };
              
              return (
                <Grid.Col key={type} span={{ base: 12, sm: 6, md: 3 }}>
                  <Paper p="md" withBorder radius="md">
                    <Text fw={600} mb="xs">{typeLabels[type as keyof typeof typeLabels]}</Text>
                    <Text size="sm" c="dimmed" mb="md">
                      {data.completed}/{data.total} hoàn thành
                    </Text>
                    <Progress
                      value={rate}
                      color={getProductivityColor(rate)}
                      size="lg"
                      mb="xs"
                    />
                    <Text size="sm" ta="center" fw={600} c={getProductivityColor(rate)}>
                      {Math.round(rate)}%
                    </Text>
                  </Paper>
                </Grid.Col>
              );
            })}
          </Grid>
        </Card>

        {/* AI Insights */}
        <Card padding="lg" withBorder>
          <Group gap="xs" mb="lg">
            <IconBrain size={20} color="blue" />
            <Text fw={600} size="lg">Nhận xét từ AI</Text>
          </Group>
          
          <Stack gap="md">
            {analytics.completionRate >= 80 && (
              <Alert color="green" variant="light">
                🎉 <strong>Xuất sắc!</strong> Tỷ lệ hoàn thành {Math.round(analytics.completionRate)}% rất ấn tượng. Bạn có khả năng quản lý thời gian rất tốt!
              </Alert>
            )}
            
            {analytics.streakCount >= 7 && (
              <Alert color="blue" variant="light">
                🔥 <strong>Streak tuyệt vời!</strong> {analytics.streakCount} ngày liên tiếp hoàn thành task. Hãy duy trì đà này!
              </Alert>
            )}
            
            {analytics.procrastinationScore > 60 && (
              <Alert color="orange" variant="light">
                ⚠️ <strong>Cẩn thận!</strong> Chỉ số trì hoãn cao ({Math.round(analytics.procrastinationScore)}%). Hãy thử phương pháp Pomodoro hoặc chia nhỏ các task lớn.
              </Alert>
            )}
            
            {/* Procrastination Analysis Insights */}
            {procrastinationInsights.recommendations.length > 0 && (
              <Card withBorder>
                <Stack gap="md">
                  <Group>
                    <ThemeIcon color="orange" variant="light">
                      <IconBrain size={20} />
                    </ThemeIcon>
                    <Text fw={600}>🤖 AI Phân tích Procrastination</Text>
                  </Group>
                  
                  <Group gap="xs">
                    <Text size="sm">Xu hướng gần đây:</Text>
                    <Badge 
                      color={procrastinationInsights.trend === 'improving' ? 'green' : 
                             procrastinationInsights.trend === 'worsening' ? 'red' : 'blue'}
                    >
                      {procrastinationInsights.trend === 'improving' ? '📈 Đang tiến bộ' :
                       procrastinationInsights.trend === 'worsening' ? '📉 Cần chú ý' : '➡️ Ổn định'}
                    </Badge>
                  </Group>
                  
                  <Group gap="lg">
                    <div>
                      <Text size="xs" c="dimmed">Trung bình chậm deadline</Text>
                      <Text fw={500}>{procrastinationInsights.averageDelay.toFixed(1)}%</Text>
                    </div>
                    <div>
                      <Text size="xs" c="dimmed">Loại task khó nhất</Text>
                      <Text fw={500}>{procrastinationInsights.worstTaskType}</Text>
                    </div>
                    <div>
                      <Text size="xs" c="dimmed">Loại task dễ nhất</Text>
                      <Text fw={500}>{procrastinationInsights.bestTaskType}</Text>
                    </div>
                  </Group>
                  
                  <div>
                    <Text size="sm" fw={500} mb="xs">💡 Gợi ý cải thiện:</Text>
                    <Stack gap="xs">
                      {procrastinationInsights.recommendations.map((rec, index) => (
                        <Alert key={index} color="blue" variant="light" size="sm">
                          {rec}
                        </Alert>
                      ))}
                    </Stack>
                  </div>
                </Stack>
              </Card>
            )}
            
            {analytics.bestWorkingHours.includes(9) && (
              <Alert color="purple" variant="light">
                ☀️ <strong>Morning Person!</strong> Bạn làm việc hiệu quả vào buổi sáng. Hãy tận dụng thời gian này cho các task quan trọng!
              </Alert>
            )}
            
            {analytics.bestWorkingHours.some(hour => hour >= 20) && (
              <Alert color="indigo" variant="light">
                🌙 <strong>Night Owl!</strong> Bạn làm việc tốt vào buổi tối. Đảm bảo nghỉ ngơi đủ giấc nhé!
              </Alert>
            )}
            
            {analytics.totalTasks === 0 && (
              <Alert color="gray" variant="light">
                📝 <strong>Bắt đầu hành trình!</strong> Thêm một số task để AI có thể phân tích thói quen làm việc của bạn.
              </Alert>
            )}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}

export default AnalyticsView;
