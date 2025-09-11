import { Card, Text, Badge, Group, ActionIcon, Stack, Progress } from '@mantine/core';
import { IconEdit, IconTrash, IconClock, IconCheck } from '@tabler/icons-react';
import type { AcademicEvent } from '../types';
import { formatDateTime, getRelativeTime, getDaysUntil } from '../utils/dateUtils';

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

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="sm">
        {/* Header */}
        <Group justify="space-between">
          <Group gap="xs">
            <Badge color={typeColors[event.type]} variant="light">
              {event.type}
            </Badge>
            {event.priority && (
              <Badge color={priorityColors[event.priority]} variant="outline" size="sm">
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
              >
                <IconEdit size={16} />
              </ActionIcon>
            )}
            
            {onDelete && (
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => onDelete(event.id)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            )}
            
            {onStatusChange && event.status !== 'done' && (
              <ActionIcon
                variant="subtle"
                color="green"
                onClick={() => onStatusChange(event.id, 'done')}
              >
                <IconCheck size={16} />
              </ActionIcon>
            )}
          </Group>
        </Group>

        {/* Title */}
        <Text fw={500} size="lg">
          {event.title}
        </Text>

        {/* Course */}
        {event.course && (
          <Text size="sm" c="dimmed">
            📚 {event.course}
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
          <IconClock size={16} />
          <Text size="sm">
            {formatDateTime(event.startTime)}
          </Text>
          <Text size="sm" c={isOverdue ? 'red' : 'dimmed'}>
            ({getRelativeTime(event.startTime)})
          </Text>
        </Group>

        {/* Status and Progress */}
        <Group justify="space-between" align="center">
          <Badge color={statusColors[event.status]} variant="light">
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
        <Progress value={getProgress()} color={statusColors[event.status]} size="sm" />

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <Group gap={4}>
            {event.tags.map((tag, index) => (
              <Badge key={index} variant="outline" size="xs">
                {tag}
              </Badge>
            ))}
          </Group>
        )}

        {/* Overdue Warning */}
        {isOverdue && (
          <Text size="sm" c="red" fw={500}>
            ⚠️ Đã quá hạn {Math.abs(daysUntil)} ngày
          </Text>
        )}
      </Stack>
    </Card>
  );
}
