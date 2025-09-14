import { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Button,
  Badge,
  Select,
  ActionIcon,
  RingProgress,
  Center,
  Card
} from '@mantine/core';
import { 
  IconPlayerPlay, 
  IconPlayerPause, 
  IconPlayerStop, 
  IconPlayerSkipForward,
  IconClock,
  IconBrain,
  IconCoffee,
  IconChecklist
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { integrationService } from '../services/integrationService';
import { useEventStore } from '../store/eventStore';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface TimerConfig {
  focus: number;
  shortBreak: number;
  longBreak: number;
  sessionsUntilLongBreak: number;
}

interface TimerSession {
  mode: TimerMode;
  duration: number;
  completed: boolean;
  startTime: Date;
  endTime?: Date;
  taskId?: string;
}

export function PomodoroTimer() {
  const { events } = useEventStore();
  const [availableTasks, setAvailableTasks] = useState<Array<{value: string, label: string}>>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [currentMode, setCurrentMode] = useState<TimerMode>('focus');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [config, setConfig] = useState<TimerConfig>({
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsUntilLongBreak: 4
  });

  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load available tasks prioritizing store data for better Kanban integration
  useEffect(() => {
    const loadTasks = async () => {
      try {
        // First, try to get tasks from the store (Kanban board data)
        const storeTasks = events
          .filter(event => event.status !== 'done')
          .map(event => ({
            value: event.id,
            label: `${event.title} ${event.course ? `(${event.course})` : ''}`,
            estimatedTime: event.estimatedTime
          }));

        // Cache store data in integration service for consistency
        if (storeTasks.length > 0) {
          integrationService.cacheStoreData('events', events);
        }

        // If store has tasks, use them directly for immediate Kanban sync
        if (storeTasks.length > 0) {
          setAvailableTasks(storeTasks);
          console.log(`Loaded ${storeTasks.length} tasks from store for Pomodoro`);
        } else {
          // Fallback to integration service if store is empty
          const integrationTasks = await integrationService.getAvailableTasks();
          setAvailableTasks(integrationTasks);
          console.log(`Loaded ${integrationTasks.length} tasks from integration service`);
        }
      } catch (error) {
        console.error('Failed to load available tasks:', error);
        // Final fallback to empty array
        setAvailableTasks([]);
      }
    };

    loadTasks();
    
    // Listen for integration events instead of taskUpdated
    const handleIntegrationEvent = (event: CustomEvent) => {
      const { type } = event.detail;
      if (type === 'task') {
        loadTasks();
      }
    };

    // Listen for legacy events for backward compatibility
    const handleLegacyEvent = () => loadTasks();
    
    window.addEventListener('integration', handleIntegrationEvent as EventListener);
    window.addEventListener('taskUpdated', handleLegacyEvent);
    
    return () => {
      window.removeEventListener('integration', handleIntegrationEvent as EventListener);
      window.removeEventListener('taskUpdated', handleLegacyEvent);
    };
  }, [events]); // Keep events dependency for store sync

  // Initialize audio
  useEffect(() => {
    // Create a simple beep sound using Web Audio API
    const createBeepSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    };

    audioRef.current = { play: createBeepSound } as any;
  }, []);

  const getTimerDuration = (mode: TimerMode): number => {
    switch (mode) {
      case 'focus': return config.focus * 60;
      case 'shortBreak': return config.shortBreak * 60;
      case 'longBreak': return config.longBreak * 60;
    }
  };

  const getModeInfo = (mode: TimerMode) => {
    switch (mode) {
      case 'focus':
        return { 
          label: 'Tập trung', 
          icon: IconBrain, 
          color: 'blue',
          description: 'Thời gian tập trung học tập'
        };
      case 'shortBreak':
        return { 
          label: 'Nghỉ ngắn', 
          icon: IconCoffee, 
          color: 'green',
          description: 'Nghỉ ngắn để thư giãn'
        };
      case 'longBreak':
        return { 
          label: 'Nghỉ dài', 
          icon: IconCoffee, 
          color: 'orange',
          description: 'Nghỉ dài để phục hồi năng lượng'
        };
    }
  };

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      const startTime = new Date();
      
      // Add session to history
      const newSession: TimerSession = {
        mode: currentMode,
        duration: getTimerDuration(currentMode),
        completed: false,
        startTime,
        taskId: selectedTask || undefined
      };
      
      setSessions(prev => [...prev, newSession]);

      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            completeSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const stopTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTimeLeft(getTimerDuration(currentMode));
    
    // Mark current session as incomplete
    setSessions(prev => 
      prev.map((session, index) => 
        index === prev.length - 1 
          ? { ...session, endTime: new Date() }
          : session
      )
    );
  };

  const completeSession = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Play sound notification
    if (audioRef.current) {
      try {
        audioRef.current.play();
      } catch (error) {
        console.log('Could not play audio:', error);
      }
    }

    // Mark session as completed and integrate with other systems
    const endTime = new Date();
    setSessions(prev => 
      prev.map((session, index) => 
        index === prev.length - 1 
          ? { ...session, completed: true, endTime }
          : session
      )
    );

    if (currentMode === 'focus') {
      setSessionsCompleted(prev => prev + 1);
      
      // Integrate with other systems through integration service
      const session = sessions[sessions.length - 1];
      if (session) {
        integrationService.completePomodoroSession({
          taskId: session.taskId,
          mode: currentMode,
          duration: config.focus,
          productivity: 4 // Could be made configurable
        });
      }
      
      // Determine next break type
      const nextSessionCount = sessionsCompleted + 1;
      const shouldTakeLongBreak = nextSessionCount % config.sessionsUntilLongBreak === 0;
      
      const nextMode = shouldTakeLongBreak ? 'longBreak' : 'shortBreak';
      switchMode(nextMode);
      
      notifications.show({
        title: 'Phiên tập trung hoàn thành!',
        message: shouldTakeLongBreak 
          ? 'Bạn đã hoàn thành một chu kỳ! Hãy nghỉ dài một chút.' 
          : 'Tuyệt vời! Hãy nghỉ ngắn và tiếp tục.',
        color: 'green',
        autoClose: 5000
      });
    } else {
      switchMode('focus');
      notifications.show({
        title: 'Giờ nghỉ kết thúc!',
        message: 'Đã đến lúc bắt đầu phiên tập trung tiếp theo.',
        color: 'blue',
        autoClose: 5000
      });
    }
  };

  const switchMode = (mode: TimerMode) => {
    setCurrentMode(mode);
    setTimeLeft(getTimerDuration(mode));
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const skipSession = () => {
    completeSession();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    const totalDuration = getTimerDuration(currentMode);
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  };

  const modeInfo = getModeInfo(currentMode);
  const Icon = modeInfo.icon;

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const todaySessions = sessions.filter(session => {
    const today = new Date();
    const sessionDate = new Date(session.startTime);
    return sessionDate.toDateString() === today.toDateString();
  });

  const todayFocusTime = todaySessions
    .filter(s => s.mode === 'focus' && s.completed)
    .reduce((total, s) => total + s.duration, 0);

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <Group>
            <IconClock size={24} color="#fa5252" />
            <Title order={3}>Pomodoro Timer</Title>
          </Group>
          
          <Badge color={modeInfo.color} leftSection={<Icon size={14} />}>
            {modeInfo.label}
          </Badge>
        </Group>

        {/* Task Selection */}
        {currentMode === 'focus' && (
          <Select
            placeholder={availableTasks.length > 0 
              ? "Chọn nhiệm vụ để tập trung (Tích hợp thông minh)" 
              : "Không có nhiệm vụ nào - Hãy tạo sự kiện mới"
            }
            data={availableTasks}
            value={selectedTask}
            onChange={setSelectedTask}
            leftSection={<IconChecklist size={16} />}
            clearable
            searchable
            allowDeselect={true}
            comboboxProps={{ zIndex: 1000 }}
            description={`${availableTasks.length} nhiệm vụ khả dụng - Chọn để tự động cập nhật thời gian thực tế`}
            disabled={availableTasks.length === 0}
          />
        )}

        {/* Timer Display */}
        <Center>
          <RingProgress
            size={200}
            thickness={8}
            sections={[{ value: getProgress(), color: modeInfo.color }]}
            label={
              <Center>
                <Stack align="center" gap="xs">
                  <Text size="xl" fw={700} ta="center">
                    {formatTime(timeLeft)}
                  </Text>
                  <Text size="sm" c="dimmed" ta="center">
                    {modeInfo.description}
                  </Text>
                </Stack>
              </Center>
            }
          />
        </Center>

        {/* Timer Controls */}
        <Group justify="center" gap="xs">
          <Button
            leftSection={isRunning ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />}
            onClick={isRunning ? pauseTimer : startTimer}
            color={modeInfo.color}
            size="md"
          >
            {isRunning ? 'Tạm dừng' : 'Bắt đầu'}
          </Button>
          
          <ActionIcon 
            size="lg" 
            variant="light" 
            color="red" 
            onClick={stopTimer}
            disabled={!isRunning}
          >
            <IconPlayerStop size={18} />
          </ActionIcon>
          
          <ActionIcon 
            size="lg" 
            variant="light" 
            color="blue" 
            onClick={skipSession}
            disabled={!isRunning}
          >
            <IconPlayerSkipForward size={18} />
          </ActionIcon>
        </Group>

        {/* Mode Switcher */}
        <Group justify="center" gap="xs">
          <Button
            variant={currentMode === 'focus' ? 'filled' : 'light'}
            size="xs"
            onClick={() => switchMode('focus')}
            disabled={isRunning}
          >
            Tập trung ({config.focus}p)
          </Button>
          <Button
            variant={currentMode === 'shortBreak' ? 'filled' : 'light'}
            size="xs"
            color="green"
            onClick={() => switchMode('shortBreak')}
            disabled={isRunning}
          >
            Nghỉ ngắn ({config.shortBreak}p)
          </Button>
          <Button
            variant={currentMode === 'longBreak' ? 'filled' : 'light'}
            size="xs"
            color="orange"
            onClick={() => switchMode('longBreak')}
            disabled={isRunning}
          >
            Nghỉ dài ({config.longBreak}p)
          </Button>
        </Group>

        {/* Today's Stats */}
        <Card withBorder p="sm" radius="sm" bg="gray.0">
          <Group justify="space-between">
            <Stack gap="xs">
              <Text size="sm" fw={500}>Hôm nay</Text>
              <Group gap="md">
                <Group gap="xs">
                  <Text size="sm" c="dimmed">Phiên hoàn thành:</Text>
                  <Badge color="blue">{todaySessions.filter(s => s.completed).length}</Badge>
                </Group>
                <Group gap="xs">
                  <Text size="sm" c="dimmed">Thời gian tập trung:</Text>
                  <Badge color="green">{Math.round(todayFocusTime / 60)}p</Badge>
                </Group>
              </Group>
            </Stack>
            
            <Text size="sm" c="dimmed">
              Chu kỳ: {sessionsCompleted % config.sessionsUntilLongBreak}/{config.sessionsUntilLongBreak}
            </Text>
          </Group>
        </Card>

        {/* Quick Settings */}
        <Group justify="center">
          <Select
            label="Thời gian tập trung"
            value={config.focus.toString()}
            onChange={(value) => {
              const newFocus = Number(value) || 25;
              setConfig(prev => ({ ...prev, focus: newFocus }));
              if (currentMode === 'focus' && !isRunning) {
                setTimeLeft(newFocus * 60);
              }
            }}
            data={[
              { value: '15', label: '15 phút' },
              { value: '25', label: '25 phút' },
              { value: '30', label: '30 phút' },
              { value: '45', label: '45 phút' },
              { value: '60', label: '60 phút' }
            ]}
            size="xs"
            comboboxProps={{ zIndex: 1000 }}
            allowDeselect={false}
            style={{ width: '150px' }}
          />
        </Group>
      </Stack>
    </Paper>
  );
}
