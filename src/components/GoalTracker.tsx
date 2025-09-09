import { useState, useEffect } from 'react';
import {
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Button,
  Progress,
  Badge,
  Card,
  ActionIcon,
  Modal,
  TextInput,
  NumberInput,
  Select,
  Textarea,
  Grid,
  Alert
} from '@mantine/core';
import { 
  IconTarget,
  IconPlus,
  IconEdit,
  IconTrash,
  IconTrophy,
  IconCalendar,
  IconBulb,
  IconFlame,
  IconStar
} from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useEventStore } from '../store/eventStore';
import dayjs from 'dayjs';

interface Goal {
  id: string;
  title: string;
  description?: string;
  category: 'academic' | 'personal' | 'fitness' | 'skill' | 'habit';
  type: 'daily' | 'weekly' | 'monthly' | 'one-time';
  target: number;
  current: number;
  unit: string;
  startDate: Date;
  endDate?: Date;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'paused' | 'failed';
  streak: number;
  lastUpdated: Date;
}

export function GoalTracker() {
  const { events } = useEventStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      category: 'academic' as Goal['category'],
      type: 'weekly' as Goal['type'],
      target: 1,
      unit: 'hours',
      startDate: new Date(),
      endDate: null as Date | null,
      priority: 'medium' as Goal['priority']
    }
  });

  // Load goals from localStorage
  useEffect(() => {
    const savedGoals = localStorage.getItem('academic-planner-goals');
    if (savedGoals) {
      try {
        const parsed = JSON.parse(savedGoals);
        setGoals(parsed.map((goal: any) => ({
          ...goal,
          startDate: new Date(goal.startDate),
          endDate: goal.endDate ? new Date(goal.endDate) : undefined,
          lastUpdated: new Date(goal.lastUpdated)
        })));
      } catch (error) {
        console.error('Error loading goals:', error);
      }
    }
  }, []);

  // Save goals to localStorage
  useEffect(() => {
    localStorage.setItem('academic-planner-goals', JSON.stringify(goals));
  }, [goals]);

  // Auto-update academic goals based on events
  useEffect(() => {
    const updateAcademicGoals = () => {
      const now = dayjs();
      
      setGoals(prevGoals => prevGoals.map(goal => {
        if (goal.category !== 'academic' || goal.status !== 'active') return goal;

        let newCurrent = goal.current;
        
        // Calculate progress for different goal types
        if (goal.type === 'daily') {
          const todayEvents = events.filter(event =>
            dayjs(event.startTime).isSame(now, 'day') && 
            event.status === 'done'
          );
          
          if (goal.unit === 'tasks') {
            newCurrent = todayEvents.length;
          } else if (goal.unit === 'hours') {
            newCurrent = todayEvents.reduce((total, event) => 
              total + (event.actualTime || event.estimatedTime || 0), 0
            );
          }
        } else if (goal.type === 'weekly') {
          const weekStart = now.startOf('week');
          const weekEvents = events.filter(event =>
            dayjs(event.startTime).isAfter(weekStart) && 
            dayjs(event.startTime).isBefore(now) &&
            event.status === 'done'
          );
          
          if (goal.unit === 'tasks') {
            newCurrent = weekEvents.length;
          } else if (goal.unit === 'hours') {
            newCurrent = weekEvents.reduce((total, event) => 
              total + (event.actualTime || event.estimatedTime || 0), 0
            );
          }
        }

        return {
          ...goal,
          current: newCurrent,
          lastUpdated: new Date()
        };
      }));
    };

    updateAcademicGoals();
  }, [events]);

  const handleSubmit = (values: typeof form.values) => {
    const goal: Goal = {
      id: editingGoal?.id || Date.now().toString(),
      title: values.title,
      description: values.description,
      category: values.category,
      type: values.type,
      target: values.target,
      current: editingGoal?.current || 0,
      unit: values.unit,
      startDate: values.startDate,
      endDate: values.endDate || undefined,
      priority: values.priority,
      status: 'active',
      streak: editingGoal?.streak || 0,
      lastUpdated: new Date()
    };

    if (editingGoal) {
      setGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
      notifications.show({
        title: 'Cập nhật thành công',
        message: 'Mục tiêu đã được cập nhật',
        color: 'blue'
      });
    } else {
      setGoals(prev => [...prev, goal]);
      notifications.show({
        title: 'Tạo mục tiêu thành công',
        message: 'Mục tiêu mới đã được thêm vào danh sách',
        color: 'green'
      });
    }

    setIsFormOpen(false);
    setEditingGoal(null);
    form.reset();
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    form.setValues({
      title: goal.title,
      description: goal.description || '',
      category: goal.category,
      type: goal.type,
      target: goal.target,
      unit: goal.unit,
      startDate: goal.startDate,
      endDate: goal.endDate || null,
      priority: goal.priority
    });
    setIsFormOpen(true);
  };

  const handleDelete = (goalId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa mục tiêu này?')) {
      setGoals(prev => prev.filter(g => g.id !== goalId));
      notifications.show({
        title: 'Đã xóa',
        message: 'Mục tiêu đã được xóa',
        color: 'red'
      });
    }
  };

  const updateProgress = (goalId: string, increment: number) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id !== goalId) return goal;
      
      const newCurrent = Math.max(0, goal.current + increment);
      const isCompleted = newCurrent >= goal.target;
      
      if (isCompleted && goal.status !== 'completed') {
        notifications.show({
          title: '🎉 Chúc mừng!',
          message: `Bạn đã hoàn thành mục tiêu "${goal.title}"!`,
          color: 'green',
          autoClose: 8000
        });
      }

      return {
        ...goal,
        current: newCurrent,
        status: isCompleted ? 'completed' : goal.status,
        streak: isCompleted ? goal.streak + 1 : goal.streak,
        lastUpdated: new Date()
      };
    }));
  };

  const getCategoryIcon = (category: Goal['category']) => {
    switch (category) {
      case 'academic': return IconTarget;
      case 'personal': return IconStar;
      case 'fitness': return IconFlame;
      case 'skill': return IconBulb;
      case 'habit': return IconCalendar;
      default: return IconTarget;
    }
  };

  const getCategoryColor = (category: Goal['category']) => {
    switch (category) {
      case 'academic': return 'blue';
      case 'personal': return 'green';
      case 'fitness': return 'red';
      case 'skill': return 'orange';
      case 'habit': return 'purple';
      default: return 'gray';
    }
  };

  const getProgress = (goal: Goal) => {
    return Math.min((goal.current / goal.target) * 100, 100);
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <Group>
            <IconTrophy size={24} color="#ffd43b" />
            <Title order={3}>🎯 Mục tiêu & Thành tựu</Title>
          </Group>
          
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setIsFormOpen(true)}
            variant="light"
          >
            Thêm mục tiêu
          </Button>
        </Group>

        {/* Summary Stats */}
        <Grid>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Card withBorder p="sm" radius="sm" ta="center">
              <Text size="xl" fw={700} c="blue">{activeGoals.length}</Text>
              <Text size="sm" c="dimmed">Đang thực hiện</Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Card withBorder p="sm" radius="sm" ta="center">
              <Text size="xl" fw={700} c="green">{completedGoals.length}</Text>
              <Text size="sm" c="dimmed">Đã hoàn thành</Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Card withBorder p="sm" radius="sm" ta="center">
              <Text size="xl" fw={700} c="orange">
                {goals.reduce((total, goal) => total + goal.streak, 0)}
              </Text>
              <Text size="sm" c="dimmed">Tổng chuỗi</Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Card withBorder p="sm" radius="sm" ta="center">
              <Text size="xl" fw={700} c="purple">
                {Math.round(goals.length > 0 ? 
                  goals.reduce((total, goal) => total + getProgress(goal), 0) / goals.length : 0
                )}%
              </Text>
              <Text size="sm" c="dimmed">Tiến độ TB</Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Goals List */}
        {activeGoals.length > 0 ? (
          <Stack gap="md">
            {activeGoals.map(goal => {
              const Icon = getCategoryIcon(goal.category);
              const progress = getProgress(goal);
              
              return (
                <Card key={goal.id} withBorder p="md" radius="md">
                  <Stack gap="md">
                    {/* Goal Header */}
                    <Group justify="space-between">
                      <Group>
                        <Icon size={20} color={getCategoryColor(goal.category)} />
                        <Stack gap="xs">
                          <Text fw={500}>{goal.title}</Text>
                          {goal.description && (
                            <Text size="sm" c="dimmed">{goal.description}</Text>
                          )}
                        </Stack>
                      </Group>
                      
                      <Group gap="xs">
                        <Badge color={getCategoryColor(goal.category)} size="sm">
                          {goal.category}
                        </Badge>
                        <Badge color="gray" size="sm">
                          {goal.type}
                        </Badge>
                        <ActionIcon 
                          variant="light" 
                          size="sm"
                          onClick={() => handleEdit(goal)}
                        >
                          <IconEdit size={14} />
                        </ActionIcon>
                        <ActionIcon 
                          variant="light" 
                          color="red" 
                          size="sm"
                          onClick={() => handleDelete(goal.id)}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Group>
                    </Group>

                    {/* Progress */}
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="sm">
                          {goal.current} / {goal.target} {goal.unit}
                        </Text>
                        <Text size="sm" fw={500}>
                          {progress.toFixed(1)}%
                        </Text>
                      </Group>
                      <Progress 
                        value={progress} 
                        color={getCategoryColor(goal.category)}
                        size="lg"
                        radius="xl"
                      />
                    </Stack>

                    {/* Manual Progress Update */}
                    <Group justify="space-between">
                      <Group gap="xs">
                        <Button
                          size="xs"
                          variant="light"
                          onClick={() => updateProgress(goal.id, -1)}
                          disabled={goal.current <= 0}
                        >
                          -1
                        </Button>
                        <Button
                          size="xs"
                          variant="light"
                          onClick={() => updateProgress(goal.id, 1)}
                          disabled={goal.current >= goal.target}
                        >
                          +1
                        </Button>
                      </Group>
                      
                      {goal.streak > 0 && (
                        <Group gap="xs">
                          <IconFlame size={16} color="#fa5252" />
                          <Text size="sm" c="orange">
                            {goal.streak} chuỗi
                          </Text>
                        </Group>
                      )}
                    </Group>
                  </Stack>
                </Card>
              );
            })}
          </Stack>
        ) : (
          <Alert icon={<IconTarget size={16} />} color="blue">
            Chưa có mục tiêu nào. Hãy tạo mục tiêu đầu tiên để bắt đầu!
          </Alert>
        )}

        {/* Goal Form Modal */}
        <Modal
          opened={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingGoal(null);
            form.reset();
          }}
          title={editingGoal ? 'Chỉnh sửa mục tiêu' : 'Tạo mục tiêu mới'}
          size="md"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Tiêu đề mục tiêu"
                placeholder="Ví dụ: Học 2 giờ mỗi ngày"
                required
                {...form.getInputProps('title')}
              />
              
              <Textarea
                label="Mô tả (tùy chọn)"
                placeholder="Mô tả chi tiết về mục tiêu..."
                {...form.getInputProps('description')}
              />
              
              <Grid>
                <Grid.Col span={6}>
                  <Select
                    label="Danh mục"
                    data={[
                      { value: 'academic', label: 'Học tập' },
                      { value: 'personal', label: 'Cá nhân' },
                      { value: 'fitness', label: 'Sức khỏe' },
                      { value: 'skill', label: 'Kỹ năng' },
                      { value: 'habit', label: 'Thói quen' }
                    ]}
                    {...form.getInputProps('category')}
                  />
                </Grid.Col>
                
                <Grid.Col span={6}>
                  <Select
                    label="Loại mục tiêu"
                    data={[
                      { value: 'daily', label: 'Hàng ngày' },
                      { value: 'weekly', label: 'Hàng tuần' },
                      { value: 'monthly', label: 'Hàng tháng' },
                      { value: 'one-time', label: 'Một lần' }
                    ]}
                    {...form.getInputProps('type')}
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={6}>
                  <NumberInput
                    label="Mục tiêu"
                    placeholder="Số lượng"
                    min={1}
                    required
                    {...form.getInputProps('target')}
                  />
                </Grid.Col>
                
                <Grid.Col span={6}>
                  <Select
                    label="Đơn vị"
                    data={[
                      { value: 'hours', label: 'Giờ' },
                      { value: 'tasks', label: 'Nhiệm vụ' },
                      { value: 'pages', label: 'Trang' },
                      { value: 'exercises', label: 'Bài tập' },
                      { value: 'days', label: 'Ngày' }
                    ]}
                    {...form.getInputProps('unit')}
                  />
                </Grid.Col>
              </Grid>

              <DatePickerInput
                label="Ngày bắt đầu"
                {...form.getInputProps('startDate')}
              />

              <Select
                label="Độ ưu tiên"
                data={[
                  { value: 'high', label: 'Cao' },
                  { value: 'medium', label: 'Trung bình' },
                  { value: 'low', label: 'Thấp' }
                ]}
                {...form.getInputProps('priority')}
              />

              <Group justify="flex-end" gap="xs">
                <Button
                  variant="light"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingGoal(null);
                    form.reset();
                  }}
                >
                  Hủy
                </Button>
                <Button type="submit">
                  {editingGoal ? 'Cập nhật' : 'Tạo mục tiêu'}
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>
      </Stack>
    </Paper>
  );
}
