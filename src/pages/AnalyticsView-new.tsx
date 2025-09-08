import { useMemo } from 'react';
import {
  Container,
  Paper,
  Text,
  Stack,
  Group,
  Card,
  SimpleGrid,
  RingProgress,
  ThemeIcon,
  Badge,
  Progress,
  Title,
  Tabs,
  Alert,
  List,
  Button,
  Tooltip,
  ActionIcon
} from '@mantine/core';
import { 
  IconCalendar, 
  IconClock, 
  IconTrendingUp, 
  IconTarget,
  IconBrain,
  IconChartLine,
  IconAlertTriangle,
  IconBulb,
  IconDownload,
  IconRefresh
} from '@tabler/icons-react';
import { useEventStore } from '../store/eventStore';
import { analyticsService } from '../services/analyticsService';
import { calendarService } from '../services/calendarService';

export function AnalyticsView() {
  const { events } = useEventStore();
  
  // Advanced analytics data
  const analyticsData = useMemo(() => {
    return analyticsService.generateAdvancedAnalytics(events);
  }, [events]);

  const performanceMetrics = useMemo(() => {
    return analyticsService.calculatePerformanceMetrics(events);
  }, [events]);

  const studySchedule = useMemo(() => {
    return calendarService.generateStudySchedule(events, 4);
  }, [events]);

  // Basic statistics
  const stats = useMemo(() => {
    const total = events.length;
    const completed = events.filter(e => e.status === 'done').length;
    const pending = events.filter(e => e.status === 'todo').length;
    const inProgress = events.filter(e => e.status === 'in-progress').length;
    const overdue = events.filter(e => 
      new Date(e.startTime) < new Date() && e.status !== 'done'
    ).length;

    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    const eventsByType = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventsByPriority = events.reduce((acc, event) => {
      const priority = event.priority || 'medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      completed,
      pending,
      inProgress,
      overdue,
      completionRate,
      eventsByType,
      eventsByPriority
    };
  }, [events]);

  const getPerformanceColor = (rating: string) => {
    switch (rating) {
      case 'Excellent': return 'green';
      case 'Good': return 'blue';
      case 'Fair': return 'yellow';
      case 'Poor': return 'red';
      default: return 'gray';
    }
  };

  const handleExport = () => {
    const data = analyticsService.exportAnalyticsData(events);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-planner-analytics-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container size="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>Advanced Analytics</Title>
            <Text c="dimmed">Phân tích hiệu suất và insights thông minh với AI</Text>
          </div>
          <Group>
            <Tooltip label="Xuất dữ liệu analytics">
              <ActionIcon variant="outline" onClick={handleExport}>
                <IconDownload size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Refresh analytics">
              <ActionIcon variant="outline" onClick={() => window.location.reload()}>
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        <Tabs defaultValue="overview">
          <Tabs.List>
            <Tabs.Tab value="overview" leftSection={<IconChartLine size={16} />}>
              Tổng Quan
            </Tabs.Tab>
            <Tabs.Tab value="performance" leftSection={<IconTarget size={16} />}>
              Hiệu Suất
            </Tabs.Tab>
            <Tabs.Tab value="patterns" leftSection={<IconBrain size={16} />}>
              Patterns & AI
            </Tabs.Tab>
            <Tabs.Tab value="predictions" leftSection={<IconTrendingUp size={16} />}>
              Dự Đoán
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="lg">
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
              {/* Basic Stats Cards */}
              <Card withBorder p="lg">
                <Group justify="space-between">
                  <div>
                    <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                      Tổng Sự Kiện
                    </Text>
                    <Text fw={700} size="xl">
                      {stats.total}
                    </Text>
                  </div>
                  <ThemeIcon color="blue" variant="light" size={38} radius="md">
                    <IconCalendar size={18} />
                  </ThemeIcon>
                </Group>
              </Card>

              <Card withBorder p="lg">
                <Group justify="space-between">
                  <div>
                    <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                      Hoàn Thành
                    </Text>
                    <Text fw={700} size="xl">
                      {stats.completed}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {stats.completionRate.toFixed(1)}%
                    </Text>
                  </div>
                  <RingProgress
                    size={38}
                    thickness={4}
                    sections={[{ value: stats.completionRate, color: 'green' }]}
                  />
                </Group>
              </Card>

              <Card withBorder p="lg">
                <Group justify="space-between">
                  <div>
                    <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                      Đang Thực Hiện
                    </Text>
                    <Text fw={700} size="xl">
                      {stats.inProgress}
                    </Text>
                  </div>
                  <ThemeIcon color="yellow" variant="light" size={38} radius="md">
                    <IconClock size={18} />
                  </ThemeIcon>
                </Group>
              </Card>

              <Card withBorder p="lg">
                <Group justify="space-between">
                  <div>
                    <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                      Quá Hạn
                    </Text>
                    <Text fw={700} size="xl" c="red">
                      {stats.overdue}
                    </Text>
                  </div>
                  <ThemeIcon color="red" variant="light" size={38} radius="md">
                    <IconAlertTriangle size={18} />
                  </ThemeIcon>
                </Group>
              </Card>
            </SimpleGrid>

            {/* Charts */}
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              <Card withBorder p="lg">
                <Text fw={500} mb="md">Phân Bố Theo Loại</Text>
                <Stack gap="sm">
                  {Object.entries(stats.eventsByType).map(([type, count]) => {
                    const percentage = (count / stats.total) * 100;
                    return (
                      <div key={type}>
                        <Group justify="space-between" mb={5}>
                          <Text size="sm" tt="capitalize">{type}</Text>
                          <Text size="sm" fw={500}>{count}</Text>
                        </Group>
                        <Progress value={percentage} size="sm" />
                      </div>
                    );
                  })}
                </Stack>
              </Card>

              <Card withBorder p="lg">
                <Text fw={500} mb="md">Phân Bố Theo Độ Ưu Tiên</Text>
                <Stack gap="sm">
                  {Object.entries(stats.eventsByPriority).map(([priority, count]) => {
                    const percentage = (count / stats.total) * 100;
                    const color = priority === 'high' ? 'red' : priority === 'medium' ? 'yellow' : 'green';
                    return (
                      <div key={priority}>
                        <Group justify="space-between" mb={5}>
                          <Text size="sm" tt="capitalize">{priority}</Text>
                          <Text size="sm" fw={500}>{count}</Text>
                        </Group>
                        <Progress value={percentage} size="sm" color={color} />
                      </div>
                    );
                  })}
                </Stack>
              </Card>
            </SimpleGrid>
          </Tabs.Panel>

          <Tabs.Panel value="performance" pt="lg">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              <Card withBorder p="lg">
                <Group justify="space-between" mb="md">
                  <Text fw={500}>Performance Metrics</Text>
                  <Badge color={getPerformanceColor(performanceMetrics.timeManagementRating)}>
                    {performanceMetrics.timeManagementRating}
                  </Badge>
                </Group>
                
                <Stack gap="md">
                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm">Tỷ lệ hoàn thành</Text>
                      <Text size="sm" fw={500}>{performanceMetrics.completionRate.toFixed(1)}%</Text>
                    </Group>
                    <Progress value={performanceMetrics.completionRate} />
                  </div>
                  
                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm">Productivity Score</Text>
                      <Text size="sm" fw={500}>{performanceMetrics.productivityScore.toFixed(1)}/100</Text>
                    </Group>
                    <Progress value={performanceMetrics.productivityScore} color="blue" />
                  </div>
                  
                  <div>
                    <Text size="sm" mb="xs">Độ trễ trung bình</Text>
                    <Text size="lg" fw={500} c="orange">
                      {performanceMetrics.averageDelay.toFixed(1)} ngày
                    </Text>
                  </div>
                </Stack>
              </Card>

              <Card withBorder p="lg">
                <Text fw={500} mb="md">Khu Vực Cần Cải Thiện</Text>
                {performanceMetrics.improvementAreas.length > 0 ? (
                  <List spacing="sm">
                    {performanceMetrics.improvementAreas.map((area, index) => (
                      <List.Item key={index}>{area}</List.Item>
                    ))}
                  </List>
                ) : (
                  <Alert color="green" icon={<IconBulb size={16} />}>
                    Xuất sắc! Không có khu vực nào cần cải thiện.
                  </Alert>
                )}
              </Card>
            </SimpleGrid>

            {/* Productivity Trends */}
            <Card withBorder p="lg">
              <Text fw={500} mb="md">Xu Hướng Hiệu Suất</Text>
              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
                <div>
                  <Text size="sm" c="dimmed" mb="xs">30 ngày qua</Text>
                  <Group gap="xs">
                    {analyticsData.productivity.daily.slice(-7).map((value, index) => (
                      <div
                        key={index}
                        style={{
                          width: 20,
                          height: Math.max(4, value * 8),
                          backgroundColor: 'var(--mantine-color-blue-6)',
                          borderRadius: 2
                        }}
                      />
                    ))}
                  </Group>
                </div>
                
                <div>
                  <Text size="sm" c="dimmed" mb="xs">Xu hướng</Text>
                  <Stack gap="xs">
                    {analyticsData.productivity.trends.map((trend, index) => (
                      <Badge key={index} variant="light" size="sm">
                        {trend}
                      </Badge>
                    ))}
                  </Stack>
                </div>
              </SimpleGrid>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="patterns" pt="lg">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              <Card withBorder p="lg">
                <Text fw={500} mb="md">Giờ Làm Việc Hiệu Quả Nhất</Text>
                <Stack gap="sm">
                  {analyticsData.patterns.peakHours.slice(0, 5).map((hour, index) => (
                    <Group key={index} justify="space-between">
                      <Text size="sm">
                        {hour.hour}:00 {hour.hour < 12 ? 'AM' : 'PM'}
                      </Text>
                      <Badge variant="light">{hour.count} sự kiện</Badge>
                    </Group>
                  ))}
                </Stack>
              </Card>

              <Card withBorder p="lg">
                <Text fw={500} mb="md">Hiệu Suất Theo Môn Học</Text>
                <Stack gap="sm">
                  {analyticsData.patterns.courseworkDistribution.slice(0, 5).map((course, index) => (
                    <div key={index}>
                      <Group justify="space-between" mb="xs">
                        <Text size="sm">{course.course}</Text>
                        <Text size="sm" fw={500}>{course.completion.toFixed(1)}%</Text>
                      </Group>
                      <Progress 
                        value={course.completion} 
                        color={course.completion > 80 ? 'green' : course.completion > 60 ? 'yellow' : 'red'}
                      />
                    </div>
                  ))}
                </Stack>
              </Card>

              <Card withBorder p="lg" style={{ gridColumn: '1 / -1' }}>
                <Text fw={500} mb="md">AI Insights</Text>
                {analyticsData.insights.length > 0 ? (
                  <Stack gap="sm">
                    {analyticsData.insights.map((insight, index) => (
                      <Alert key={index} variant="light" icon={<IconBulb size={16} />}>
                        {insight}
                      </Alert>
                    ))}
                  </Stack>
                ) : (
                  <Text c="dimmed">Chưa đủ dữ liệu để tạo insights.</Text>
                )}
              </Card>
            </SimpleGrid>
          </Tabs.Panel>

          <Tabs.Panel value="predictions" pt="lg">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              <Card withBorder p="lg">
                <Text fw={500} mb="md">Dự Đoán Overload</Text>
                {analyticsData.predictions.overloadDays.length > 0 ? (
                  <Stack gap="sm">
                    {analyticsData.predictions.overloadDays.map((day, index) => (
                      <Alert key={index} color="orange" variant="light">
                        Ngày {day} có thể quá tải
                      </Alert>
                    ))}
                  </Stack>
                ) : (
                  <Alert color="green" icon={<IconBulb size={16} />}>
                    Không có ngày nào dự đoán quá tải trong 2 tuần tới.
                  </Alert>
                )}
              </Card>

              <Card withBorder p="lg">
                <Text fw={500} mb="md">Burnout Risk</Text>
                <div style={{ textAlign: 'center' }}>
                  <RingProgress
                    size={120}
                    thickness={12}
                    sections={[
                      { 
                        value: analyticsData.predictions.burnoutRisk, 
                        color: analyticsData.predictions.burnoutRisk > 70 ? 'red' : 
                               analyticsData.predictions.burnoutRisk > 40 ? 'yellow' : 'green'
                      }
                    ]}
                    label={
                      <Text ta="center" fw={700} size="lg">
                        {analyticsData.predictions.burnoutRisk.toFixed(0)}%
                      </Text>
                    }
                  />
                  <Text size="sm" c="dimmed" mt="md">
                    Rủi ro burnout dựa trên workload
                  </Text>
                </div>
              </Card>

              <Card withBorder p="lg" style={{ gridColumn: '1 / -1' }}>
                <Text fw={500} mb="md">Thời Gian Học Được Đề Xuất</Text>
                <Group>
                  {analyticsData.predictions.recommendedStudyTimes.map((time, index) => (
                    <Badge key={index} size="lg" variant="light">
                      {time}
                    </Badge>
                  ))}
                </Group>
              </Card>

              <Card withBorder p="lg" style={{ gridColumn: '1 / -1' }}>
                <Text fw={500} mb="md">Lịch Học Thông Minh (7 ngày tới)</Text>
                <Stack gap="sm">
                  {studySchedule.slice(0, 7).map((day, index) => (
                    <Paper key={index} p="sm" withBorder>
                      <Group justify="space-between">
                        <div>
                          <Text fw={500}>{new Date(day.date).toLocaleDateString('vi-VN')}</Text>
                          <Text size="sm" c="dimmed">
                            {day.totalHours}h khả dụng • {day.subjects.join(', ')}
                          </Text>
                        </div>
                        <Button size="xs" variant="light">
                          Chi tiết
                        </Button>
                      </Group>
                      {day.recommendations.length > 0 && (
                        <Text size="xs" c="blue" mt="xs">
                          💡 {day.recommendations[0]}
                        </Text>
                      )}
                    </Paper>
                  ))}
                </Stack>
              </Card>
            </SimpleGrid>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
