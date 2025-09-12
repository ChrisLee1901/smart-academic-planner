import { useState, useEffect } from 'react';
import {
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Grid,
  Card,
  RingProgress,
  Center,
  Badge,
  Switch,
  Alert,
  ActionIcon,
  Tooltip,
  Progress,
  SimpleGrid,
  Modal,
  NumberInput,
  Button,
  Divider,
  Checkbox,
  Slider,
  Box
} from '@mantine/core';
import {
  IconBrain,
  IconTarget,
  IconFlame,
  IconChartLine,
  IconSettings,
  IconInfoCircle,
  IconCheck,
  IconClock,
  IconTrophy,
  IconDeviceFloppy,
  IconRefresh
} from '@tabler/icons-react';
import { integrationService, type IntegratedStats } from '../services/integrationService';

export function IntegratedDashboard() {
  const [stats, setStats] = useState<IntegratedStats>({
    todayFocusTime: 0,
    todayTasksCompleted: 0,
    todayHabitsCompleted: 0,
    weeklyGoalProgress: 0,
    productivityScore: 0
  });
  const [integrationEnabled, setIntegrationEnabled] = useState(true);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    dailyFocusGoal: 120, // minutes
    dailyTaskGoal: 5,
    dailyHabitGoal: 3,
    enablePomodoroIntegration: true,
    enableTaskGoalIntegration: true,
    enableHabitIntegration: true,
    enableNotifications: true,
    productivityThreshold: 80
  });

  useEffect(() => {
    const updateStats = () => {
      setStats(integrationService.getIntegratedStats());
      setIntegrationEnabled(integrationService.isIntegrationEnabled());
    };

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('integrationSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to load integration settings:', error);
      }
    }

    updateStats();

    // Listen for updates from other components
    const handleTaskUpdated = () => updateStats();
    const handleGoalsUpdated = () => updateStats();
    const handleHabitsUpdated = () => updateStats();

    window.addEventListener('taskUpdated', handleTaskUpdated);
    window.addEventListener('goalsUpdated', handleGoalsUpdated);
    window.addEventListener('habitsUpdated', handleHabitsUpdated);

    return () => {
      window.removeEventListener('taskUpdated', handleTaskUpdated);
      window.removeEventListener('goalsUpdated', handleGoalsUpdated);
      window.removeEventListener('habitsUpdated', handleHabitsUpdated);
    };
  }, []);

  const handleIntegrationToggle = (enabled: boolean) => {
    setIntegrationEnabled(enabled);
    integrationService.setIntegrationEnabled(enabled);
  };

  const handleSettingsSave = () => {
    // Save settings to localStorage
    localStorage.setItem('integrationSettings', JSON.stringify(settings));
    setSettingsModalOpen(false);
  };

  const handleSettingsReset = () => {
    setSettings({
      dailyFocusGoal: 120,
      dailyTaskGoal: 5,
      dailyHabitGoal: 3,
      enablePomodoroIntegration: true,
      enableTaskGoalIntegration: true,
      enableHabitIntegration: true,
      enableNotifications: true,
      productivityThreshold: 80
    });
  };

  const getProductivityLabel = (score: number) => {
    if (score >= 80) return 'Xuất sắc';
    if (score >= 60) return 'Tốt';
    if (score >= 40) return 'Trung bình';
    return 'Cần cải thiện';
  };

  const formatFocusTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <Group>
            <IconChartLine size={24} color="#228be6" />
            <Title order={3}>Tổng quan Tích hợp</Title>
          </Group>
          
          <Group gap="xs">
            <Tooltip label="Cài đặt tích hợp">
              <ActionIcon 
                variant="light" 
                size="sm"
                onClick={() => setSettingsModalOpen(true)}
              >
                <IconSettings size={16} />
              </ActionIcon>
            </Tooltip>
            
            <Switch
              label="Tích hợp tự động"
              checked={integrationEnabled}
              onChange={(event) => handleIntegrationToggle(event.currentTarget.checked)}
              size="sm"
            />
          </Group>
        </Group>

        {/* Integration Status */}
        {!integrationEnabled && (
          <Alert icon={<IconInfoCircle size={16} />} color="orange" variant="light">
            Tích hợp tự động đang tắt. Các tính năng sẽ hoạt động độc lập.
          </Alert>
        )}

        {/* Main Productivity Score */}
        <Card withBorder p="lg" radius="md" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Center>
            <Stack align="center" gap="md">
              <RingProgress
                size={120}
                thickness={8}
                sections={[{ value: stats.productivityScore, color: 'white' }]}
                label={
                  <Center>
                    <Stack align="center" gap={2}>
                      <Text size="xl" fw={700} c="white">
                        {stats.productivityScore}
                      </Text>
                      <Text size="xs" c="white" opacity={0.9}>
                        Điểm
                      </Text>
                    </Stack>
                  </Center>
                }
              />
              <Stack align="center" gap={2}>
                <Text size="lg" fw={600} c="white">
                  Chỉ số Năng suất Hôm nay
                </Text>
                <Badge color="white" variant="light" size="lg">
                  {getProductivityLabel(stats.productivityScore)}
                </Badge>
              </Stack>
            </Stack>
          </Center>
        </Card>

        {/* Detailed Stats */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          {/* Focus Time */}
          <Card withBorder p="md" radius="md">
            <Stack align="center" gap="sm">
              <Group>
                <IconClock size={20} color="#fa5252" />
                <Text size="sm" fw={500} c="dimmed">Tập trung</Text>
              </Group>
              <Text size="xl" fw={700} c="red">
                {formatFocusTime(stats.todayFocusTime)}
              </Text>
              <Progress
                value={Math.min((stats.todayFocusTime / settings.dailyFocusGoal) * 100, 100)}
                color="red"
                size="sm"
                w="100%"
              />
              <Text size="xs" c="dimmed" ta="center">
                Mục tiêu: {Math.floor(settings.dailyFocusGoal / 60)}h{settings.dailyFocusGoal % 60 > 0 ? ` ${settings.dailyFocusGoal % 60}m` : ''}
              </Text>
            </Stack>
          </Card>

          {/* Tasks Completed */}
          <Card withBorder p="md" radius="md">
            <Stack align="center" gap="sm">
              <Group>
                <IconCheck size={20} color="#40c057" />
                <Text size="sm" fw={500} c="dimmed">Nhiệm vụ</Text>
              </Group>
              <Text size="xl" fw={700} c="green">
                {stats.todayTasksCompleted}
              </Text>
              <Progress
                value={Math.min((stats.todayTasksCompleted / settings.dailyTaskGoal) * 100, 100)}
                color="green"
                size="sm"
                w="100%"
              />
              <Text size="xs" c="dimmed" ta="center">
                Mục tiêu: {settings.dailyTaskGoal} nhiệm vụ
              </Text>
            </Stack>
          </Card>

          {/* Habits Completed */}
          <Card withBorder p="md" radius="md">
            <Stack align="center" gap="sm">
              <Group>
                <IconFlame size={20} color="#fd7e14" />
                <Text size="sm" fw={500} c="dimmed">Thói quen</Text>
              </Group>
              <Text size="xl" fw={700} c="orange">
                {stats.todayHabitsCompleted}
              </Text>
              <Progress
                value={Math.min((stats.todayHabitsCompleted / settings.dailyHabitGoal) * 100, 100)}
                color="orange"
                size="sm"
                w="100%"
              />
              <Text size="xs" c="dimmed" ta="center">
                Mục tiêu: {settings.dailyHabitGoal} thói quen
              </Text>
            </Stack>
          </Card>

          {/* Weekly Goals */}
          <Card withBorder p="md" radius="md">
            <Stack align="center" gap="sm">
              <Group>
                <IconTrophy size={20} color="#be4bdb" />
                <Text size="sm" fw={500} c="dimmed">Mục tiêu</Text>
              </Group>
              <Text size="xl" fw={700} c="purple">
                {Math.round(stats.weeklyGoalProgress)}%
              </Text>
              <Progress
                value={stats.weeklyGoalProgress}
                color="purple"
                size="sm"
                w="100%"
              />
              <Text size="xs" c="dimmed" ta="center">
                Tiến độ tuần này
              </Text>
            </Stack>
          </Card>
        </SimpleGrid>

        {/* Integration Features */}
        <Card withBorder p="md" radius="md" bg="gray.0">
          <Stack gap="md">
            <Group>
              <IconBrain size={20} />
              <Text fw={500}>Tính năng Tích hợp</Text>
            </Group>
            
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap="xs">
                  <Group>
                    <IconCheck size={16} color="green" />
                    <Text size="sm">Pomodoro ↔ Nhiệm vụ</Text>
                  </Group>
                  <Text size="xs" c="dimmed" pl="md">
                    Chọn nhiệm vụ khi bắt đầu Pomodoro, tự động cập nhật thời gian thực tế
                  </Text>
                </Stack>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap="xs">
                  <Group>
                    <IconCheck size={16} color="green" />
                    <Text size="sm">Nhiệm vụ ↔ Mục tiêu</Text>
                  </Group>
                  <Text size="xs" c="dimmed" pl="md">
                    Hoàn thành nhiệm vụ tự động cập nhật tiến độ mục tiêu học tập
                  </Text>
                </Stack>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap="xs">
                  <Group>
                    <IconCheck size={16} color="green" />
                    <Text size="sm">Pomodoro ↔ Thói quen</Text>
                  </Group>
                  <Text size="xs" c="dimmed" pl="md">
                    Hoàn thành phiên tập trung đánh dấu thói quen năng suất
                  </Text>
                </Stack>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap="xs">
                  <Group>
                    <IconCheck size={16} color="green" />
                    <Text size="sm">Thống kê Tổng hợp</Text>
                  </Group>
                  <Text size="xs" c="dimmed" pl="md">
                    Chỉ số năng suất tổng hợp từ tất cả hoạt động
                  </Text>
                </Stack>
              </Grid.Col>
            </Grid>
          </Stack>
        </Card>

        {/* Tips for Better Integration */}
        <Alert icon={<IconTarget size={16} />} color="blue" variant="light">
          <Stack gap="xs">
            <Text fw={500} size="sm">Mẹo để tối đa hóa tích hợp:</Text>
            <Text size="xs">
              • Luôn chọn nhiệm vụ cụ thể khi bắt đầu Pomodoro Timer
            </Text>
            <Text size="xs">
              • Tạo mục tiêu hàng tuần cho số giờ học và số nhiệm vụ hoàn thành
            </Text>
            <Text size="xs">
              • Thiết lập thói quen "Học tập" để theo dõi chuỗi ngày học liên tục
            </Text>
            <Text size="xs">
              • Xem lại chỉ số năng suất hàng ngày để điều chỉnh kế hoạch
            </Text>
          </Stack>
        </Alert>

        {/* Settings Modal */}
        <Modal
          opened={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          title={
            <Group>
              <IconSettings size={20} />
              <Text fw={600}>Cài đặt Tích hợp</Text>
            </Group>
          }
          size="lg"
          centered
          styles={{
            content: {
              maxHeight: '90vh',
              overflow: 'auto'
            }
          }}
        >
          <Stack gap="xl" p="xs">
            {/* Daily Goals */}
            <Stack gap="md">
              <Group>
                <IconTarget size={18} color="#228be6" />
                <Text fw={500} size="sm">Mục tiêu hàng ngày</Text>
              </Group>
              
              <NumberInput
                label="Thời gian tập trung (phút)"
                description="Mục tiêu thời gian tập trung mỗi ngày"
                value={settings.dailyFocusGoal}
                onChange={(value) => setSettings(prev => ({ ...prev, dailyFocusGoal: Number(value) || 120 }))}
                min={30}
                max={600}
                step={15}
                leftSection={<IconClock size={16} />}
              />
              
              <NumberInput
                label="Số nhiệm vụ hoàn thành"
                description="Mục tiêu số nhiệm vụ hoàn thành mỗi ngày"
                value={settings.dailyTaskGoal}
                onChange={(value) => setSettings(prev => ({ ...prev, dailyTaskGoal: Number(value) || 5 }))}
                min={1}
                max={20}
                leftSection={<IconCheck size={16} />}
              />
              
              <NumberInput
                label="Số thói quen thực hiện"
                description="Mục tiêu số thói quen thực hiện mỗi ngày"
                value={settings.dailyHabitGoal}
                onChange={(value) => setSettings(prev => ({ ...prev, dailyHabitGoal: Number(value) || 3 }))}
                min={1}
                max={10}
                leftSection={<IconFlame size={16} />}
              />
            </Stack>

            <Divider />

            {/* Integration Options */}
            <Stack gap="md">
              <Group>
                <IconBrain size={18} color="#40c057" />
                <Text fw={500} size="sm">Tùy chọn Tích hợp</Text>
              </Group>
              
              <Checkbox
                label="Tích hợp Pomodoro Timer"
                description="Tự động liên kết timer với nhiệm vụ"
                checked={settings.enablePomodoroIntegration}
                onChange={(event) => setSettings(prev => ({ 
                  ...prev, 
                  enablePomodoroIntegration: event.currentTarget.checked 
                }))}
              />
              
              <Checkbox
                label="Tích hợp Mục tiêu"
                description="Cập nhật tiến độ mục tiêu khi hoàn thành nhiệm vụ"
                checked={settings.enableTaskGoalIntegration}
                onChange={(event) => setSettings(prev => ({ 
                  ...prev, 
                  enableTaskGoalIntegration: event.currentTarget.checked 
                }))}
              />
              
              <Checkbox
                label="Tích hợp Thói quen"
                description="Đánh dấu thói quen khi hoàn thành hoạt động"
                checked={settings.enableHabitIntegration}
                onChange={(event) => setSettings(prev => ({ 
                  ...prev, 
                  enableHabitIntegration: event.currentTarget.checked 
                }))}
              />
              
              <Checkbox
                label="Thông báo"
                description="Nhận thông báo về tiến độ và thành tích"
                checked={settings.enableNotifications}
                onChange={(event) => setSettings(prev => ({ 
                  ...prev, 
                  enableNotifications: event.currentTarget.checked 
                }))}
              />
            </Stack>

            <Divider />

            {/* Productivity Settings */}
            <Stack gap="md">
              <Group>
                <IconChartLine size={18} color="#fd7e14" />
                <Text fw={500} size="sm">Chỉ số Năng suất</Text>
              </Group>
              
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text size="sm">Ngưỡng "Xuất sắc"</Text>
                  <Badge color="blue" variant="light">
                    {settings.productivityThreshold}%
                  </Badge>
                </Group>
                
                <Box pt="xs" pb="md">
                  <Slider
                    value={settings.productivityThreshold}
                    onChange={(value) => setSettings(prev => ({ ...prev, productivityThreshold: value }))}
                    min={50}
                    max={100}
                    step={5}
                    marks={[
                      { value: 50, label: '50%' },
                      { value: 75, label: '75%' },
                      { value: 100, label: '100%' }
                    ]}
                    size="md"
                    color="blue"
                  />
                </Box>
                
                <Text size="xs" c="dimmed" ta="center">
                  Điểm số cần đạt để được đánh giá "Xuất sắc"
                </Text>
              </Stack>
            </Stack>

            <Divider />

            {/* Action Buttons */}
            <Group justify="space-between">
              <Button
                variant="light"
                color="gray"
                leftSection={<IconRefresh size={16} />}
                onClick={handleSettingsReset}
              >
                Đặt lại mặc định
              </Button>
              
              <Group>
                <Button
                  variant="light"
                  onClick={() => setSettingsModalOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  leftSection={<IconDeviceFloppy size={16} />}
                  onClick={handleSettingsSave}
                >
                  Lưu cài đặt
                </Button>
              </Group>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Paper>
  );
}
