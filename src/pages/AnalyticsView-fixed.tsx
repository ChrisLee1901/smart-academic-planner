import { useMemo } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Grid,
  Card,
  Group,
  Badge,
  Stack,
  Progress,
  Box,
  SimpleGrid,
  ThemeIcon,
  List,
  Alert,
} from '@mantine/core';
import {
  IconTrendingUp,
  IconBooks,
  IconClock,
  IconTarget,
  IconCalendarStats,
  IconBrain,
  IconCheckbox,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useEventStore } from '../store/eventStore';
import dayjs from 'dayjs';

export default function AnalyticsView() {
  const { events } = useEventStore();

  // Safe analytics calculations with fallbacks
  const analyticsData = useMemo(() => {
    try {
      if (!events || events.length === 0) {
        return {
          totalEvents: 0,
          completedEvents: 0,
          completionRate: 0,
          averageScore: 0,
          totalStudyTime: 0,
          topCategories: [],
          recentTrends: [],
          insights: ['Thêm sự kiện để xem phân tích chi tiết']
        };
      }

      const completed = events.filter(e => e.status === 'done');
      const completionRate = events.length > 0 ? (completed.length / events.length) * 100 : 0;
      
      // Calculate average estimated vs actual time efficiency
      const eventsWithTime = events.filter(e => e.estimatedTime && e.actualTime);
      const timeEfficiency = eventsWithTime.length > 0 
        ? eventsWithTime.reduce((sum, e) => {
            const efficiency = (e.estimatedTime! / e.actualTime!) * 100;
            return sum + Math.min(efficiency, 200); // Cap at 200% efficiency
          }, 0) / eventsWithTime.length 
        : 100;

      // Calculate total study time (estimate)
      const totalStudyTime = events.reduce((sum, e) => {
        const duration = dayjs(e.endTime || e.startTime).diff(dayjs(e.startTime), 'hour');
        return sum + Math.max(0, duration);
      }, 0);

      // Top types (instead of categories)
      const typeCount: Record<string, number> = {};
      events.forEach(e => {
        if (e.type) {
          typeCount[e.type] = (typeCount[e.type] || 0) + 1;
        }
      });
      
      const topTypes = Object.entries(typeCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 4)
        .map(([type, count]) => ({ type, count }));

      // Priority distribution
      const priorityCount: Record<string, number> = {};
      events.forEach(e => {
        const priority = e.priority || 'medium';
        priorityCount[priority] = (priorityCount[priority] || 0) + 1;
      });

      // Simple insights
      const insights = [];
      if (completionRate >= 80) {
        insights.push('Bạn đang duy trì tỷ lệ hoàn thành tốt!');
      } else if (completionRate < 50) {
        insights.push('Hãy cố gắng hoàn thành nhiều nhiệm vụ hơn.');
      }
      
      if (timeEfficiency >= 100) {
        insights.push('Bạn ước tính thời gian khá chính xác!');
      }
      
      if (totalStudyTime > 40) {
        insights.push('Bạn đã dành nhiều thời gian học tập trong tuần.');
      }

      return {
        totalEvents: events.length,
        completedEvents: completed.length,
        completionRate,
        timeEfficiency,
        totalStudyTime,
        topTypes,
        priorityCount,
        insights: insights.length > 0 ? insights : ['Tiếp tục theo dõi để có thêm thông tin chi tiết']
      };
    } catch (error) {
      console.error('Analytics calculation error:', error);
      return {
        totalEvents: 0,
        completedEvents: 0,
        completionRate: 0,
        averageScore: 0,
        totalStudyTime: 0,
        topCategories: [],
        insights: ['Có lỗi khi tính toán phân tích']
      };
    }
  }, [events]);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'green';
    if (score >= 6) return 'yellow';
    return 'red';
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'green';
    if (rate >= 60) return 'yellow';
    return 'red';
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Box>
          <Title order={1} mb="md">📊 Phân tích hiệu suất học tập</Title>
          <Text c="dimmed" size="lg">
            Theo dõi tiến trình và hiệu quả học tập của bạn
          </Text>
        </Box>

        {/* Overview Stats */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          <Card withBorder padding="lg">
            <Group justify="apart" mb="xs">
              <Text size="sm" c="dimmed" fw={500}>Tổng số sự kiện</Text>
              <ThemeIcon variant="light" color="blue" size="sm">
                <IconBooks size={16} />
              </ThemeIcon>
            </Group>
            <Text fw={700} size="xl">{analyticsData.totalEvents}</Text>
          </Card>

          <Card withBorder padding="lg">
            <Group justify="apart" mb="xs">
              <Text size="sm" c="dimmed" fw={500}>Đã hoàn thành</Text>
              <ThemeIcon variant="light" color="green" size="sm">
                <IconCheckbox size={16} />
              </ThemeIcon>
            </Group>
            <Text fw={700} size="xl">{analyticsData.completedEvents}</Text>
          </Card>

          <Card withBorder padding="lg">
            <Group justify="apart" mb="xs">
              <Text size="sm" c="dimmed" fw={500}>Tỷ lệ hoàn thành</Text>
              <ThemeIcon variant="light" color={getCompletionColor(analyticsData.completionRate)} size="sm">
                <IconTarget size={16} />
              </ThemeIcon>
            </Group>
            <Text fw={700} size="xl">{analyticsData.completionRate.toFixed(1)}%</Text>
            <Progress 
              value={analyticsData.completionRate} 
              color={getCompletionColor(analyticsData.completionRate)}
              size="sm" 
              mt="xs"
            />
          </Card>

          <Card withBorder padding="lg">
            <Group justify="apart" mb="xs">
              <Text size="sm" c="dimmed" fw={500}>Hiệu quả thời gian</Text>
              <ThemeIcon variant="light" color={getScoreColor(analyticsData.timeEfficiency || 0)} size="sm">
                <IconTrendingUp size={16} />
              </ThemeIcon>
            </Group>
            <Text fw={700} size="xl">{(analyticsData.timeEfficiency || 0).toFixed(1)}%</Text>
          </Card>
        </SimpleGrid>

        <Grid>
          {/* Time Analysis */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper withBorder p="md" h="100%">
              <Group mb="md">
                <ThemeIcon variant="light" color="violet">
                  <IconClock size={20} />
                </ThemeIcon>
                <Title order={3}>Thời gian học tập</Title>
              </Group>
              
              <Stack gap="sm">
                <Box>
                  <Text size="sm" c="dimmed">Tổng thời gian học trong tuần</Text>
                  <Text size="xl" fw={700} c="violet">
                    {analyticsData.totalStudyTime.toFixed(1)} giờ
                  </Text>
                </Box>
                
                <Box>
                  <Text size="sm" c="dimmed">Trung bình mỗi ngày</Text>
                  <Text size="lg" fw={500}>
                    {(analyticsData.totalStudyTime / 7).toFixed(1)} giờ
                  </Text>
                </Box>
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Top Types */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper withBorder p="md" h="100%">
              <Group mb="md">
                <ThemeIcon variant="light" color="orange">
                  <IconCalendarStats size={20} />
                </ThemeIcon>
                <Title order={3}>Loại sự kiện hàng đầu</Title>
              </Group>
              
              <Stack gap="xs">
                {analyticsData.topTypes && analyticsData.topTypes.length > 0 ? (
                  analyticsData.topTypes.map((item: any, index: number) => (
                    <Group key={item.type} justify="apart">
                      <Badge variant="light" color={index === 0 ? 'blue' : index === 1 ? 'green' : 'orange'}>
                        {item.type === 'deadline' ? 'Deadline' : 
                         item.type === 'class' ? 'Lớp học' :
                         item.type === 'project' ? 'Dự án' : 'Cá nhân'}
                      </Badge>
                      <Text size="sm" fw={500}>{item.count} sự kiện</Text>
                    </Group>
                  ))
                ) : (
                  <Text c="dimmed" ta="center">Chưa có dữ liệu</Text>
                )}
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Insights */}
          <Grid.Col span={12}>
            <Paper withBorder p="md">
              <Group mb="md">
                <ThemeIcon variant="light" color="blue">
                  <IconBrain size={20} />
                </ThemeIcon>
                <Title order={3}>Thông tin chi tiết</Title>
              </Group>
              
              <List spacing="xs" size="sm" center>
                {analyticsData.insights.map((insight, index) => (
                  <List.Item key={index}>
                    <Text>{insight}</Text>
                  </List.Item>
                ))}
              </List>
            </Paper>
          </Grid.Col>
        </Grid>

        {events.length === 0 && (
          <Alert icon={<IconAlertCircle size={16} />} title="Chưa có dữ liệu" color="blue">
            Thêm một số sự kiện vào lịch để xem phân tích chi tiết về hiệu suất học tập của bạn.
          </Alert>
        )}
      </Stack>
    </Container>
  );
}
