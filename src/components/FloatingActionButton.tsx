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
  Box,
} from '@mantine/core';
import { 
  IconPlus, 
  IconCalendarEvent, 
  IconClock, 
  IconTarget, 
  IconX,
  IconSparkles,
  IconFocusCentered
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
  const [isHovered, setIsHovered] = useState(false);

  const handleFormSubmit = (eventData: AcademicEvent) => {
    onAddEvent(eventData);
    setIsFormOpen(false);
  };

  const openFormWithStatus = (status: AcademicEvent['status']) => {
    setDefaultStatus(status);
    setIsFormOpen(true);
    setIsMenuOpen(false);
  };

  const quickOptions = [
    {
      label: 'Cần làm',
      status: 'todo' as const,
      icon: IconCalendarEvent,
      color: 'blue',
      gradient: { from: '#667eea', to: '#764ba2' },
      tooltip: 'Thêm nhiệm vụ cần làm'
    },
    {
      label: 'Đang làm',
      status: 'in-progress' as const,
      icon: IconClock,
      color: 'orange',
      gradient: { from: '#f093fb', to: '#f5576c' },
      tooltip: 'Thêm nhiệm vụ đang làm'
    },
    {
      label: 'Hoàn thành',
      status: 'done' as const,
      icon: IconTarget,
      color: 'green',
      gradient: { from: '#43e97b', to: '#38f9d7' },
      tooltip: 'Thêm nhiệm vụ đã hoàn thành'
    }
  ];

  return (
    <>
      {/* Floating Action Button Container */}
      <Box
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          zIndex: 1500,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '16px',
        }}
      >
        {/* Quick Options Menu */}
        {isMenuOpen && (
          <Stack 
            gap="md" 
            align="flex-end"
            style={{
              animation: 'slide-in-up 0.3s ease-out',
            }}
          >
            {/* Close Button */}
            <Tooltip label="Đóng menu" position="left" openDelay={500}>
              <ActionIcon
                size="lg"
                radius="xl"
                variant="light"
                color="gray"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                }}
              >
                <IconX size={18} />
              </ActionIcon>
            </Tooltip>

            {/* Quick Add Options */}
            <Stack gap="sm" align="flex-end">
              {quickOptions.map((option, index) => (
                <Tooltip key={option.status} label={option.tooltip} position="left" openDelay={300}>
                  <Button
                    leftSection={<option.icon size={18} />}
                    size="md"
                    onClick={() => openFormWithStatus(option.status)}
                    style={{
                      background: `linear-gradient(135deg, ${option.gradient.from}20 0%, ${option.gradient.to}20 100%)`,
                      backdropFilter: 'blur(20px)',
                      border: `2px solid ${option.gradient.from}40`,
                      boxShadow: `0 8px 32px ${option.gradient.from}30`,
                      minWidth: '180px',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      animation: `slide-in-right 0.3s ease-out ${index * 0.1}s both`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(-8px) scale(1.05)';
                      e.currentTarget.style.background = `linear-gradient(135deg, ${option.gradient.from}40 0%, ${option.gradient.to}40 100%)`;
                      e.currentTarget.style.boxShadow = `0 12px 40px ${option.gradient.from}50`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0) scale(1)';
                      e.currentTarget.style.background = `linear-gradient(135deg, ${option.gradient.from}20 0%, ${option.gradient.to}20 100%)`;
                      e.currentTarget.style.boxShadow = `0 8px 32px ${option.gradient.from}30`;
                    }}
                  >
                    {option.label}
                  </Button>
                </Tooltip>
              ))}

              {/* Separator with gradient */}
              <Box
                style={{
                  height: '2px',
                  width: '140px',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.4) 50%, transparent 100%)',
                  margin: '8px 0',
                  borderRadius: '1px',
                }}
              />

              {/* Advanced Form Option */}
              <Tooltip label="Mở form chi tiết với tất cả tùy chọn" position="left" openDelay={300}>
                <Button
                  leftSection={<IconFocusCentered size={18} />}
                  variant="light"
                  size="md"
                  onClick={() => {
                    setDefaultStatus('todo');
                    setIsFormOpen(true);
                    setIsMenuOpen(false);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.15) 0%, rgba(123, 31, 162, 0.15) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(156, 39, 176, 0.3)',
                    boxShadow: '0 8px 32px rgba(156, 39, 176, 0.25)',
                    minWidth: '180px',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    animation: 'slide-in-right 0.3s ease-out 0.3s both',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(-8px) scale(1.05)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(156, 39, 176, 0.25) 0%, rgba(123, 31, 162, 0.25) 100%)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(156, 39, 176, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0) scale(1)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(156, 39, 176, 0.15) 0%, rgba(123, 31, 162, 0.15) 100%)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(156, 39, 176, 0.25)';
                  }}
                >
                  Form chi tiết
                </Button>
              </Tooltip>
            </Stack>
          </Stack>
        )}

        {/* Main FAB */}
        {!isMenuOpen && (
          <Tooltip label="Tạo nhiệm vụ mới" position="left" openDelay={500}>
            <ActionIcon
              size="xl"
              radius="xl"
              onClick={() => setIsMenuOpen(true)}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: '3px solid rgba(255, 255, 255, 0.8)',
                width: '70px',
                height: '70px',
                boxShadow: isHovered 
                  ? '0 20px 50px rgba(102, 126, 234, 0.6), 0 0 30px rgba(118, 75, 162, 0.4)'
                  : '0 12px 35px rgba(102, 126, 234, 0.4)',
                transform: isHovered ? 'scale(1.1) rotate(90deg)' : 'scale(1) rotate(0deg)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(20px)',
                animation: 'pulse 3s infinite',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Sparkle Effect */}
              <Box
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                }}
              >
                <IconSparkles size={24} style={{ color: 'white' }} />
              </Box>
              
              {/* Plus Icon */}
              <Box
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  opacity: isHovered ? 0 : 1,
                  transition: 'opacity 0.3s ease',
                }}
              >
                <IconPlus size={26} style={{ color: 'white' }} />
              </Box>

              {/* Ripple Effect */}
              <Box
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '200%',
                  height: '200%',
                  transform: 'translate(-50%, -50%)',
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
                  borderRadius: '50%',
                  opacity: isHovered ? 1 : 0,
                  animation: isHovered ? 'ripple 0.6s ease-out' : 'none',
                }}
              />
            </ActionIcon>
          </Tooltip>
        )}
      </Box>

      {/* Enhanced Event Form Modal */}
      <Modal
        opened={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={
          <Group gap="md">
            <ThemeIcon 
              variant="gradient" 
              gradient={{ from: 'blue', to: 'cyan' }}
              size="lg"
              style={{
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
              }}
            >
              <IconCalendarEvent size={22} />
            </ThemeIcon>
            <Stack gap="xs">
              <Text 
                fw={800} 
                size="lg"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Tạo nhiệm vụ mới
              </Text>
              <Text size="xs" c="dimmed" fw={500}>
                Sử dụng AI để tạo kế hoạch thông minh
              </Text>
            </Stack>
          </Group>
        }
        size="xl"
        centered
        padding="xl"
        radius="xl"
        zIndex={1500}
        styles={{
          content: {
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          },
          header: { 
            paddingBottom: '1.5rem',
            borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
            background: 'transparent',
          },
          body: { 
            padding: 0,
            background: 'transparent',
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
