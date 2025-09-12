import { Paper, Group, Title, Text, Stack, Badge, Button, SimpleGrid, ThemeIcon } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconCheck } from '@tabler/icons-react';
import { useEventStore } from '../store/eventStore';

export function CRUDOperationsDemo() {
  const { events, addEvent, updateEvent, deleteEvent } = useEventStore();

  const createSampleTask = async () => {
    const sampleTask = {
      id: Date.now().toString(),
      title: `Demo Task ${new Date().toLocaleTimeString()}`,
      type: 'project' as const,
      course: 'Demo Course',
      startTime: new Date(),
      status: 'todo' as const,
      priority: 'medium' as const,
      description: 'This is a demo task created to showcase CRUD functionality',
      tags: ['demo', 'crud']
    };
    
    await addEvent(sampleTask);
  };

  const updateFirstTask = async () => {
    const firstTask = events.find(e => e.status === 'todo');
    if (firstTask) {
      await updateEvent(firstTask.id, {
        ...firstTask,
        status: 'in-progress',
        title: `${firstTask.title} (UPDATED)`
      });
    }
  };

  const deleteLastTask = async () => {
    const lastTask = events[events.length - 1];
    if (lastTask) {
      await deleteEvent(lastTask.id);
    }
  };

  const markFirstAsComplete = async () => {
    const firstInProgress = events.find(e => e.status === 'in-progress');
    if (firstInProgress) {
      await updateEvent(firstInProgress.id, {
        ...firstInProgress,
        status: 'done'
      });
    }
  };

  return (
    <Paper withBorder p="lg" radius="md" bg="violet.0">
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="sm">
            <ThemeIcon variant="light" color="violet" size="lg">
              <IconCheck size={20} />
            </ThemeIcon>
            <div>
              <Title order={4} c="violet.7">
                CRUD Operations Demo
              </Title>
              <Text size="sm" c="dimmed">
                Chứng minh đầy đủ chức năng Create, Read, Update, Delete
              </Text>
            </div>
          </Group>
          
          <Badge color="violet" variant="light" size="lg">
            Full CRUD
          </Badge>
        </Group>

        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
          <Button
            leftSection={<IconPlus size={16} />}
            color="green"
            variant="light"
            size="sm"
            onClick={createSampleTask}
          >
            CREATE
          </Button>

          <Button
            leftSection={<IconEdit size={16} />}
            color="blue"
            variant="light"
            size="sm"
            onClick={updateFirstTask}
            disabled={!events.find(e => e.status === 'todo')}
          >
            UPDATE
          </Button>

          <Button
            leftSection={<IconTrash size={16} />}
            color="red"
            variant="light"
            size="sm"
            onClick={deleteLastTask}
            disabled={events.length === 0}
          >
            DELETE
          </Button>

          <Button
            leftSection={<IconCheck size={16} />}
            color="violet"
            variant="light"
            size="sm"
            onClick={markFirstAsComplete}
            disabled={!events.find(e => e.status === 'in-progress')}
          >
            COMPLETE
          </Button>
        </SimpleGrid>

        <Paper p="sm" radius="sm" bg="white">
          <Group justify="space-between">
            <Text size="sm" fw={500}>Thống kê hiện tại:</Text>
            <Group gap="md">
              <Text size="xs">
                Tổng: <strong>{events.length}</strong>
              </Text>
              <Text size="xs">
                Todo: <strong>{events.filter(e => e.status === 'todo').length}</strong>
              </Text>
              <Text size="xs">
                In Progress: <strong>{events.filter(e => e.status === 'in-progress').length}</strong>
              </Text>
              <Text size="xs">
                Done: <strong>{events.filter(e => e.status === 'done').length}</strong>
              </Text>
            </Group>
          </Group>
        </Paper>

        <Text size="xs" c="dimmed" ta="center">
          Sử dụng các nút trên để test các chức năng CRUD. Dữ liệu sẽ được lưu trong IndexedDB và đồng bộ real-time.
        </Text>
      </Stack>
    </Paper>
  );
}
