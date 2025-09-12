import { Paper, Text, Stack, Group, Box, ScrollArea } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { AcademicEvent } from '../../types';
import { formatTime } from '../../utils/dateUtils';

interface WeekViewProps {
  selectedDate: Date;
  events: AcademicEvent[];
  onEventClick: (event: AcademicEvent) => void;
  onTimeSlotClick: (date: Date, hour: number) => void;
}

export function WeekView({ selectedDate, events, onEventClick, onTimeSlotClick }: WeekViewProps) {
  const startOfWeek = dayjs(selectedDate).startOf('week');
  const weekDays = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForDateTime = (date: dayjs.Dayjs, hour: number) => {
    return events.filter(event => {
      const eventDate = dayjs(event.startTime);
      return eventDate.isSame(date, 'day') && eventDate.hour() === hour;
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

  const isToday = (date: dayjs.Dayjs) => date.isSame(dayjs(), 'day');

  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="md">
        {/* Week header with days */}
        <Group justify="space-between" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)', paddingBottom: '12px' }}>
          <Box style={{ width: '60px' }}></Box> {/* Spacer for time column */}
          {weekDays.map((day) => (
            <Box key={day.format('YYYY-MM-DD')} style={{ flex: 1, textAlign: 'center' }}>
              <Stack gap="xs">
                <Text size="sm" fw={500} c="dimmed">
                  {day.format('dddd')}
                </Text>
                <Text 
                  size="lg" 
                  fw={isToday(day) ? 700 : 500}
                  c={isToday(day) ? 'blue' : 'dark'}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isToday(day) ? 'var(--mantine-color-blue-1)' : 'transparent',
                    margin: '0 auto'
                  }}
                >
                  {day.format('D')}
                </Text>
              </Stack>
            </Box>
          ))}
        </Group>

        {/* Timeline */}
        <ScrollArea style={{ height: '600px' }}>
          <Stack gap="0">
            {hours.map((hour) => (
              <Group key={hour} gap="0" style={{ minHeight: '60px' }}>
                {/* Time column */}
                <Box style={{ width: '60px', padding: '8px', borderRight: '1px solid var(--mantine-color-gray-2)' }}>
                  <Text size="xs" c="dimmed" ta="right">
                    {hour.toString().padStart(2, '0')}:00
                  </Text>
                </Box>

                {/* Day columns */}
                {weekDays.map((day) => {
                  const timeSlotEvents = getEventsForDateTime(day, hour);
                  
                  return (
                    <Box 
                      key={`${day.format('YYYY-MM-DD')}-${hour}`}
                      style={{ 
                        flex: 1, 
                        minHeight: '60px',
                        borderRight: '1px solid var(--mantine-color-gray-1)',
                        borderBottom: '1px solid var(--mantine-color-gray-1)',
                        padding: '4px',
                        cursor: 'pointer',
                        backgroundColor: isToday(day) ? 'var(--mantine-color-blue-0)' : 'transparent',
                        transition: 'background-color 0.2s ease'
                      }}
                      onClick={() => onTimeSlotClick(day.toDate(), hour)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isToday(day) 
                          ? 'var(--mantine-color-blue-1)' 
                          : 'var(--mantine-color-gray-0)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isToday(day) 
                          ? 'var(--mantine-color-blue-0)' 
                          : 'transparent';
                      }}
                    >
                      <Stack gap="2px">
                        {timeSlotEvents.map((event) => (
                          <Box
                            key={event.id}
                            style={{
                              backgroundColor: `var(--mantine-color-${getEventTypeColor(event.type)}-1)`,
                              borderLeft: `4px solid var(--mantine-color-${getEventTypeColor(event.type)}-6)`,
                              padding: '6px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              border: `1px solid var(--mantine-color-${getEventTypeColor(event.type)}-3)`
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event);
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = `var(--mantine-color-${getEventTypeColor(event.type)}-2)`;
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = 'var(--mantine-shadow-sm)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = `var(--mantine-color-${getEventTypeColor(event.type)}-1)`;
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <Stack gap="2px">
                              <Text size="xs" fw={600} lineClamp={1}>
                                {event.title}
                              </Text>
                              <Group gap="4px">
                                <IconClock size={10} />
                                <Text size="xs" c="dimmed">
                                  {formatTime(event.startTime)}
                                  {event.endTime && ` - ${formatTime(event.endTime)}`}
                                </Text>
                              </Group>
                              {event.course && (
                                <Text size="xs" c="dimmed" lineClamp={1}>
                                  {event.course}
                                </Text>
                              )}
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  );
                })}
              </Group>
            ))}
          </Stack>
        </ScrollArea>
      </Stack>
    </Paper>
  );
}
