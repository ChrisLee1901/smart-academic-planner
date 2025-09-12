import { useState } from 'react';
import {
  Card,
  Text,
  Badge,
  Group,
  Button,
  ActionIcon,
  Modal,
  Menu,
  Box,
  Stack,
  Progress,
} from '@mantine/core';
import { IconEdit, IconTrash, IconClock, IconDots, IconCalendar } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { EventForm } from './EventForm';
import { useEventStore } from '../store/eventStore';
import type { AcademicEvent } from '../types';
import { formatDateTime, getRelativeTime, getDaysUntil } from '../utils/dateUtils';
import dayjs from 'dayjs';

interface EnhancedEventCardProps {
  event: AcademicEvent;
}

export function EnhancedEventCard({ event }: EnhancedEventCardProps) {
  const [editOpened, editModal] = useDisclosure(false);
  const [isHovered, setIsHovered] = useState(false);
  const { updateEvent, deleteEvent } = useEventStore();

  const handleStatusChange = async (newStatus: AcademicEvent['status']) => {
    try {
      await updateEvent(event.id, { status: newStatus });
      notifications.show({
        title: 'Cập nhật thành công',
        message: `Đã chuyển trạng thái thành "${getStatusLabel(newStatus)}"`,
        color: 'green',
        autoClose: 3000,
      });
    } catch (error) {
      notifications.show({
        title: 'Lỗi',
        message: 'Không thể cập nhật trạng thái',
        color: 'red',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEvent(event.id);
      notifications.show({
        title: '🗑️ Đã xóa',
        message: 'Sự kiện đã được xóa thành công',
        color: 'blue',
        autoClose: 3000,
      });
    } catch (error) {
      notifications.show({
        title: 'Lỗi',
        message: 'Không thể xóa sự kiện',
        color: 'red',
      });
    }
  };

  const getStatusColor = (status: AcademicEvent['status']) => {
    switch (status) {
      case 'todo': return 'blue';
      case 'in-progress': return 'orange';
      case 'done': return 'green';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status: AcademicEvent['status']) => {
    switch (status) {
      case 'todo': return 'Chưa làm';
      case 'in-progress': return 'Đang làm';
      case 'done': return 'Hoàn thành';
      default: return status;
    }
  };

  const getPriorityGradient = (priority?: string) => {
    switch (priority) {
      case 'high':
        return { from: '#f44336', to: '#e91e63', deg: 135 };
      case 'medium':
        return { from: '#ff9800', to: '#f57c00', deg: 135 };
      case 'low':
        return { from: '#4caf50', to: '#2e7d32', deg: 135 };
      default:
        return { from: '#9e9e9e', to: '#616161', deg: 135 };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deadline': return '⏰';
      case 'class': return '📚';
      case 'project': return '💼';
      case 'personal': return '👤';
      default: return '📝';
    }
  };

  const getProgress = () => {
    if (event.status === 'done') return 100;
    if (event.status === 'in-progress') return 50;
    return 0;
  };

  const daysUntil = getDaysUntil(event.startTime);
  const isOverdue = daysUntil < 0 && event.status !== 'done';
  const timeUntil = getRelativeTime(event.startTime);

  return (
    <>
      <Card
        shadow={isHovered ? "xl" : "md"}
        padding="lg"
        radius="xl"
        withBorder
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          transform: isHovered ? 'translateY(-8px) scale(1.03)' : 'translateY(0) scale(1)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          background: isHovered 
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
          backdropFilter: 'blur(20px)',
          border: `2px solid ${isHovered ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255, 255, 255, 0.2)'}`,
          boxShadow: isHovered 
            ? '0 25px 50px rgba(0, 0, 0, 0.2), 0 0 30px rgba(102, 126, 234, 0.15)'
            : '0 10px 30px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden',
        }}
        className={`slide-in-up ${event.priority === 'high' ? 'priority-high' : 
                   event.priority === 'medium' ? 'priority-medium' : 'priority-low'}`}
      >
        {/* Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${getPriorityGradient(event.priority).from} 0%, ${getPriorityGradient(event.priority).to} 100%)`,
            opacity: isHovered ? 1 : 0.7,
            transition: 'opacity 0.3s ease',
          }}
        />

        {/* Header with Type Icon and Menu */}
        <Group justify="space-between" mb="md">
          <Group gap="sm">
            <div
              style={{
                fontSize: '24px',
                filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.2))',
                transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
                transition: 'all 0.3s ease',
              }}
            >
              {getTypeIcon(event.type)}
            </div>
            <Badge
              variant="gradient"
              gradient={getPriorityGradient(event.priority)}
              size="md"
              style={{
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.8px',
                boxShadow: '0 3px 12px rgba(0, 0, 0, 0.2)',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.3s ease',
              }}
            >
              {event.priority || 'medium'}
            </Badge>
          </Group>
          
          <Menu shadow="xl" width={220} radius="md">
            <Menu.Target>
              <ActionIcon 
                variant="subtle" 
                color="gray"
                size="lg"
                style={{
                  transition: 'all 0.3s ease',
                  transform: isHovered ? 'rotate(90deg)' : 'rotate(0deg)',
                  backgroundColor: isHovered ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                }}
              >
                <IconDots size={20} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}>
              <Menu.Item
                leftSection={<IconEdit size={16} />}
                onClick={editModal.open}
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                ✏️ Chỉnh sửa
              </Menu.Item>
              <Menu.Item
                leftSection={<IconTrash size={16} />}
                color="red"
                onClick={handleDelete}
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                🗑️ Xóa
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {/* Title with Gradient Text */}
        <Text 
          fw={800} 
          size="xl" 
          mb="sm"
          style={{
            background: 'linear-gradient(135deg, #2c3e50 0%, #667eea 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            transform: isHovered ? 'scale(1.02)' : 'scale(1)',
            lineHeight: 1.2,
          }}
        >
          {event.title}
        </Text>

        {/* Course Info with Icon */}
        {event.course && (
          <Group gap="xs" mb="sm">
            <Text size="lg">📖</Text>
            <Text size="sm" c="dimmed" style={{ fontStyle: 'italic', fontWeight: 500 }}>
              {event.course}
            </Text>
          </Group>
        )}

        {/* Time Information with Enhanced Icons */}
        <Stack gap="sm" mb="md">
          <Group gap="md">
            <Group gap="xs">
              <IconCalendar size={18} style={{ color: '#667eea' }} />
              <Text 
                size="sm" 
                c={isOverdue ? "red" : "blue"}
                fw={isOverdue ? 700 : 500}
                style={{ 
                  textShadow: isOverdue ? '0 1px 3px rgba(244, 67, 54, 0.4)' : 'none',
                  animation: isOverdue ? 'pulse 2s infinite' : 'none',
                }}
              >
                {formatDateTime(event.startTime)}
              </Text>
              {isOverdue && (
                <Badge color="red" size="xs" variant="filled" style={{
                  animation: 'pulse 1.5s infinite',
                  boxShadow: '0 2px 8px rgba(244, 67, 54, 0.4)',
                }}>
                  ⚠️ Quá hạn
                </Badge>
              )}
            </Group>
          </Group>
          
          <Group gap="xs">
            <IconClock size={18} style={{ color: '#ff9800' }} />
            <Text size="sm" c="orange" fw={600}>
              {timeUntil}
            </Text>
            {Math.abs(daysUntil) <= 1 && event.status !== 'done' && (
              <Badge color="orange" size="xs" variant="light" style={{
                animation: 'pulse 2s infinite',
              }}>
                Gấp
              </Badge>
            )}
          </Group>
        </Stack>

        {/* Progress Bar */}
        <Box mb="md">
          <Group justify="space-between" mb="xs">
            <Text size="xs" fw={600} c="dimmed">Tiến độ</Text>
            <Text size="xs" fw={700} c={getStatusColor(event.status)}>
              {getProgress()}%
            </Text>
          </Group>
          <Progress
            value={getProgress()}
            size="md"
            radius="xl"
            style={{
              background: 'rgba(0, 0, 0, 0.05)',
            }}
          />
        </Box>

        {/* Realistic Deadline Display */}
        {event.realisticDeadline && (
          <Box
            style={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              border: '2px solid rgba(102, 126, 234, 0.2)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '16px',
              transform: isHovered ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.3s ease',
            }}
          >
            <Group gap="sm">
              <Text size="sm" fw={600} c="dimmed">AI Deadline:</Text>
              <Text size="sm" fw={700} c="grape">
                {dayjs(event.realisticDeadline).format('DD/MM HH:mm')}
              </Text>
              <Badge size="sm" variant="gradient" gradient={{ from: 'violet', to: 'purple' }}>
                AI Gợi ý
              </Badge>
            </Group>
          </Box>
        )}

        {/* Description */}
        {event.description && (
          <Text size="sm" c="dimmed" mb="md" lineClamp={3} style={{
            background: 'rgba(0, 0, 0, 0.02)',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(0, 0, 0, 0.05)',
          }}>
            💭 {event.description}
          </Text>
        )}

        {/* Time Tracking */}
        {(event.estimatedTime || event.actualTime) && (
          <Group gap="md" mb="md" style={{
            background: 'linear-gradient(90deg, rgba(33, 150, 243, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%)',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(33, 150, 243, 0.1)',
          }}>
            {event.estimatedTime && (
              <Group gap="xs">
                <Text size="xs" c="blue" fw={600}>⏱️ Dự kiến:</Text>
                <Badge variant="light" color="blue" size="sm">{event.estimatedTime}h</Badge>
              </Group>
            )}
            {event.actualTime && (
              <Group gap="xs">
                <Text size="xs" c="green" fw={600}>Thực tế:</Text>
                <Badge variant="light" color="green" size="sm">{event.actualTime}h</Badge>
              </Group>
            )}
          </Group>
        )}

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <Group gap="xs" mb="md">
            {event.tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="light" 
                size="sm"
                style={{
                  background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                  fontWeight: 600,
                }}
              >
                #{tag}
              </Badge>
            ))}
          </Group>
        )}

        {/* Status Change Buttons */}
        <Group gap="xs" mb="md">
          {event.status !== 'todo' && (
            <Button
              variant="light"
              color="blue"
              size="sm"
              onClick={() => handleStatusChange('todo')}
              style={{
                background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(30, 136, 229, 0.1) 100%)',
                border: '2px solid rgba(33, 150, 243, 0.3)',
                transition: 'all 0.3s ease',
                fontWeight: 600,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              📋 Chưa làm
            </Button>
          )}
          
          {event.status !== 'in-progress' && (
            <Button
              variant="light"
              color="orange"
              size="sm"
              onClick={() => handleStatusChange('in-progress')}
              style={{
                background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(245, 124, 0, 0.1) 100%)',
                border: '2px solid rgba(255, 152, 0, 0.3)',
                transition: 'all 0.3s ease',
                fontWeight: 600,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 152, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              🔄 Đang làm
            </Button>
          )}
          
          {event.status !== 'done' && (
            <Button
              variant="light"
              color="green"
              size="sm"
              onClick={() => handleStatusChange('done')}
              style={{
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(67, 160, 71, 0.1) 100%)',
                border: '2px solid rgba(76, 175, 80, 0.3)',
                transition: 'all 0.3s ease',
                fontWeight: 600,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Hoàn thành
            </Button>
          )}
        </Group>

        {/* Current Status Badge */}
        <Group justify="center" mt="lg">
          <Badge
            variant="filled"
            color={getStatusColor(event.status)}
            size="xl"
            style={{
              background: `linear-gradient(135deg, ${getStatusColor(event.status) === 'green' ? '#4caf50' : getStatusColor(event.status) === 'orange' ? '#ff9800' : '#2196f3'} 0%, ${getStatusColor(event.status) === 'green' ? '#2e7d32' : getStatusColor(event.status) === 'orange' ? '#f57c00' : '#1565c0'} 100%)`,
              boxShadow: `0 6px 20px rgba(${getStatusColor(event.status) === 'green' ? '76, 175, 80' : getStatusColor(event.status) === 'orange' ? '255, 152, 0' : '33, 150, 243'}, 0.4)`,
              textTransform: 'uppercase',
              fontWeight: 800,
              letterSpacing: '1.5px',
              padding: '12px 24px',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.3s ease',
            }}
          >
            {getStatusLabel(event.status)}
          </Badge>
        </Group>
      </Card>

      {/* Enhanced Edit Modal */}
      <Modal
        opened={editOpened}
        onClose={editModal.close}
        title={
          <Group gap="sm">
            <Text size="lg">✏️</Text>
            <Text fw={700} size="lg" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Chỉnh sửa sự kiện
            </Text>
          </Group>
        }
        size="lg"
        radius="xl"
        shadow="xl"
        styles={{
          content: {
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
          },
          header: {
            background: 'transparent',
            borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
          }
        }}
      >
        <EventForm
          event={event}
          onSubmit={async (formData) => {
            await updateEvent(event.id, formData);
            editModal.close();
            notifications.show({
              title: 'Cập nhật thành công',
              message: 'Sự kiện đã được cập nhật!',
              color: 'green',
              autoClose: 3000,
            });
          }}
          onCancel={editModal.close}
        />
      </Modal>
    </>
  );
}