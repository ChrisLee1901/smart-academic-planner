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
  IconPlus,
  IconCalendarEvent,
  IconClock,
  IconAlertTriangle,
  IconCheck,
  IconBrain,
} from '@tabler/icons-react';
import { EventCard } from '../components/EventCard';
import { EventForm } from '../components/EventForm';
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

  const handleAddEvent = () => {
    setEditingEvent(undefined);
    setIsFormOpen(true);
  };

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

  const handleFormSubmit = async (eventData: AcademicEvent) => {
    try {
      if (editingEvent) {
        await updateEvent(eventData.id, eventData);
      } else {
        await addEvent(eventData);
      }
      setIsFormOpen(false);
      setEditingEvent(undefined);
    } catch (error) {
      console.error('Failed to save event:', error);
      // Error will be shown via store's error state
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
        <Group justify="space-between" align="center">
          <Box>
            <Title order={1} mb="xs">
              🎯 Dashboard
            </Title>
            <Text c="dimmed" size="lg">
              Chào mừng bạn quay trở lại! Hãy xem tình hình học tập hôm nay.
            </Text>
          </Box>
          
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleAddEvent}
            size="lg"
            variant="gradient"
            gradient={{ from: 'blue', to: 'teal' }}
          >
            Thêm sự kiện mới
          </Button>
        </Group>

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
                    leftSection={<IconPlus size={16} />}
                    onClick={handleAddEvent}
                  >
                    Tạo sự kiện mới
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

        {/* Event Form Modal */}
        <Modal
          opened={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingEvent(undefined);
          }}
          title={editingEvent ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}
          size="lg"
          centered={false}
          padding="lg"
          styles={{
            content: {
              marginLeft: '0px',
              marginRight: 'auto',
              transform: 'translateX(-2000px)',
              maxWidth: '500px'
            },
            inner: {
              justifyContent: 'flex-start',
              alignItems: 'center',
              paddingLeft: '5px',
              paddingRight: '50px'
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
      </Stack>
    </Container>
  );
}
