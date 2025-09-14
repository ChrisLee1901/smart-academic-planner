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
  Alert,
  LoadingOverlay,
  Tooltip
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
  IconStar,
  IconMinus,
  IconCheck
} from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useEventStore } from '../store/eventStore';
import { useGoalStore } from '../store/goalStore';
import { type Goal } from '../services/databaseService';
import dayjs from '../utils/dayjs';

export function GoalTracker() {
  const { events } = useEventStore();
  const { 
    goals, 
    isLoading, 
    error, 
    initialized,
    loadGoals, 
    addGoal, 
    updateGoal, 
    deleteGoal, 
    clearError 
  } = useGoalStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [manuallyUpdatedGoals, setManuallyUpdatedGoals] = useState<Set<string>>(new Set());

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

  // Load goals from database
  useEffect(() => {
    if (!initialized) {
      loadGoals();
    }
  }, [initialized, loadGoals]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Auto-update academic goals based on events (but respect manual updates)
  useEffect(() => {
    // Disable auto-update for academic goals to prevent conflicts with manual updates
    // Users can manually update goals by clicking + or - buttons
    console.log('Auto-update disabled for academic goals to prevent conflicts with manual updates');
    return;
    
    const updateAcademicGoals = async () => {
      const now = dayjs();
      
      for (const goal of goals) {
        // Skip if not academic goal or not active
        if (goal.category !== 'academic' || goal.status !== 'active') continue;

        // Skip if goal was manually updated recently
        if (manuallyUpdatedGoals.has(goal.id)) {
          console.log(`Skipping auto-update for goal ${goal.title} - manually updated recently`);
          continue;
        }

        let newCurrent = 0; // Always calculate from scratch based on events
        
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

        // Only update if there's a significant difference (to avoid constant updates)
        if (Math.abs(newCurrent - goal.current) > 0.1) {
          console.log(`Auto-updating goal ${goal.title}: ${goal.current} -> ${newCurrent}`);
          try {
            await updateGoal(goal.id, { current: newCurrent });
          } catch (error) {
            console.error('Failed to auto-update goal progress:', error);
          }
        }
      }
    };

    // Only run auto-update periodically, not on every change
    const timeoutId = setTimeout(() => {
      if (goals.length > 0 && events.length > 0) {
        updateAcademicGoals();
      }
    }, 1000); // Delay to avoid conflicts with manual updates

    return () => clearTimeout(timeoutId);
  }, [events, manuallyUpdatedGoals]); // Include manuallyUpdatedGoals in dependencies

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, {
          title: values.title,
          description: values.description,
          category: values.category,
          type: values.type,
          target: values.target,
          unit: values.unit,
          startDate: values.startDate,
          endDate: values.endDate || undefined,
          priority: values.priority
        });
        
        notifications.show({
          title: 'Cập nhật thành công',
          message: 'Mục tiêu đã được cập nhật',
          color: 'blue'
        });
      } else {
        await addGoal({
          title: values.title,
          description: values.description,
          category: values.category,
          type: values.type,
          target: values.target,
          current: 0,
          unit: values.unit,
          startDate: values.startDate,
          endDate: values.endDate || undefined,
          priority: values.priority,
          status: 'active',
          streak: 0,
          lastUpdated: new Date()
        });
        
        notifications.show({
          title: 'Tạo mục tiêu thành công',
          message: 'Mục tiêu mới đã được thêm vào danh sách',
          color: 'green'
        });
      }

      setIsFormOpen(false);
      setEditingGoal(null);
      form.reset();
    } catch (error) {
      notifications.show({
        title: 'Lỗi',
        message: 'Không thể lưu mục tiêu. Vui lòng thử lại.',
        color: 'red'
      });
    }
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

  const handleDelete = async (goalId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa mục tiêu này?')) {
      try {
        await deleteGoal(goalId);
        notifications.show({
          title: 'Đã xóa',
          message: 'Mục tiêu đã được xóa',
          color: 'red'
        });
      } catch (error) {
        notifications.show({
          title: 'Lỗi',
          message: 'Không thể xóa mục tiêu. Vui lòng thử lại.',
          color: 'red'
        });
      }
    }
  };

  const updateProgress = async (goalId: string, increment: number) => {
    console.log('updateProgress called:', { goalId, increment });
    
    const goal = goals.find(g => g.id === goalId);
    if (!goal) {
      console.error('Goal not found:', goalId);
      return;
    }
    
    console.log('Current goal:', goal);
    
    const newCurrent = Math.max(0, goal.current + increment);
    const isCompleted = newCurrent >= goal.target;
    
    console.log('Updating progress:', { current: goal.current, newCurrent, target: goal.target, isCompleted });
    
    // Mark this goal as manually updated to prevent auto-update conflicts
    setManuallyUpdatedGoals(prev => new Set(prev).add(goalId));
    
    try {
      await updateGoal(goalId, {
        current: newCurrent,
        status: isCompleted ? 'completed' : goal.status,
        streak: isCompleted ? goal.streak + 1 : goal.streak,
        lastUpdated: new Date()
      });
      
      console.log('Goal updated successfully');
      
      // Remove from manually updated set after a delay
      setTimeout(() => {
        setManuallyUpdatedGoals(prev => {
          const newSet = new Set(prev);
          newSet.delete(goalId);
          return newSet;
        });
      }, 10000); // Keep protected for 10 seconds
      
      if (isCompleted && goal.status !== 'completed') {
        notifications.show({
          title: 'Chúc mừng!',
          message: `Bạn đã hoàn thành mục tiêu "${goal.title}"!`,
          color: 'green',
          autoClose: 8000
        });
      }
    } catch (error) {
      console.error('Failed to update goal progress:', error);
      // Remove from manually updated set if update failed
      setManuallyUpdatedGoals(prev => {
        const newSet = new Set(prev);
        newSet.delete(goalId);
        return newSet;
      });
      notifications.show({
        title: 'Lỗi',
        message: 'Không thể cập nhật tiến độ. Vui lòng thử lại.',
        color: 'red'
      });
    }
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
    <Paper withBorder p="md" radius="md" style={{ position: 'relative' }}>
      <LoadingOverlay visible={isLoading} />
      
      <Stack gap="md">
        {/* Error Alert */}
        {error && (
          <Alert color="red" onClose={clearError} withCloseButton>
            {error}
          </Alert>
        )}
        {/* Header */}
        <Group justify="space-between">
          <Group>
            <IconTrophy size={24} color="#ffd43b" />
            <Title order={3}>Mục tiêu & Thành tựu</Title>
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

                    {/* Manual Progress Update - Improved UI */}
                    <Group justify="space-between" align="center">
                      <Text size="sm" c="dimmed">Cập nhật tiến độ:</Text>
                      
                      <Group gap="xs">
                        <Tooltip label="Giảm 1 đơn vị">
                          <ActionIcon
                            size="sm"
                            variant="light"
                            color="red"
                            onClick={() => {
                              console.log('Minus button clicked for goal:', goal.id);
                              updateProgress(goal.id, -1);
                            }}
                            disabled={goal.current <= 0 || isLoading}
                            loading={isLoading}
                          >
                            <IconMinus size={14} />
                          </ActionIcon>
                        </Tooltip>
                        
                        <Text size="sm" fw={500} style={{ minWidth: '60px', textAlign: 'center' }}>
                          {goal.current}/{goal.target}
                        </Text>
                        
                        <Tooltip label={goal.current >= goal.target ? "Hoàn thành mục tiêu" : "Tăng 1 đơn vị"}>
                          <ActionIcon
                            size="sm"
                            variant="light"
                            color={goal.current >= goal.target ? "blue" : "green"}
                            onClick={() => {
                              console.log('Plus button clicked for goal:', goal.id);
                              updateProgress(goal.id, 1);
                            }}
                            disabled={goal.status === 'completed' || isLoading}
                            loading={isLoading}
                          >
                            {goal.current >= goal.target ? <IconCheck size={14} /> : <IconPlus size={14} />}
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                      
                      {goal.streak > 0 && (
                        <Group gap="xs">
                          <IconFlame size={16} color="#fa5252" />
                          <Text size="sm" c="orange" fw={500}>
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
