import { Card, Text, Badge, Group, ActionIcon, Stack, Menu, Progress } from '@mantine/core';
import { IconEdit, IconTrash, IconClock, IconDots, IconFlag } from '@tabler/icons-react';
import type { AcademicEvent } from '../types';
import { formatTime, getDaysUntil } from '../utils/dateUtils';

interface TaskCardProps {
  event: AcademicEvent;
  onEdit: (event: AcademicEvent) => void;
  onDelete: (eventId: string) => void;
  onStatusChange: (eventId: string, status: AcademicEvent['status']) => void;
}

export function TaskCard({ event, onEdit, onDelete, onStatusChange }: TaskCardProps) {
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

  const daysUntil = getDaysUntil(event.startTime);
  const isOverdue = daysUntil < 0;
  const isUrgent = daysUntil <= 2 && daysUntil >= 0;

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

  return (
    <Card 
      shadow="sm" 
      padding="md" 
      radius="md" 
      withBorder
      style={{
        border: isOverdue ? '2px solid #fa5252' : isUrgent ? '2px solid #fd7e14' : undefined,
        backgroundColor: isOverdue ? '#fff5f5' : isUrgent ? '#fff4e6' : undefined
      }}
    >
      <Stack gap="xs">
        {/* Header with title and menu */}
        <Group justify="space-between" wrap="nowrap">
          <Text fw={500} size="sm" lineClamp={2} style={{ flex: 1 }}>
            {event.title}
          </Text>
          
          <Menu shadow="md" width={150}>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="sm">
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
              
              {event.status !== 'done' && (
                <>
                  <Menu.Item 
                    onClick={() => onStatusChange(event.id, 'in-progress')}
                    disabled={event.status === 'in-progress'}
                  >
                    Bắt đầu làm
                  </Menu.Item>
                  <Menu.Item 
                    onClick={() => onStatusChange(event.id, 'done')}
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
              >
                Xóa
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {/* Course info */}
        {event.course && (
          <Text size="xs" c="dimmed">
            {event.course}
          </Text>
        )}

        {/* Badges row */}
        <Group gap="xs">
          <Badge size="xs" color={getTypeColor(event.type)}>
            {event.type === 'deadline' ? 'Deadline' : 
             event.type === 'class' ? 'Lớp học' :
             event.type === 'project' ? 'Dự án' : 'Cá nhân'}
          </Badge>
          
          <Badge 
            size="xs" 
            color={getPriorityColor(event.priority)} 
            leftSection={<IconFlag size={10} />}
          >
            {event.priority === 'high' ? 'Cao' : 
             event.priority === 'low' ? 'Thấp' : 'Trung bình'}
          </Badge>

          <Badge size="xs" color={getStatusColor(event.status)}>
            {event.status === 'todo' ? 'Cần làm' :
             event.status === 'in-progress' ? 'Đang làm' : 'Hoàn thành'}
          </Badge>
        </Group>

        {/* Time info */}
        <Group gap="xs" align="center">
          <IconClock size={14} color="gray" />
          <Text size="xs" c={isOverdue ? 'red' : isUrgent ? 'orange' : 'dimmed'}>
            {formatTime(event.startTime)}
            {isOverdue && ' (Quá hạn)'}
            {isUrgent && ' (Gấp)'}
          </Text>
        </Group>

        {/* Time progress */}
        {timeProgress && (
          <Stack gap="xs">
            <Text size="xs" c="dimmed">{timeProgress.label}</Text>
            <Progress 
              value={timeProgress.value} 
              color={timeProgress.color} 
              size="sm" 
              radius="xl"
            />
          </Stack>
        )}

        {/* Description preview */}
        {event.description && (
          <Text size="xs" c="dimmed" lineClamp={2}>
            {event.description}
          </Text>
        )}

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <Group gap="xs">
            {event.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} size="xs" variant="light" color="gray">
                {tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Text size="xs" c="dimmed">+{event.tags.length - 3}</Text>
            )}
          </Group>
        )}
      </Stack>
    </Card>
  );
}
