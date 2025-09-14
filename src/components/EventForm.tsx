import { useForm } from '@mantine/form';
import {
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Button,
  Stack,
  Group,
  TagsInput,
  Grid,
  Alert,
  Text,
  Badge,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IconClock } from '@tabler/icons-react';
import type { AcademicEvent, EventFormData } from '../types';
import { generateId } from '../utils/dateUtils';
import { ProcrastinationAnalysisService } from '../services/procrastinationService';
import dayjs from '../utils/dayjs';

interface EventFormProps {
  event?: AcademicEvent;
  onSubmit: (event: AcademicEvent) => void;
  onCancel: () => void;
  defaultStatus?: AcademicEvent['status']; // New prop to set default status
}

export function EventForm({ event, onSubmit, onCancel, defaultStatus }: EventFormProps) {
  const form = useForm<EventFormData>({
    initialValues: {
      title: event?.title || '',
      type: event?.type || 'deadline',
      course: event?.course || '',
      startTime: event?.startTime || new Date(),
      endTime: event?.endTime || undefined,
      status: event?.status || defaultStatus || 'todo',
      estimatedTime: event?.estimatedTime || undefined,
      description: event?.description || '',
      priority: event?.priority || 'medium',
      tags: event?.tags || []
    },
    validate: {
      title: (value) => value.trim().length === 0 ? 'Tiêu đề không được để trống' : null,
      startTime: (value) => !value ? 'Thời gian bắt đầu không được để trống' : null,
    }
  });

  // Calculate realistic deadline when form values change
  const getRealisticDeadlineInfo = () => {
    const values = form.values;
    if (!values.estimatedTime || !values.startTime) {
      return null;
    }

    const tempEvent: AcademicEvent = {
      id: 'temp',
      title: values.title,
      type: values.type,
      startTime: values.startTime,
      endTime: values.endTime,
      estimatedTime: values.estimatedTime,
      priority: values.priority,
      status: values.status,
      course: values.course,
      description: values.description,
      tags: values.tags
    };

    const realisticDeadline = ProcrastinationAnalysisService.calculateRealisticDeadline(tempEvent);
    const officialDeadline = dayjs(values.startTime);
    const realistic = dayjs(realisticDeadline);
    
    const timeDifference = officialDeadline.diff(realistic, 'hour', true);
    
    return {
      realisticDeadline: realistic.format('DD/MM/YYYY HH:mm'),
      timeDifference: Math.round(timeDifference * 10) / 10,
      isEarlier: realistic.isBefore(officialDeadline),
      urgencyLevel: timeDifference > 24 ? 'low' : timeDifference > 12 ? 'medium' : 'high'
    };
  };

  const realisticInfo = getRealisticDeadlineInfo();

  const handleSubmit = (values: EventFormData) => {
    const eventData: AcademicEvent = {
      id: event?.id || generateId(),
      ...values,
      actualTime: event?.actualTime
    };
    onSubmit(eventData);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg" p="md">
        <TextInput
          label="Tiêu đề sự kiện"
          placeholder="Ví dụ: Nộp bài tập Lịch sử Đảng"
          required
          {...form.getInputProps('title')}
        />

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label="Loại sự kiện"
              placeholder="Chọn loại sự kiện"
              data={[
                { value: 'deadline', label: 'Deadline' },
                { value: 'class', label: 'Lớp học' },
                { value: 'project', label: 'Dự án' },
                { value: 'personal', label: 'Cá nhân' }
              ]}
              allowDeselect={false}
              searchable
              clearable={false}
              comboboxProps={{ zIndex: 1000 }}
              {...form.getInputProps('type')}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label="Ưu tiên"
              placeholder="Chọn mức ưu tiên"
              data={[
                { value: 'low', label: 'Thấp' },
                { value: 'medium', label: 'Trung bình' },
                { value: 'high', label: 'Cao' }
              ]}
              allowDeselect={false}
              searchable
              clearable={false}
              comboboxProps={{ zIndex: 1000 }}
              {...form.getInputProps('priority')}
            />
          </Grid.Col>
        </Grid>

        <TextInput
          label="Môn học / Khóa học"
          placeholder="Ví dụ: Lịch sử Đảng Cộng sản Việt Nam"
          {...form.getInputProps('course')}
        />

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <DateTimePicker
              label="Bắt đầu"
              placeholder="Chọn ngày và thời gian"
              required
              popoverProps={{ zIndex: 1000 }}
              {...form.getInputProps('startTime')}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <DateTimePicker
              label="Kết thúc"
              placeholder="Chọn ngày và thời gian (tùy chọn)"
              popoverProps={{ zIndex: 1000 }}
              {...form.getInputProps('endTime')}
            />
          </Grid.Col>
        </Grid>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label="Trạng thái"
              placeholder="Chọn trạng thái"
              data={[
                { value: 'todo', label: 'Cần làm' },
                { value: 'in-progress', label: 'Đang làm' },
                { value: 'done', label: 'Hoàn thành' }
              ]}
              allowDeselect={false}
              searchable
              clearable={false}
              comboboxProps={{ zIndex: 1000 }}
              {...form.getInputProps('status')}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <NumberInput
              label="Thời gian ước tính (giờ)"
              placeholder="Ví dụ: 2.5"
              min={0}
              max={100}
              step={0.5}
              {...form.getInputProps('estimatedTime')}
            />
          </Grid.Col>
        </Grid>

        {/* AI Realistic Deadline Suggestion */}
        {realisticInfo && (
          <Alert
            icon={<IconClock size={16} />}
            color={realisticInfo.urgencyLevel === 'high' ? 'red' : 
                   realisticInfo.urgencyLevel === 'medium' ? 'yellow' : 'blue'}
            variant="light"
            title="AI Gợi ý Deadline Thực tế"
          >
            <Stack gap="xs">
              <Group gap="xs">
                <Text size="sm" fw={500}>
                  {realisticInfo.realisticDeadline}
                </Text>
                {realisticInfo.isEarlier && (
                  <Badge size="xs" color={realisticInfo.urgencyLevel === 'high' ? 'red' : 'orange'}>
                    {realisticInfo.timeDifference}h sớm hơn deadline chính thức
                  </Badge>
                )}
              </Group>
              <Text size="xs" c="dimmed">
                {realisticInfo.urgencyLevel === 'high' 
                  ? '⚠️ Nên bắt đầu ngay để tránh trễ deadline'
                  : realisticInfo.urgencyLevel === 'medium'
                  ? 'Nên bắt đầu trong vài giờ tới'
                  : 'Còn thời gian, nhưng nên lập kế hoạch sớm'
                }
                <br />
                <span style={{ fontSize: '10px', opacity: 0.7 }}>
                  AI dự đoán dựa trên: ưu tiên {form.values.priority || 'medium'} + loại {form.values.type}
                </span>
              </Text>
            </Stack>
          </Alert>
        )}

        <Textarea
          label="Mô tả chi tiết"
          placeholder="Thêm mô tả về nhiệm vụ..."
          minRows={3}
          maxRows={6}
          autosize
          {...form.getInputProps('description')}
        />

        <TagsInput
          label="Tags"
          placeholder="Nhấn Enter để thêm tag"
          {...form.getInputProps('tags')}
        />

        <Group justify="flex-end" gap="sm">
          <Button variant="light" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit">
            {event ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
