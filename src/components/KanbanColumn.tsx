import { Stack, Title, Paper, Text, Badge, Group, Button, ActionIcon } from '@mantine/core';
import { IconPlus, IconFilter } from '@tabler/icons-react';
import type { AcademicEvent } from '../types';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  title: string;
  status: AcademicEvent['status'];
  events: AcademicEvent[];
  onEdit: (event: AcademicEvent) => void;
  onDelete: (eventId: string) => void;
  onStatusChange: (eventId: string, status: AcademicEvent['status']) => void;
  onAddEvent?: () => void;
  color: string;
}

export function KanbanColumn({
  title,
  status,
  events,
  onEdit,
  onDelete,
  onStatusChange,
  onAddEvent,
  color
}: KanbanColumnProps) {
  const getStatusDescription = () => {
    switch (status) {
      case 'todo':
        return 'Các nhiệm vụ cần thực hiện';
      case 'in-progress':
        return 'Các nhiệm vụ đang thực hiện';
      case 'done':
        return 'Các nhiệm vụ đã hoàn thành';
      default:
        return '';
    }
  };

  const getUrgentCount = () => {
    if (status === 'done') return 0;
    return events.filter(event => {
      const daysUntil = Math.ceil((new Date(event.startTime).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 2 && daysUntil >= 0;
    }).length;
  };

  const urgentCount = getUrgentCount();

  return (
    <Paper withBorder p="md" radius="md" style={{ height: 'fit-content', minHeight: '400px' }}>
      <Stack gap="md">
        {/* Column Header */}
        <Group justify="space-between">
          <Stack gap="xs">
            <Group gap="xs">
              <Title order={4} c={color}>
                {title}
              </Title>
              <Badge color={color} variant="light">
                {events.length}
              </Badge>
              {urgentCount > 0 && (
                <Badge color="red" size="sm">
                  {urgentCount} gấp
                </Badge>
              )}
            </Group>
            <Text size="xs" c="dimmed">
              {getStatusDescription()}
            </Text>
          </Stack>

          <Group gap="xs">
            <ActionIcon variant="light" color={color} size="sm">
              <IconFilter size={16} />
            </ActionIcon>
            {status === 'todo' && onAddEvent && (
              <ActionIcon variant="light" color={color} size="sm" onClick={onAddEvent}>
                <IconPlus size={16} />
              </ActionIcon>
            )}
          </Group>
        </Group>

        {/* Events List */}
        <Stack gap="sm">
          {events.length > 0 ? (
            events.map(event => (
              <TaskCard
                key={event.id}
                event={event}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
              />
            ))
          ) : (
            <Paper p="xl" style={{ border: '2px dashed #e9ecef', textAlign: 'center' }}>
              <Stack align="center" gap="xs">
                <Text size="sm" c="dimmed">
                  {status === 'todo' && 'Không có nhiệm vụ nào cần làm'}
                  {status === 'in-progress' && 'Không có nhiệm vụ nào đang thực hiện'}
                  {status === 'done' && 'Chưa hoàn thành nhiệm vụ nào'}
                </Text>
                {status === 'todo' && onAddEvent && (
                  <Button variant="light" color={color} size="xs" onClick={onAddEvent}>
                    Thêm nhiệm vụ đầu tiên
                  </Button>
                )}
              </Stack>
            </Paper>
          )}
        </Stack>

        {/* Column Footer Stats */}
        {events.length > 0 && (
          <Paper withBorder p="xs" radius="sm" bg="gray.0">
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                {status === 'todo' && `${events.filter(e => e.priority === 'high').length} ưu tiên cao`}
                {status === 'in-progress' && `${events.reduce((acc, e) => acc + (e.estimatedTime || 0), 0)}h ước tính`}
                {status === 'done' && `${events.reduce((acc, e) => acc + (e.actualTime || e.estimatedTime || 0), 0)}h hoàn thành`}
              </Text>
              
              {status !== 'done' && (
                <Text size="xs" c="dimmed">
                  {events.filter(e => e.type === 'deadline').length} deadline
                </Text>
              )}
            </Group>
          </Paper>
        )}
      </Stack>
    </Paper>
  );
}
