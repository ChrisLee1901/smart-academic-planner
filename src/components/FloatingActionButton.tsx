import { useState } from 'react';
import {
  Button,
  Modal,
  Group,
  Stack,
  ActionIcon,
  Tooltip,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { 
  IconPlus, 
  IconCalendarEvent, 
  IconClock, 
  IconTarget, 
  IconUser,
  IconX 
} from '@tabler/icons-react';
import { EventForm } from './EventForm';
import type { AcademicEvent } from '../types';

interface FloatingActionButtonProps {
  onAddEvent: (event: AcademicEvent) => void;
}

export function FloatingActionButton({ onAddEvent }: FloatingActionButtonProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<AcademicEvent['status']>('todo');

  const handleFormSubmit = (eventData: AcademicEvent) => {
    onAddEvent(eventData);
    setIsFormOpen(false);
  };

  const openFormWithStatus = (status: AcademicEvent['status']) => {
    setDefaultStatus(status);
    setIsFormOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          zIndex: 1500,
        }}
      >
        {!isMenuOpen ? (
          <Tooltip label="Thêm nhiệm vụ mới" position="left">
            <ActionIcon
              size="xl"
              radius="xl"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
              onClick={() => setIsMenuOpen(true)}
              style={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                border: '2px solid white',
                width: '60px',
                height: '60px',
              }}
            >
              <IconPlus size={24} />
            </ActionIcon>
          </Tooltip>
        ) : (
          <Stack gap="sm" align="flex-end">
            {/* Close Button */}
            <Tooltip label="Đóng" position="left">
              <ActionIcon
                size="lg"
                radius="xl"
                variant="light"
                color="gray"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  backgroundColor: 'white',
                }}
              >
                <IconX size={18} />
              </ActionIcon>
            </Tooltip>

            {/* Quick Add Options */}
            <Stack gap="xs" align="flex-end">
              <Tooltip label="Thêm nhiệm vụ cần làm" position="left">
                <Button
                  leftSection={<IconCalendarEvent size={18} />}
                  color="blue"
                  size="sm"
                  onClick={() => openFormWithStatus('todo')}
                  style={{
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    minWidth: '160px',
                  }}
                >
                  📝 Cần làm
                </Button>
              </Tooltip>

              <Tooltip label="Thêm nhiệm vụ đang làm" position="left">
                <Button
                  leftSection={<IconClock size={18} />}
                  color="yellow"
                  size="sm"
                  onClick={() => openFormWithStatus('in-progress')}
                  style={{
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    minWidth: '160px',
                  }}
                >
                  ⚡ Đang làm
                </Button>
              </Tooltip>

              <Tooltip label="Thêm nhiệm vụ đã hoàn thành" position="left">
                <Button
                  leftSection={<IconTarget size={18} />}
                  color="green"
                  size="sm"
                  onClick={() => openFormWithStatus('done')}
                  style={{
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    minWidth: '160px',
                  }}
                >
                  ✅ Hoàn thành
                </Button>
              </Tooltip>

              {/* Separator */}
              <div style={{ height: '1px', backgroundColor: '#e9ecef', width: '120px', margin: '4px 0' }} />

              <Tooltip label="Mở form chi tiết" position="left">
                <Button
                  leftSection={<IconUser size={18} />}
                  variant="light"
                  color="violet"
                  size="sm"
                  onClick={() => {
                    setDefaultStatus('todo');
                    setIsFormOpen(true);
                    setIsMenuOpen(false);
                  }}
                  style={{
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    minWidth: '160px',
                  }}
                >
                  📋 Form chi tiết
                </Button>
              </Tooltip>
            </Stack>
          </Stack>
        )}
      </div>

      {/* Event Form Modal */}
      <Modal
        opened={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={
          <Group gap="sm">
            <ThemeIcon variant="light" color="blue">
              <IconCalendarEvent size={20} />
            </ThemeIcon>
            <Text fw={600}>Tạo nhiệm vụ mới</Text>
          </Group>
        }
        size="lg"
        centered
        padding="lg"
        zIndex={2000}
        styles={{
          title: {
            fontSize: '18px',
            fontWeight: 600,
          },
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
          defaultStatus={defaultStatus}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>
    </>
  );
}
