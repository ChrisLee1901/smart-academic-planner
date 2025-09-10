import { useState } from 'react';
import {
  TextInput,
  Button,
  Group,
  Select,
  Paper,
  Stack,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { IconPlus, IconX, IconCalendarEvent } from '@tabler/icons-react';
import { DateTimePicker } from '@mantine/dates';
import type { AcademicEvent } from '../types';
import { generateId } from '../utils/dateUtils';

interface QuickAddTaskProps {
  status: AcademicEvent['status'];
  onAdd: (task: AcademicEvent) => void;
  color: string;
}

export function QuickAddTask({ status, onAdd, color }: QuickAddTaskProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<AcademicEvent['type']>('deadline');
  const [priority, setPriority] = useState<AcademicEvent['priority']>('medium');
  const [startTime, setStartTime] = useState<Date>(new Date());

  const handleSubmit = () => {
    if (!title.trim()) return;

    const newTask: AcademicEvent = {
      id: generateId(),
      title: title.trim(),
      type,
      startTime,
      status,
      priority,
      tags: []
    };

    onAdd(newTask);
    
    // Reset form
    setTitle('');
    setType('deadline');
    setPriority('medium');
    setStartTime(new Date());
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTitle('');
    setType('deadline');
    setPriority('medium');
    setStartTime(new Date());
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        variant="light"
        color={color}
        size="sm"
        leftSection={<IconPlus size={16} />}
        onClick={() => setIsOpen(true)}
        fullWidth
        styles={{
          root: {
            border: `2px dashed var(--mantine-color-${color}-3)`,
            '&:hover': {
              backgroundColor: `var(--mantine-color-${color}-1)`,
              border: `2px dashed var(--mantine-color-${color}-5)`
            }
          }
        }}
      >
        ➕ Thêm nhiệm vụ nhanh
      </Button>
    );
  }

  return (
    <Paper withBorder p="md" radius="md" bg={`${color}.0`}>
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <IconCalendarEvent size={16} color={`var(--mantine-color-${color}-6)`} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: `var(--mantine-color-${color}-7)` }}>
              Thêm nhiệm vụ mới
            </span>
          </Group>
          <Tooltip label="Đóng">
            <ActionIcon 
              variant="subtle" 
              color={color} 
              size="sm"
              onClick={handleCancel}
            >
              <IconX size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <TextInput
          placeholder="Nhập tên nhiệm vụ..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          size="sm"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && title.trim()) {
              handleSubmit();
            }
            if (e.key === 'Escape') {
              handleCancel();
            }
          }}
        />

        <Group grow>
          <Select
            placeholder="Loại"
            value={type}
            onChange={(value) => setType(value as AcademicEvent['type'])}
            data={[
              { value: 'deadline', label: 'Deadline' },
              { value: 'class', label: 'Lớp học' },
              { value: 'project', label: 'Dự án' },
              { value: 'personal', label: 'Cá nhân' }
            ]}
            size="sm"
          />

          <Select
            placeholder="Ưu tiên"
            value={priority}
            onChange={(value) => setPriority(value as AcademicEvent['priority'])}
            data={[
              { value: 'low', label: 'Thấp' },
              { value: 'medium', label: 'Trung bình' },
              { value: 'high', label: 'Cao' }
            ]}
            size="sm"
          />
        </Group>

        <DateTimePicker
          placeholder="Thời gian"
          value={startTime}
          onChange={(date) => setStartTime(date ? new Date(date) : new Date())}
          size="sm"
        />

        <Group justify="flex-end" gap="xs">
          <Button
            variant="light"
            color="gray"
            size="xs"
            onClick={handleCancel}
          >
            Hủy
          </Button>
          <Button
            color={color}
            size="xs"
            onClick={handleSubmit}
            disabled={!title.trim()}
          >
            Thêm
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
