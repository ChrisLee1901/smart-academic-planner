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
  Modal,
  SegmentedControl,
  Box,
  Flex
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash, IconClock, IconChevronLeft, IconChevronRight, IconCalendarEvent } from '@tabler/icons-react';
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
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Navigation functions
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
    setSelectedDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
    setSelectedDate(newDate);
  };

  const getDateRangeText = () => {
    if (viewMode === 'month') {
      return dayjs(currentDate).format('MMMM YYYY');
    } else if (viewMode === 'week') {
      const startOfWeek = dayjs(currentDate).startOf('week');
      const endOfWeek = dayjs(currentDate).endOf('week');
      return `${startOfWeek.format('DD MMM')} - ${endOfWeek.format('DD MMM YYYY')}`;
    } else {
      return dayjs(currentDate).format('DD MMMM YYYY');
    }
  };

  // Get events for selected date/period based on view mode
  const selectedDateEvents = events.filter(event => {
    const eventDate = dayjs(event.startTime);
    const selected = dayjs(selectedDate);
    
    let matchesDate = false;
    if (viewMode === 'day') {
      matchesDate = eventDate.isSame(selected, 'day');
    } else if (viewMode === 'week') {
      const startOfWeek = selected.startOf('week');
      const endOfWeek = selected.endOf('week');
      matchesDate = eventDate.isAfter(startOfWeek.subtract(1, 'day')) && eventDate.isBefore(endOfWeek.add(1, 'day'));
    } else if (viewMode === 'month') {
      matchesDate = eventDate.isSame(selected, 'month');
    }
    
    const matchesType = filterType === 'all' || event.type === filterType;
    return matchesDate && matchesType;
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

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
      <Container size="xl" py="md">
        <Stack gap="lg">
          {/* Google Calendar Style Header */}
          <Paper p="md" withBorder radius="md">
            <Flex justify="space-between" align="center" wrap="wrap" gap="md">
              {/* Left side - Logo and navigation */}
              <Group gap="lg">
                <Group gap="xs">
                  <IconCalendarEvent size={24} color="var(--mantine-color-blue-6)" />
                  <Title order={2} c="blue">Lịch học tập</Title>
                </Group>
                
                {/* Navigation controls */}
                <Group gap="xs">
                  <Button 
                    variant="subtle" 
                    size="sm"
                    onClick={goToToday}
                  >
                    Hôm nay
                  </Button>
                  
                  <ActionIcon 
                    variant="subtle" 
                    size="lg"
                    onClick={navigatePrevious}
                  >
                    <IconChevronLeft size={18} />
                  </ActionIcon>
                  
                  <ActionIcon 
                    variant="subtle" 
                    size="lg"
                    onClick={navigateNext}
                  >
                    <IconChevronRight size={18} />
                  </ActionIcon>
                  
                  <Text size="lg" fw={500} style={{ minWidth: '200px' }}>
                    {getDateRangeText()}
                  </Text>
                </Group>
              </Group>

              {/* Right side - View selector and add button */}
              <Group gap="md">
                <SegmentedControl
                  value={viewMode}
                  onChange={(value) => setViewMode(value as 'month' | 'week' | 'day')}
                  data={[
                    { label: 'Tháng', value: 'month' },
                    { label: 'Tuần', value: 'week' },
                    { label: 'Ngày', value: 'day' }
                  ]}
                  size="sm"
                />
                
                <Button 
                  leftSection={<IconPlus size={16} />}
                  onClick={() => openCreateModal(selectedDate)}
                  variant="filled"
                >
                  Tạo
                </Button>
              </Group>
            </Flex>
          </Paper>

          {/* Main Layout with Sidebar */}
          <Grid>
            {/* Left Sidebar - Mini Calendar & Filters */}
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Stack gap="md">
                {/* Mini Calendar Navigation */}
                <Card shadow="sm" padding="md" radius="md" withBorder>
                  <Stack gap="sm">
                    <Text fw={500} size="sm">Mini Lịch</Text>
                    
                    {/* Simple date picker replacement for mini calendar */}
                    <Box>
                      <input
                        type="date"
                        value={dayjs(selectedDate).format('YYYY-MM-DD')}
                        onChange={(e) => {
                          const newDate = new Date(e.target.value);
                          setSelectedDate(newDate);
                          setCurrentDate(newDate);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid var(--mantine-color-gray-4)',
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: 'var(--mantine-color-gray-0)'
                        }}
                      />
                    </Box>
                    
                    {/* Quick date buttons */}
                    <Stack gap="xs">
                      <Button 
                        size="xs" 
                        variant="light" 
                        fullWidth
                        onClick={() => {
                          const today = new Date();
                          setSelectedDate(today);
                          setCurrentDate(today);
                        }}
                      >
                        Hôm nay
                      </Button>
                      <Button 
                        size="xs" 
                        variant="light" 
                        fullWidth
                        onClick={() => {
                          const tomorrow = dayjs().add(1, 'day').toDate();
                          setSelectedDate(tomorrow);
                          setCurrentDate(tomorrow);
                        }}
                      >
                        Ngày mai
                      </Button>
                      <Button 
                        size="xs" 
                        variant="light" 
                        fullWidth
                        onClick={() => {
                          const nextWeek = dayjs().add(7, 'day').toDate();
                          setSelectedDate(nextWeek);
                          setCurrentDate(nextWeek);
                        }}
                      >
                        Tuần sau
                      </Button>
                    </Stack>
                  </Stack>
                </Card>

                {/* Event Type Filter */}
                <Card shadow="sm" padding="md" radius="md" withBorder>
                  <Stack gap="sm">
                    <Text fw={500} size="sm">Lọc sự kiện</Text>
                    <Select
                      placeholder="Chọn loại sự kiện"
                      data={[
                        { value: 'all', label: 'Tất cả' },
                        { value: 'deadline', label: 'Deadline' },
                        { value: 'class', label: 'Lớp học' },
                        { value: 'project', label: 'Dự án' },
                        { value: 'personal', label: 'Cá nhân' }
                      ]}
                      value={filterType}
                      onChange={(value) => setFilterType(value || 'all')}
                    />
                  </Stack>
                </Card>

                {/* Legend */}
                <Card shadow="sm" padding="md" radius="md" withBorder>
                  <Stack gap="sm">
                    <Text fw={500} size="sm">Chú thích</Text>
                    <Stack gap="xs">
                      <Group gap="xs">
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--mantine-color-red-6)'
                          }}
                        />
                        <Text size="xs">Deadline</Text>
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
                        <Text size="xs">Lớp học</Text>
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
                        <Text size="xs">Dự án</Text>
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
                        <Text size="xs">Cá nhân</Text>
                      </Group>
                    </Stack>
                  </Stack>
                </Card>
              </Stack>
            </Grid.Col>

            {/* Main Content Area */}
            <Grid.Col span={{ base: 12, md: 9 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder style={{ minHeight: '600px' }}>
                <Stack gap="md">
                  {/* Current View Header */}
                  <Group justify="space-between" align="center">
                    <div>
                      <Title order={3}>
                        {viewMode === 'day' ? dayjs(selectedDate).format('dddd, DD MMMM YYYY') :
                         viewMode === 'week' ? `Tuần của ${dayjs(selectedDate).format('DD/MM/YYYY')}` :
                         'Lịch tháng'}
                      </Title>
                      <Text size="sm" c="dimmed">
                        {selectedDateEvents.length} sự kiện
                      </Text>
                    </div>
                    <Badge color="blue" variant="light" size="lg">
                      {viewMode === 'month' ? 'Xem tháng' : 
                       viewMode === 'week' ? 'Xem tuần' : 'Xem ngày'}
                    </Badge>
                  </Group>

                  {/* Events Display */}
                  {selectedDateEvents.length === 0 ? (
                    <Paper 
                      p="xl" 
                      style={{ 
                        border: '2px dashed var(--mantine-color-gray-3)', 
                        textAlign: 'center',
                        backgroundColor: 'var(--mantine-color-gray-0)'
                      }}
                    >
                      <Stack align="center" gap="md">
                        <IconCalendarEvent size={48} color="var(--mantine-color-gray-4)" />
                        <Text c="dimmed" size="lg">
                          Không có sự kiện nào trong {dayjs(selectedDate).format('DD/MM/YYYY')}
                        </Text>
                        <Button 
                          leftSection={<IconPlus size={16} />}
                          onClick={() => openCreateModal(selectedDate)}
                          variant="light"
                        >
                          Tạo sự kiện đầu tiên
                        </Button>
                      </Stack>
                    </Paper>
                  ) : (
                    <Stack gap="sm">
                      {selectedDateEvents.map((event) => (
                        <Card key={event.id} padding="md" withBorder radius="md" 
                              style={{ 
                                borderLeft: `4px solid var(--mantine-color-${getEventTypeColor(event.type)}-6)`,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  boxShadow: 'var(--mantine-shadow-md)'
                                }
                              }}>
                          <Group justify="space-between" align="flex-start">
                            <div style={{ flex: 1 }}>
                              <Group gap="sm" mb="xs">
                                <Text fw={600} size="md">
                                  {event.title}
                                </Text>
                                <Badge 
                                  size="sm" 
                                  color={getEventTypeColor(event.type)} 
                                  variant="light"
                                >
                                  {event.type}
                                </Badge>
                                <Badge 
                                  size="sm" 
                                  color={getStatusColor(event.status)} 
                                  variant="outline"
                                >
                                  {event.status}
                                </Badge>
                              </Group>
                              
                              {event.course && (
                                <Text size="sm" c="dimmed" mb="xs">
                                  📚 {event.course}
                                </Text>
                              )}
                              
                              <Group gap="sm">
                                <Group gap="xs">
                                  <IconClock size={14} />
                                  <Text size="sm" c="dimmed">
                                    {viewMode !== 'day' && `${dayjs(event.startTime).format('DD/MM')} - `}
                                    {formatTime(event.startTime)}
                                    {event.endTime && ` - ${formatTime(event.endTime)}`}
                                  </Text>
                                </Group>
                                
                                {event.priority === 'high' && (
                                  <Badge size="xs" color="red">🔥 Ưu tiên cao</Badge>
                                )}
                              </Group>
                              
                              {event.description && (
                                <Text size="sm" mt="xs" lineClamp={2}>
                                  {event.description}
                                </Text>
                              )}
                            </div>
                            
                            <Group gap="xs">
                              <ActionIcon
                                variant="subtle"
                                color="blue"
                                onClick={() => openEditModal(event)}
                              >
                                <IconEdit size={16} />
                              </ActionIcon>
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                onClick={() => handleDelete(event.id)}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Group>
                          </Group>
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
        centered={true}
        padding="lg"
        zIndex={120}
        styles={{
          header: { paddingBottom: '1rem' },
          body: { padding: 0 },
          content: {
            position: 'relative',
          },
          inner: {
            paddingLeft: '1rem',
            paddingRight: '1rem',
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
