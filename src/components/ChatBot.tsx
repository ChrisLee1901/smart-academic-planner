import React, { useState, useRef, useEffect } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Textarea,
  ActionIcon,
  Avatar,
  Badge,
  Divider,
  ScrollArea,
  Button,
  Tooltip,
} from '@mantine/core';
import {
  IconSend,
  IconRobot,
  IconUser,
  IconX,
  IconMinimize,
  IconMaximize,
  IconHelp,
  IconBulb,
  IconRocket,
} from '@tabler/icons-react';
import { chatbotService } from '../services/chatbotService';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'welcome' | 'guide' | 'response';
}

interface ChatBotProps {
  onClose: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  currentPage?: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({
  onClose,
  isMinimized,
  onToggleMinimize,
  currentPage = 'dashboard'
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      const welcomeMessage = chatbotService.getWelcomeMessage(currentPage);
      setMessages([
        {
          id: Date.now().toString(),
          content: welcomeMessage,
          sender: 'bot',
          timestamp: new Date(),
          type: 'welcome'
        }
      ]);
    }
  }, [currentPage, messages.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = chatbotService.getResponse(inputValue.trim(), currentPage);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: 'bot',
        timestamp: new Date(),
        type: 'response'
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const quickActions = chatbotService.getQuickActions(currentPage);

  if (isMinimized) {
    return null; // Handled by the floating button
  }

  return (
    <Paper
      shadow="xl"
      radius="md"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '380px',
        height: '500px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Group justify="space-between" p="md" style={{ borderBottom: '1px solid #e9ecef' }}>
        <Group gap="sm">
          <Avatar size="sm" color="blue">
            <IconRobot size={16} />
          </Avatar>
          <div>
            <Text size="sm" fw={500}>Smart Assistant</Text>
            <Text size="xs" c="dimmed">Hỗ trợ sử dụng ứng dụng</Text>
          </div>
        </Group>
        <Group gap="xs">
          <Tooltip label="Thu nhỏ">
            <ActionIcon variant="subtle" onClick={onToggleMinimize}>
              <IconMinimize size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Đóng">
            <ActionIcon variant="subtle" color="red" onClick={onClose}>
              <IconX size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div style={{ padding: '8px 16px', borderBottom: '1px solid #e9ecef' }}>
          <Text size="xs" c="dimmed" mb="xs">Câu hỏi gợi ý:</Text>
          <Group gap="xs">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                size="xs"
                variant="light"
                leftSection={<IconBulb size={12} />}
                onClick={() => handleQuickAction(action.text)}
              >
                {action.label}
              </Button>
            ))}
          </Group>
        </div>
      )}

      {/* Messages */}
      <ScrollArea style={{ flex: 1, padding: '16px' }}>
        <Stack gap="md">
          {messages.map((message) => (
            <Group
              key={message.id}
              align="flex-start"
              justify={message.sender === 'user' ? 'flex-end' : 'flex-start'}
            >
              {message.sender === 'bot' && (
                <Avatar size="sm" color="blue">
                  <IconRobot size={14} />
                </Avatar>
              )}
              
              <Paper
                p="sm"
                radius="md"
                bg={message.sender === 'user' ? 'blue.5' : 'gray.1'}
                style={{ 
                  maxWidth: '80%',
                  color: message.sender === 'user' ? 'white' : 'inherit'
                }}
              >
                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Text>
                {message.type === 'welcome' && (
                  <Badge size="xs" mt="xs" variant="light" color="green">
                    <IconRocket size={10} /> Bắt đầu
                  </Badge>
                )}
              </Paper>

              {message.sender === 'user' && (
                <Avatar size="sm" color="gray">
                  <IconUser size={14} />
                </Avatar>
              )}
            </Group>
          ))}
          
          {isTyping && (
            <Group align="flex-start">
              <Avatar size="sm" color="blue">
                <IconRobot size={14} />
              </Avatar>
              <Paper p="sm" radius="md" bg="gray.1">
                <Text size="sm" c="dimmed">
                  <span className="typing-indicator">●●●</span> Đang trả lời...
                </Text>
              </Paper>
            </Group>
          )}
        </Stack>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input */}
      <div style={{ padding: '16px', borderTop: '1px solid #e9ecef' }}>
        <Group align="flex-end" gap="sm">
          <Textarea
            ref={textareaRef}
            placeholder="Hỏi về cách sử dụng ứng dụng..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            autosize
            minRows={1}
            maxRows={3}
            style={{ flex: 1 }}
          />
          <Tooltip label="Gửi tin nhắn">
            <ActionIcon
              size="lg"
              variant="filled"
              color="blue"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
            >
              <IconSend size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </div>

      <style jsx>{`
        .typing-indicator {
          animation: typing 1.5s infinite;
        }
        
        @keyframes typing {
          0%, 20% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </Paper>
  );
};