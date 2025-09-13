import { useState } from "react";
import {
  Modal,
  ActionIcon,
  Tooltip,
  Box,
} from '@mantine/core';
import { 
  IconSparkles,
} from '@tabler/icons-react';
import { EventForm } from './EventForm';
import type { AcademicEvent } from '../types';

interface FloatingActionButtonProps {
  onAddEvent: (event: AcademicEvent) => void;
}

export function FloatingActionButton({ onAddEvent }: FloatingActionButtonProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleFormSubmit = (eventData: AcademicEvent) => {
    onAddEvent(eventData);
    setIsFormOpen(false);
  };

  return (
    <>
      <Modal
        opened={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Tạo nhiệm vụ mới"
        size="lg"
        centered
      >
        <EventForm
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
          defaultStatus="todo"
        />
      </Modal>

      <Box>
        <Tooltip label="Tạo nhiệm vụ mới" position="left">
          <ActionIcon
            size="lg"
            radius="xl"
            onClick={() => setIsFormOpen(true)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: '2px solid rgba(255, 255, 255, 0.8)',
              width: '56px',
              height: '56px',
              boxShadow: isHovered 
                ? '0 15px 40px rgba(102, 126, 234, 0.5)'
                : '0 8px 25px rgba(102, 126, 234, 0.3)',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.4s ease',
              cursor: 'pointer',
            }}
          >
            <IconSparkles size={22} style={{ color: 'white' }} />
          </ActionIcon>
        </Tooltip>
      </Box>
    </>
  );
}
