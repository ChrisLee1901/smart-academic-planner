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

  const getTypeIcon = (type: AcademicEvent['type']) => {
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
    'event-card-gradient'
  ].filter(Boolean).join(' ');

  return (
    <Box style={{ position: 'relative' }}>
      {/* Urgency indicator dot */}
      {(urgencyLevel === 'critical' || urgencyLevel === 'urgent') && (
        <div 
          className={`urgency-indicator urgency-${urgencyLevel}`}
          style={{
            background: urgencyInfo.color,
            boxShadow: `0 0 8px ${urgencyInfo.color}30`,
            opacity: 0.8
          }}
        />
      )}
      
      <Card 
        shadow={isHovered ? "xl" : "md"}
        padding="md" 
        radius="xl" 
        withBorder
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: isHovered 
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
          backdropFilter: 'blur(15px)',
          border: urgencyLevel === 'critical' 
            ? `2px solid ${urgencyInfo.borderColor}` 
            : urgencyLevel === 'urgent' 
              ? `2px solid ${urgencyInfo.borderColor}`
              : `2px solid ${isHovered ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255, 255, 255, 0.2)'}`,
          boxShadow: isHovered 
            ? urgencyLevel === 'critical'
              ? `0 20px 40px rgba(0, 0, 0, 0.15), 0 0 20px ${urgencyInfo.color}15`
              : '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 20px rgba(102, 126, 234, 0.1)'
            : '0 8px 25px rgba(0, 0, 0, 0.08)',
          position: 'relative',
          overflow: 'hidden',
          ...(urgencyLevel === 'critical' && {
            animation: 'urgentPulse 3s infinite'
          })
        } as React.CSSProperties}
      >
        {/* Priority Gradient Top Border */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: urgencyLevel === 'critical' || urgencyLevel === 'urgent' 
              ? urgencyInfo.color 
              : 'linear-gradient(90deg, #667eea, #764ba2)',
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

              {/* Urgency Badge */}
              {urgencyLevel === 'critical' && (
                <Badge 
                  color="red" 
                  size="xs" 
                  variant="filled"
                  className="status-badge-animated"
                  style={{
                    animation: 'urgentPulse 1.5s infinite',
                    boxShadow: `0 2px 8px ${urgencyInfo.color}40`,
                  }}
                >
                  {daysUntil < 0 ? 'Quá hạn' : 'Khẩn cấp'}
                </Badge>
              )}
              {urgencyLevel === 'urgent' && (
                <Badge 
                  color="orange" 
                  size="xs" 
                  variant="light"
                  className="status-badge-animated"
                >
                  Gấp
                </Badge>
              )}
            </Group>

            {/* Action Menu */}
            <Menu shadow="md" width={150} position="bottom-end">
              <Menu.Target>
                <ActionIcon 
                  variant="subtle" 
                  color="gray"
                  style={{
                    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item 
                  leftSection={<IconEdit size={14} />}
                  onClick={() => onEdit(event)}
                >
                  Chỉnh sửa
                </Menu.Item>
                
                <Menu.Divider />
                
                <Menu.Label>Thay đổi trạng thái</Menu.Label>
                {event.status !== 'todo' && (
                  <Menu.Item onClick={() => onStatusChange(event.id, 'todo')}>
                    📝 Cần làm
                  </Menu.Item>
                )}
                {event.status !== 'in-progress' && (
                  <Menu.Item onClick={() => onStatusChange(event.id, 'in-progress')}>
                    ⚡ Đang làm
                  </Menu.Item>
                )}
                {event.status !== 'done' && (
                  <Menu.Item onClick={() => onStatusChange(event.id, 'done')}>
                    ✅ Hoàn thành
                  </Menu.Item>
                )}
                
                <Menu.Divider />
                
                <Menu.Item 
                  color="red"
                  leftSection={<IconTrash size={14} />}
                  onClick={() => onDelete(event.id)}
                >
                  Xóa
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>

          {/* Course */}
          {event.course && (
            <Text 
              size="xs" 
              c="dimmed"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                padding: '2px 6px',
                borderRadius: '4px',
                alignSelf: 'flex-start',
                color: urgencyInfo.textColor,
                opacity: 0.8
              }}
            >
              {event.course}
            </Text>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <Group gap={4}>
              {event.tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  size="xs"
                  style={{
                    borderColor: urgencyLevel === 'critical' ? '#ff6b6b' : urgencyLevel === 'urgent' ? '#ffa726' : '#78909c',
                    color: urgencyLevel === 'critical' ? '#d32f2f' : urgencyLevel === 'urgent' ? '#f57c00' : '#546e7a',
                    opacity: 0.8
                  }}
                  className="status-badge-animated"
                >
                  {tag}
                </Badge>
              ))}
            </Group>
          )}

          {/* Priority & Status */}
          <Group justify="space-between" align="center">
            <Group gap="xs">
              {/* Priority */}
              {event.priority && (
                <Badge 
                  color={getPriorityColor(event.priority)} 
                  size="xs" 
                  variant="light"
                  leftSection={
                    event.priority === 'high' ? (
                      <IconFlame size={10} />
                    ) : event.priority === 'medium' ? (
                      <IconFlag size={10} />
                    ) : (
                      <IconStar size={10} />
                    )
                  }
                  className="status-badge-animated"
                >
                  {event.priority}
                </Badge>
              )}

              {/* Status */}
              <Badge 
                color={getStatusColor(event.status)} 
                size="xs" 
                variant="filled"
                className="status-badge-animated"
              >
                {event.status === 'todo' ? 'Cần làm' : 
                 event.status === 'in-progress' ? 'Đang làm' : 'Hoàn thành'}
              </Badge>
            </Group>
          </Group>

          {/* Urgency Message - chỉ hiện cho critical và urgent */}
          {(urgencyLevel === 'critical' || urgencyLevel === 'urgent') && (
            <Tooltip label={`Mức độ ưu tiên: ${urgencyLevel}`} withArrow>
              <Text 
                size="xs" 
                className="urgency-message"
                style={{
                  background: urgencyInfo.backgroundColor,
                  color: urgencyInfo.textColor,
                  border: `1px solid ${urgencyInfo.borderColor}`,
                  fontWeight: 600,
                  fontSize: '10px',
                  opacity: 0.9
                }}
              >
                {urgencyMessage}
              </Text>
            </Tooltip>
          )}

          {/* Time Information */}
          <Group gap="xs" align="center">
            <IconClock 
              size={14} 
              style={{ 
                color: urgencyLevel === 'critical' ? '#ff6b6b' : urgencyLevel === 'urgent' ? '#ffa726' : '#667eea',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
              }} 
            />
            <Text 
              size="xs"
              fw={urgencyLevel === 'critical' || urgencyLevel === 'urgent' ? 700 : 600}
              style={{
                color: urgencyLevel === 'critical' ? '#d32f2f' : urgencyLevel === 'urgent' ? '#f57c00' : '#495057',
                textShadow: urgencyLevel === 'critical' ? '0 1px 3px rgba(211, 47, 47, 0.2)' : 'none'
              }}
            >
              {formatTime(event.startTime)}
              {urgencyLevel === 'critical' && daysUntil < 0 && ' (Quá hạn)'}
              {urgencyLevel === 'urgent' && ' (Gấp)'}
            </Text>
          </Group>

          {/* Time Progress */}
          {timeProgress && (
            <Stack gap={4}>
              <Group justify="space-between">
                <Text size="xs" c="dimmed">{timeProgress.label}</Text>
                <Text size="xs" fw={600} style={{ color: urgencyInfo.color }}>
                  {timeProgress.value}%
                </Text>
              </Group>
              <Progress 
                value={timeProgress.value}
                color={urgencyLevel === 'critical' ? 'red' : urgencyLevel === 'urgent' ? 'orange' : 'blue'}
                size="xs"
                radius="xl"
                className="progress-bar-animated"
                style={{
                  background: 'rgba(0, 0, 0, 0.05)'
                }}
              />
            </Stack>
          )}

          {/* Estimated Time */}
          {event.estimatedTime && (
            <Text 
              size="xs" 
              c="dimmed"
              style={{
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.6)',
                padding: '2px 6px',
                borderRadius: '4px',
                border: `1px solid rgba(120, 144, 156, 0.2)`,
                opacity: 0.9
              }}
            >
              ⏱️ {event.estimatedTime}h dự kiến
              {event.actualTime && ` • ${event.actualTime}h thực tế`}
            </Text>
          )}
        </Stack>
      </Card>
    </Box>
  );
}