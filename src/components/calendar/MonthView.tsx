import { Paper, Text, Grid, Box, Stack, Group } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import dayjs from '../../utils/dayjs';
import type { AcademicEvent } from '../../types';
import { formatTime } from '../../utils/dateUtils';

interface MonthViewProps {
  selectedDate: Date;
  events: AcademicEvent[];
  onEventClick: (event: AcademicEvent) => void;
  onDateClick: (date: Date) => void;
}

export function MonthView({ selectedDate, events, onEventClick, onDateClick }: MonthViewProps) {
  const startOfMonth = dayjs(selectedDate).startOf('month');
  const endOfMonth = dayjs(selectedDate).endOf('month');
  const startOfWeek = startOfMonth.startOf('week');
  const endOfWeek = endOfMonth.endOf('week');

  const days = [];
  let day = startOfWeek;

  while (day.isBefore(endOfWeek) || day.isSame(endOfWeek, 'day')) {
    days.push(day);
    day = day.add(1, 'day');
  }

  const getEventsForDate = (date: dayjs.Dayjs) => {
    return events.filter(event => 
      dayjs(event.startTime).isSame(date, 'day')
    ).slice(0, 3); // Limit to 3 events per day for display
  };

  const getMoreEventsCount = (date: dayjs.Dayjs) => {
    const totalEvents = events.filter(event => 
      dayjs(event.startTime).isSame(date, 'day')
    ).length;
    return Math.max(0, totalEvents - 3);
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
  const isCurrentMonth = (date: dayjs.Dayjs) => date.isSame(startOfMonth, 'month');

  // Create 6 weeks x 7 days grid
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="xs">
        {/* Header with day names */}
        <Grid>
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((dayName) => (
            <Grid.Col span={12/7} key={dayName}>
              <Text ta="center" fw={600} size="sm" c="dimmed">
                {dayName}
              </Text>
            </Grid.Col>
          ))}
        </Grid>

        {/* Calendar grid */}
        <Stack gap="xs">
          {weeks.map((week, weekIndex) => (
            <Grid key={weekIndex} gutter="xs">
              {week.map((day) => {
                const dayEvents = getEventsForDate(day);
                const moreCount = getMoreEventsCount(day);
                
                return (
                  <Grid.Col span={12/7} key={day.format('YYYY-MM-DD')}>
                    <Paper
                      withBorder={isToday(day)}
                      style={{
                        minHeight: '120px',
                        padding: '8px',
                        cursor: 'pointer',
                        backgroundColor: isToday(day) 
                          ? 'var(--mantine-color-blue-0)' 
                          : isCurrentMonth(day) 
                            ? 'white' 
                            : 'var(--mantine-color-gray-0)',
                        borderColor: isToday(day) ? 'var(--mantine-color-blue-6)' : undefined,
                        borderWidth: isToday(day) ? 2 : 1,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: isToday(day) 
                            ? 'var(--mantine-color-blue-1)' 
                            : 'var(--mantine-color-gray-0)',
                          transform: 'translateY(-1px)',
                          boxShadow: 'var(--mantine-shadow-sm)'
                        }
                      }}
                      onClick={() => onDateClick(day.toDate())}
                    >
                      <Stack gap="xs" style={{ height: '100%' }}>
                        {/* Date number */}
                        <Text
                          ta="center"
                          fw={isToday(day) ? 700 : 500}
                          size="sm"
                          c={isCurrentMonth(day) 
                            ? isToday(day) ? 'blue' : 'dark' 
                            : 'dimmed'}
                        >
                          {day.format('D')}
                        </Text>

                        {/* Events */}
                        <Stack gap="2px" style={{ flex: 1 }}>
                          {dayEvents.map((event) => (
                            <Box
                              key={event.id}
                              style={{
                                backgroundColor: `var(--mantine-color-${getEventTypeColor(event.type)}-1)`,
                                borderLeft: `3px solid var(--mantine-color-${getEventTypeColor(event.type)}-6)`,
                                padding: '2px 4px',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontSize: '10px',
                                lineHeight: 1.2,
                                transition: 'all 0.2s ease'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEventClick(event);
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = `var(--mantine-color-${getEventTypeColor(event.type)}-2)`;
                                e.currentTarget.style.transform = 'translateX(2px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = `var(--mantine-color-${getEventTypeColor(event.type)}-1)`;
                                e.currentTarget.style.transform = 'translateX(0)';
                              }}
                            >
                              <Text 
                                size="xs" 
                                lineClamp={1}
                                fw={500}
                                style={{ fontSize: '10px' }}
                              >
                                <Group gap="2px">
                                  <IconClock size={8} />
                                  {formatTime(event.startTime)} {event.title}
                                </Group>
                              </Text>
                            </Box>
                          ))}
                          
                          {moreCount > 0 && (
                            <Text
                              size="xs"
                              c="dimmed"
                              ta="center"
                              style={{
                                padding: '2px',
                                fontSize: '9px',
                                cursor: 'pointer'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onDateClick(day.toDate());
                              }}
                            >
                              +{moreCount} more
                            </Text>
                          )}
                        </Stack>
                      </Stack>
                    </Paper>
                  </Grid.Col>
                );
              })}
            </Grid>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
