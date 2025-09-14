import { useState } from 'react';
import {
  Container,
  Paper,
  Text,
  TextInput,
  Button,
  Stack,
  Card,
  Badge,
  Group,
  Alert,
  List,
  Progress,
  Tabs,
  Title,
  Textarea,
  ActionIcon,
  CopyButton,
  Tooltip
} from '@mantine/core';
import { IconBrain, IconSend, IconBulb, IconDownload, IconCopy, IconCheck, IconAlertCircle, IconCalendarEvent } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useEventStore } from '../store/eventStore';
import { aiService } from '../services/aiService';
import { analyticsService } from '../services/analyticsService';
import { calendarService } from '../services/calendarService';
import { generateId } from '../utils/dateUtils';

interface AIAssistantViewProps {
  onTabChange?: (tab: string) => void;
}

export function AIAssistantView({ onTabChange }: AIAssistantViewProps = {}) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [exportData, setExportData] = useState('');
  
  const { events, addEvent } = useEventStore();

  const handleCreateInProgress = async () => {
    if (!input.trim()) return;
    
    setIsProcessing(true);
    setLastResult(null);
    
    try {
      const result = await aiService.parseNaturalLanguage(input);
      
      if (result.error) {
        setLastResult(result);
        return;
      }
      
      if (result.confidence > 0.6 && result.event.title) {
        const newEvent = {
          id: generateId(),
          title: result.event.title,
          type: result.event.type || 'personal',
          startTime: result.event.startTime || new Date(),
          status: 'in-progress' as const, // Set to in-progress instead of todo
          priority: result.event.priority || 'medium',
          course: result.event.course,
          estimatedTime: result.event.estimatedTime
        };
        
        const conflicts = aiService.detectConflicts(newEvent, events);
        if (conflicts.length === 0) {
          addEvent(newEvent);
          setInput('');
          
          // Show success notification popup for in-progress task
          notifications.show({
            id: 'task-created-in-progress',
            title: '✅ Tạo task "Đang làm" thành công!',
            message: `"${newEvent.title}" đã được thêm vào bảng Đang làm. Click để xem trong Kanban!`,
            color: 'blue',
            autoClose: 8000,
            onClick: () => {
              onTabChange?.('dashboard');
              notifications.hide('task-created-in-progress');
            },
            style: { cursor: 'pointer' }
          });
        } else {
          setLastResult({
            ...result,
            conflicts,
            event: newEvent
          });
        }
      }
      
    } catch (error) {
      console.error('AI processing error:', error);
      setLastResult({
        confidence: 0,
        event: {},
        error: "Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại.",
        suggestions: [
          'Kiểm tra kết nối mạng',
          'Thử lại với câu lệnh đơn giản hơn',
          'Liên hệ hỗ trợ nếu vấn đề tiếp tục'
        ]
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcess = async () => {
    if (!input.trim()) return;
    
    setIsProcessing(true);
    setLastResult(null); // Clear previous results
    
    try {
      const result = await aiService.parseNaturalLanguage(input);
      setLastResult(result);
      
      // Show error if AI cannot create event properly
      if (result.error) {
        // Don't add event if there's an error
        return;
      }
      
      if (result.confidence > 0.6 && result.event.title) {
        const newEvent = {
          id: generateId(),
          title: result.event.title,
          type: result.event.type || 'personal',
          startTime: result.event.startTime || new Date(),
          status: 'todo' as const,
          priority: result.event.priority || 'medium',
          course: result.event.course,
          estimatedTime: result.event.estimatedTime
        };
        
        // Check for conflicts
        const conflicts = aiService.detectConflicts(newEvent, events);
        if (conflicts.length === 0) {
          addEvent(newEvent);
          setInput('');
          
          // Show success notification popup
          notifications.show({
            id: 'task-created-success',
            title: '✅ Tạo task thành công!',
            message: `"${newEvent.title}" đã được thêm vào danh sách Todo. Click để xem trong Kanban!`,
            color: 'green',
            autoClose: 8000,
            onClick: () => {
              onTabChange?.('dashboard');
              notifications.hide('task-created-success');
            },
            style: { cursor: 'pointer' }
          });
        } else {
          setLastResult({
            ...result,
            conflicts,
            event: newEvent
          });
        }
      } else if (result.confidence > 0 && result.confidence <= 0.6) {
        // Low confidence but some information extracted
        // Show the extracted info but don't auto-create
      }
      
      // Generate smart suggestions
      const smartSuggestions = aiService.generateSmartSuggestions(events);
      setSuggestions(smartSuggestions);
      
    } catch (error) {
      console.error('AI processing error:', error);
      setLastResult({
        confidence: 0,
        event: {},
        error: "Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại.",
        suggestions: [
          'Kiểm tra kết nối mạng',
          'Thử lại với câu lệnh đơn giản hơn',
          'Liên hệ hỗ trợ nếu vấn đề tiếp tục'
        ]
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportAnalytics = () => {
    const data = analyticsService.exportAnalyticsData(events);
    setExportData(data);
  };

  const handleExportCalendar = (format: 'ics' | 'json' | 'csv') => {
    const data = calendarService.exportCalendar(events, format);
    setExportData(data);
  };

  const addConflictedEvent = () => {
    if (lastResult?.event) {
      addEvent(lastResult.event);
      setLastResult(null);
      setInput('');
      
      // Show success notification for conflicted event
      notifications.show({
        id: 'conflicted-task-created',
        title: '✅ Task đã được thêm!',
        message: `"${lastResult.event.title}" đã được thêm dù có xung đột. Click để xem trong Kanban!`,
        color: 'orange',
        autoClose: 8000,
        onClick: () => {
          onTabChange?.('dashboard');
          notifications.hide('conflicted-task-created');
        },
        style: { cursor: 'pointer' }
      });
    }
  };

  return (
    <Container size="lg">

      <Stack gap="lg">
        <Paper p="xl" withBorder>
          <Group mb="lg">
            <IconBrain size={32} />
            <div>
              <Title order={2}>AI Assistant</Title>
              <Text c="dimmed">Tạo sự kiện bằng ngôn ngữ tự nhiên và nhận insights thông minh</Text>
            </div>
          </Group>

          <Tabs defaultValue="create">
            <Tabs.List>
              <Tabs.Tab value="create">Tạo Sự Kiện</Tabs.Tab>
              <Tabs.Tab value="insights">Smart Insights</Tabs.Tab>
              <Tabs.Tab value="export">Xuất Dữ Liệu</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="create" pt="lg">
              <Stack>
                <TextInput
                  placeholder="VD: Nộp bài tập Toán vào thứ 3 lúc 5 giờ chiều"
                  value={input}
                  onChange={(e) => setInput(e.currentTarget.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleProcess()}
                  rightSection={
                    <ActionIcon 
                      variant="filled" 
                      onClick={handleProcess}
                      loading={isProcessing}
                    >
                      <IconSend size={16} />
                    </ActionIcon>
                  }
                />

                {/* Quick Action Buttons */}
                <Group>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCreateInProgress}
                    loading={isProcessing}
                    leftSection={<IconCalendarEvent size={16} />}
                  >
                    Tạo & Bắt đầu làm ngay
                  </Button>
                  <Text size="sm" c="dimmed">
                    Hoặc nhấn Enter để tạo task thông thường
                  </Text>
                </Group>

                {lastResult && (
                  <Card withBorder>
                    <Group justify="space-between" mb="md">
                      <Text fw={500}>Kết Quả Phân Tích</Text>
                      <Badge 
                        color={lastResult.confidence > 0.8 ? 'green' : lastResult.confidence > 0.5 ? 'yellow' : 'red'}
                      >
                        {Math.round(lastResult.confidence * 100)}% Chính Xác
                      </Badge>
                    </Group>
                    
                    <Progress value={lastResult.confidence * 100} mb="md" />
                    
                    {lastResult.error && (
                      <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
                        <Text fw={500} mb="xs">Lỗi:</Text>
                        <Text>{lastResult.error}</Text>
                        {lastResult.suggestions && (
                          <>
                            <Text fw={500} mt="xs" mb="xs">Gợi ý:</Text>
                            <List size="sm">
                              {lastResult.suggestions.map((suggestion: string, index: number) => (
                                <List.Item key={index}>{suggestion}</List.Item>
                              ))}
                            </List>
                          </>
                        )}
                      </Alert>
                    )}
                    
                    {lastResult.event.title && (
                      <Stack gap="xs">
                        <Text><strong>Tiêu đề:</strong> {lastResult.event.title}</Text>
                        <Text><strong>Loại:</strong> {lastResult.event.type}</Text>
                        <Text><strong>Thời gian:</strong> {new Date(lastResult.event.startTime).toLocaleString('vi-VN')}</Text>
                        <Text><strong>Ưu tiên:</strong> {lastResult.event.priority}</Text>
                        {lastResult.event.course && <Text><strong>Môn học:</strong> {lastResult.event.course}</Text>}
                        {lastResult.event.estimatedTime && <Text><strong>Thời gian ước tính:</strong> {lastResult.event.estimatedTime} giờ</Text>}
                      </Stack>
                    )}

                    {lastResult.conflicts && lastResult.conflicts.length > 0 && (
                      <Alert icon={<IconAlertCircle size={16} />} color="orange" mt="md">
                        <Text fw={500} mb="xs">Phát hiện xung đột:</Text>
                        <List size="sm">
                          {lastResult.conflicts.map((conflict: string, index: number) => (
                            <List.Item key={index}>{conflict}</List.Item>
                          ))}
                        </List>
                        <Button size="sm" mt="xs" onClick={addConflictedEvent}>
                          Thêm Anyway
                        </Button>
                      </Alert>
                    )}

                    {lastResult.suggestions && !lastResult.error && (
                      <Alert icon={<IconBulb size={16} />} color="blue" mt="md">
                        <Text fw={500} mb="xs">Gợi ý:</Text>
                        <List size="sm">
                          {lastResult.suggestions.map((suggestion: string, index: number) => (
                            <List.Item key={index}>{suggestion}</List.Item>
                          ))}
                        </List>
                      </Alert>
                    )}
                  </Card>
                )}

                <Card withBorder>
                  <Text fw={500} mb="md">Ví dụ về cách sử dụng:</Text>
                  <List size="sm">
                    <List.Item>"Nộp bài tập Toán vào thứ 3 lúc 5 giờ chiều"</List.Item>
                    <List.Item>"Họp nhóm dự án AI ngày mai 2 giờ"</List.Item>
                    <List.Item>"Thi Lý tuần sau ưu tiên cao"</List.Item>
                    <List.Item>"Học Tiếng Anh 2 tiếng vào cuối tuần"</List.Item>
                    <List.Item>"Deadline báo cáo Marketing 25/12 gấp"</List.Item>
                  </List>
                </Card>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="insights" pt="lg">
              <Stack>
                {suggestions.length > 0 && (
                  <Card withBorder>
                    <Group mb="md">
                      <IconBulb />
                      <Text fw={500}>Smart Suggestions</Text>
                    </Group>
                    <List>
                      {suggestions.map((suggestion, index) => (
                        <List.Item key={index}>{suggestion}</List.Item>
                      ))}
                    </List>
                  </Card>
                )}

                <Card withBorder>
                  <Text fw={500} mb="md">Tính Năng AI Nâng Cao</Text>
                  <List>
                    <List.Item>🧠 Phân tích ngôn ngữ tự nhiên tiếng Việt</List.Item>
                    <List.Item>⚡ Phát hiện xung đột thời gian thông minh</List.Item>
                    <List.Item>📊 Đề xuất thời gian tối ưu dựa trên patterns</List.Item>
                    <List.Item>🎯 Ưu tiên tự động theo độ quan trọng</List.Item>
                    <List.Item>📈 Phân tích xu hướng hiệu suất</List.Item>
                    <List.Item>🔮 Dự đoán burnout và overload</List.Item>
                  </List>
                </Card>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="export" pt="lg">
              <Stack>
                <Card withBorder>
                  <Text fw={500} mb="md">Xuất Dữ Liệu Analytics</Text>
                  <Button 
                    leftSection={<IconDownload size={16} />}
                    onClick={handleExportAnalytics}
                    mb="md"
                  >
                    Xuất Analytics JSON
                  </Button>
                </Card>

                <Card withBorder>
                  <Text fw={500} mb="md">Xuất Calendar</Text>
                  <Group>
                    <Button 
                      variant="outline"
                      onClick={() => handleExportCalendar('ics')}
                    >
                      .ICS
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleExportCalendar('csv')}
                    >
                      .CSV
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleExportCalendar('json')}
                    >
                      .JSON
                    </Button>
                  </Group>
                </Card>

                {exportData && (
                  <Card withBorder>
                    <Group justify="space-between" mb="md">
                      <Text fw={500}>Dữ Liệu Xuất</Text>
                      <CopyButton value={exportData}>
                        {({ copied, copy }) => (
                          <Tooltip label={copied ? 'Đã copy!' : 'Copy'}>
                            <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>
                    </Group>
                    <Textarea
                      value={exportData}
                      autosize
                      minRows={10}
                      maxRows={20}
                      readOnly
                    />
                  </Card>
                )}
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Stack>
    </Container>
  );
}
