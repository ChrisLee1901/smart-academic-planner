import { 
  Container,
  Title,
  Text,
  Button,
  Grid,
  Paper,
  Group,
  Badge,
  Stack,
  SimpleGrid,
  Card,
  ThemeIcon,
  Progress,
  Box,
} from '@mantine/core';
import {
  IconCalendarEvent,
  IconClock,
  IconAlertTriangle,
  IconCheck,
  IconBrain,
} from '@tabler/icons-react';
import { StudyScheduleGenerator } from '../components/StudyScheduleGenerator';
import { PomodoroTimer } from '../components/PomodoroTimer';
import { GoalTracker } from '../components/GoalTracker';
import { HabitTracker } from '../components/HabitTracker';
import { ProductivityAnalytics } from '../components/ProductivityAnalytics';
import { AIStudyAssistant } from '../components/AIStudyAssistant';
import { useEventStore } from '../store/eventStore';
import { getDaysUntil } from '../utils/dateUtils';

interface DashboardProps {
  onTabChange: (tab: string) => void;
}

export function Dashboard({ onTabChange }: DashboardProps) {
  const { events } = useEventStore();

  const handleGoToAnalytics = () => {
    onTabChange('analytics');
  };

  const handleGoToCalendar = () => {
    onTabChange('calendar');
  };

  // Statistics
  const totalEvents = events.length;
  const completedEvents = events.filter(e => e.status === 'done').length;
  const upcomingEvents = events.filter(e => e.status !== 'done' && getDaysUntil(e.startTime) >= 0).length;
  const overdueEvents = events.filter(e => e.status !== 'done' && getDaysUntil(e.startTime) < 0).length;
  const completionRate = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;

  // Upcoming events (next 7 days)
  const upcomingThisWeek = events
    .filter(e => {
      const days = getDaysUntil(e.startTime);
      return days >= 0 && days <= 7 && e.status !== 'done';
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5);

  // Recent completed events
  const recentCompleted = events
    .filter(e => e.status === 'done')
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 3);

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Box ta="center">
          <Title order={1} mb="xs">
            🎯 Dashboard
          </Title>
          <Text c="dimmed" size="lg">
            Chào mừng bạn quay trở lại! Hãy xem tình hình học tập hôm nay.
          </Text>
        </Box>

        {/* Statistics Cards */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
          <Card withBorder padding="lg" radius="md">
            <Group justify="apart" mb="xs">
              <Text size="sm" c="dimmed" fw={500}>Tổng sự kiện</Text>
              <ThemeIcon variant="light" color="blue" size="sm">
                <IconCalendarEvent size={16} />
              </ThemeIcon>
            </Group>
            <Text size="xl" fw={700} c="blue">{totalEvents}</Text>
          </Card>

          <Card withBorder padding="lg" radius="md">
            <Group justify="apart" mb="xs">
              <Text size="sm" c="dimmed" fw={500}>Đã hoàn thành</Text>
              <ThemeIcon variant="light" color="green" size="sm">
                <IconCheck size={16} />
              </ThemeIcon>
            </Group>
            <Text size="xl" fw={700} c="green">{completedEvents}</Text>
          </Card>

          <Card withBorder padding="lg" radius="md">
            <Group justify="apart" mb="xs">
              <Text size="sm" c="dimmed" fw={500}>Sắp tới</Text>
              <ThemeIcon variant="light" color="yellow" size="sm">
                <IconClock size={16} />
              </ThemeIcon>
            </Group>
            <Text size="xl" fw={700} c="yellow">{upcomingEvents}</Text>
          </Card>

          <Card withBorder padding="lg" radius="md">
            <Group justify="apart" mb="xs">
              <Text size="sm" c="dimmed" fw={500}>Quá hạn</Text>
              <ThemeIcon variant="light" color="red" size="sm">
                <IconAlertTriangle size={16} />
              </ThemeIcon>
            </Group>
            <Text size="xl" fw={700} c="red">{overdueEvents}</Text>
          </Card>
        </SimpleGrid>

        {/* Progress Overview */}
        <Paper withBorder p="lg" radius="md">
          <Title order={3} mb="sm">Tỷ lệ hoàn thành</Title>
          <Badge size="lg" color={completionRate >= 80 ? 'green' : completionRate >= 60 ? 'yellow' : 'red'} mb="sm">
            {completionRate}%
          </Badge>
          <Progress value={completionRate} color={completionRate >= 80 ? 'green' : completionRate >= 60 ? 'yellow' : 'red'} />
        </Paper>

        {/* Study Tools Grid */}
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          {/* Study Schedule Generator */}
          <StudyScheduleGenerator />
          
          {/* Pomodoro Timer */}
          <PomodoroTimer />
        </SimpleGrid>

        {/* Upcoming This Week */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Paper withBorder p="md" radius="md">
              <Group mb="md">
                <ThemeIcon variant="light" color="blue">
                  <IconCalendarEvent size={20} />
                </ThemeIcon>
                <Title order={4}>Sự kiện tuần này</Title>
              </Group>
              
              <Stack gap="xs">
                {upcomingThisWeek.length > 0 ? (
                  upcomingThisWeek.map(event => {
                    const daysUntil = getDaysUntil(event.startTime);
                    return (
                      <Paper key={event.id} p="xs" withBorder radius="sm">
                        <Group justify="space-between">
                          <Box>
                            <Text size="sm" fw={500} truncate>{event.title}</Text>
                            <Text size="xs" c="dimmed">{event.course}</Text>
                          </Box>
                          <Badge 
                            color={daysUntil === 0 ? 'red' : daysUntil <= 1 ? 'orange' : 'blue'} 
                            size="sm"
                          >
                            {daysUntil === 0 ? 'Hôm nay' : `${daysUntil} ngày`}
                          </Badge>
                        </Group>
                      </Paper>
                    );
                  })
                ) : (
                  <Text c="dimmed" size="sm" ta="center">
                    Không có sự kiện nào trong tuần này
                  </Text>
                )}
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              {/* Quick Actions */}
              <Paper withBorder p="md" radius="md">
                <Group mb="md">
                  <ThemeIcon variant="light" color="teal">
                    <IconBrain size={20} />
                  </ThemeIcon>
                  <Title order={4}>Thao tác nhanh</Title>
                </Group>
                
                <Stack gap="xs">
                  <Button 
                    variant="light" 
                    fullWidth 
                    color="teal"
                    onClick={handleGoToCalendar}
                  >
                    Xem lịch tuần này
                  </Button>
                  <Button 
                    variant="light" 
                    fullWidth 
                    color="orange"
                    onClick={handleGoToAnalytics}
                  >
                    Phân tích hiệu suất
                  </Button>
                </Stack>
              </Paper>

              {/* Recent Completed */}
              <Paper withBorder p="md" radius="md">
                <Group mb="md">
                  <ThemeIcon variant="light" color="green">
                    <IconCheck size={20} />
                  </ThemeIcon>
                  <Title order={4}>Hoàn thành gần đây</Title>
                </Group>
                
                <Stack gap="xs">
                  {recentCompleted.length > 0 ? (
                    recentCompleted.map(event => (
                      <Paper key={event.id} p="xs" withBorder radius="sm">
                        <Text size="sm" fw={500} truncate>{event.title}</Text>
                        <Text size="xs" c="dimmed">{event.course}</Text>
                      </Paper>
                    ))
                  ) : (
                    <Text c="dimmed" size="sm" ta="center">
                      Chưa có sự kiện nào được hoàn thành
                    </Text>
                  )}
                </Stack>
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>

        {/* New Study Tools Section */}
        <Stack gap="xl" mt="xl">
          <Title order={2} ta="center">🚀 Công cụ hỗ trợ học tập</Title>
          
          {/* AI Study Assistant */}
          <AIStudyAssistant />
          
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            {/* Goal Tracker */}
            <GoalTracker />
            
            {/* Habit Tracker */}
            <HabitTracker />
          </SimpleGrid>
          
          {/* Productivity Analytics */}
          <ProductivityAnalytics />
        </Stack>
      </Stack>
    </Container>
  );
}
