import { Card, Text, Badge, Group, ActionIcon, Stack, Progress, Box, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash, IconClock, IconCheck } from '@tabler/icons-react';
import type { AcademicEvent } from '../types';
import { formatDateTime, getRelativeTime, getDaysUntil } from '../utils/dateUtils';
import { getUrgencyLevel, getUrgencyInfo, getUrgencyMessage } from '../utils/urgencyUtils';
import '../styles/urgency-animations.css';

interface EventCardProps {
  event: AcademicEvent;
  onEdit?: (event: AcademicEvent) => void;
  onDelete?: (eventId: string) => void;
  onStatusChange?: (eventId: string, status: AcademicEvent['status']) => void;
}

const typeColors = {
  deadline: 'red',
  class: 'blue',
  project: 'orange',
  personal: 'green'
};

const statusColors = {
  todo: 'gray',
  'in-progress': 'yellow',
  done: 'green'
};

const priorityColors = {
  low: 'green',
  medium: 'yellow',
  high: 'red'
};

export function EventCard({ event, onEdit, onDelete, onStatusChange }: EventCardProps) {
  const daysUntil = getDaysUntil(event.startTime);
  const isOverdue = daysUntil < 0 && event.status !== 'done';
  
  // Get urgency information
  const urgencyLevel = getUrgencyLevel(event.startTime.toString(), event.status);
  const urgencyInfo = getUrgencyInfo(urgencyLevel);
  const urgencyMessage = getUrgencyMessage(urgencyLevel, daysUntil);
  
  const getProgress = () => {
    if (event.status === 'done') return 100;
    if (event.status === 'in-progress') return 50;
    return 0;
  };

  const getStatusLabel = (status: AcademicEvent['status']) => {
    switch (status) {
      case 'todo': return 'Cần làm';
      case 'in-progress': return 'Đang làm';
      case 'done': return 'Hoàn thành';
      default: return status;
    }
  };

  // Dynamic card classes based on urgency
  const cardClasses = [
    'event-card-animated',
    urgencyInfo.shouldPulse ? 'urgent-card' : '',
    'event-card-gradient',
    'card-enter'
  ].filter(Boolean).join(' ');

  return (
    <Box style={{ position: 'relative' }}>
      {/* Urgency indicator dot - only show for critical and urgent */}
      {(urgencyLevel === 'critical' || urgencyLevel === 'urgent') && (
        <div 
          className={`urgency-indicator urgency-${urgencyLevel}`}
          style={{
            background: urgencyLevel === 'critical' ? '#ff6b6b' : '#ffa726',
            boxShadow: `0 0 6px ${urgencyLevel === 'critical' ? 'rgba(255, 107, 107, 0.4)' : 'rgba(255, 167, 38, 0.4)'}`
          }}
        />
      )}
      
      <Card 
        shadow="sm" 
        padding="lg" 
        radius="md" 
        withBorder
        className={cardClasses}
        style={{
          background: event.status === 'done' 
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 255, 240, 0.8) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.8) 100%)',
          backdropFilter: 'blur(10px)',
          borderColor: urgencyLevel === 'critical' || urgencyLevel === 'urgent' 
            ? `rgba(${urgencyLevel === 'critical' ? '255, 107, 107' : '255, 167, 38'}, 0.3)`
            : 'rgba(226, 232, 240, 0.8)',
          borderWidth: '1px',
          boxShadow: urgencyLevel === 'critical' || urgencyLevel === 'urgent'
            ? `0 4px 16px rgba(${urgencyLevel === 'critical' ? '255, 107, 107' : '255, 167, 38'}, 0.1)`
            : '0 4px 16px rgba(0, 0, 0, 0.05)',
          '--card-gradient': urgencyInfo.gradient,
          '--progress-width': `${getProgress()}%`,
          transition: 'all 0.3s ease'
        } as React.CSSProperties}
      >
        <Stack gap="sm">
          {/* Header */}
          <Group justify="space-between">
            <Group gap="xs">
              <Badge color={typeColors[event.type]} variant="light" className="status-badge-animated">
                {event.type}
              </Badge>
              {event.priority && (
                <Badge color={priorityColors[event.priority]} variant="outline" size="sm" className="status-badge-animated">
                  {event.priority}
                </Badge>
              )}
            </Group>
            
            <Group gap="xs">
              {onEdit && (
                <ActionIcon
                  variant="subtle"
                  color="blue"
                  onClick={() => onEdit(event)}
                  style={{ transition: 'all 0.2s ease' }}
                >
                  <IconEdit size={16} />
                </ActionIcon>
              )}
              
              {onDelete && (
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => onDelete(event.id)}
                  style={{ transition: 'all 0.2s ease' }}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              )}
              
              {onStatusChange && event.status !== 'done' && (
                <ActionIcon
                  variant="subtle"
                  color="green"
                  onClick={() => onStatusChange(event.id, 'done')}
                  style={{ transition: 'all 0.2s ease' }}
                >
                  <IconCheck size={16} />
                </ActionIcon>
              )}
            </Group>
          </Group>

          {/* Title */}
          <Text fw={500} size="lg" style={{ 
            color: '#2c3e50' 
          }}>
            {event.title}
          </Text>

          {/* Course */}
          {event.course && (
            <Text size="sm" c="dimmed">
              {event.course}
            </Text>
          )}

          {/* Description */}
          {event.description && (
            <Text size="sm" c="dimmed">
              {event.description}
            </Text>
          )}

          {/* Time Info */}
          <Group gap="xs">
            <IconClock size={16} style={{ 
              color: urgencyLevel === 'critical' || urgencyLevel === 'urgent' 
                ? urgencyInfo.color 
                : '#64748b' 
            }} />
            <Text size="sm">
              {formatDateTime(event.startTime)}
            </Text>
            <Text size="sm" c={isOverdue ? 'red' : 'dimmed'}>
              ({getRelativeTime(event.startTime)})
            </Text>
          </Group>

          {/* Urgency Message */}
          {(urgencyLevel === 'critical' || urgencyLevel === 'urgent') && (
            <Tooltip label={`Mức độ ưu tiên: ${urgencyLevel}`} withArrow>
              <Text 
                size="sm" 
                className="urgency-message"
                style={{
                  background: urgencyLevel === 'critical' 
                    ? 'rgba(255, 107, 107, 0.08)' 
                    : 'rgba(255, 167, 38, 0.08)',
                  color: urgencyLevel === 'critical' 
                    ? '#dc2626' 
                    : '#d97706',
                  border: `1px solid ${urgencyLevel === 'critical' 
                    ? 'rgba(255, 107, 107, 0.2)' 
                    : 'rgba(255, 167, 38, 0.2)'}`,
                  fontWeight: 500,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  textAlign: 'center'
                }}
              >
                {urgencyMessage}
              </Text>
            </Tooltip>
          )}

          {/* Status and Progress */}
          <Group justify="space-between" align="center">
            <Badge color={statusColors[event.status]} variant="light" className="status-badge-animated">
              {getStatusLabel(event.status)}
            </Badge>
            
            {event.estimatedTime && (
              <Text size="sm" c="dimmed">
                ⏱️ {event.estimatedTime}h
                {event.actualTime && ` (thực tế: ${event.actualTime}h)`}
              </Text>
            )}
          </Group>

          {/* Progress Bar */}
          <Progress 
            value={getProgress()} 
            color={urgencyLevel === 'critical' 
              ? 'red' 
              : urgencyLevel === 'urgent' 
                ? 'orange' 
                : event.status === 'done' 
                  ? 'green' 
                  : 'blue'} 
            size="sm"
            className="progress-bar-animated"
            style={{
              background: 'rgba(226, 232, 240, 0.3)'
            }}
          />

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <Group gap={4}>
              {event.tags.map((tag, index) => (
                <Badge key={index} variant="outline" size="xs" className="status-badge-animated">
                  {tag}
                </Badge>
              ))}
            </Group>
          )}
        </Stack>
      </Card>
    </Box>
  );
}
