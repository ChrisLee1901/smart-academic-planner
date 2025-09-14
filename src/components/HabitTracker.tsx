import { useState, useEffect } from 'react';
import {
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Button,
  Card,
  ActionIcon,
  Modal,
  TextInput,
  NumberInput,
  Select,
  Textarea,
  Alert,
  Box,
  Progress,
  SimpleGrid,
  LoadingOverlay,
  Tooltip
} from '@mantine/core';
import { 
  IconFlame,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconCalendar
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import dayjs from '../utils/dayjs';
import { useHabitStore } from '../store/habitStore';
import { type Habit } from '../services/databaseService';

const HABIT_ICONS = [
  { value: '📚', label: 'Đọc sách' },
  { value: '💪', label: 'Tập thể dục' },
  { value: '🧘', label: 'Thiền' },
  { value: '💧', label: 'Uống nước' },
  { value: '🍎', label: 'Ăn healthy' },
  { value: '😴', label: 'Ngủ đủ giấc' },
  { value: '🚶', label: 'Đi bộ' },
  { value: '✍️', label: 'Viết nhật ký' },
  { value: '🎯', label: 'Mục tiêu' },
  { value: '🌅', label: 'Dậy sớm' }
];

const HABIT_COLORS = [
  '#228be6', '#40c057', '#fd7e14', '#be4bdb', 
  '#fa5252', '#82c91e', '#15aabf', '#fab005'
];

export function HabitTracker() {
  const {
    habits,
    records,
    isLoading,
    error,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
    loadHabits,
    loadRecords,
    clearError
  } = useHabitStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      category: 'productivity' as Habit['category'],
      frequency: 'daily' as Habit['frequency'],
      target: 1,
      color: HABIT_COLORS[0],
      icon: HABIT_ICONS[0].value
    }
  });

  // Load habits and records from database
  useEffect(() => {
    const initializeData = async () => {
      await loadHabits();
      await loadRecords();
    };
    
    initializeData();
  }, [loadHabits, loadRecords]);

  // Debug log for data changes
  useEffect(() => {
    console.log('HabitTracker - Habits:', habits.length, 'Records:', records.length);
  }, [habits, records]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (editingHabit) {
        await updateHabit(editingHabit.id, {
          name: values.name,
          description: values.description,
          category: values.category,
          frequency: values.frequency,
          target: values.target,
          color: values.color,
          icon: values.icon,
          isActive: editingHabit.isActive,
          createdAt: editingHabit.createdAt
        });
        notifications.show({
          title: 'Cập nhật thành công',
          message: 'Thói quen đã được cập nhật!',
          color: 'green',
        });
      } else {
        await addHabit({
          name: values.name,
          description: values.description,
          category: values.category,
          frequency: values.frequency,
          target: values.target,
          color: values.color,
          icon: values.icon,
          isActive: true,
          createdAt: new Date()
        });
        notifications.show({
          title: 'Thêm thành công',
          message: 'Thói quen mới đã được thêm!',
          color: 'green',
        });
      }
      handleCloseForm();
    } catch (error) {
      notifications.show({
        title: 'Có lỗi xảy ra',
        message: editingHabit ? 'Không thể cập nhật thói quen' : 'Không thể thêm thói quen',
        color: 'red',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHabit(id);
      notifications.show({
        title: 'Xóa thành công',
        message: 'Thói quen đã được xóa!',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Có lỗi xảy ra',
        message: 'Không thể xóa thói quen',
        color: 'red',
      });
    }
  };

  const handleToggleCompletion = async (habitId: string, date: string = dayjs().format('YYYY-MM-DD')) => {
    try {
      await toggleHabitCompletion(habitId, date);
    } catch (error) {
      notifications.show({
        title: 'Có lỗi xảy ra',
        message: 'Không thể cập nhật trạng thái thói quen',
        color: 'red',
      });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingHabit(null);
    form.reset();
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    form.setValues({
      name: habit.name,
      description: habit.description || '',
      category: habit.category,
      frequency: habit.frequency,
      target: habit.target,
      color: habit.color,
      icon: habit.icon
    });
    setIsFormOpen(true);
  };

  const getHabitStreak = (habitId: string): number => {
    const today = dayjs();
    let streak = 0;
    
    for (let i = 0; i < 365; i++) {
      const checkDate = today.subtract(i, 'day');
      const dateStr = checkDate.format('YYYY-MM-DD');
      const record = records.find(r => r.habitId === habitId && r.date === dateStr);
      
      if (record?.completed) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getWeeklyProgress = (habitId: string): number => {
    const today = dayjs();
    const completedDays = [];
    
    // Calculate for last 7 days (same as calendar display)
    for (let i = 6; i >= 0; i--) {
      const checkDate = today.subtract(i, 'day');
      const dateStr = checkDate.format('YYYY-MM-DD');
      const record = records.find(r => r.habitId === habitId && r.date === dateStr);
      
      if (record?.completed) {
        completedDays.push(dateStr);
      }
    }
    
    return completedDays.length;
  };

  const isHabitCompletedToday = (habitId: string): boolean => {
    const today = dayjs().format('YYYY-MM-DD');
    const record = records.find(r => r.habitId === habitId && r.date === today);
    return record?.completed || false;
  };

  const renderHabitCalendar = (habitId: string) => {
    const today = dayjs();
    const days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = today.subtract(i, 'day');
      const dateStr = date.format('YYYY-MM-DD');
      const record = records.find(r => r.habitId === habitId && r.date === dateStr);
      const isToday = date.isSame(today, 'day');
      const isCompleted = record?.completed || false;
      
      days.push(
        <Tooltip
          key={dateStr}
          label={`${date.format('DD/MM')} - ${isCompleted ? 'Đã hoàn thành' : 'Chưa hoàn thành'}`}
        >
          <Box
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              backgroundColor: isCompleted ? '#40c057' : '#e9ecef',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: isToday ? '2px solid #228be6' : '1px solid #dee2e6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
            onClick={() => {
              console.log(`Clicking ${dateStr} for habit ${habitId}, current completed: ${isCompleted}`);
              handleToggleCompletion(habitId, dateStr);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {isCompleted && <IconCheck size={12} color="white" />}
            {isToday && (
              <div style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#228be6'
              }} />
            )}
          </Box>
        </Tooltip>
      );
    }
    
    return days;
  };

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

        <Group justify="space-between">
          <Group>
            <IconCalendar size={24} color="#fa5252" />
            <Title order={3}>Theo dõi thói quen</Title>
          </Group>
          <Button 
            leftSection={<IconPlus size={16} />}
            onClick={() => setIsFormOpen(true)}
            variant="light"
            color="blue"
          >
            Thêm thói quen
          </Button>
        </Group>

        {/* Summary Stats */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          <Card withBorder p="sm" radius="sm" ta="center">
            <Text size="xl" fw={700} c="blue">{habits.filter(h => h.isActive).length}</Text>
            <Text size="sm" c="dimmed">Thói quen đang theo dõi</Text>
          </Card>
          <Card withBorder p="sm" radius="sm" ta="center">
            <Text size="xl" fw={700} c="green">
              {habits.filter(h => h.isActive && isHabitCompletedToday(h.id)).length}
            </Text>
            <Text size="sm" c="dimmed">Hoàn thành hôm nay</Text>
          </Card>
          <Card withBorder p="sm" radius="sm" ta="center">
            <Text size="xl" fw={700} c="orange">
              {Math.round(habits.length > 0 ? 
                habits.filter(h => h.isActive).reduce((sum, h) => sum + getHabitStreak(h.id), 0) / habits.filter(h => h.isActive).length : 0
              )}
            </Text>
            <Text size="sm" c="dimmed">Chuỗi TB (ngày)</Text>
          </Card>
          <Card withBorder p="sm" radius="sm" ta="center">
            <Text size="xl" fw={700} c="purple">
              {Math.round(habits.length > 0 ? 
                habits.filter(h => h.isActive).reduce((sum, h) => sum + (getWeeklyProgress(h.id) / 7 * 100), 0) / habits.filter(h => h.isActive).length : 0
              )}%
            </Text>
            <Text size="sm" c="dimmed">7 ngày gần đây</Text>
          </Card>
        </SimpleGrid>

        {habits.length === 0 ? (
          <Text ta="center" c="dimmed" py="xl">
            Chưa có thói quen nào. Hãy thêm thói quen đầu tiên!
          </Text>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {habits.filter(h => h.isActive).map((habit) => {
              const streak = getHabitStreak(habit.id);
              const weeklyProgress = getWeeklyProgress(habit.id);
              const isCompletedToday = isHabitCompletedToday(habit.id);
              const progressPercentage = (weeklyProgress / 7) * 100;

              return (
                <Card key={habit.id} withBorder radius="md" p="md">
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Group gap="xs">
                        <Text size="lg">{habit.icon}</Text>
                        <div>
                          <Text fw={500} size="sm">{habit.name}</Text>
                          <Text size="xs" c="dimmed">{habit.category}</Text>
                        </div>
                      </Group>
                      
                      <Group gap="xs">
                        <ActionIcon
                          variant="light"
                          size="sm"
                          onClick={() => handleEdit(habit)}
                        >
                          <IconEdit size={14} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          size="sm"
                          onClick={() => handleDelete(habit.id)}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Group>
                    </Group>

                    {habit.description && (
                      <Text size="xs" c="dimmed">{habit.description}</Text>
                    )}

                    <div>
                      <Group justify="space-between" mb="xs">
                        <Text size="xs" c="dimmed">7 ngày gần đây: {weeklyProgress}/7</Text>
                        <Text size="xs" c="dimmed">{progressPercentage.toFixed(0)}%</Text>
                      </Group>
                      <Progress 
                        value={progressPercentage} 
                        color={habit.color}
                        size="sm"
                        radius="sm"
                      />
                    </div>

                    <Group justify="space-between" align="center">
                      <Group gap="xs">
                        <IconFlame size={16} color="#fd7e14" />
                        <Text size="sm" fw={500}>{streak} ngày</Text>
                      </Group>
                      
                      <Tooltip label={isCompletedToday ? "Bỏ đánh dấu hoàn thành hôm nay" : "Đánh dấu hoàn thành hôm nay"}>
                        <Button
                          size="xs"
                          variant={isCompletedToday ? "filled" : "outline"}
                          color={isCompletedToday ? "green" : "blue"}
                          leftSection={isCompletedToday ? <IconCheck size={14} /> : <IconX size={14} />}
                          onClick={() => handleToggleCompletion(habit.id)}
                          style={{
                            minWidth: '120px'
                          }}
                        >
                          {isCompletedToday ? "✓ Hôm nay" : "○ Hôm nay"}
                        </Button>
                      </Tooltip>
                    </Group>

                    <div>
                      <Text size="xs" c="dimmed" mb="xs">
                        7 ngày gần đây: ({weeklyProgress}/7 ngày)
                      </Text>
                      <Group gap={4} justify="center">
                        {renderHabitCalendar(habit.id)}
                      </Group>
                    </div>
                  </Stack>
                </Card>
              );
            })}
          </SimpleGrid>
        )}
      </Stack>

      {/* Add/Edit Habit Modal */}
      <Modal
        opened={isFormOpen}
        onClose={handleCloseForm}
        title={editingHabit ? "Chỉnh sửa thói quen" : "Thêm thói quen mới"}
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Tên thói quen"
              placeholder="Ví dụ: Đọc sách 30 phút"
              {...form.getInputProps('name')}
              required
            />

            <Textarea
              label="Mô tả"
              placeholder="Mô tả chi tiết về thói quen..."
              {...form.getInputProps('description')}
              rows={3}
            />

            <Select
              label="Danh mục"
              data={[
                { value: 'health', label: 'Sức khỏe' },
                { value: 'productivity', label: 'Năng suất' },
                { value: 'learning', label: 'Học tập' },
                { value: 'personal', label: 'Cá nhân' },
                { value: 'social', label: 'Xã hội' }
              ]}
              {...form.getInputProps('category')}
              required
            />

            <Group grow>
              <Select
                label="Tần suất"
                data={[
                  { value: 'daily', label: 'Hàng ngày' },
                  { value: 'weekly', label: 'Hàng tuần' },
                  { value: 'custom', label: 'Tùy chỉnh' }
                ]}
                {...form.getInputProps('frequency')}
                required
              />

              <NumberInput
                label="Mục tiêu"
                placeholder="1"
                min={1}
                max={10}
                {...form.getInputProps('target')}
                required
              />
            </Group>

            <Select
              label="Biểu tượng"
              data={HABIT_ICONS}
              {...form.getInputProps('icon')}
              required
            />

            <Select
              label="Màu sắc"
              data={HABIT_COLORS.map((color, index) => ({
                value: color,
                label: `Màu ${index + 1}`
              }))}
              {...form.getInputProps('color')}
              required
            />

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={handleCloseForm}>
                Hủy
              </Button>
              <Button type="submit" loading={isLoading}>
                {editingHabit ? "Cập nhật" : "Thêm"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Paper>
  );
}