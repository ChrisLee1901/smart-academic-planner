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
  Modal,
  NumberInput,
  Button,
  Divider,
  Checkbox
} from '@mantine/core';
import {
  IconBrain,
  IconTarget,
  IconChartLine,
  IconSettings,
  IconInfoCircle,
  IconCheck,
  IconClock,
  IconDeviceFloppy,
  IconRefresh
} from '@tabler/icons-react';
import { integrationService, type IntegratedStats, type IntegrationEvent } from '../services/integrationService';

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
    enablePomodoroIntegration: true,
    enableNotifications: true
  });

  useEffect(() => {
    const updateStats = async () => {
      try {
        const newStats = await integrationService.getIntegratedStats();
        setStats(newStats);
        setIntegrationEnabled(integrationService.isIntegrationEnabled());
      } catch (error) {
        console.error('Failed to update stats:', error);
      }
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

    // Listen for standardized integration events
    const handleIntegrationEvent = (event: CustomEvent<IntegrationEvent>) => {
      console.log('Integration event received:', event.detail);
      updateStats();
    };

    // Listen for legacy events for backward compatibility
    const handleLegacyEvent = () => updateStats();

    window.addEventListener('integration', handleIntegrationEvent as EventListener);
    window.addEventListener('taskUpdated', handleLegacyEvent);
    window.addEventListener('goalsUpdated', handleLegacyEvent);
    window.addEventListener('habitsUpdated', handleLegacyEvent);

    return () => {
      window.removeEventListener('integration', handleIntegrationEvent as EventListener);
      window.removeEventListener('taskUpdated', handleLegacyEvent);
      window.removeEventListener('goalsUpdated', handleLegacyEvent);
      window.removeEventListener('habitsUpdated', handleLegacyEvent);
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
      enablePomodoroIntegration: true,
      enableNotifications: true
    });
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

        {/* Main Focus Time Display */}
        <Card withBorder p="lg" radius="md" style={{ background: 'linear-gradient(135deg, #fa5252 0%, #e03131 100%)' }}>
          <Center>
            <Stack align="center" gap="md">
              <RingProgress
                size={120}
                thickness={8}
                sections={[{ value: Math.min((stats.todayFocusTime / settings.dailyFocusGoal) * 100, 100), color: 'white' }]}
                label={
                  <Center>
                    <Stack align="center" gap={2}>
                      <Text size="xl" fw={700} c="white">
                        {formatFocusTime(stats.todayFocusTime)}
                      </Text>
                      <Text size="xs" c="white" opacity={0.9}>
                        Tập trung
                      </Text>
                    </Stack>
                  </Center>
                }
              />
              <Stack align="center" gap={2}>
                <Text size="lg" fw={600} c="white">
                  Thời gian Tập trung Hôm nay
                </Text>
                <Badge color="white" variant="light" size="lg">
                  Mục tiêu: {Math.floor(settings.dailyFocusGoal / 60)}h{settings.dailyFocusGoal % 60 > 0 ? ` ${settings.dailyFocusGoal % 60}m` : ''}
                </Badge>
              </Stack>
            </Stack>
          </Center>
        </Card>

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
                    <Text size="sm">Theo dõi Tập trung</Text>
                  </Group>
                  <Text size="xs" c="dimmed" pl="md">
                    Tổng hợp thời gian tập trung từ các phiên Pomodoro
                  </Text>
                </Stack>
              </Grid.Col>
            </Grid>
          </Stack>
        </Card>

        {/* Tips for Better Focus */}
        <Alert icon={<IconTarget size={16} />} color="blue" variant="light">
          <Stack gap="xs">
            <Text fw={500} size="sm">Mẹo để tối đa hóa thời gian tập trung:</Text>
            <Text size="xs">
              • Luôn chọn nhiệm vụ cụ thể khi bắt đầu Pomodoro Timer
            </Text>
            <Text size="xs">
              • Đặt mục tiêu thời gian tập trung hàng ngày (mặc định 2 giờ)
            </Text>
            <Text size="xs">
              • Tắt thông báo và tìm môi trường yên tĩnh trong phiên Pomodoro
            </Text>
            <Text size="xs">
              • Xem lại thống kê hàng ngày để điều chỉnh kế hoạch học tập
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
                description="Tự động theo dõi thời gian tập trung từ Pomodoro"
                checked={settings.enablePomodoroIntegration}
                onChange={(event) => setSettings(prev => ({ 
                  ...prev, 
                  enablePomodoroIntegration: event.currentTarget.checked 
                }))}
              />
              
              <Checkbox
                label="Thông báo"
                description="Nhận thông báo về thời gian tập trung và tiến độ"
                checked={settings.enableNotifications}
                onChange={(event) => setSettings(prev => ({ 
                  ...prev, 
                  enableNotifications: event.currentTarget.checked 
                }))}
              />
            </Stack>

            <Divider />

            {/* Advanced Settings */}
            <Stack gap="md">
              <Group>
                <IconSettings size={18} color="#868e96" />
                <Text fw={500} size="sm">Cài đặt Khác</Text>
              </Group>
              
              <Text size="xs" c="dimmed" ta="center">
                Tập trung vào việc theo dõi thời gian học tập hiệu quả
              </Text>
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
