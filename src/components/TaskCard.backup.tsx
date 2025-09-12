import { useState } from 'react';
import { Card, Text, Badge, Group, ActionIcon, Stack, Menu, Progress, Box, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash, IconClock, IconDots, IconFlag, IconStar, IconFlame } from '@tabler/icons-react';
import type { AcademicEvent } from '../types';
import { formatTime, getDaysUntil } from '../utils/dateUtils';
import { getUrgencyLevel, getUrgencyInfo, getUrgencyMessage } from '../utils/urgencyUtils';
import '../styles/urgency-animations.css';

interface TaskCardProps {
  event: AcademicEvent;
  onEdit: (event: AcademicEvent) => void;
  onDelete: (eventId: string) => void;
  onStatusChange: (eventId: string, status: AcademicEvent['status']) => void;
}

export function TaskCard({ event, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getTypeColor = (type: AcademicEvent['type']) => {
    const colors = {
      deadline: 'red',
      class: 'blue',
      project: 'orange',
      personal: 'green'
    };
    return colors[type] || 'gray';
  };

  const getPriorityColor = (priority: AcademicEvent['priority']) => {
    const colors = {
      high: 'red',
      medium: 'yellow',
      low: 'green'
    };
    return colors[priority || 'medium'];
  };

  const getStatusColor = (status: AcademicEvent['status']) => {
    const colors = {
      todo: 'gray',
      'in-progress': 'blue',
      done: 'green'
    };
    return colors[status];
  };

  const getPriorityGradient = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'linear-gradient(135deg, rgba(244, 67, 54, 0.15) 0%, rgba(233, 30, 99, 0.15) 100%)';
      case 'medium':
        return 'linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(245, 124, 0, 0.15) 100%)';
      case 'low':
        return 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(46, 125, 50, 0.15) 100%)';
      default:
        return 'linear-gradient(135deg, rgba(158, 158, 158, 0.15) 0%, rgba(97, 97, 97, 0.15) 100%)';
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

  const daysUntil = getDaysUntil(event.startTime);
  
  // Get urgency information
  const urgencyLevel = getUrgencyLevel(event.startTime.toString(), event.status);
  const urgencyInfo = getUrgencyInfo(urgencyLevel);
  const urgencyMessage = getUrgencyMessage(urgencyLevel, daysUntil);

  const getTimeProgress = () => {
    if (!event.estimatedTime) return null;
    if (event.status === 'done' && event.actualTime) {
      return {
        value: 100,
        label: `Hoàn thành: ${event.actualTime}h / ${event.estimatedTime}h`,
        color: event.actualTime <= event.estimatedTime ? 'green' : 'orange'
      };
    }
    if (event.status === 'in-progress') {
      return {
        value: 50,
        label: `Đang thực hiện: ${event.estimatedTime}h ước tính`,
        color: 'blue'
      };
    }
    return {
      value: 0,
      label: `Dự kiến: ${event.estimatedTime}h`,
      color: 'gray'
    };
  };

  const timeProgress = getTimeProgress();

  // Dynamic card classes based on urgency
  const cardClasses = [
    'event-card-animated',
    urgencyInfo.shouldPulse ? 'urgent-card' : '',
    'event-card-gradient',
    'slide-in-up'
  ].filter(Boolean).join(' ');

  return (
    <Box style={{ position: 'relative' }}>
      {/* Urgency indicator dot */}
      <div 
        className={`urgency-indicator urgency-${urgencyLevel}`}
        style={{
          background: urgencyInfo.color,
          boxShadow: `0 0 10px ${urgencyInfo.color}40`
        }}
      />
      
      <Card 
        shadow={isHovered ? "xl" : "md"}
        padding="md" 
        radius="xl" 
        withBorder
        className={cardClasses}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: urgencyInfo.gradient,
          backdropFilter: 'blur(15px)',
          borderColor: urgencyInfo.borderColor,
          borderWidth: urgencyInfo.level === 'critical' ? '2px' : '1px',
          boxShadow: isHovered 
            ? `0 20px 40px rgba(0, 0, 0, 0.15), 0 0 20px ${urgencyInfo.color}20`
            : '0 8px 25px rgba(0, 0, 0, 0.08)',
          position: 'relative',
          overflow: 'hidden',
          '--card-gradient': urgencyInfo.gradient
        } as React.CSSProperties
    >
      {/* Priority Gradient Top Border */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: getPriorityGradient(event.priority),
          opacity: isHovered ? 1 : 0.7,
          transition: 'opacity 0.3s ease',
        }}
      />

      <Stack gap="xs">
        {/* Header with title and menu */}
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" style={{ flex: 1 }}>
            {/* Type Icon */}
            <div
              style={{
                fontSize: '18px',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
                transition: 'all 0.3s ease',
              }}
            >
              {getTypeIcon(event.type)}
            </div>

            {/* Title */}
            <Text 
              fw={700} 
              size="sm" 
              lineClamp={2} 
              c="dark"
              style={{ 
                flex: 1,
                color: '#2c3e50',
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
                transition: 'all 0.3s ease',
                transform: isHovered ? 'scale(1.01)' : 'scale(1)',
              }}
            >
              {event.title}
            </Text>

            {/* Urgent/Overdue Indicators */}
            {isOverdue && (
              <Badge 
                color="red" 
                size="xs" 
                variant="filled"
                style={{
                  animation: 'pulse 1.5s infinite',
                  boxShadow: '0 2px 8px rgba(244, 67, 54, 0.4)',
                }}
              >
                Quá hạn
              </Badge>
            )}
            {isUrgent && !isOverdue && (
              <Badge 
                color="orange" 
                size="xs" 
                variant="filled"
                leftSection={<IconFlame size={10} />}
                style={{
                  animation: 'pulse 2s infinite',
                  boxShadow: '0 2px 8px rgba(255, 152, 0, 0.4)',
                }}
              >
                Gấp
              </Badge>
            )}
          </Group>
          
          <Menu shadow="xl" width={180} radius="md">
            <Menu.Target>
              <ActionIcon 
                variant="subtle" 
                color="gray" 
                size="sm"
                style={{
                  transition: 'all 0.3s ease',
                  transform: isHovered ? 'rotate(90deg)' : 'rotate(0deg)',
                  backgroundColor: isHovered ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                }}
              >
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            
            <Menu.Dropdown style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}>
              <Menu.Item 
                leftSection={<IconEdit size={14} />}
                onClick={() => onEdit(event)}
                style={{ fontSize: '13px', fontWeight: 500 }}
              >
                Chỉnh sửa
              </Menu.Item>
              
              {event.status !== 'done' && (
                <>
                  <Menu.Item 
                    onClick={() => onStatusChange(event.id, 'in-progress')}
                    disabled={event.status === 'in-progress'}
                    style={{ fontSize: '13px', fontWeight: 500 }}
                  >
                    Bắt đầu làm
                  </Menu.Item>
                  <Menu.Item 
                    onClick={() => onStatusChange(event.id, 'done')}
                    style={{ fontSize: '13px', fontWeight: 500 }}
                  >
                    Đánh dấu hoàn thành
                  </Menu.Item>
                </>
              )}
              
              <Menu.Divider />
              
              <Menu.Item 
                leftSection={<IconTrash size={14} />}
                color="red"
                onClick={() => onDelete(event.id)}
                style={{ fontSize: '13px', fontWeight: 500 }}
              >
                Xóa
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {/* Course info */}
        {event.course && (
          <Group gap="xs">
            <Text size="xs" c="dimmed" fw={600} style={{ 
              color: '#6c757d',
              fontStyle: 'italic'
            }}>
              📖 {event.course}
            </Text>
          </Group>
        )}

        {/* Badges row */}
        <Group gap="xs">
          <Badge 
            size="sm" 
            color={getTypeColor(event.type)}
            style={{
              background: `linear-gradient(135deg, ${getTypeColor(event.type) === 'red' ? 'rgba(244, 67, 54, 0.1)' : getTypeColor(event.type) === 'blue' ? 'rgba(33, 150, 243, 0.1)' : getTypeColor(event.type) === 'orange' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(76, 175, 80, 0.1)'} 0%, ${getTypeColor(event.type) === 'red' ? 'rgba(233, 30, 99, 0.1)' : getTypeColor(event.type) === 'blue' ? 'rgba(30, 136, 229, 0.1)' : getTypeColor(event.type) === 'orange' ? 'rgba(245, 124, 0, 0.1)' : 'rgba(46, 125, 50, 0.1)'} 100%)`,
              border: `1px solid ${getTypeColor(event.type) === 'red' ? 'rgba(244, 67, 54, 0.3)' : getTypeColor(event.type) === 'blue' ? 'rgba(33, 150, 243, 0.3)' : getTypeColor(event.type) === 'orange' ? 'rgba(255, 152, 0, 0.3)' : 'rgba(76, 175, 80, 0.3)'}`,
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s ease',
              fontWeight: 700,
              color: getTypeColor(event.type) === 'red' ? '#d32f2f' : getTypeColor(event.type) === 'blue' ? '#1976d2' : getTypeColor(event.type) === 'orange' ? '#f57c00' : '#388e3c',
            }}
          >
            {event.type === 'deadline' ? 'Deadline' : 
             event.type === 'class' ? 'Lớp học' :
             event.type === 'project' ? 'Dự án' : 'Cá nhân'}
          </Badge>
          
          <Badge 
            size="sm" 
            color={getPriorityColor(event.priority)} 
            leftSection={<IconFlag size={10} />}
            style={{
              background: getPriorityGradient(event.priority),
              border: `1px solid ${getPriorityColor(event.priority) === 'red' ? 'rgba(244, 67, 54, 0.3)' : getPriorityColor(event.priority) === 'yellow' ? 'rgba(255, 152, 0, 0.3)' : 'rgba(76, 175, 80, 0.3)'}`,
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s ease',
              fontWeight: 700,
              color: getPriorityColor(event.priority) === 'red' ? '#d32f2f' : getPriorityColor(event.priority) === 'yellow' ? '#f57c00' : '#388e3c',
            }}
          >
            {event.priority === 'high' ? 'Cao' : 
             event.priority === 'low' ? 'Thấp' : 'Trung bình'}
          </Badge>

          <Badge 
            size="sm" 
            color={getStatusColor(event.status)}
            style={{
              background: `linear-gradient(135deg, ${getStatusColor(event.status) === 'green' ? 'rgba(76, 175, 80, 0.1)' : getStatusColor(event.status) === 'blue' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(158, 158, 158, 0.1)'} 0%, ${getStatusColor(event.status) === 'green' ? 'rgba(46, 125, 50, 0.1)' : getStatusColor(event.status) === 'blue' ? 'rgba(30, 136, 229, 0.1)' : 'rgba(97, 97, 97, 0.1)'} 100%)`,
              border: `1px solid ${getStatusColor(event.status) === 'green' ? 'rgba(76, 175, 80, 0.3)' : getStatusColor(event.status) === 'blue' ? 'rgba(33, 150, 243, 0.3)' : 'rgba(158, 158, 158, 0.3)'}`,
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s ease',
              fontWeight: 700,
              color: getStatusColor(event.status) === 'green' ? '#388e3c' : getStatusColor(event.status) === 'blue' ? '#1976d2' : '#5f6368',
            }}
          >
            {event.status === 'todo' ? 'Cần làm' :
             event.status === 'in-progress' ? 'Đang làm' : 'Hoàn thành'}
          </Badge>
        </Group>

        {/* Time info */}
        <Group gap="xs" align="center" style={{
          background: 'rgba(0, 0, 0, 0.02)',
          padding: '6px 10px',
          borderRadius: '8px',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        }}>
          <IconClock size={14} style={{ color: isOverdue ? '#f44336' : isUrgent ? '#ff9800' : '#667eea' }} />
          <Text 
            size="xs" 
            fw={isOverdue || isUrgent ? 700 : 600}
            style={{ 
              color: isOverdue ? '#d32f2f' : isUrgent ? '#f57c00' : '#495057',
              textShadow: isOverdue ? '0 1px 3px rgba(244, 67, 54, 0.4)' : 'none'
            }}
          >
            {formatTime(event.startTime)}
            {isOverdue && ' (Quá hạn)'}
            {isUrgent && ' (Gấp)'}
          </Text>
        </Group>

        {/* Time progress */}
        {timeProgress && (
          <Stack gap="xs">
            <Text size="xs" fw={600} style={{ color: '#495057' }}>{timeProgress.label}</Text>
            <Progress 
              value={timeProgress.value} 
              color={timeProgress.color} 
              size="sm" 
              radius="xl"
              style={{
                background: 'rgba(0, 0, 0, 0.05)',
              }}
            />
          </Stack>
        )}

        {/* Description preview */}
        {event.description && (
          <Box style={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(102, 126, 234, 0.1)',
          }}>
            <Text size="xs" lineClamp={2} style={{ 
              color: '#6c757d',
              fontStyle: 'italic' 
            }}>
              {event.description}
            </Text>
          </Box>
        )}

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <Group gap="xs">
            {event.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                size="xs" 
                variant="light" 
                color="gray"
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
            {event.tags.length > 3 && (
              <Text size="xs" c="dimmed" fw={600}>+{event.tags.length - 3}</Text>
            )}
          </Group>
        )}

        {/* AI Realistic Deadline Display */}
        {event.realisticDeadline && (
          <Box
            style={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              border: '2px solid rgba(102, 126, 234, 0.2)',
              borderRadius: '8px',
              padding: '8px 12px',
              transform: isHovered ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.3s ease',
            }}
          >
            <Group gap="sm">
              <IconStar size={14} style={{ color: '#667eea' }} />
              <Text size="xs" fw={700} style={{ color: '#5e72e4' }}>
                AI Deadline: {new Date(event.realisticDeadline).toLocaleDateString('vi-VN')}
              </Text>
              <Badge size="xs" variant="gradient" gradient={{ from: 'violet', to: 'purple' }}>
                AI
              </Badge>
            </Group>
          </Box>
        )}
      </Stack>
    </Card>
  );
}
