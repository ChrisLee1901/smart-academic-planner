import { Paper, Text, Stack, Group, Box, ScrollArea, Badge } from '@mantine/core';
import { IconClock, IconFlag } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { AcademicEvent } from '../../types';
import { formatTime } from '../../utils/dateUtils';

interface DayViewProps {
  selectedDate: Date;
  events: AcademicEvent[];
  onEventClick: (event: AcademicEvent) => void;
  onTimeSlotClick: (date: Date, hour: number) => void;
}

export function DayView({ selectedDate, events, onEventClick, onTimeSlotClick }: DayViewProps) {
  const selectedDay = dayjs(selectedDate);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Filter events for the selected day
  const dayEvents = events.filter(event => 
    dayjs(event.startTime).isSame(selectedDay, 'day')
  );

  const getEventsForHour = (hour: number) => {
    return dayEvents.filter(event => {
      const eventHour = dayjs(event.startTime).hour();
      return eventHour === hour;
    });
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

  const isToday = selectedDay.isSame(dayjs(), 'day');
  const currentHour = dayjs().hour();

  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="md">
        {/* Day header */}
        <Group justify="space-between" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)', paddingBottom: '16px' }}>
          <Stack gap="xs">
            <Text size="xl" fw={700} c={isToday ? 'blue' : 'dark'}>
              {selectedDay.format('dddd, DD MMMM YYYY')}
            </Text>
            <Group gap="sm">
              <Badge color="blue" variant="light">
                {dayEvents.length} sự kiện
              </Badge>
              {isToday && (
                <Badge color="green" variant="light">
                  Hôm nay
                </Badge>
              )}
            </Group>
          </Stack>
          
          {/* Today's weather or summary could go here */}
          <Box>
            <Text size="sm" c="dimmed">
              {selectedDay.format('HH:mm')} - Hiện tại
            </Text>
          </Box>
        </Group>

        {/* Timeline */}
        <ScrollArea style={{ height: '700px' }}>
          <Stack gap="0">
            {hours.map((hour) => {
              const hourEvents = getEventsForHour(hour);
              const isCurrentHour = isToday && hour === currentHour;
              
              return (
                <Group key={hour} gap="0" style={{ minHeight: '80px' }}>
                  {/* Time column */}
                  <Box 
                    style={{ 
                      width: '80px', 
                      padding: '12px', 
                      borderRight: '2px solid var(--mantine-color-gray-2)',
                      backgroundColor: isCurrentHour ? 'var(--mantine-color-blue-0)' : 'transparent'
                    }}
                  >
                    <Text 
                      size="sm" 
                      fw={isCurrentHour ? 600 : 400}
                      c={isCurrentHour ? 'blue' : 'dimmed'} 
                      ta="right"
                    >
                      {hour.toString().padStart(2, '0')}:00
                    </Text>
                    {isCurrentHour && (
                      <Text size="xs" c="blue" ta="right">
                        Hiện tại
                      </Text>
                    )}
                  </Box>

                  {/* Event column */}
                  <Box 
                    style={{ 
                      flex: 1, 
                      minHeight: '80px',
                      borderBottom: '1px solid var(--mantine-color-gray-1)',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      backgroundColor: isCurrentHour ? 'var(--mantine-color-blue-0)' : 'transparent',
                      transition: 'background-color 0.2s ease',
                      position: 'relative'
                    }}
                    onClick={() => onTimeSlotClick(selectedDay.toDate(), hour)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isCurrentHour 
                        ? 'var(--mantine-color-blue-1)' 
                        : 'var(--mantine-color-gray-0)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isCurrentHour 
                        ? 'var(--mantine-color-blue-0)' 
                        : 'transparent';
                    }}
                  >
                    {/* Current time indicator */}
                    {isCurrentHour && (
                      <Box
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          width: '100%',
                          height: '2px',
                          backgroundColor: 'var(--mantine-color-red-6)',
                          zIndex: 10
                        }}
                      >
                        <Box
                          style={{
                            position: 'absolute',
                            left: '-6px',
                            top: '-4px',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--mantine-color-red-6)'
                          }}
                        />
                      </Box>
                    )}

                    <Stack gap="md">
                      {hourEvents.length === 0 ? (
                        <Text size="sm" c="dimmed" ta="center" style={{ padding: '20px 0' }}>
                          Không có sự kiện nào
                        </Text>
                      ) : (
                        hourEvents.map((event) => (
                          <Paper
                            key={event.id}
                            withBorder
                            p="md"
                            radius="md"
                            style={{
                              borderLeft: `6px solid var(--mantine-color-${getEventTypeColor(event.type)}-6)`,
                              backgroundColor: `var(--mantine-color-${getEventTypeColor(event.type)}-0)`,
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              boxShadow: 'var(--mantine-shadow-xs)'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event);
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = 'var(--mantine-shadow-md)';
                              e.currentTarget.style.backgroundColor = `var(--mantine-color-${getEventTypeColor(event.type)}-1)`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'var(--mantine-shadow-xs)';
                              e.currentTarget.style.backgroundColor = `var(--mantine-color-${getEventTypeColor(event.type)}-0)`;
                            }}
                          >
                            <Stack gap="sm">
                              <Group justify="space-between" align="flex-start">
                                <Stack gap="xs" style={{ flex: 1 }}>
                                  <Text size="md" fw={600} c="dark">
                                    {event.title}
                                  </Text>
                                  
                                  <Group gap="sm">
                                    <Group gap="xs">
                                      <IconClock size={14} />
                                      <Text size="sm" c="dimmed">
                                        {formatTime(event.startTime)}
                                        {event.endTime && ` - ${formatTime(event.endTime)}`}
                                      </Text>
                                    </Group>
                                    
                                    {event.priority === 'high' && (
                                      <Group gap="xs">
                                        <IconFlag size={14} color="var(--mantine-color-red-6)" />
                                        <Text size="sm" c="red" fw={500}>
                                          Ưu tiên cao
                                        </Text>
                                      </Group>
                                    )}
                                  </Group>
                                </Stack>
                                
                                <Group gap="xs">
                                  <Badge 
                                    color={getEventTypeColor(event.type)} 
                                    variant="light"
                                    size="sm"
                                  >
                                    {event.type}
                                  </Badge>
                                  <Badge 
                                    color={getStatusColor(event.status)} 
                                    variant="outline"
                                    size="sm"
                                  >
                                    {event.status}
                                  </Badge>
                                </Group>
                              </Group>
                              
                              {event.course && (
                                <Group gap="xs">
                                  <Text size="sm" c="dimmed">
                                    Môn học:
                                  </Text>
                                  <Text size="sm" fw={500}>
                                    {event.course}
                                  </Text>
                                </Group>
                              )}
                              
                              {event.description && (
                                <Text size="sm" c="dimmed" lineClamp={3}>
                                  {event.description}
                                </Text>
                              )}
                              
                              {event.estimatedTime && (
                                <Group gap="xs">
                                  <Text size="xs" c="dimmed">
                                    ⏱️ Thời gian ước tính: {event.estimatedTime}h
                                  </Text>
                                </Group>
                              )}
                            </Stack>
                          </Paper>
                        ))
                      )}
                    </Stack>
                  </Box>
                </Group>
              );
            })}
          </Stack>
        </ScrollArea>
      </Stack>
    </Paper>
  );
}
