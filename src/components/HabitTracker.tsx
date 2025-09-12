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
  Grid,
  Alert,
  Badge,
  Box,
  Progress,
  SimpleGrid
} from '@mantine/core';
import { 
  IconFlame,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';

interface Habit {
  id: string;
  name: string;
  description?: string;
  category: 'health' | 'productivity' | 'learning' | 'personal' | 'social';
  frequency: 'daily' | 'weekly' | 'custom';
  target: number; // times per frequency period
  color: string;
  icon: string;
  createdAt: Date;
  isActive: boolean;
}

interface HabitRecord {
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  notes?: string;
}

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
  const [habits, setHabits] = useState<Habit[]>([]);
  const [records, setRecords] = useState<HabitRecord[]>([]);
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

  // Load data from localStorage
  useEffect(() => {
    const savedHabits = localStorage.getItem('academic-planner-habits');
    const savedRecords = localStorage.getItem('academic-planner-habit-records');
    
    if (savedHabits) {
      try {
        const parsed = JSON.parse(savedHabits);
        setHabits(parsed.map((habit: any) => ({
          ...habit,
          createdAt: new Date(habit.createdAt)
        })));
      } catch (error) {
        console.error('Error loading habits:', error);
      }
    }
    
    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords));
      } catch (error) {
        console.error('Error loading habit records:', error);
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('academic-planner-habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('academic-planner-habit-records', JSON.stringify(records));
  }, [records]);

  const handleSubmit = (values: typeof form.values) => {
    const habit: Habit = {
      id: editingHabit?.id || Date.now().toString(),
      name: values.name,
      description: values.description,
      category: values.category,
      frequency: values.frequency,
      target: values.target,
      color: values.color,
      icon: values.icon,
      createdAt: editingHabit?.createdAt || new Date(),
      isActive: true
    };

    if (editingHabit) {
      setHabits(prev => prev.map(h => h.id === habit.id ? habit : h));
      notifications.show({
        title: 'Cập nhật thành công',
        message: 'Thói quen đã được cập nhật',
        color: 'blue'
      });
    } else {
      setHabits(prev => [...prev, habit]);
      notifications.show({
        title: 'Tạo thói quen thành công',
        message: 'Thói quen mới đã được thêm vào danh sách',
        color: 'green'
      });
    }

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

  const handleDelete = (habitId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa thói quen này? Tất cả dữ liệu liên quan sẽ bị mất.')) {
      setHabits(prev => prev.filter(h => h.id !== habitId));
      setRecords(prev => prev.filter(r => r.habitId !== habitId));
      notifications.show({
        title: 'Đã xóa',
        message: 'Thói quen đã được xóa',
        color: 'red'
      });
    }
  };

  const toggleHabitCompletion = (habitId: string, date: Date) => {
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    const existingRecord = records.find(
      r => r.habitId === habitId && r.date === dateStr
    );

    if (existingRecord) {
      setRecords(prev => prev.map(r => 
        r.habitId === habitId && r.date === dateStr
          ? { ...r, completed: !r.completed }
          : r
      ));
    } else {
      setRecords(prev => [...prev, {
        habitId,
        date: dateStr,
        completed: true
      }]);
    }
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

  const getHabitCompletionRate = (habitId: string, days: number = 30): number => {
    const today = dayjs();
    let completed = 0;
    
    for (let i = 0; i < days; i++) {
      const checkDate = today.subtract(i, 'day');
      const dateStr = checkDate.format('YYYY-MM-DD');
      const record = records.find(r => r.habitId === habitId && r.date === dateStr);
      
      if (record?.completed) {
        completed++;
      }
    }
    
    return (completed / days) * 100;
  };

  const isHabitCompletedOnDate = (habitId: string, date: Date): boolean => {
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    const record = records.find(r => r.habitId === habitId && r.date === dateStr);
    return record?.completed || false;
  };

  const getTodayProgress = () => {
    const today = dayjs().format('YYYY-MM-DD');
    const todayRecords = records.filter(r => r.date === today && r.completed);
    const activeHabits = habits.filter(h => h.isActive);
    
    return activeHabits.length > 0 ? (todayRecords.length / activeHabits.length) * 100 : 0;
  };

  const getCategoryColor = (category: Habit['category']) => {
    switch (category) {
      case 'health': return 'red';
      case 'productivity': return 'blue';
      case 'learning': return 'green';
      case 'personal': return 'purple';
      case 'social': return 'orange';
      default: return 'gray';
    }
  };

  const activeHabits = habits.filter(h => h.isActive);
  const todayProgress = getTodayProgress();

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <Group>
            <IconFlame size={24} color="#fa5252" />
            <Title order={3}>Theo dõi Thói quen</Title>
          </Group>
          
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setIsFormOpen(true)}
            variant="light"
          >
            Thêm thói quen
          </Button>
        </Group>

        {/* Today's Progress */}
        <Card withBorder p="md" radius="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500}>Tiến độ hôm nay</Text>
              <Text size="sm" c="dimmed">
                {records.filter(r => r.date === dayjs().format('YYYY-MM-DD') && r.completed).length} / {activeHabits.length}
              </Text>
            </Group>
            <Progress value={todayProgress} color="green" size="lg" radius="xl" />
            <Text size="sm" ta="center" c="dimmed">
              {todayProgress.toFixed(1)}% hoàn thành
            </Text>
          </Stack>
        </Card>

        {/* Habit Cards */}
        {activeHabits.length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
            {activeHabits.map(habit => {
              const streak = getHabitStreak(habit.id);
              const completionRate = getHabitCompletionRate(habit.id);
              const isCompletedToday = isHabitCompletedOnDate(habit.id, new Date());
              
              return (
                <Card key={habit.id} withBorder p="md" radius="md">
                  <Stack gap="md">
                    {/* Habit Header */}
                    <Group justify="space-between">
                      <Group gap="xs">
                        <Text size="xl">{habit.icon}</Text>
                        <Stack gap={2}>
                          <Text fw={500} size="sm">{habit.name}</Text>
                          <Badge size="xs" color={getCategoryColor(habit.category)}>
                            {habit.category}
                          </Badge>
                        </Stack>
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

                    {/* Today's Status */}
                    <Group justify="center">
                      <ActionIcon
                        size="xl"
                        variant={isCompletedToday ? "filled" : "light"}
                        color={isCompletedToday ? "green" : "gray"}
                        onClick={() => toggleHabitCompletion(habit.id, new Date())}
                        style={{ borderRadius: '50%' }}
                      >
                        {isCompletedToday ? (
                          <IconCheck size={24} />
                        ) : (
                          <IconX size={24} />
                        )}
                      </ActionIcon>
                    </Group>

                    {/* Stats */}
                    <Group grow ta="center">
                      <Stack gap={2}>
                        <Text size="lg" fw={700} c="orange">
                          {streak}
                        </Text>
                        <Text size="xs" c="dimmed">Chuỗi</Text>
                      </Stack>
                      
                      <Stack gap={2}>
                        <Text size="lg" fw={700} c="blue">
                          {completionRate.toFixed(0)}%
                        </Text>
                        <Text size="xs" c="dimmed">30 ngày</Text>
                      </Stack>
                    </Group>

                    {/* Mini Calendar */}
                    <Box>
                      <Text size="xs" c="dimmed" mb="xs">7 ngày gần đây</Text>
                      <Group gap="xs" justify="center">
                        {Array.from({ length: 7 }, (_, i) => {
                          const date = dayjs().subtract(6 - i, 'day');
                          const isCompleted = isHabitCompletedOnDate(habit.id, date.toDate());
                          
                          return (
                            <Box
                              key={i}
                              w={20}
                              h={20}
                              style={{
                                backgroundColor: isCompleted ? habit.color : '#f8f9fa',
                                borderRadius: '4px',
                                border: `1px solid ${habit.color}`,
                                cursor: 'pointer'
                              }}
                              onClick={() => toggleHabitCompletion(habit.id, date.toDate())}
                            />
                          );
                        })}
                      </Group>
                    </Box>
                  </Stack>
                </Card>
              );
            })}
          </SimpleGrid>
        ) : (
          <Alert icon={<IconFlame size={16} />} color="orange">
            Chưa có thói quen nào. Hãy tạo thói quen đầu tiên để bắt đầu hành trình phát triển bản thân!
          </Alert>
        )}

        {/* Habit Form Modal */}
        <Modal
          opened={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingHabit(null);
            form.reset();
          }}
          title={editingHabit ? 'Chỉnh sửa thói quen' : 'Tạo thói quen mới'}
          size="md"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Tên thói quen"
                placeholder="Ví dụ: Đọc sách 30 phút"
                required
                {...form.getInputProps('name')}
              />
              
              <Textarea
                label="Mô tả (tùy chọn)"
                placeholder="Mô tả chi tiết về thói quen..."
                {...form.getInputProps('description')}
              />
              
              <Grid>
                <Grid.Col span={6}>
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
                  />
                </Grid.Col>
                
                <Grid.Col span={6}>
                  <Select
                    label="Tần suất"
                    data={[
                      { value: 'daily', label: 'Hàng ngày' },
                      { value: 'weekly', label: 'Hàng tuần' },
                      { value: 'custom', label: 'Tùy chỉnh' }
                    ]}
                    {...form.getInputProps('frequency')}
                  />
                </Grid.Col>
              </Grid>

              <NumberInput
                label="Mục tiêu"
                description="Số lần thực hiện trong khoảng thời gian đã chọn"
                placeholder="1"
                min={1}
                max={10}
                required
                {...form.getInputProps('target')}
              />

              <Select
                label="Biểu tượng"
                data={HABIT_ICONS}
                {...form.getInputProps('icon')}
              />

              <Select
                label="Màu sắc"
                data={HABIT_COLORS.map(color => ({
                  value: color,
                  label: color
                }))}
                {...form.getInputProps('color')}
              />

              <Group justify="flex-end" gap="xs">
                <Button
                  variant="light"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingHabit(null);
                    form.reset();
                  }}
                >
                  Hủy
                </Button>
                <Button type="submit">
                  {editingHabit ? 'Cập nhật' : 'Tạo thói quen'}
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>
      </Stack>
    </Paper>
  );
}
