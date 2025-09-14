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
import { TaskDetailPanel } from '../components/TaskDetailPanel';
import { StudyScheduleGenerator } from '../components/StudyScheduleGenerator';
import { PomodoroTimer } from '../components/PomodoroTimer';
import { GoalTracker } from '../components/GoalTracker';
import { HabitTracker } from '../components/HabitTracker';
import { ProductivityAnalytics } from '../components/ProductivityAnalytics';
import { EventForm } from '../components/EventForm';
import { IntegratedDashboard } from '../components/IntegratedDashboard';
import { useEventStore } from '../store/eventStore';
import type { AcademicEvent } from '../types';
import { getDaysUntil } from '../utils/dateUtils';
import { integrationService } from '../services/integrationService';

interface DashboardProps {
  onTabChange: (tab: string) => void;
}

export function Dashboard({ onTabChange }: DashboardProps) {
  const { events, addEvent, updateEvent, deleteEvent } = useEventStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AcademicEvent | undefined>();
  const [selectedTask, setSelectedTask] = useState<AcademicEvent | null>(null);
  const [isPanelVisible, setIsPanelVisible] = useState(true);

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
        const updatedEvent = { ...event, status };
        await updateEvent(eventId, updatedEvent);
        
        // Integrate with other systems when task is completed
        if (status === 'done') {
          await integrationService.completeTask(updatedEvent);
        }
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
          <Card 
            withBorder 
            padding="lg" 
            radius="md"
            className="event-card-animated"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 248, 255, 0.7) 100%)',
              backdropFilter: 'blur(10px)',
              borderColor: 'rgba(102, 126, 234, 0.2)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 25px rgba(102, 126, 234, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Group justify="apart" mb="xs">
              <Text size="sm" c="dimmed" fw={500}>Tổng sự kiện</Text>
              <ThemeIcon variant="light" color="blue" size="sm">
                <IconCalendarEvent size={16} />
              </ThemeIcon>
            </Group>
            <Text fw={700} size="xl" style={{ color: '#667eea' }}>{totalEvents}</Text>
          </Card>

          <Card 
            withBorder 
            padding="lg" 
            radius="md"
            className="event-card-animated"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 255, 248, 0.7) 100%)',
              backdropFilter: 'blur(10px)',
              borderColor: 'rgba(102, 187, 106, 0.2)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 25px rgba(102, 187, 106, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Group justify="apart" mb="xs">
              <Text size="sm" c="dimmed" fw={500}>Đã hoàn thành</Text>
              <ThemeIcon variant="light" color="green" size="sm">
                <IconCheck size={16} />
              </ThemeIcon>
            </Group>
            <Text fw={700} size="xl" style={{ color: '#66bb6a' }}>{completedEvents}</Text>
          </Card>

          <Card 
            withBorder 
            padding="lg" 
            radius="md"
            className="event-card-animated"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 248, 240, 0.7) 100%)',
              backdropFilter: 'blur(10px)',
              borderColor: 'rgba(66, 165, 245, 0.2)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 25px rgba(66, 165, 245, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Group justify="apart" mb="xs">
              <Text size="sm" c="dimmed" fw={500}>Sắp tới</Text>
              <ThemeIcon variant="light" color="blue" size="sm">
                <IconClock size={16} />
              </ThemeIcon>
            </Group>
            <Text fw={700} size="xl" style={{ color: '#42a5f5' }}>{upcomingEvents}</Text>
          </Card>

          <Card 
            withBorder 
            padding="lg" 
            radius="md"
            className="event-card-animated"
            style={{
              background: overdueEvents > 0 
                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 245, 245, 0.7) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 248, 248, 0.7) 100%)',
              backdropFilter: 'blur(10px)',
              borderColor: overdueEvents > 0 ? 'rgba(255, 107, 107, 0.3)' : 'rgba(120, 144, 156, 0.2)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              animation: overdueEvents > 0 ? 'urgentPulse 4s infinite' : 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = overdueEvents > 0 
                ? '0 12px 25px rgba(255, 107, 107, 0.2)'
                : '0 12px 25px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Group justify="apart" mb="xs">
              <Text size="sm" c="dimmed" fw={500}>Quá hạn</Text>
              <ThemeIcon 
                variant="light" 
                color="red" 
                size="sm"
                style={{
                  animation: overdueEvents > 0 ? 'urgentPulse 3s infinite' : 'none'
                }}
              >
                <IconAlertTriangle size={16} />
              </ThemeIcon>
            </Group>
            <Text 
              fw={700} 
              size="xl" 
              style={{ 
                color: overdueEvents > 0 ? '#ff6b6b' : '#78909c',
                textShadow: overdueEvents > 0 ? '0 1px 3px rgba(255, 107, 107, 0.2)' : 'none'
              }}
            >
              {overdueEvents}
            </Text>
          </Card>
        </SimpleGrid>

        {/* Completion Rate */}
        <Paper 
          withBorder 
          p="md" 
          radius="md"
          className="event-card-animated"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.7) 100%)',
            backdropFilter: 'blur(10px)',
            borderColor: completionRate >= 80 ? 'rgba(102, 187, 106, 0.3)' : completionRate >= 60 ? 'rgba(66, 165, 245, 0.3)' : 'rgba(255, 107, 107, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          <Group justify="space-between" mb="xs">
            <Text fw={500} style={{
              color: '#2c3e50'
            }}>
              Tỷ lệ hoàn thành
            </Text>
            <Badge 
              color={completionRate >= 80 ? 'green' : completionRate >= 60 ? 'blue' : 'red'}
              variant="light"
              style={{
                animation: 'bounceIn 1s ease-out',
                boxShadow: `0 2px 8px ${completionRate >= 80 ? 'rgba(102, 187, 106, 0.2)' : completionRate >= 60 ? 'rgba(66, 165, 245, 0.2)' : 'rgba(255, 107, 107, 0.2)'}`
              }}
            >
              {completionRate}%
            </Badge>
          </Group>
          <Progress 
            value={completionRate} 
            color={completionRate >= 80 ? 'green' : completionRate >= 60 ? 'blue' : 'red'} 
            size="md"
            radius="xl"
            className="progress-bar-animated"
            style={{
              '--progress-width': `${completionRate}%`
            } as React.CSSProperties}
          />
          <Group justify="center" mt="xs">
            <Text size="xs" c="dimmed">
              {completionRate >= 80 ? '🎉 Xuất sắc!' : completionRate >= 60 ? '👍 Tốt lắm!' : '💪 Cố gắng lên!'}
            </Text>
          </Group>
        </Paper>

        {/* Kanban Board with Detail Panel */}
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Title order={2}>📋 Bảng quản lý nhiệm vụ</Title>
            <Group gap="sm">
              {!isPanelVisible && (
                <Button
                  size="sm"
                  variant="light"
                  color="orange"
                  onClick={() => {
                    setSelectedTask(null);
                    setIsPanelVisible(true);
                  }}
                  leftSection={<IconCalendarEvent size={16} />}
                >
                  📝 Mở Daily Note
                </Button>
              )}
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
          </Group>

          <Grid gutter="md">
            {/* Kanban Columns */}
            <Grid.Col span={{ base: 12, lg: isPanelVisible ? 8 : 12 }}>
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
                    onTaskClick={(task) => {
                      setSelectedTask(task);
                      setIsPanelVisible(true);
                    }}
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
                    onTaskClick={(task) => {
                      setSelectedTask(task);
                      setIsPanelVisible(true);
                    }}
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
                    onTaskClick={(task) => {
                      setSelectedTask(task);
                      setIsPanelVisible(true);
                    }}
                    color="green"
                  />
                </Grid.Col>
              </Grid>
            </Grid.Col>

            {/* Task Detail Panel */}
            {isPanelVisible && (
              <Grid.Col span={{ base: 12, lg: 4 }}>
                <TaskDetailPanel
                  selectedTask={selectedTask}
                  onEdit={handleEditEvent}
                  onDelete={handleDeleteEvent}
                  onStatusChange={handleStatusChange}
                  onClose={() => setIsPanelVisible(false)}
                />
              </Grid.Col>
            )}
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
            <Paper 
              withBorder 
              p="md" 
              radius="md" 
              h="100%"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.8) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(114, 137, 218, 0.15)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}
              className="event-card-animated"
            >
              {/* Animated gradient border */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, rgba(114, 137, 218, 0.6), rgba(102, 126, 234, 0.6), rgba(159, 122, 234, 0.6))',
                  backgroundSize: '400% 400%',
                  animation: 'shimmer 4s ease infinite',
                }}
              />
              
              <Group mb="md">
                <ThemeIcon 
                  variant="light" 
                  color="blue"
                  style={{
                    animation: 'bounceIn 1s ease-out',
                    boxShadow: '0 2px 8px rgba(114, 137, 218, 0.2)'
                  }}
                >
                  <IconClock size={20} />
                </ThemeIcon>
                <Title order={3} style={{ 
                  color: '#2c3e50',
                  fontWeight: 600
                }}>
                  Sự kiện sắp tới (7 ngày)
                </Title>
                {upcomingThisWeek.length > 0 && (
                  <Badge 
                    color="blue" 
                    variant="light"
                    style={{
                      animation: 'slideInRight 0.8s ease-out',
                      boxShadow: '0 1px 4px rgba(114, 137, 218, 0.2)',
                      backgroundColor: 'rgba(114, 137, 218, 0.1)',
                      color: '#2c3e50'
                    }}
                  >
                    {upcomingThisWeek.length} sự kiện
                  </Badge>
                )}
              </Group>
              
              <Stack gap="md">
                {upcomingThisWeek.length > 0 ? (
                  upcomingThisWeek.map((event, index) => (
                    <div
                      key={event.id}
                      style={{
                        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                      }}
                    >
                      <EventCard
                        event={event}
                        onEdit={handleEditEvent}
                        onDelete={handleDeleteEvent}
                        onStatusChange={handleStatusChange}
                      />
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '3rem 1rem',
                      background: 'linear-gradient(135deg, rgba(114, 137, 218, 0.05) 0%, rgba(102, 126, 234, 0.05) 100%)',
                      borderRadius: '12px',
                      border: '2px dashed rgba(114, 137, 218, 0.2)',
                      animation: 'bounceIn 1s ease-out'
                    }}
                  >
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                    <Text 
                      fw={600} 
                      size="lg"
                      style={{
                        color: '#2c3e50'
                      }}
                    >
                      Không có sự kiện nào sắp tới trong 7 ngày!
                    </Text>
                    <Text c="dimmed" size="sm" mt="xs">
                      Bạn có thể thư giãn hoặc lên kế hoạch cho tuần tới
                    </Text>
                  </div>
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
          <Title order={2} ta="center">🚀 Hệ thống Tích hợp Thông minh</Title>
          
          {/* Integrated Dashboard */}
          <IntegratedDashboard />
          
          <Title order={2} ta="center">🛠️ Công cụ hỗ trợ học tập</Title>
          
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
          zIndex={100}
          styles={{
            header: { paddingBottom: '1rem' },
            body: { padding: 0 }
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
