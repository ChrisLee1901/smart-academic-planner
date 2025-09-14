import { useState, useEffect } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Badge,
  Button,
  Textarea,
  Title,
  Divider,
  ActionIcon,
  Tooltip,
  Progress,
  Grid,
  Card,
  Checkbox,
  TextInput,
  Select,
  Alert
} from '@mantine/core';
import {
  IconCalendar,
  IconClock,
  IconUser,
  IconNotes,
  IconEdit,
  IconTrash,
  IconPlus,
  IconCheck,
  IconX,
  IconSubtask,
  IconSticker,
  IconDeviceFloppy,
  IconFlag
} from '@tabler/icons-react';
import type { AcademicEvent } from '../types';
import { formatTime, getDaysUntil } from '../utils/dateUtils';
import { getUrgencyLevel, getUrgencyMessage } from '../utils/urgencyUtils';
import dayjs from '../utils/dayjs';

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

interface TaskNote {
  id: string;
  content: string;
  timestamp: Date;
  type: 'note' | 'report' | 'reminder';
}

interface DailyNote {
  date: string;
  content: string;
  lastUpdated: Date;
}

interface TaskDetailPanelProps {
  selectedTask: AcademicEvent | null;
  onEdit: (event: AcademicEvent) => void;
  onDelete: (eventId: string) => void;
  onStatusChange: (eventId: string, status: AcademicEvent['status']) => void;
  onClose: () => void;
}

export function TaskDetailPanel({ selectedTask, onEdit, onDelete, onStatusChange, onClose }: TaskDetailPanelProps) {
  const [taskNotes, setTaskNotes] = useState<TaskNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'note' | 'report' | 'reminder'>('note');
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [newSubTask, setNewSubTask] = useState('');
  const [dailyNote, setDailyNote] = useState<DailyNote | null>(null);
  const [showAddSubTask, setShowAddSubTask] = useState(false);

  const today = dayjs().format('YYYY-MM-DD');

  // Load data when component mounts or task changes
  useEffect(() => {
    if (selectedTask) {
      loadTaskData(selectedTask.id);
    } else {
      loadDailyNote();
    }
  }, [selectedTask]);

  const loadTaskData = (taskId: string) => {
    // Load from localStorage
    const storedNotes = localStorage.getItem(`task-notes-${taskId}`);
    const storedSubTasks = localStorage.getItem(`task-subtasks-${taskId}`);
    
    if (storedNotes) {
      setTaskNotes(JSON.parse(storedNotes));
    } else {
      setTaskNotes([]);
    }
    
    if (storedSubTasks) {
      setSubTasks(JSON.parse(storedSubTasks));
    } else {
      setSubTasks([]);
    }
  };

  const loadDailyNote = () => {
    const storedDailyNote = localStorage.getItem(`daily-note-${today}`);
    if (storedDailyNote) {
      setDailyNote(JSON.parse(storedDailyNote));
    } else {
      setDailyNote({
        date: today,
        content: '',
        lastUpdated: new Date()
      });
    }
  };

  const saveDailyNote = (content: string) => {
    const updatedNote: DailyNote = {
      date: today,
      content,
      lastUpdated: new Date()
    };
    setDailyNote(updatedNote);
    localStorage.setItem(`daily-note-${today}`, JSON.stringify(updatedNote));
  };

  const addTaskNote = () => {
    if (!newNote.trim() || !selectedTask) return;

    const note: TaskNote = {
      id: Date.now().toString(),
      content: newNote.trim(),
      timestamp: new Date(),
      type: noteType
    };

    const updatedNotes = [...taskNotes, note];
    setTaskNotes(updatedNotes);
    localStorage.setItem(`task-notes-${selectedTask.id}`, JSON.stringify(updatedNotes));
    setNewNote('');
  };

  const deleteTaskNote = (noteId: string) => {
    if (!selectedTask) return;
    
    const updatedNotes = taskNotes.filter(note => note.id !== noteId);
    setTaskNotes(updatedNotes);
    localStorage.setItem(`task-notes-${selectedTask.id}`, JSON.stringify(updatedNotes));
  };

  const addSubTask = () => {
    if (!newSubTask.trim() || !selectedTask) return;

    const subTask: SubTask = {
      id: Date.now().toString(),
      title: newSubTask.trim(),
      completed: false,
      createdAt: new Date()
    };

    const updatedSubTasks = [...subTasks, subTask];
    setSubTasks(updatedSubTasks);
    localStorage.setItem(`task-subtasks-${selectedTask.id}`, JSON.stringify(updatedSubTasks));
    setNewSubTask('');
    setShowAddSubTask(false);
  };

  const toggleSubTask = (subTaskId: string) => {
    if (!selectedTask) return;

    const updatedSubTasks = subTasks.map(st => 
      st.id === subTaskId ? { ...st, completed: !st.completed } : st
    );
    setSubTasks(updatedSubTasks);
    localStorage.setItem(`task-subtasks-${selectedTask.id}`, JSON.stringify(updatedSubTasks));
  };

  const deleteSubTask = (subTaskId: string) => {
    if (!selectedTask) return;

    const updatedSubTasks = subTasks.filter(st => st.id !== subTaskId);
    setSubTasks(updatedSubTasks);
    localStorage.setItem(`task-subtasks-${selectedTask.id}`, JSON.stringify(updatedSubTasks));
  };

  const getTypeColor = (type: AcademicEvent['type']) => {
    const colors = { deadline: 'red', class: 'blue', project: 'orange', personal: 'green' };
    return colors[type] || 'gray';
  };

  const getPriorityColor = (priority: AcademicEvent['priority']) => {
    const colors = { high: 'red', medium: 'yellow', low: 'green' };
    return colors[priority || 'medium'];
  };

  const getStatusColor = (status: AcademicEvent['status']) => {
    const colors = { todo: 'gray', 'in-progress': 'blue', done: 'green' };
    return colors[status];
  };

  const getNoteTypeColor = (type: TaskNote['type']) => {
    const colors = { note: 'blue', report: 'green', reminder: 'orange' };
    return colors[type];
  };

  const getNoteTypeIcon = (type: TaskNote['type']) => {
    const icons = { note: IconNotes, report: IconCheck, reminder: IconClock };
    return icons[type];
  };

  if (!selectedTask) {
    // Default state - Daily Notes
    return (
      <Paper p="lg" withBorder radius="md" style={{ height: '100%', minHeight: '600px' }}>
        <Stack gap="md">
          <Group justify="space-between">
            <Group gap="sm">
              <IconSticker size={24} color="#ffa726" />
              <Title order={3}>Daily Notes</Title>
              <Badge color="orange" variant="light">
                {dayjs().format('DD/MM/YYYY')}
              </Badge>
            </Group>
            <ActionIcon variant="subtle" color="gray" onClick={onClose}>
              <IconX size={16} />
            </ActionIcon>
          </Group>

          <Text size="sm" c="dimmed">
            Write your daily notes, reminders, or anything you want to remember for today.
            These notes will reset tomorrow.
          </Text>

          <Divider />

          <Textarea
            placeholder="Write your daily notes here..."
            minRows={15}
            maxRows={20}
            value={dailyNote?.content || ''}
            onChange={(e) => {
              const content = e.target.value;
              setDailyNote(prev => prev ? { ...prev, content } : {
                date: today,
                content,
                lastUpdated: new Date()
              });
            }}
            onBlur={() => saveDailyNote(dailyNote?.content || '')}
            styles={{
              input: {
                backgroundColor: '#f8f9fa',
                border: '2px dashed #dee2e6',
                fontSize: '14px',
                lineHeight: 1.6
              }
            }}
          />

          {dailyNote?.lastUpdated && (
            <Text size="xs" c="dimmed" ta="right">
              Last saved: {dayjs(dailyNote.lastUpdated).format('HH:mm:ss')}
            </Text>
          )}

          <Alert icon={<IconSticker size={16} />} color="orange" variant="light">
            <Text size="sm">
              <strong>Tip:</strong> These notes are automatically saved as you type and will be cleared tomorrow.
              Click on any task to switch to task-specific notes and sub-tasks.
            </Text>
          </Alert>
        </Stack>
      </Paper>
    );
  }

  // Task selected state
  const daysUntil = getDaysUntil(selectedTask.startTime);
  const urgencyLevel = getUrgencyLevel(selectedTask.startTime.toString(), selectedTask.status);
  const urgencyMessage = getUrgencyMessage(urgencyLevel, daysUntil);

  const completedSubTasks = subTasks.filter(st => st.completed).length;
  const subTaskProgress = subTasks.length > 0 ? (completedSubTasks / subTasks.length) * 100 : 0;

  return (
    <Paper p="lg" withBorder radius="md" style={{ height: '100%', minHeight: '600px' }}>
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Group gap="sm">
            <div style={{ fontSize: '24px' }}>
              {selectedTask.type === 'deadline' ? '⏰' : 
               selectedTask.type === 'class' ? '📚' : 
               selectedTask.type === 'project' ? '💼' : '👤'}
            </div>
            <Stack gap={2}>
              <Title order={3} lineClamp={2}>{selectedTask.title}</Title>
              <Group gap="xs">
                <Badge color={getTypeColor(selectedTask.type)} variant="light" size="sm">
                  {selectedTask.type}
                </Badge>
                <Badge color={getPriorityColor(selectedTask.priority)} variant="filled" size="sm">
                  {selectedTask.priority} priority
                </Badge>
                <Badge color={getStatusColor(selectedTask.status)} variant="outline" size="sm">
                  {selectedTask.status}
                </Badge>
              </Group>
            </Stack>
          </Group>

          <Group gap="xs">
            <Tooltip label="Edit Task">
              <ActionIcon variant="light" color="blue" onClick={() => onEdit(selectedTask)}>
                <IconEdit size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete Task">
              <ActionIcon variant="light" color="red" onClick={() => onDelete(selectedTask.id)}>
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Close Panel">
              <ActionIcon variant="subtle" color="gray" onClick={onClose}>
                <IconX size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        {/* Urgency Alert */}
        {(urgencyLevel === 'critical' || urgencyLevel === 'urgent') && (
          <Alert color={urgencyLevel === 'critical' ? 'red' : 'orange'} variant="light">
            ⚠️ {urgencyMessage}
          </Alert>
        )}

        {/* Basic Info Grid */}
        <Grid>
          <Grid.Col span={6}>
            <Card p="sm" withBorder>
              <Group gap="xs">
                <IconCalendar size={16} color="#667eea" />
                <Stack gap={2}>
                  <Text size="xs" c="dimmed">Due Date</Text>
                  <Text size="sm" fw={500}>
                    {dayjs(selectedTask.startTime).format('dddd, DD/MM/YYYY')}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {formatTime(selectedTask.startTime)}
                  </Text>
                </Stack>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={6}>
            <Card p="sm" withBorder>
              <Group gap="xs">
                <IconClock size={16} color="#ffa726" />
                <Stack gap={2}>
                  <Text size="xs" c="dimmed">Estimated Time</Text>
                  <Text size="sm" fw={500}>
                    {selectedTask.estimatedTime || 1}h
                  </Text>
                  {selectedTask.actualTime && (
                    <Text size="xs" c="dimmed">
                      Actual: {selectedTask.actualTime}h
                    </Text>
                  )}
                </Stack>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={6}>
            <Card p="sm" withBorder>
              <Group gap="xs">
                <IconCheck size={16} color="#10b981" />
                <Stack gap={2}>
                  <Text size="xs" c="dimmed">Status</Text>
                  <Select
                    value={selectedTask.status}
                    data={[
                      { value: 'to-do', label: 'To Do' },
                      { value: 'in-progress', label: 'In Progress' },
                      { value: 'done', label: 'Done' }
                    ]}
                    onChange={(value) => {
                      if (value && onStatusChange) {
                        onStatusChange(selectedTask.id, value as AcademicEvent['status']);
                      }
                    }}
                    size="xs"
                    style={{ maxWidth: 120 }}
                  />
                </Stack>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={6}>
            <Card p="sm" withBorder>
              <Group gap="xs">
                <IconFlag size={16} color="#ef4444" />
                <Stack gap={2}>
                  <Text size="xs" c="dimmed">Priority</Text>
                  <Badge color={getPriorityColor(selectedTask.priority)} variant="filled" size="sm">
                    {selectedTask.priority}
                  </Badge>
                </Stack>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Course and Description */}
        <Grid>
          <Grid.Col span={12}>
            {selectedTask.course && (
              <Card p="sm" withBorder>
                <Group gap="xs">
                  <IconUser size={16} color="#7c3aed" />
                  <Stack gap={2}>
                    <Text size="xs" c="dimmed">Course</Text>
                    <Text size="sm" fw={500}>{selectedTask.course}</Text>
                  </Stack>
                </Group>
              </Card>
            )}
          </Grid.Col>
        </Grid>

        <Divider />

        {/* Sub-tasks Section */}
        <Stack gap="md">
          <Group justify="space-between">
            <Group gap="sm">
              <IconSubtask size={20} color="#4dabf7" />
              <Title order={4}>Sub-tasks</Title>
              <Badge variant="light" color="blue">
                {completedSubTasks}/{subTasks.length}
              </Badge>
            </Group>
            <Button
              size="xs"
              leftSection={<IconPlus size={14} />}
              onClick={() => setShowAddSubTask(true)}
              variant="light"
            >
              Add Sub-task
            </Button>
          </Group>

          {subTasks.length > 0 && (
            <Progress value={subTaskProgress} color="blue" size="sm" radius="xl" />
          )}

          <Stack gap="xs">
            {subTasks.map(subTask => (
              <Card key={subTask.id} p="sm" withBorder>
                <Group justify="space-between">
                  <Group gap="sm">
                    <Checkbox
                      checked={subTask.completed}
                      onChange={() => toggleSubTask(subTask.id)}
                    />
                    <Text
                      size="sm"
                      style={{
                        textDecoration: subTask.completed ? 'line-through' : 'none',
                        opacity: subTask.completed ? 0.6 : 1
                      }}
                    >
                      {subTask.title}
                    </Text>
                  </Group>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="red"
                    onClick={() => deleteSubTask(subTask.id)}
                  >
                    <IconX size={12} />
                  </ActionIcon>
                </Group>
              </Card>
            ))}
          </Stack>

          {showAddSubTask && (
            <Card p="sm" withBorder style={{ backgroundColor: '#f8f9fa' }}>
              <Stack gap="sm">
                <TextInput
                  placeholder="Enter sub-task title..."
                  value={newSubTask}
                  onChange={(e) => setNewSubTask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSubTask()}
                />
                <Group gap="xs">
                  <Button size="xs" onClick={addSubTask} disabled={!newSubTask.trim()}>
                    Add
                  </Button>
                  <Button
                    size="xs"
                    variant="subtle"
                    onClick={() => {
                      setShowAddSubTask(false);
                      setNewSubTask('');
                    }}
                  >
                    Cancel
                  </Button>
                </Group>
              </Stack>
            </Card>
          )}
        </Stack>

        <Divider />

        {/* Notes Section */}
        <Stack gap="md">
          <Group gap="sm">
            <IconNotes size={20} color="#51cf66" />
            <Title order={4}>Notes & Reports</Title>
          </Group>

          {/* Add new note */}
          <Stack gap="sm">
            <Group gap="sm">
              <Select
                value={noteType}
                onChange={(value) => setNoteType(value as 'note' | 'report' | 'reminder')}
                data={[
                  { value: 'note', label: '📝 Note' },
                  { value: 'report', label: '📊 Report' },
                  { value: 'reminder', label: '⏰ Reminder' }
                ]}
                size="xs"
                style={{ width: 120 }}
              />
            </Group>
            <Textarea
              placeholder="Write a note, report, or reminder about this task..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              minRows={3}
              maxRows={5}
            />
            <Button
              size="sm"
              leftSection={<IconDeviceFloppy size={14} />}
              onClick={addTaskNote}
              disabled={!newNote.trim()}
              variant="light"
            >
              Save Note
            </Button>
          </Stack>

          {/* Notes list */}
          <Stack gap="sm">
            {taskNotes.map(note => {
              const IconComponent = getNoteTypeIcon(note.type);
              return (
                <Card key={note.id} p="sm" withBorder>
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Group gap="xs">
                        <IconComponent size={14} />
                        <Badge color={getNoteTypeColor(note.type)} variant="light" size="xs">
                          {note.type}
                        </Badge>
                        <Text size="xs" c="dimmed">
                          {dayjs(note.timestamp).format('DD/MM HH:mm')}
                        </Text>
                      </Group>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="red"
                        onClick={() => deleteTaskNote(note.id)}
                      >
                        <IconX size={12} />
                      </ActionIcon>
                    </Group>
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                      {note.content}
                    </Text>
                  </Stack>
                </Card>
              );
            })}
          </Stack>

          {taskNotes.length === 0 && (
            <Text size="sm" c="dimmed" ta="center" py="xl">
              No notes yet. Add your first note above.
            </Text>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}