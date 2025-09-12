import { useState, useEffect } from 'react';
import {
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Badge,
  Button,
  Select,
  Card,
  Timeline,
  ActionIcon,
  Alert,
  NumberInput,
  Grid
} from '@mantine/core';
import { 
  IconClock, 
  IconBook, 
  IconBulb, 
  IconRefresh, 
  IconCalendarEvent,
  IconTarget
} from '@tabler/icons-react';
import { useEventStore } from '../store/eventStore';
import dayjs from 'dayjs';

interface StudyRecommendation {
  date: string;
  subjects: string[];
  totalHours: number;
  recommendations: string[];
  priority: 'high' | 'medium' | 'low';
  workload: 'light' | 'moderate' | 'heavy';
}

export function StudyScheduleGenerator() {
  const { events } = useEventStore();
  const [schedule, setSchedule] = useState<StudyRecommendation[]>([]);
  const [studyHoursPerDay, setStudyHoursPerDay] = useState(4);
  const [timeHorizon, setTimeHorizon] = useState(7);
  const [focusSubject, setFocusSubject] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  // Get unique subjects
  const subjects = Array.from(new Set(events.map(e => e.course).filter(Boolean)));

  const generateStudySchedule = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const newSchedule: StudyRecommendation[] = [];
      const now = dayjs();
      
      for (let i = 0; i < timeHorizon; i++) {
        const date = now.add(i, 'day');
        const dateStr = date.format('YYYY-MM-DD');
        
        // Get events for this day
        const dayEvents = events.filter(e => 
          dayjs(e.startTime).isSame(date, 'day')
        );
        
        // Calculate available study time
        const eventHours = dayEvents.reduce((total, event) => 
          total + (event.estimatedTime || 1), 0
        );
        
        const availableStudyTime = Math.max(0, studyHoursPerDay - eventHours);
        
        // Get upcoming deadlines (next 7 days)
        const upcomingDeadlines = events.filter(e => 
          e.type === 'deadline' && 
          dayjs(e.startTime).isAfter(date) &&
          dayjs(e.startTime).isBefore(date.add(7, 'day'))
        );
        
        // Prioritize subjects based on deadlines
        let prioritizedSubjects = subjects;
        if (focusSubject !== 'all') {
          prioritizedSubjects = [focusSubject];
        } else {
          prioritizedSubjects = subjects.sort((a, b) => {
            const aDeadlines = upcomingDeadlines.filter(e => e.course === a);
            const bDeadlines = upcomingDeadlines.filter(e => e.course === b);
            return bDeadlines.length - aDeadlines.length;
          });
        }
        
        // Generate recommendations
        const recommendations = [];
        let priority: 'high' | 'medium' | 'low' = 'medium';
        let workload: 'light' | 'moderate' | 'heavy' = 'moderate';
        
        if (availableStudyTime >= 3) {
          recommendations.push(`Có ${availableStudyTime} giờ để học. Thời gian tốt để tập trung học sâu.`);
          workload = availableStudyTime >= 5 ? 'heavy' : 'moderate';
          
          if (prioritizedSubjects[0]) {
            recommendations.push(`Ưu tiên học ${prioritizedSubjects[0]} - có deadline sắp tới.`);
          }
        } else if (availableStudyTime > 0) {
          recommendations.push(`Thời gian học hạn chế (${availableStudyTime}h). Ôn tập nhanh các khái niệm chính.`);
          workload = 'light';
        } else {
          recommendations.push('Ngày bận rộn. Có thể ôn tập trong khoảng thời gian nghỉ ngắn.');
          workload = 'light';
        }
        
        // Check for urgent deadlines
        const urgentDeadlines = upcomingDeadlines.filter(e => 
          dayjs(e.startTime).diff(date, 'day') <= 2
        );
        
        if (urgentDeadlines.length > 0) {
          priority = 'high';
          recommendations.push(`Có ${urgentDeadlines.length} deadline gấp trong 2 ngày tới!`);
        }
        
        // Weekend recommendations
        if (date.day() === 0 || date.day() === 6) {
          recommendations.push('Cuối tuần - thời gian tốt để học sâu và làm project lớn.');
          if (availableStudyTime < 2) {
            recommendations.push('Hãy dành thêm thời gian học vào cuối tuần.');
          }
        }
        
        // Productivity tips
        if (date.day() === 1) {
          recommendations.push('Đầu tuần - năng lượng cao, phù hợp với môn khó.');
        }
        if (date.day() === 5) {
          recommendations.push('Cuối tuần - thời gian tốt để ôn tập và chuẩn bị cho tuần sau.');
        }
        
        newSchedule.push({
          date: dateStr,
          subjects: prioritizedSubjects.filter(Boolean).slice(0, 2) as string[],
          totalHours: availableStudyTime,
          recommendations,
          priority,
          workload
        });
      }
      
      setSchedule(newSchedule);
      setIsGenerating(false);
    }, 1000);
  };

  useEffect(() => {
    generateStudySchedule();
  }, [events, studyHoursPerDay, timeHorizon, focusSubject]);

  const getWorkloadColor = (workload: string) => {
    switch (workload) {
      case 'light': return 'green';
      case 'moderate': return 'yellow';
      case 'heavy': return 'red';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <Group>
            <IconBook size={24} color="#228be6" />
            <Title order={3}>Lịch học thông minh</Title>
          </Group>
          
          <Group gap="xs">
            <ActionIcon variant="light" onClick={generateStudySchedule} loading={isGenerating}>
              <IconRefresh size={16} />
            </ActionIcon>
          </Group>
        </Group>

        {/* Settings */}
        <Card withBorder p="sm" radius="sm" bg="gray.0">
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <NumberInput
                label="Giờ học/ngày"
                value={studyHoursPerDay}
                onChange={(value) => setStudyHoursPerDay(Number(value) || 4)}
                min={1}
                max={12}
                size="xs"
                leftSection={<IconClock size={14} />}
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <Select
                label="Thời gian dự báo"
                value={timeHorizon.toString()}
                onChange={(value) => setTimeHorizon(Number(value) || 7)}
                data={[
                  { value: '3', label: '3 ngày' },
                  { value: '7', label: '1 tuần' },
                  { value: '14', label: '2 tuần' },
                  { value: '30', label: '1 tháng' }
                ]}
                size="xs"
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <Select
                label="Môn học ưu tiên"
                value={focusSubject}
                onChange={(value) => setFocusSubject(value || 'all')}
                data={[
                  { value: 'all', label: 'Tất cả môn' },
                  ...subjects.filter(Boolean).map(subject => ({ 
                    value: subject!, 
                    label: subject! 
                  }))
                ]}
                size="xs"
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <Button 
                variant="light" 
                size="xs" 
                leftSection={<IconTarget size={14} />}
                onClick={generateStudySchedule}
                loading={isGenerating}
                style={{ marginTop: '1.4rem' }}
              >
                Tạo lịch học
              </Button>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Schedule Timeline */}
        {schedule.length > 0 ? (
          <Timeline active={-1} bulletSize={24}>
            {schedule.map((day) => (
              <Timeline.Item
                key={day.date}
                bullet={<IconCalendarEvent size={16} />}
                title={
                  <Group gap="xs">
                    <Text fw={500}>
                      {dayjs(day.date).format('dddd, DD/MM')}
                    </Text>
                    <Badge color={getWorkloadColor(day.workload)} size="sm">
                      {day.workload === 'light' ? 'Nhẹ' : 
                       day.workload === 'moderate' ? 'Vừa' : 'Nặng'}
                    </Badge>
                    <Badge color={getPriorityColor(day.priority)} size="sm">
                      {day.priority === 'high' ? 'Gấp' : 
                       day.priority === 'medium' ? 'Bình thường' : 'Không gấp'}
                    </Badge>
                  </Group>
                }
              >
                <Card withBorder p="sm" radius="sm" mt="xs">
                  <Stack gap="xs">
                    <Group gap="xs">
                      <IconClock size={14} />
                      <Text size="sm" fw={500}>
                        {day.totalHours} giờ học khả dụng
                      </Text>
                    </Group>
                    
                    {day.subjects.length > 0 && (
                      <Group gap="xs">
                        <Text size="sm" c="dimmed">Môn học ưu tiên:</Text>
                        {day.subjects.map((subject, idx) => (
                          <Badge key={idx} size="sm" variant="light">
                            {subject}
                          </Badge>
                        ))}
                      </Group>
                    )}
                    
                    <Stack gap="xs">
                      {day.recommendations.map((rec, idx) => (
                        <Group key={idx} gap="xs" align="flex-start">
                          <IconBulb size={14} color="#fab005" />
                          <Text size="sm">{rec}</Text>
                        </Group>
                      ))}
                    </Stack>
                  </Stack>
                </Card>
              </Timeline.Item>
            ))}
          </Timeline>
        ) : (
          <Alert icon={<IconBulb size={16} />} color="blue">
            Đang tạo lịch học thông minh cho bạn...
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}
