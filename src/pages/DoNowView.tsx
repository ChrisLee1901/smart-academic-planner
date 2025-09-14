import { useState, useMemo } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  Group,
  Badge,
  Button,
  Progress,
  Paper,
  Alert,
  Divider,
  Grid,
  ThemeIcon
} from '@mantine/core';
import { 
  IconClock, 
  IconAlertTriangle, 
  IconBrain,
  IconTarget,
  IconFlame,
  IconCheckbox,
  IconBolt,
  IconTrendingUp
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useEventStore } from '../store/eventStore';
import type { AcademicEvent } from '../types';
import dayjs from '../utils/dayjs';

interface TaskWithPriority extends AcademicEvent {
  aiPriorityScore: number;
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
  procrastinationRisk: number;
  timeToDeadline: number;
  estimatedEffort: number;
}

export function DoNowView() {
  const { events, updateEvent } = useEventStore();
  const [completingTask, setCompletingTask] = useState<string | null>(null);

  // AI-powered task prioritization algorithm
  const prioritizedTasks = useMemo(() => {
    const now = dayjs();
    
    return events
      .filter(event => event.status !== 'done')
      .map((event): TaskWithPriority => {
        const deadline = dayjs(event.startTime);
        const timeToDeadline = deadline.diff(now, 'hour');
        
        // AI scoring factors
        const urgencyScore = Math.max(0, 100 - timeToDeadline / 24); // Higher score for closer deadlines
        const typeMultiplier = {
          'deadline': 1.5,
          'project': 1.3,
          'class': 1.0,
          'personal': 0.8
        }[event.type];
        
        const priorityMultiplier = {
          'high': 1.4,
          'medium': 1.0,
          'low': 0.7
        }[event.priority || 'medium'];
        
        // Procrastination risk (higher for deadlines, projects)
        const procrastinationRisk = event.type === 'deadline' ? 85 : 
                                   event.type === 'project' ? 70 : 45;
        
        // Estimated effort (mock AI prediction)
        const estimatedEffort = event.type === 'project' ? 4 : 
                               event.type === 'deadline' ? 2 : 1;
        
        const aiPriorityScore = urgencyScore * typeMultiplier * priorityMultiplier;
        
        let urgencyLevel: 'critical' | 'high' | 'medium' | 'low' = 'low';
        if (timeToDeadline < 24) urgencyLevel = 'critical';
        else if (timeToDeadline < 72) urgencyLevel = 'high';
        else if (timeToDeadline < 168) urgencyLevel = 'medium';
        
        return {
          ...event,
          aiPriorityScore,
          urgencyLevel,
          procrastinationRisk,
          timeToDeadline,
          estimatedEffort
        };
      })
      .sort((a, b) => b.aiPriorityScore - a.aiPriorityScore);
  }, [events]);

  const handleCompleteTask = async (task: TaskWithPriority) => {
    setCompletingTask(task.id);
    try {
      await updateEvent(task.id, { ...task, status: 'done' });
      notifications.show({
        title: '🎉 Hoàn thành!',
        message: `Bạn đã hoàn thành "${task.title}". Tuyệt vời!`,
        color: 'green'
      });
    } catch (error) {
      notifications.show({
        title: 'Lỗi',
        message: 'Không thể cập nhật trạng thái task',
        color: 'red'
      });
    } finally {
      setCompletingTask(null);
    }
  };

  const handleStartTask = async (task: TaskWithPriority) => {
    try {
      await updateEvent(task.id, { ...task, status: 'in-progress' });
      notifications.show({
        title: '▶️ Bắt đầu!',
        message: `Đã bắt đầu làm "${task.title}"`,
        color: 'blue'
      });
    } catch (error) {
      notifications.show({
        title: 'Lỗi',
        message: 'Không thể cập nhật trạng thái task',
        color: 'red'
      });
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      default: return 'blue';
    }
  };

  const getTimeDisplay = (hours: number) => {
    if (hours < 0) return 'Quá hạn';
    if (hours < 24) return `${Math.round(hours)} giờ nữa`;
    const days = Math.round(hours / 24);
    return `${days} ngày nữa`;
  };

  const criticalTasks = prioritizedTasks.filter(t => t.urgencyLevel === 'critical');
  const highPriorityTasks = prioritizedTasks.filter(t => t.urgencyLevel === 'high');
  const otherTasks = prioritizedTasks.filter(t => !['critical', 'high'].includes(t.urgencyLevel));

  return (
    <Container size="lg" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Paper p="lg" withBorder radius="md" bg="gradient-to-r from-blue-50 to-indigo-50">
          <Group gap="md">
            <ThemeIcon size={48} radius="md" variant="gradient" gradient={{ from: 'blue', to: 'indigo' }}>
              <IconBrain size={24} />
            </ThemeIcon>
            <div>
              <Title order={1} c="blue">Làm Ngay</Title>
              <Text c="dimmed" size="lg">
                AI sắp xếp theo độ ưu tiên và thói quen trì hoãn của bạn
              </Text>
            </div>
          </Group>
        </Paper>

        {/* AI Insights */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card padding="lg" withBorder>
              <Group gap="xs" mb="sm">
                <IconBolt size={20} color="orange" />
                <Text fw={600}>Thống kê AI</Text>
              </Group>
              <Stack gap="xs">
                <Text size="sm">
                  <strong>{prioritizedTasks.length}</strong> task đang chờ
                </Text>
                <Text size="sm">
                  <strong>{criticalTasks.length}</strong> task khẩn cấp
                </Text>
                <Text size="sm">
                  <strong>{Math.round(prioritizedTasks.reduce((acc, t) => acc + t.procrastinationRisk, 0) / prioritizedTasks.length)}%</strong> risk trì hoãn trung bình
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card padding="lg" withBorder>
              <Group gap="xs" mb="sm">
                <IconTrendingUp size={20} color="blue" />
                <Text fw={600}>Khuyến nghị AI</Text>
              </Group>
              <Text size="sm">
                {criticalTasks.length > 0 
                  ? `🚨 Tập trung vào ${criticalTasks.length} task khẩn cấp trước. Đừng để trì hoãn!`
                  : highPriorityTasks.length > 0
                  ? `⚡ Bắt đầu với các task ưu tiên cao. Bạn có thể hoàn thành trong hôm nay!`
                  : `✨ Tuyệt vời! Không có task khẩn cấp. Thời gian tốt để làm các task dài hạn.`
                }
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Critical Tasks */}
        {criticalTasks.length > 0 && (
          <Stack gap="md">
            <Alert 
              icon={<IconAlertTriangle size={16} />}
              title="🚨 KHẨN CẤP - Làm ngay!"
              color="red"
              variant="light"
            >
              Các task này sắp quá hạn. AI khuyến nghị ưu tiên tuyệt đối!
            </Alert>
            
            {criticalTasks.map((task) => (
              <Card key={task.id} padding="lg" withBorder radius="md" 
                    style={{ borderLeft: '4px solid var(--mantine-color-red-6)' }}>
                <Stack gap="sm">
                  <Group justify="space-between" align="flex-start">
                    <div style={{ flex: 1 }}>
                      <Group gap="sm" mb="xs">
                        <Text fw={700} size="lg" c="red">
                          {task.title}
                        </Text>
                        <Badge color="red" variant="filled">
                          KHẨN CẤP
                        </Badge>
                        <Badge color={getUrgencyColor(task.urgencyLevel)} variant="light">
                          AI Score: {Math.round(task.aiPriorityScore)}
                        </Badge>
                      </Group>
                      
                      <Group gap="md" mb="sm">
                        <Group gap="xs">
                          <IconClock size={14} />
                          <Text size="sm" c="red" fw={600}>
                            {getTimeDisplay(task.timeToDeadline)}
                          </Text>
                        </Group>
                        {task.realisticDeadline && (
                          <Group gap="xs">
                            <Text size="xs" c="dimmed">AI deadline:</Text>
                            <Text size="sm" c="orange" fw={500}>
                              {dayjs(task.realisticDeadline).format('DD/MM HH:mm')}
                            </Text>
                          </Group>
                        )}
                        <Text size="sm" c="dimmed">
                          Effort: {task.estimatedEffort}h
                        </Text>
                        <Text size="sm" c="orange">
                          Risk trì hoãn: {task.procrastinationRisk}%
                        </Text>
                      </Group>
                      
                      <Progress 
                        value={task.procrastinationRisk} 
                        color="red" 
                        size="sm" 
                        mb="sm"
                      />
                      
                      {task.description && (
                        <Text size="sm" lineClamp={2}>
                          {task.description}
                        </Text>
                      )}
                    </div>
                  </Group>
                  
                  <Group gap="xs">
                    <Button 
                      leftSection={<IconTarget size={16} />}
                      color="red"
                      onClick={() => handleStartTask(task)}
                      disabled={task.status === 'in-progress'}
                    >
                      {task.status === 'in-progress' ? 'Đang làm' : 'Bắt đầu ngay'}
                    </Button>
                    
                    <Button 
                      leftSection={<IconCheckbox size={16} />}
                      variant="light"
                      color="green"
                      onClick={() => handleCompleteTask(task)}
                      loading={completingTask === task.id}
                    >
                      Hoàn thành
                    </Button>
                  </Group>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}

        {/* High Priority Tasks */}
        {highPriorityTasks.length > 0 && (
          <Stack gap="md">
            <Divider 
              label={
                <Group gap="xs">
                  <IconFlame size={16} color="orange" />
                  <Text fw={600} c="orange">Ưu tiên cao</Text>
                </Group>
              }
              labelPosition="left"
            />
            
            {highPriorityTasks.map((task) => (
              <Card key={task.id} padding="md" withBorder radius="md" 
                    style={{ borderLeft: '4px solid var(--mantine-color-orange-6)' }}>
                <Group justify="space-between" align="flex-start">
                  <div style={{ flex: 1 }}>
                    <Group gap="sm" mb="xs">
                      <Text fw={600} size="md">
                        {task.title}
                      </Text>
                      <Badge color="orange" variant="light">
                        Ưu tiên cao
                      </Badge>
                      <Badge size="sm" variant="outline">
                        AI: {Math.round(task.aiPriorityScore)}
                      </Badge>
                    </Group>
                    
                    <Group gap="md" mb="xs">
                      <Group gap="xs">
                        <IconClock size={14} />
                        <Text size="sm">
                          {getTimeDisplay(task.timeToDeadline)}
                        </Text>
                      </Group>
                      <Text size="sm" c="dimmed">
                        {task.estimatedEffort}h • Risk: {task.procrastinationRisk}%
                      </Text>
                    </Group>
                  </div>
                  
                  <Group gap="xs">
                    <Button 
                      size="sm"
                      variant="light"
                      onClick={() => handleStartTask(task)}
                      disabled={task.status === 'in-progress'}
                    >
                      {task.status === 'in-progress' ? 'Đang làm' : 'Bắt đầu'}
                    </Button>
                    
                    <Button 
                      size="sm"
                      variant="subtle"
                      color="green"
                      onClick={() => handleCompleteTask(task)}
                      loading={completingTask === task.id}
                    >
                      ✓
                    </Button>
                  </Group>
                </Group>
              </Card>
            ))}
          </Stack>
        )}

        {/* Other Tasks */}
        {otherTasks.length > 0 && (
          <Stack gap="md">
            <Divider 
              label={<Text fw={600} c="dimmed">Các task khác</Text>}
              labelPosition="left"
            />
            
            <Stack gap="xs">
              {otherTasks.map((task) => (
                <Card key={task.id} padding="sm" withBorder radius="md">
                  <Group justify="space-between" align="center">
                    <div>
                      <Text size="sm" fw={500}>{task.title}</Text>
                      <Text size="xs" c="dimmed">
                        {getTimeDisplay(task.timeToDeadline)} • {task.estimatedEffort}h
                      </Text>
                    </div>
                    
                    <Group gap="xs">
                      <Badge size="xs" color={getUrgencyColor(task.urgencyLevel)} variant="light">
                        {Math.round(task.aiPriorityScore)}
                      </Badge>
                      <Button 
                        size="xs" 
                        variant="subtle"
                        onClick={() => handleCompleteTask(task)}
                        loading={completingTask === task.id}
                      >
                        ✓
                      </Button>
                    </Group>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Stack>
        )}

        {prioritizedTasks.length === 0 && (
          <Paper p="xl" ta="center" withBorder>
            <Stack align="center" gap="md">
              <IconCheckbox size={48} color="green" />
              <Text size="lg" fw={600} c="green">
                Tuyệt vời! Bạn đã hoàn thành tất cả task!
              </Text>
              <Text c="dimmed">
                Thời gian nghỉ ngơi hoặc lên kế hoạch cho các task mới.
              </Text>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
