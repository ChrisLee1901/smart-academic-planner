import { useState } from 'react';
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
  Modal,
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
import { EventCard } from '../components/EventCard';
import { KanbanColumn } from '../components/KanbanColumn';
import { StudyScheduleGenerator } from '../components/StudyScheduleGenerator';
import { PomodoroTimer } from '../components/PomodoroTimer';
import { GoalTracker } from '../components/GoalTracker';
import { HabitTracker } from '../components/HabitTracker';
import { ProductivityAnalytics } from '../components/ProductivityAnalytics';
import { AIStudyAssistant } from '../components/AIStudyAssistant';
import { EventForm } from '../components/EventForm';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { useEventStore } from '../store/eventStore';
import type { AcademicEvent } from '../types';
import { getDaysUntil } from '../utils/dateUtils';

interface DashboardProps {
  onTabChange: (tab: string) => void;
}

export function Dashboard({ onTabChange }: DashboardProps) {
  const { events, addEvent, updateEvent, deleteEvent } = useEventStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AcademicEvent | undefined>();

  const handleGoToAnalytics = () => {
    onTabChange('analytics');
  };

  const handleGoToCalendar = () => {
    onTabChange('calendar');
  };

  const handleEditEvent = (event: AcademicEvent) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (eventData: Omit<AcademicEvent, 'id'>) => {
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, { ...eventData, id: editingEvent.id });
      } else {
        await addEvent({ ...eventData, id: Date.now().toString() });
      }
      setIsFormOpen(false);
      setEditingEvent(undefined);
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleQuickAdd = async (eventData: AcademicEvent) => {
    try {
      await addEvent(eventData);
    } catch (error) {
      console.error('Failed to add event:', error);
    }
  };

  const handleStatusChange = async (eventId: string, status: AcademicEvent['status']) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (event) {
        await updateEvent(eventId, { ...event, status });
      }
    } catch (error) {
      console.error('Failed to update event status:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
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
          <Text c="dimmed" size="lg" mb="md">
            Chào mừng bạn quay trở lại! Hãy xem tình hình học tập hôm nay.
          </Text>
          
          {/* Quick Add Button */}
          <Group justify="center" mb="lg">
            <Button
              leftSection={<IconCalendarEvent size={18} />}
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
              size="md"
              onClick={() => setIsFormOpen(true)}
              styles={{
                root: {
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 600,
                }
              }}
            >
              ➕ Tạo nhiệm vụ mới
            </Button>
          </Group>
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
            <Text fw={700} size="xl">{totalEvents}</Text>
          </Card>

          <Card withBorder padding="lg" radius="md">
            <Group justify="apart" mb="xs">
              <Text size="sm" c="dimmed" fw={500}>Đã hoàn thành</Text>
              <ThemeIcon variant="light" color="green" size="sm">
                <IconCheck size={16} />
              </ThemeIcon>
            </Group>
            <Text fw={700} size="xl">{completedEvents}</Text>
          </Card>

          <Card withBorder padding="lg" radius="md">
            <Group justify="apart" mb="xs">
              <Text size="sm" c="dimmed" fw={500}>Sắp tới</Text>
              <ThemeIcon variant="light" color="yellow" size="sm">
                <IconClock size={16} />
              </ThemeIcon>
            </Group>
            <Text fw={700} size="xl">{upcomingEvents}</Text>
          </Card>

          <Card withBorder padding="lg" radius="md">
            <Group justify="apart" mb="xs">
              <Text size="sm" c="dimmed" fw={500}>Quá hạn</Text>
              <ThemeIcon variant="light" color="red" size="sm">
                <IconAlertTriangle size={16} />
              </ThemeIcon>
            </Group>
            <Text fw={700} size="xl" c={overdueEvents > 0 ? 'red' : undefined}>
              {overdueEvents}
            </Text>
          </Card>
        </SimpleGrid>

        {/* Completion Rate */}
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" mb="xs">
            <Text fw={500}>Tỷ lệ hoàn thành</Text>
            <Badge color={completionRate >= 80 ? 'green' : completionRate >= 60 ? 'yellow' : 'red'}>
              {completionRate}%
            </Badge>
          </Group>
          <Progress value={completionRate} color={completionRate >= 80 ? 'green' : completionRate >= 60 ? 'yellow' : 'red'} />
        </Paper>

        {/* Kanban Board */}
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Title order={2}>📋 Bảng quản lý nhiệm vụ</Title>
            <Button
              leftSection={<IconCalendarEvent size={16} />}
              variant="filled"
              color="blue"
              onClick={() => setIsFormOpen(true)}
              size="sm"
            >
              ➕ Thêm nhiệm vụ mới
            </Button>
          </Group>

          <Grid gutter="md">
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <KanbanColumn
                title="📝 Cần làm"
                status="todo"
                events={events.filter(e => e.status === 'todo')}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
                onStatusChange={handleStatusChange}
                onAddEvent={() => setIsFormOpen(true)}
                onQuickAdd={handleQuickAdd}
                color="blue"
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <KanbanColumn
                title="⚡ Đang làm"
                status="in-progress"
                events={events.filter(e => e.status === 'in-progress')}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
                onStatusChange={handleStatusChange}
                onAddEvent={() => setIsFormOpen(true)}
                onQuickAdd={handleQuickAdd}
                color="yellow"
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <KanbanColumn
                title="✅ Hoàn thành"
                status="done"
                events={events.filter(e => e.status === 'done')}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
                onStatusChange={handleStatusChange}
                onAddEvent={() => setIsFormOpen(true)}
                onQuickAdd={handleQuickAdd}
                color="green"
              />
            </Grid.Col>
          </Grid>
        </Stack>

        {/* Study Tools Section */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <StudyScheduleGenerator />
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 4 }}>
            <PomodoroTimer />
          </Grid.Col>
        </Grid>

        <Grid>
          {/* Upcoming This Week */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Paper withBorder p="md" radius="md" h="100%">
              <Group mb="md">
                <ThemeIcon variant="light" color="blue">
                  <IconClock size={20} />
                </ThemeIcon>
                <Title order={3}>Sự kiện sắp tới (7 ngày)</Title>
              </Group>
              
              <Stack gap="md">
                {upcomingThisWeek.length > 0 ? (
                  upcomingThisWeek.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onEdit={handleEditEvent}
                      onDelete={handleDeleteEvent}
                      onStatusChange={handleStatusChange}
                    />
                  ))
                ) : (
                  <Text c="dimmed" ta="center" py="xl">
                    🎉 Không có sự kiện nào sắp tới trong 7 ngày!
                  </Text>
                )}
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Quick Actions & Recent Completed */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="lg">
              {/* Quick Actions */}
              <Paper withBorder p="md" radius="md">
                <Group mb="md">
                  <ThemeIcon variant="light" color="violet">
                    <IconBrain size={20} />
                  </ThemeIcon>
                  <Title order={4}>Hành động nhanh</Title>
                </Group>
                
                <Stack gap="xs">
                  <Button 
                    variant="light" 
                    fullWidth 
                    color="blue"
                    onClick={() => setIsFormOpen(true)}
                    leftSection={<IconCalendarEvent size={16} />}
                  >
                    Tạo sự kiện nhanh
                  </Button>
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

        {/* Event Form Modal */}
        <Modal
          opened={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingEvent(undefined);
          }}
          title={editingEvent ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}
          size="lg"
          centered={true}
          padding="lg"
          zIndex={1000}
          styles={{
            content: {
              position: 'relative',
            },
            inner: {
              paddingLeft: '1rem',
              paddingRight: '1rem',
            }
          }}
        >
          <EventForm
            event={editingEvent}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingEvent(undefined);
            }}
          />
        </Modal>

        {/* Floating Action Button */}
        <FloatingActionButton onAddEvent={handleQuickAdd} />
      </Stack>
    </Container>
  );
}
