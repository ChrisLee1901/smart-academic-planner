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
  Grid
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import type { AcademicEvent, EventFormData } from '../types';
import { generateId } from '../utils/dateUtils';

interface EventFormProps {
  event?: AcademicEvent;
  onSubmit: (event: AcademicEvent) => void;
  onCancel: () => void;
}

export function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const form = useForm<EventFormData>({
    initialValues: {
      title: event?.title || '',
      type: event?.type || 'deadline',
      course: event?.course || '',
      startTime: event?.startTime || new Date(),
      endTime: event?.endTime || undefined,
      status: event?.status || 'todo',
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
              data={[
                { value: 'deadline', label: 'Deadline' },
                { value: 'class', label: 'Lớp học' },
                { value: 'project', label: 'Dự án' },
                { value: 'personal', label: 'Cá nhân' }
              ]}
              {...form.getInputProps('type')}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label="Ưu tiên"
              data={[
                { value: 'low', label: 'Thấp' },
                { value: 'medium', label: 'Trung bình' },
                { value: 'high', label: 'Cao' }
              ]}
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
              {...form.getInputProps('startTime')}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <DateTimePicker
              label="Kết thúc"
              placeholder="Chọn ngày và thời gian (tùy chọn)"
              {...form.getInputProps('endTime')}
            />
          </Grid.Col>
        </Grid>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label="Trạng thái"
              data={[
                { value: 'todo', label: 'Chưa làm' },
                { value: 'in-progress', label: 'Đang làm' },
                { value: 'done', label: 'Hoàn thành' }
              ]}
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
