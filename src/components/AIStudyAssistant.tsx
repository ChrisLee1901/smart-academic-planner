import { useState } from 'react';
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
  Badge,
  Alert,
  Progress,
  Box,
  Divider,
  Loader
} from '@mantine/core';
import { 
  IconRobot,
  IconSend,
  IconBrain,
  IconBulb,
  IconTarget
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useEventStore } from '../store/eventStore';
import { geminiService } from '../services/geminiService';
import dayjs from 'dayjs';

interface AIAssistantMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface StudyTip {
  id: string;
  category: 'time-management' | 'focus' | 'motivation' | 'technique';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

const STUDY_TIPS: StudyTip[] = [
  {
    id: '1',
    category: 'time-management',
    title: 'Kỹ thuật Pomodoro',
    description: 'Học 25 phút, nghỉ 5 phút. Sau 4 chu kỳ, nghỉ dài 15-30 phút.',
    priority: 'high'
  },
  {
    id: '2',
    category: 'focus',
    title: 'Môi trường học tập',
    description: 'Tạo không gian yên tĩnh, tắt thông báo điện thoại, chuẩn bị đủ tài liệu.',
    priority: 'high'
  },
  {
    id: '3',
    category: 'technique',
    title: 'Phương pháp Feynman',
    description: 'Giải thích kiến thức bằng ngôn ngữ đơn giản như dạy cho người khác.',
    priority: 'medium'
  },
  {
    id: '4',
    category: 'motivation',
    title: 'Đặt mục tiêu nhỏ',
    description: 'Chia nhiệm vụ lớn thành các mục tiêu nhỏ, dễ đạt được.',
    priority: 'medium'
  },
  {
    id: '5',
    category: 'time-management',
    title: 'Ma trận Eisenhower',
    description: 'Ưu tiên công việc theo: Khẩn cấp-Quan trọng, Quan trọng-Không khẩn cấp...',
    priority: 'medium'
  }
];

export function AIStudyAssistant() {
  const { events } = useEventStore();
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [messages, setMessages] = useState<AIAssistantMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTips, setSelectedTips] = useState<StudyTip[]>([]);
  const [usingGemini, setUsingGemini] = useState(true);

  const form = useForm({
    initialValues: {
      message: ''
    }
  });

  // Generate AI responses with Gemini API and fallback
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Prepare context for AI
    const completedToday = events.filter(e => 
      dayjs(e.startTime).isSame(dayjs(), 'day') && e.status === 'done'
    ).length;
    
    const totalToday = events.filter(e => 
      dayjs(e.startTime).isSame(dayjs(), 'day')
    ).length;

    const context = {
      userMessage,
      completedTasks: completedToday,
      totalTasks: totalToday,
      currentTime: dayjs().format('HH:mm DD/MM/YYYY'),
      recentTopics: messages.slice(-3).map(m => m.content)
    };

    // Try Gemini API first
    if (geminiService.isGeminiAvailable()) {
      try {
        setUsingGemini(true);
        const response = await geminiService.generateResponse(userMessage, context);
        return response;
      } catch (error) {
        console.warn('Gemini API failed, falling back to local logic:', error);
        setUsingGemini(false);
        
        // Show notification about fallback
        notifications.show({
          title: 'Chuyển sang chế độ offline',
          message: 'API Gemini không khả dụng, sử dụng AI cục bộ.',
          color: 'yellow',
          autoClose: 3000
        });
      }
    }

    // Fallback to local logic
    setUsingGemini(false);
    return geminiService.generateFallbackResponse(userMessage, context);
  };

  const handleSendMessage = async (values: typeof form.values) => {
    if (!values.message.trim()) return;

    const userMessage: AIAssistantMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: values.message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    form.reset();
    setIsLoading(true);

    try {
      const response = await generateAIResponse(values.message);
      
      const aiMessage: AIAssistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update study tips based on conversation
      updateStudyTips(values.message);
      
    } catch (error) {
      console.error('AI Assistant error:', error);
      
      // Fallback error response
      const errorMessage: AIAssistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '🔧 Xin lỗi, tôi gặp sự cố kỹ thuật. Đây là một số gợi ý chung:\n\n• Sử dụng kỹ thuật Pomodoro cho việc học\n• Tạo môi trường yên tĩnh\n• Nghỉ ngơi đầy đủ\n• Đặt mục tiêu rõ ràng\n\nHãy thử lại sau hoặc đặt câu hỏi khác!',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      notifications.show({
        title: 'Lỗi AI Assistant',
        message: error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định',
        color: 'red',
        autoClose: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateStudyTips = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    let relevantTips: StudyTip[] = [];

    if (lowerMessage.includes('thời gian') || lowerMessage.includes('lịch')) {
      relevantTips = STUDY_TIPS.filter(tip => tip.category === 'time-management');
    } else if (lowerMessage.includes('tập trung') || lowerMessage.includes('focus')) {
      relevantTips = STUDY_TIPS.filter(tip => tip.category === 'focus');
    } else if (lowerMessage.includes('động lực') || lowerMessage.includes('stress')) {
      relevantTips = STUDY_TIPS.filter(tip => tip.category === 'motivation');
    } else {
      relevantTips = STUDY_TIPS.filter(tip => tip.category === 'technique');
    }

    setSelectedTips(relevantTips.slice(0, 2));
  };

  const getProductivityInsights = () => {
    const completedToday = events.filter(e => 
      dayjs(e.startTime).isSame(dayjs(), 'day') && e.status === 'done'
    ).length;
    
    const totalToday = events.filter(e => 
      dayjs(e.startTime).isSame(dayjs(), 'day')
    ).length;

    const completionRate = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

    return {
      completedToday,
      totalToday,
      completionRate
    };
  };

  const insights = getProductivityInsights();

  const getCategoryColor = (category: StudyTip['category']) => {
    switch (category) {
      case 'time-management': return 'blue';
      case 'focus': return 'green';
      case 'motivation': return 'orange';
      case 'technique': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <Group>
            <IconRobot size={24} color="#228be6" />
            <Title order={3}>AI Study Assistant</Title>
            {usingGemini && (
              <Badge size="xs" color="green" variant="light">
                Gemini AI
              </Badge>
            )}
            {!usingGemini && geminiService.isGeminiAvailable() && (
              <Badge size="xs" color="yellow" variant="light">
                Offline Mode
              </Badge>
            )}
          </Group>
          
          <Button
            leftSection={<IconBrain size={16} />}
            onClick={() => setIsAIOpen(true)}
            variant="light"
          >
            Hỏi AI Assistant
          </Button>
        </Group>

        {/* Today's Insights */}
        <Card withBorder p="md" radius="md">
          <Stack gap="md">
            <Group>
              <IconTarget size={20} color="#40c057" />
              <Text fw={500}>Tiến độ hôm nay</Text>
            </Group>
            
            <Group justify="space-between">
              <Text size="sm">
                {insights.completedToday} / {insights.totalToday} nhiệm vụ
              </Text>
              <Text size="sm" fw={500}>
                {insights.completionRate.toFixed(1)}%
              </Text>
            </Group>
            
            <Progress 
              value={insights.completionRate} 
              color={insights.completionRate >= 80 ? 'green' : insights.completionRate >= 60 ? 'yellow' : 'red'}
              size="lg"
              radius="xl"
            />
            
            <Text size="sm" c="dimmed" ta="center">
              {insights.completionRate >= 80 
                ? 'Tuyệt vời! Bạn đang rất productive!'
                : insights.completionRate >= 60
                ? '👍 Tốt lắm! Cố gắng thêm một chút nữa!'
                : 'Hãy bắt đầu với một nhiệm vụ nhỏ!'
              }
            </Text>
          </Stack>
        </Card>

        {/* Quick Study Tips */}
        {selectedTips.length > 0 && (
          <Stack gap="md">
            <Group>
              <IconBulb size={20} color="#ffd43b" />
              <Text fw={500}>Gợi ý học tập</Text>
            </Group>
            
            {selectedTips.map(tip => (
              <Alert key={tip.id} color={getCategoryColor(tip.category)} variant="light">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>{tip.title}</Text>
                    <Badge size="xs" color={getCategoryColor(tip.category)}>
                      {tip.category}
                    </Badge>
                  </Group>
                  <Text size="sm">{tip.description}</Text>
                </Stack>
              </Alert>
            ))}
          </Stack>
        )}

        {/* AI Chat Modal */}
        <Modal
          opened={isAIOpen}
          onClose={() => setIsAIOpen(false)}
          title={
            <Group>
              <Text fw={500}>AI Study Assistant</Text>
              {usingGemini ? (
                <Badge size="sm" color="green" variant="light">
                  🤖 Powered by Gemini AI
                </Badge>
              ) : (
                <Badge size="sm" color="blue" variant="light">
                  🔄 Offline Mode
                </Badge>
              )}
            </Group>
          }
          size="lg"
        >
          <Stack gap="md" h={400}>
            {/* Chat Messages */}
            <Box style={{ flex: 1, overflowY: 'auto', maxHeight: '300px' }} p="sm">
              {messages.length === 0 ? (
                <Alert icon={<IconBrain size={16} />} color="blue">
                  <Stack gap="xs">
                    <Text>
                      Xin chào! Tôi là AI Assistant học tập {usingGemini ? 'với Gemini AI' : '(chế độ offline)'}. Hãy hỏi tôi về:
                    </Text>
                    <Text size="sm">
                      • Kỹ thuật học hiệu quả<br />
                      • Quản lý thời gian<br />
                      • Tạo động lực học tập<br />
                      • Chuẩn bị thi cử
                    </Text>
                    {!usingGemini && (
                      <Button 
                        size="xs" 
                        variant="light" 
                        color="green"
                        onClick={() => {
                          geminiService.resetAvailability();
                          setUsingGemini(true);
                          notifications.show({
                            title: 'Đã reset',
                            message: 'Thử lại kết nối Gemini API',
                            color: 'green'
                          });
                        }}
                      >
                        🔄 Thử lại Gemini AI
                      </Button>
                    )}
                  </Stack>
                </Alert>
              ) : (
                <Stack gap="md">
                  {messages.map(message => (
                    <Card 
                      key={message.id} 
                      p="sm" 
                      radius="md"
                      style={{ 
                        alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        backgroundColor: message.type === 'user' ? '#e3f2fd' : '#f5f5f5'
                      }}
                    >
                      <Stack gap="xs">
                        <Text 
                          size="sm" 
                          style={{ 
                            whiteSpace: 'pre-line',
                            lineHeight: 1.6
                          }}
                        >
                          {message.content}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {dayjs(message.timestamp).format('HH:mm')}
                        </Text>
                      </Stack>
                    </Card>
                  ))}
                  
                  {isLoading && (
                    <Card p="sm" radius="md" style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                      <Group gap="xs">
                        <Loader size="xs" />
                        <Text size="sm" c="dimmed">AI đang suy nghĩ...</Text>
                      </Group>
                    </Card>
                  )}
                </Stack>
              )}
            </Box>

            <Divider />

            {/* Message Input */}
            <form onSubmit={form.onSubmit(handleSendMessage)}>
              <Group gap="xs">
                <TextInput
                  placeholder={`Hỏi AI ${usingGemini ? 'Gemini' : ''} về kỹ thuật học tập, quản lý thời gian...`}
                  style={{ flex: 1 }}
                  {...form.getInputProps('message')}
                  disabled={isLoading}
                />
                <ActionIcon 
                  type="submit" 
                  size="lg" 
                  variant="filled"
                  disabled={isLoading || !form.values.message.trim()}
                >
                  <IconSend size={16} />
                </ActionIcon>
              </Group>
            </form>
          </Stack>
        </Modal>

        {/* Quick Actions */}
        <Group justify="center" gap="xs">
          <Button 
            size="xs" 
            variant="light"
            onClick={() => {
              setIsAIOpen(true);
              form.setValues({ message: 'Làm sao để tôi tập trung học tốt hơn?' });
            }}
          >
            Cải thiện tập trung
          </Button>
          <Button 
            size="xs" 
            variant="light"
            onClick={() => {
              setIsAIOpen(true);
              form.setValues({ message: 'Tôi cần lập kế hoạch học hiệu quả' });
            }}
          >
            Lập kế hoạch
          </Button>
          <Button 
            size="xs" 
            variant="light"
            onClick={() => {
              setIsAIOpen(true);
              form.setValues({ message: 'Làm thế nào để duy trì động lực học?' });
            }}
          >
            Tăng động lực
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
