import { Modal, Stack, Group, Text, Badge, Divider, Paper, Grid, Progress, ActionIcon, Tooltip } from '@mantine/core';
import { IconCalendar, IconClock, IconFlag, IconUser, IconTarget, IconNotes, IconEdit, IconTrash } from '@tabler/icons-react';
import type { AcademicEvent } from '../types';
import { formatTime, getDaysUntil } from '../utils/dateUtils';
import { getUrgencyLevel, getUrgencyInfo, getUrgencyMessage } from '../utils/urgencyUtils';
import dayjs from '../utils/dayjs';

interface TaskDetailModalProps {
  event: AcademicEvent | null;
  opened: boolean;
  onClose: () => void;
  onEdit: (event: AcademicEvent) => void;
  onDelete: (eventId: string) => void;
  onStatusChange: (eventId: string, status: AcademicEvent['status']) => void;
}

export function TaskDetailModal({ event, opened, onClose, onEdit, onDelete, onStatusChange }: TaskDetailModalProps) {
  if (!event) return null;

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

  const getStatusText = (status: AcademicEvent['status']) => {
    switch (status) {
      case 'todo': return 'Cần làm';
      case 'in-progress': return 'Đang làm';
      case 'done': return 'Hoàn thành';
      default: return status;
    }
  };

  const getPriorityText = (priority: AcademicEvent['priority']) => {
    switch (priority) {
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return priority;
    }
  };

  const getTypeText = (type: AcademicEvent['type']) => {
    switch (type) {
      case 'deadline': return 'Deadline';
      case 'class': return 'Lớp học';
      case 'project': return 'Dự án';
      case 'personal': return 'Cá nhân';
      default: return type;
    }
  };

  const daysUntil = getDaysUntil(event.startTime);
  const urgencyLevel = getUrgencyLevel(event.startTime.toString(), event.status);
  const urgencyInfo = getUrgencyInfo(urgencyLevel);
  const urgencyMessage = getUrgencyMessage(urgencyLevel, daysUntil);

  const getTimeProgress = () => {
    if (!event.estimatedTime) return null;
    if (event.status === 'done' && event.actualTime) {
      return {
        value: 100,
        label: 'Hoàn thành',
        efficiency: event.actualTime <= event.estimatedTime ? 'Đúng hạn' : 'Quá giờ dự kiến',
        color: event.actualTime <= event.estimatedTime ? 'green' : 'orange'
      };
    }
    if (event.status === 'in-progress') {
      return {
        value: 50,
        label: 'Đang thực hiện',
        efficiency: '',
        color: 'blue'
      };
    }
    return {
      value: 0,
      label: 'Chưa bắt đầu',
      efficiency: '',
      color: 'gray'
    };
  };

  const timeProgress = getTimeProgress();

  return (
    <Modal 
      opened={opened} 
      onClose={onClose}
      title={
        <Group gap="sm">
          <Text size="lg" fw={700}>Chi tiết nhiệm vụ</Text>
          <div style={{ fontSize: '20px' }}>{getTypeIcon(event.type)}</div>
        </Group>
      }
      size="lg"
      padding="xl"
    >
      <Stack gap="lg">
        {/* Header Actions */}
        <Group justify="space-between">
          <Badge 
            size="lg" 
            color={getStatusColor(event.status)} 
            variant="light"
            style={{ fontSize: '12px', padding: '8px 12px' }}
          >
            {getStatusText(event.status)}
          </Badge>
          
          <Group gap="xs">
            <Tooltip label="Chỉnh sửa">
              <ActionIcon 
                variant="light" 
                color="blue" 
                size="lg"
                onClick={() => {
                  onEdit(event);
                  onClose();
                }}
              >
                <IconEdit size={18} />
              </ActionIcon>
            </Tooltip>
            
            <Tooltip label="Xóa">
              <ActionIcon 
                variant="light" 
                color="red" 
                size="lg"
                onClick={() => {
                  onDelete(event.id);
                  onClose();
                }}
              >
                <IconTrash size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        {/* Title */}
        <Paper p="md" withBorder radius="md" style={{ background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)' }}>
          <Text size="xl" fw={700} style={{ color: '#2c3e50' }}>
            {event.title}
          </Text>
        </Paper>

        {/* Basic Info Grid */}
        <Grid>
          <Grid.Col span={6}>
            <Paper p="md" withBorder radius="md">
              <Group gap="sm" mb="xs">
                <IconCalendar size={16} color="#667eea" />
                <Text size="sm" fw={600} c="dimmed">Thời gian</Text>
              </Group>
              <Text size="sm" fw={500}>
                {dayjs(event.startTime).format('dddd, DD/MM/YYYY')}
              </Text>
              <Text size="sm" c="dimmed">
                {formatTime(event.startTime)}
              </Text>
            </Paper>
          </Grid.Col>

          <Grid.Col span={6}>
            <Paper p="md" withBorder radius="md">
              <Group gap="sm" mb="xs">
                <IconFlag size={16} color={getPriorityColor(event.priority)} />
                <Text size="sm" fw={600} c="dimmed">Độ ưu tiên</Text>
              </Group>
              <Badge color={getPriorityColor(event.priority)} variant="light">
                {getPriorityText(event.priority)}
              </Badge>
            </Paper>
          </Grid.Col>

          <Grid.Col span={6}>
            <Paper p="md" withBorder radius="md">
              <Group gap="sm" mb="xs">
                <IconTarget size={16} color={getTypeColor(event.type)} />
                <Text size="sm" fw={600} c="dimmed">Loại</Text>
              </Group>
              <Badge color={getTypeColor(event.type)} variant="light">
                {getTypeText(event.type)}
              </Badge>
            </Paper>
          </Grid.Col>

          {event.course && (
            <Grid.Col span={6}>
              <Paper p="md" withBorder radius="md">
                <Group gap="sm" mb="xs">
                  <IconUser size={16} color="#7c3aed" />
                  <Text size="sm" fw={600} c="dimmed">Môn học</Text>
                </Group>
                <Text size="sm" fw={500}>
                  {event.course}
                </Text>
              </Paper>
            </Grid.Col>
          )}
        </Grid>

        {/* Urgency Info */}
        {(urgencyLevel === 'critical' || urgencyLevel === 'urgent') && (
          <Paper 
            p="md" 
            withBorder 
            radius="md"
            style={{ 
              background: urgencyInfo.backgroundColor,
              borderColor: urgencyInfo.borderColor,
              border: `2px solid ${urgencyInfo.borderColor}`
            }}
          >
            <Group gap="sm">
              <Text size="sm" fw={600} style={{ color: urgencyInfo.textColor }}>
                ⚠️ {urgencyMessage}
              </Text>
            </Group>
          </Paper>
        )}

        {/* Time Progress */}
        {timeProgress && (
          <Paper p="md" withBorder radius="md">
            <Group gap="sm" mb="sm">
              <IconClock size={16} color="#667eea" />
              <Text size="sm" fw={600} c="dimmed">Tiến độ thời gian</Text>
            </Group>
            
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm">{timeProgress.label}</Text>
                <Text size="sm" fw={600}>{timeProgress.value}%</Text>
              </Group>
              
              <Progress 
                value={timeProgress.value} 
                color={timeProgress.color} 
                size="md" 
                radius="xl"
              />
              
              <Group justify="space-between" mt="xs">
                <Group gap="xs">
                  <Text size="xs" c="dimmed">Dự kiến:</Text>
                  <Text size="xs" fw={500}>{event.estimatedTime || 1}h</Text>
                </Group>
                
                {event.actualTime && (
                  <Group gap="xs">
                    <Text size="xs" c="dimmed">Thực tế:</Text>
                    <Text size="xs" fw={500}>{event.actualTime}h</Text>
                  </Group>
                )}
                
                {timeProgress.efficiency && (
                  <Badge size="xs" color={timeProgress.color} variant="light">
                    {timeProgress.efficiency}
                  </Badge>
                )}
              </Group>
            </Stack>
          </Paper>
        )}

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <Paper p="md" withBorder radius="md">
            <Group gap="sm" mb="sm">
              <Text size="sm" fw={600} c="dimmed">Tags</Text>
            </Group>
            <Group gap="xs">
              {event.tags.map((tag, index) => (
                <Badge key={index} variant="outline" size="sm">
                  {tag}
                </Badge>
              ))}
            </Group>
          </Paper>
        )}

        {/* Description */}
        {event.description && (
          <Paper p="md" withBorder radius="md">
            <Group gap="sm" mb="sm">
              <IconNotes size={16} color="#667eea" />
              <Text size="sm" fw={600} c="dimmed">Mô tả</Text>
            </Group>
            <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
              {event.description}
            </Text>
          </Paper>
        )}

        {/* Status Change Actions */}
        <Divider />
        
        <Paper p="md" withBorder radius="md" style={{ background: '#f8f9fa' }}>
          <Text size="sm" fw={600} mb="sm" c="dimmed">Thay đổi trạng thái</Text>
          <Group gap="sm">
            {event.status !== 'todo' && (
              <Badge 
                variant="light" 
                color="gray"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  onStatusChange(event.id, 'todo');
                  onClose();
                }}
              >
                📝 Cần làm
              </Badge>
            )}
            {event.status !== 'in-progress' && (
              <Badge 
                variant="light" 
                color="blue"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  onStatusChange(event.id, 'in-progress');
                  onClose();
                }}
              >
                ⚡ Đang làm
              </Badge>
            )}
            {event.status !== 'done' && (
              <Badge 
                variant="light" 
                color="green"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  onStatusChange(event.id, 'done');
                  onClose();
                }}
              >
                ✅ Hoàn thành
              </Badge>
            )}
          </Group>
        </Paper>

        {/* Metadata */}
        <Paper p="sm" radius="md" style={{ background: '#f8f9fa' }}>
          <Text size="xs" c="dimmed" ta="center">
            ID: {event.id} • Tạo: {dayjs(event.startTime).format('DD/MM/YYYY HH:mm')}
          </Text>
        </Paper>
      </Stack>
    </Modal>
  );
}