import { useState } from 'react';
import { Stack, Title, Paper, Text, Badge, Group, Button, ActionIcon, Menu, Checkbox } from '@mantine/core';
import { IconPlus, IconFilter } from '@tabler/icons-react';
import type { AcademicEvent } from '../types';
import { TaskCard } from './TaskCard';
import { QuickAddTask } from './QuickAddTask';

interface KanbanColumnProps {
  title: string;
  status: AcademicEvent['status'];
  events: AcademicEvent[];
  onEdit: (event: AcademicEvent) => void;
  onDelete: (eventId: string) => void;
  onStatusChange: (eventId: string, status: AcademicEvent['status']) => void;
  onAddEvent?: () => void;
  onQuickAdd?: (event: AcademicEvent) => void; // New prop for quick add
  color: string;
}

export function KanbanColumn({
  title,
  status,
  events,
  onEdit,
  onDelete,
  onStatusChange,
  onAddEvent,
  onQuickAdd,
  color
}: KanbanColumnProps) {
  const [filterMenuOpened, setFilterMenuOpened] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    urgent: false,
    overdue: false,
    today: false,
    thisWeek: false
  });

  // Apply filters to events
  const filteredEvents = events.filter(event => {
    if (!Object.values(activeFilters).some(Boolean)) {
      return true; // No filters active, show all
    }

    const eventDate = new Date(event.startTime);
    const now = new Date();
    const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Check filters
    if (activeFilters.urgent && daysUntil <= 2 && daysUntil >= 0) return true;
    if (activeFilters.overdue && daysUntil < 0) return true;
    if (activeFilters.today && daysUntil === 0) return true;
    if (activeFilters.thisWeek && daysUntil >= 0 && daysUntil <= 7) return true;
    
    return false;
  });

  const handleFilterChange = (filterKey: keyof typeof activeFilters) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };

  const clearFilters = () => {
    setActiveFilters({
      urgent: false,
      overdue: false,
      today: false,
      thisWeek: false
    });
  };

  const hasActiveFilters = Object.values(activeFilters).some(Boolean);
  const getStatusDescription = () => {
    switch (status) {
      case 'todo':
        return 'Các nhiệm vụ cần thực hiện';
      case 'in-progress':
        return 'Các nhiệm vụ đang thực hiện';
      case 'done':
        return 'Các nhiệm vụ đã hoàn thành';
      default:
        return '';
    }
  };

  const getUrgentCount = () => {
    if (status === 'done') return 0;
    return events.filter(event => {
      const daysUntil = Math.ceil((new Date(event.startTime).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 2 && daysUntil >= 0;
    }).length;
  };

  const urgentCount = getUrgentCount();

  return (
    <Paper withBorder p="md" radius="md" style={{ height: 'fit-content', minHeight: '400px' }}>
      <Stack gap="md">
        {/* Column Header */}
        <Group justify="space-between">
          <Stack gap="xs">
            <Group gap="xs">
              <Title order={4} c={color}>
                {title}
              </Title>
              <Badge color={color} variant="light">
                {events.length}
              </Badge>
              {urgentCount > 0 && (
                <Badge color="red" size="sm">
                  {urgentCount} gấp
                </Badge>
              )}
            </Group>
            <Text size="xs" c="dimmed">
              {getStatusDescription()}
            </Text>
          </Stack>

          <Group gap="xs">
            <Menu
              opened={filterMenuOpened}
              onChange={setFilterMenuOpened}
              position="bottom-end"
              width={200}
              shadow="md"
            >
              <Menu.Target>
                <ActionIcon 
                  variant={hasActiveFilters ? "filled" : "light"} 
                  color={color} 
                  size="sm"
                >
                  <IconFilter size={16} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Lọc sự kiện</Menu.Label>
                
                <Menu.Item>
                  <Checkbox
                    label="Gấp (≤ 2 ngày)"
                    size="sm"
                    checked={activeFilters.urgent}
                    onChange={() => handleFilterChange('urgent')}
                  />
                </Menu.Item>
                
                <Menu.Item>
                  <Checkbox
                    label="Quá hạn"
                    size="sm"
                    checked={activeFilters.overdue}
                    onChange={() => handleFilterChange('overdue')}
                  />
                </Menu.Item>
                
                <Menu.Item>
                  <Checkbox
                    label="Hôm nay"
                    size="sm"
                    checked={activeFilters.today}
                    onChange={() => handleFilterChange('today')}
                  />
                </Menu.Item>
                
                <Menu.Item>
                  <Checkbox
                    label="Tuần này"
                    size="sm"
                    checked={activeFilters.thisWeek}
                    onChange={() => handleFilterChange('thisWeek')}
                  />
                </Menu.Item>

                {hasActiveFilters && (
                  <>
                    <Menu.Divider />
                    <Menu.Item
                      color="red"
                      onClick={clearFilters}
                    >
                      Xóa tất cả bộ lọc
                    </Menu.Item>
                  </>
                )}
              </Menu.Dropdown>
            </Menu>
            {onAddEvent && (
              <Button
                variant="light"
                color={color}
                size="xs"
                leftSection={<IconPlus size={14} />}
                onClick={onAddEvent}
                styles={{
                  root: {
                    fontWeight: 600,
                    fontSize: '12px'
                  }
                }}
              >
                Thêm
              </Button>
            )}
          </Group>
        </Group>

        {/* Events List */}
        <Stack gap="sm">
          {filteredEvents.length > 0 && (
            filteredEvents.map(event => (
              <TaskCard
                key={event.id}
                event={event}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
              />
            ))
          )}
          
          {filteredEvents.length === 0 && hasActiveFilters && (
            <Paper p="xl" style={{ border: '2px dashed #e9ecef', textAlign: 'center' }}>
              <Stack align="center" gap="md">
                <Text size="sm" c="dimmed">
                  Không có sự kiện nào phù hợp với bộ lọc
                </Text>
                <Button 
                  variant="subtle" 
                  color={color} 
                  size="xs"
                  onClick={clearFilters}
                >
                  Xóa bộ lọc
                </Button>
              </Stack>
            </Paper>
          )}
          
          {filteredEvents.length === 0 && !hasActiveFilters && events.length === 0 && (
            <Paper p="xl" style={{ border: '2px dashed #e9ecef', textAlign: 'center' }}>
              <Stack align="center" gap="md">
                <Text size="sm" c="dimmed">
                  {status === 'todo' && 'Chưa có nhiệm vụ nào cần làm'}
                  {status === 'in-progress' && 'Chưa có nhiệm vụ nào đang thực hiện'}
                  {status === 'done' && 'Chưa hoàn thành nhiệm vụ nào'}
                </Text>
                {onAddEvent && (
                  <Button 
                    variant="light" 
                    color={color} 
                    size="md"
                    leftSection={<IconPlus size={18} />}
                    onClick={onAddEvent}
                    styles={{
                      root: {
                        fontWeight: 600,
                        border: `2px solid var(--mantine-color-${color}-2)`,
                        '&:hover': {
                          backgroundColor: `var(--mantine-color-${color}-1)`,
                          border: `2px solid var(--mantine-color-${color}-4)`
                        }
                      }
                    }}
                  >
                    {status === 'todo' && 'Tạo nhiệm vụ đầu tiên'}
                    {status === 'in-progress' && 'Thêm nhiệm vụ mới'}
                    {status === 'done' && 'Thêm nhiệm vụ mới'}
                  </Button>
                )}
              </Stack>
            </Paper>
          )}
          
          {/* Quick Add Task Component */}
          {onQuickAdd && (
            <QuickAddTask
              status={status}
              onAdd={onQuickAdd}
              color={color}
            />
          )}
        </Stack>

        {/* Column Footer Stats */}
        {events.length > 0 && (
          <Paper withBorder p="xs" radius="sm" bg="gray.0">
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                {status === 'todo' && `${events.filter(e => e.priority === 'high').length} ưu tiên cao`}
                {status === 'in-progress' && `${events.reduce((acc, e) => acc + (e.estimatedTime || 0), 0)}h ước tính`}
                {status === 'done' && `${events.reduce((acc, e) => acc + (e.actualTime || e.estimatedTime || 0), 0)}h hoàn thành`}
              </Text>
              
              {status !== 'done' && (
                <Text size="xs" c="dimmed">
                  {events.filter(e => e.type === 'deadline').length} deadline
                </Text>
              )}
            </Group>
          </Paper>
        )}
      </Stack>
    </Paper>
  );
}
