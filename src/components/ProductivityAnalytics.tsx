import { useState, useEffect, useMemo } from 'react';
import {
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Card,
  Grid,
  Select,
  Badge,
  SimpleGrid,
  Alert,
  Progress,
  Box,
  Divider
} from '@mantine/core';
import { 
  IconChartBar,
  IconTrendingUp,
  IconTrendingDown,
  IconTarget,
  IconClock,
  IconFlame,
  IconBrain
} from '@tabler/icons-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useEventStore } from '../store/eventStore';
import dayjs from 'dayjs';

interface ProductivityMetrics {
  totalTasksCompleted: number;
  totalTimeSpent: number;
  averageTaskTime: number;
  completionRate: number;
  productivityTrend: number;
  focusScore: number;
  streakDays: number;
}

interface DailyStats {
  date: string;
  tasksCompleted: number;
  timeSpent: number;
  completionRate: number;
  productivity: number;
}

interface CategoryStats {
  name: string;
  tasks: number;
  time: number;
  color: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

export function ProductivityAnalytics() {
  const { events } = useEventStore();
  const [timeRange, setTimeRange] = useState('7'); // days
  const [habits, setHabits] = useState<any[]>([]);
  const [habitRecords, setHabitRecords] = useState<any[]>([]);

  // Load habit data
  useEffect(() => {
    const savedHabits = localStorage.getItem('academic-planner-habits');
    const savedRecords = localStorage.getItem('academic-planner-habit-records');
    
    if (savedHabits) {
      try {
        setHabits(JSON.parse(savedHabits));
      } catch (error) {
        console.error('Error loading habits:', error);
      }
    }
    
    if (savedRecords) {
      try {
        setHabitRecords(JSON.parse(savedRecords));
      } catch (error) {
        console.error('Error loading habit records:', error);
      }
    }
  }, []);

  const filteredEvents = useMemo(() => {
    const days = parseInt(timeRange);
    const startDate = dayjs().subtract(days, 'day');
    return events.filter(event => dayjs(event.startTime).isAfter(startDate));
  }, [events, timeRange]);

  const metrics: ProductivityMetrics = useMemo(() => {
    const completedEvents = filteredEvents.filter(e => e.status === 'done');
    const totalTasks = filteredEvents.length;
    const totalCompleted = completedEvents.length;
    const totalTime = completedEvents.reduce((sum, e) => sum + (e.actualTime || e.estimatedTime || 0), 0);
    
    // Calculate streak days
    let streak = 0;
    const today = dayjs();
    for (let i = 0; i < 365; i++) {
      const checkDate = today.subtract(i, 'day');
      const dayEvents = events.filter(e => 
        dayjs(e.startTime).isSame(checkDate, 'day') && e.status === 'done'
      );
      
      if (dayEvents.length > 0) {
        streak++;
      } else {
        break;
      }
    }

    // Calculate focus score based on actual vs estimated time
    const focusEvents = completedEvents.filter(e => e.actualTime && e.estimatedTime);
    const focusScore = focusEvents.length > 0 
      ? focusEvents.reduce((sum, e) => {
          const efficiency = Math.min(e.estimatedTime! / e.actualTime!, 1);
          return sum + efficiency;
        }, 0) / focusEvents.length * 100
      : 0;

    // Calculate productivity trend (last 7 days vs previous 7 days)
    const lastWeek = events.filter(e => 
      dayjs(e.startTime).isAfter(dayjs().subtract(7, 'day')) && e.status === 'done'
    ).length;
    
    const previousWeek = events.filter(e => 
      dayjs(e.startTime).isAfter(dayjs().subtract(14, 'day')) &&
      dayjs(e.startTime).isBefore(dayjs().subtract(7, 'day')) &&
      e.status === 'done'
    ).length;

    const trend = previousWeek > 0 ? ((lastWeek - previousWeek) / previousWeek) * 100 : 0;

    return {
      totalTasksCompleted: totalCompleted,
      totalTimeSpent: totalTime,
      averageTaskTime: totalCompleted > 0 ? totalTime / totalCompleted : 0,
      completionRate: totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0,
      productivityTrend: trend,
      focusScore,
      streakDays: streak
    };
  }, [filteredEvents, events]);

  const dailyStats: DailyStats[] = useMemo(() => {
    const days = parseInt(timeRange);
    const stats: DailyStats[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day');
      const dayEvents = events.filter(e => dayjs(e.startTime).isSame(date, 'day'));
      const completedEvents = dayEvents.filter(e => e.status === 'done');
      
      const timeSpent = completedEvents.reduce((sum, e) => 
        sum + (e.actualTime || e.estimatedTime || 0), 0
      );

      stats.push({
        date: date.format('MM/DD'),
        tasksCompleted: completedEvents.length,
        timeSpent: timeSpent,
        completionRate: dayEvents.length > 0 ? (completedEvents.length / dayEvents.length) * 100 : 0,
        productivity: Math.min(completedEvents.length * 10 + timeSpent / 60 * 5, 100)
      });
    }

    return stats;
  }, [events, timeRange]);

  const categoryStats: CategoryStats[] = useMemo(() => {
    const categories = new Map<string, { tasks: number; time: number }>();
    
    filteredEvents.filter(e => e.status === 'done').forEach(event => {
      const category = (event as any).category || event.type || 'Khác';
      const current = categories.get(category) || { tasks: 0, time: 0 };
      categories.set(category, {
        tasks: current.tasks + 1,
        time: current.time + (event.actualTime || event.estimatedTime || 0)
      });
    });

    return Array.from(categories.entries()).map(([name, data], index) => ({
      name,
      tasks: data.tasks,
      time: data.time,
      color: COLORS[index % COLORS.length]
    }));
  }, [filteredEvents]);

  const habitCompletionToday = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');
    const todayRecords = habitRecords.filter(r => r.date === today && r.completed);
    const activeHabits = habits.filter(h => h.isActive);
    
    return activeHabits.length > 0 ? (todayRecords.length / activeHabits.length) * 100 : 0;
  }, [habits, habitRecords]);

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <Group>
            <IconChartBar size={24} color="#228be6" />
            <Title order={3}>📊 Phân tích Năng suất</Title>
          </Group>
          
          <Select
            value={timeRange}
            onChange={(value) => value && setTimeRange(value)}
            data={[
              { value: '7', label: '7 ngày qua' },
              { value: '14', label: '14 ngày qua' },
              { value: '30', label: '30 ngày qua' },
              { value: '90', label: '3 tháng qua' }
            ]}
            w={140}
          />
        </Group>

        {/* Key Metrics */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          <Card withBorder p="md" radius="md" ta="center">
            <Stack gap="xs">
              <IconTarget size={24} color="#40c057" style={{ margin: '0 auto' }} />
              <Text size="xl" fw={700} c="green">
                {metrics.totalTasksCompleted}
              </Text>
              <Text size="sm" c="dimmed">Nhiệm vụ hoàn thành</Text>
            </Stack>
          </Card>

          <Card withBorder p="md" radius="md" ta="center">
            <Stack gap="xs">
              <IconClock size={24} color="#228be6" style={{ margin: '0 auto' }} />
              <Text size="xl" fw={700} c="blue">
                {Math.round(metrics.totalTimeSpent)}h
              </Text>
              <Text size="sm" c="dimmed">Tổng thời gian</Text>
            </Stack>
          </Card>

          <Card withBorder p="md" radius="md" ta="center">
            <Stack gap="xs">
              <IconFlame size={24} color="#fa5252" style={{ margin: '0 auto' }} />
              <Text size="xl" fw={700} c="red">
                {metrics.streakDays}
              </Text>
              <Text size="sm" c="dimmed">Chuỗi ngày</Text>
            </Stack>
          </Card>

          <Card withBorder p="md" radius="md" ta="center">
            <Stack gap="xs">
              <IconBrain size={24} color="#be4bdb" style={{ margin: '0 auto' }} />
              <Text size="xl" fw={700} c="purple">
                {Math.round(metrics.focusScore)}%
              </Text>
              <Text size="sm" c="dimmed">Chỉ số tập trung</Text>
            </Stack>
          </Card>
        </SimpleGrid>

        {/* Progress Indicators */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder p="md" radius="md">
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={500}>Tỷ lệ hoàn thành</Text>
                  <Badge color={metrics.completionRate >= 80 ? 'green' : metrics.completionRate >= 60 ? 'yellow' : 'red'}>
                    {Math.round(metrics.completionRate)}%
                  </Badge>
                </Group>
                <Progress 
                  value={metrics.completionRate} 
                  color={metrics.completionRate >= 80 ? 'green' : metrics.completionRate >= 60 ? 'yellow' : 'red'}
                  size="lg" 
                  radius="xl" 
                />
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder p="md" radius="md">
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={500}>Thói quen hôm nay</Text>
                  <Badge color={habitCompletionToday >= 80 ? 'green' : habitCompletionToday >= 60 ? 'yellow' : 'red'}>
                    {Math.round(habitCompletionToday)}%
                  </Badge>
                </Group>
                <Progress 
                  value={habitCompletionToday} 
                  color={habitCompletionToday >= 80 ? 'green' : habitCompletionToday >= 60 ? 'yellow' : 'red'}
                  size="lg" 
                  radius="xl" 
                />
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Productivity Trend */}
        <Card withBorder p="md" radius="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500}>Xu hướng năng suất</Text>
              <Group gap="xs">
                {metrics.productivityTrend > 0 ? (
                  <IconTrendingUp size={16} color="#40c057" />
                ) : (
                  <IconTrendingDown size={16} color="#fa5252" />
                )}
                <Text 
                  size="sm" 
                  c={metrics.productivityTrend > 0 ? 'green' : 'red'}
                  fw={500}
                >
                  {metrics.productivityTrend > 0 ? '+' : ''}{Math.round(metrics.productivityTrend)}%
                </Text>
              </Group>
            </Group>
          </Stack>
        </Card>

        {/* Charts */}
        {dailyStats.length > 0 ? (
          <Grid>
            {/* Daily Progress Chart */}
            <Grid.Col span={12}>
              <Card withBorder p="md" radius="md">
                <Stack gap="md">
                  <Text fw={500}>Tiến độ theo ngày</Text>
                  <Box h={250}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="tasksCompleted" 
                          stroke="#228be6" 
                          strokeWidth={2}
                          name="Nhiệm vụ hoàn thành"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="completionRate" 
                          stroke="#40c057" 
                          strokeWidth={2}
                          name="Tỷ lệ hoàn thành (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Stack>
              </Card>
            </Grid.Col>

            {/* Time Spent Chart */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder p="md" radius="md">
                <Stack gap="md">
                  <Text fw={500}>Thời gian học tập</Text>
                  <Box h={200}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="timeSpent" fill="#fd7e14" name="Giờ học" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Stack>
              </Card>
            </Grid.Col>

            {/* Category Distribution */}
            {categoryStats.length > 0 && (
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card withBorder p="md" radius="md">
                  <Stack gap="md">
                    <Text fw={500}>Phân bố theo danh mục</Text>
                    <Box h={200}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryStats}
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="tasks"
                            label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {categoryStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    
                    {/* Legend */}
                    <Stack gap="xs">
                      {categoryStats.map((category, index) => (
                        <Group key={index} gap="xs">
                          <Box
                            w={12}
                            h={12}
                            style={{ backgroundColor: category.color, borderRadius: '2px' }}
                          />
                          <Text size="sm">
                            {category.name}: {category.tasks} nhiệm vụ
                          </Text>
                        </Group>
                      ))}
                    </Stack>
                  </Stack>
                </Card>
              </Grid.Col>
            )}
          </Grid>
        ) : (
          <Alert icon={<IconChartBar size={16} />} color="blue">
            Chưa có đủ dữ liệu để hiển thị biểu đồ. Hãy hoàn thành thêm nhiệm vụ để xem phân tích chi tiết!
          </Alert>
        )}

        {/* Insights */}
        <Card withBorder p="md" radius="md">
          <Stack gap="md">
            <Text fw={500}>💡 Thông tin hữu ích</Text>
            <Divider />
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Stack gap="xs">
                <Text size="sm" fw={500}>Thời gian tốt nhất:</Text>
                <Text size="sm" c="dimmed">
                  {metrics.averageTaskTime > 0 
                    ? `Trung bình ${Math.round(metrics.averageTaskTime)} phút/nhiệm vụ`
                    : 'Chưa có dữ liệu'
                  }
                </Text>
              </Stack>
              
              <Stack gap="xs">
                <Text size="sm" fw={500}>Xu hướng:</Text>
                <Text size="sm" c={metrics.productivityTrend > 0 ? 'green' : 'red'}>
                  {metrics.productivityTrend > 0 
                    ? `Tăng ${Math.round(metrics.productivityTrend)}% so với tuần trước`
                    : metrics.productivityTrend < 0
                    ? `Giảm ${Math.round(Math.abs(metrics.productivityTrend))}% so với tuần trước`
                    : 'Không thay đổi so với tuần trước'
                  }
                </Text>
              </Stack>

              <Stack gap="xs">
                <Text size="sm" fw={500}>Hiệu suất tập trung:</Text>
                <Text size="sm" c="dimmed">
                  {metrics.focusScore >= 80 
                    ? 'Xuất sắc! Bạn tập trung rất tốt.'
                    : metrics.focusScore >= 60
                    ? 'Tốt, nhưng có thể cải thiện thêm.'
                    : 'Cần cải thiện khả năng tập trung.'
                  }
                </Text>
              </Stack>

              <Stack gap="xs">
                <Text size="sm" fw={500}>Chuỗi thành tích:</Text>
                <Text size="sm" c="dimmed">
                  {metrics.streakDays > 0 
                    ? `Tuyệt vời! ${metrics.streakDays} ngày liên tiếp.`
                    : 'Hãy bắt đầu xây dựng chuỗi thành tích!'
                  }
                </Text>
              </Stack>
            </SimpleGrid>
          </Stack>
        </Card>
      </Stack>
    </Paper>
  );
}
