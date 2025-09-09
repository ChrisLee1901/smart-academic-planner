import { useState } from 'react';
import {
  Container,
  Title,
  Card,
  Text,
  Stack,
  Group,
  Badge,
  Button,
  Grid,
  ActionIcon,
  Select,
  Paper,
  Modal
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash, IconClock } from '@tabler/icons-react';
import { useEventStore } from '../store/eventStore';
import { EventForm } from '../components/EventForm';
import type { AcademicEvent } from '../types';
import { formatTime } from '../utils/dateUtils';
import dayjs from 'dayjs';

export function CalendarView() {
  const { events, addEvent, updateEvent, deleteEvent } = useEventStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterType, setFilterType] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AcademicEvent | undefined>();
  const [modalTitle, setModalTitle] = useState('');

  // Get events for selected date
  const selectedDateEvents = events.filter(event => {
    const eventDate = dayjs(event.startTime);
    const selected = dayjs(selectedDate);
    const matchesDate = eventDate.isSame(selected, 'day');
    const matchesType = filterType === 'all' || event.type === filterType;
    return matchesDate && matchesType;
  });

  const openCreateModal = (date?: Date) => {
    const initialEvent = date ? {
      startTime: date,
      title: '',
      type: 'deadline' as const,
      status: 'todo' as const,
      id: ''
    } : undefined;

    setEditingEvent(initialEvent);
    setModalTitle('Tạo sự kiện mới');
    setIsFormOpen(true);
  };

  const openEditModal = (event: AcademicEvent) => {
    setEditingEvent(event);
    setModalTitle('Chỉnh sửa sự kiện');
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (eventData: AcademicEvent) => {
    try {
      if (editingEvent && editingEvent.id) {
        await updateEvent(editingEvent.id, eventData);
        notifications.show({
          title: 'Thành công',
          message: 'Đã cập nhật sự kiện',
          color: 'blue'
        });
      } else {
        await addEvent(eventData);
        notifications.show({
          title: 'Thành công', 
          message: 'Đã tạo sự kiện mới',
          color: 'green'
        });
      }
      setIsFormOpen(false);
      setEditingEvent(undefined);
    } catch (error) {
      notifications.show({
        title: 'Lỗi',
        message: 'Không thể lưu sự kiện. Vui lòng thử lại.',
        color: 'red'
      });
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingEvent(undefined);
  };

  const handleDelete = async (eventId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
      try {
        await deleteEvent(eventId);
        notifications.show({
          title: 'Đã xóa',
          message: 'Sự kiện đã được xóa thành công',
          color: 'red'
        });
      } catch (error) {
        notifications.show({
          title: 'Lỗi',
          message: 'Không thể xóa sự kiện. Vui lòng thử lại.',
          color: 'red'
        });
      }
    }
  };

  const getEventTypeColor = (type: AcademicEvent['type']) => {
    const colors = {
      deadline: 'red',
      class: 'blue', 
      project: 'orange',
      personal: 'green'
    };
    return colors[type];
  };

  const getStatusColor = (status: AcademicEvent['status']) => {
    const colors = {
      todo: 'gray',
      'in-progress': 'yellow',
      done: 'green'
    };
    return colors[status];
  };

  return (
    <div>
      <Container size="xl" py="xl">
        <Stack gap="xl">
          {/* Header */}
          <Group justify="space-between" align="center">
            <div>
              <Title order={1}>Lịch học tập</Title>
              <Text c="dimmed" size="lg">
                Xem sự kiện theo ngày
              </Text>
            </div>
            <Button 
              leftSection={<IconPlus size={16} />}
              onClick={() => openCreateModal(selectedDate)}
              size="md"
            >
              Thêm sự kiện
            </Button>
          </Group>

          <Grid>
            {/* Calendar Controls */}
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Group justify="space-between">
                    <Title order={3}>Lịch</Title>
                    <Select
                      placeholder="Lọc theo loại"
                      data={[
                        { value: 'all', label: 'Tất cả' },
                        { value: 'deadline', label: 'Deadline' },
                        { value: 'class', label: 'Lớp học' },
                        { value: 'project', label: 'Dự án' },
                        { value: 'personal', label: 'Cá nhân' }
                      ]}
                      value={filterType}
                      onChange={(value) => setFilterType(value || 'all')}
                      style={{ width: 200 }}
                    />
                  </Group>

                  <div style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: '8px', padding: '16px' }}>
                    <Text size="lg" fw={500} mb="md">Chọn ngày: {dayjs(selectedDate).format('DD/MM/YYYY')}</Text>
                    <Group gap="sm" mb="md">
                      <Button 
                        size="sm" 
                        variant="light" 
                        onClick={() => setSelectedDate(new Date())}
                      >
                        Hôm nay
                      </Button>
                      <Button 
                        size="sm" 
                        variant="light" 
                        onClick={() => setSelectedDate(dayjs().add(1, 'day').toDate())}
                      >
                        Ngày mai
                      </Button>
                      <Button 
                        size="sm" 
                        variant="light" 
                        onClick={() => setSelectedDate(dayjs().add(7, 'day').toDate())}
                      >
                        Tuần sau
                      </Button>
                    </Group>
                    <input
                      type="date"
                      value={dayjs(selectedDate).format('YYYY-MM-DD')}
                      onChange={(e) => setSelectedDate(new Date(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid var(--mantine-color-gray-4)',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* Legend */}
                  <Paper p="sm" withBorder>
                    <Text size="sm" fw={500} mb="xs">Chú thích:</Text>
                    <Group gap="md">
                      <Group gap="xs">
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--mantine-color-red-6)'
                          }}
                        />
                        <Text size="sm">Deadline</Text>
                      </Group>
                      <Group gap="xs">
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--mantine-color-blue-6)'
                          }}
                        />
                        <Text size="sm">Lớp học</Text>
                      </Group>
                      <Group gap="xs">
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--mantine-color-orange-6)'
                          }}
                        />
                        <Text size="sm">Dự án</Text>
                      </Group>
                      <Group gap="xs">
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--mantine-color-green-6)'
                          }}
                        />
                        <Text size="sm">Cá nhân</Text>
                      </Group>
                    </Group>
                  </Paper>
                </Stack>
              </Card>
            </Grid.Col>

            {/* Selected Date Events */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Group justify="space-between">
                    <div>
                      <Title order={3}>
                        {dayjs(selectedDate).format('DD/MM/YYYY')}
                      </Title>
                      <Text size="sm" c="dimmed">
                        {dayjs(selectedDate).format('dddd')}
                      </Text>
                    </div>
                    <Badge color="blue" variant="light">
                      {selectedDateEvents.length} sự kiện
                    </Badge>
                  </Group>

                  {selectedDateEvents.length === 0 ? (
                    <Text c="dimmed" ta="center" py="xl">
                      Không có sự kiện nào
                    </Text>
                  ) : (
                    <Stack gap="sm">
                      {selectedDateEvents.map((event) => (
                        <Card key={event.id} padding="sm" withBorder>
                          <Stack gap="xs">
                            <Group justify="space-between" align="flex-start">
                              <div style={{ flex: 1 }}>
                                <Text fw={500} size="sm" lineClamp={2}>
                                  {event.title}
                                </Text>
                                {event.course && (
                                  <Text size="xs" c="dimmed">
                                    {event.course}
                                  </Text>
                                )}
                              </div>
                              <Group gap="xs">
                                <ActionIcon
                                  size="sm"
                                  variant="subtle"
                                  color="blue"
                                  onClick={() => openEditModal(event)}
                                >
                                  <IconEdit size={12} />
                                </ActionIcon>
                                <ActionIcon
                                  size="sm"
                                  variant="subtle"
                                  color="red"
                                  onClick={() => handleDelete(event.id)}
                                >
                                  <IconTrash size={12} />
                                </ActionIcon>
                              </Group>
                            </Group>

                            <Group justify="space-between">
                              <Group gap="xs">
                                <IconClock size={12} />
                                <Text size="xs" c="dimmed">
                                  {formatTime(event.startTime)}
                                  {event.endTime && ` - ${formatTime(event.endTime)}`}
                                </Text>
                              </Group>
                            </Group>

                            <Group gap="xs">
                              <Badge 
                                size="xs" 
                                color={getEventTypeColor(event.type)} 
                                variant="light"
                              >
                                {event.type}
                              </Badge>
                              <Badge 
                                size="xs" 
                                color={getStatusColor(event.status)} 
                                variant="outline"
                              >
                                {event.status}
                              </Badge>
                            </Group>
                          </Stack>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>

      {/* Event Form Modal */}
      <Modal
        opened={isFormOpen}
        onClose={handleCancel}
        title={modalTitle}
        size="lg"
        centered={false}
        padding="lg"
        styles={{
          content: {
            marginLeft: '0px',
            marginRight: 'auto',
            transform: 'translateX(-1000px)',
            maxWidth: '500px'
          },
          inner: {
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingLeft: '5px',
            paddingRight: '50px'
          }
        }}
      >
        <EventForm
          event={editingEvent}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      </Modal>
    </div>
  );
}
