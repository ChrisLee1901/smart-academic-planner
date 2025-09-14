import { useState, useEffect } from "react";
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
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Mount animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleFormSubmit = (eventData: AcademicEvent) => {
    onAddEvent(eventData);
    setIsFormOpen(false);
  };

  const handleClick = () => {
    setIsClicked(true);
    setIsFormOpen(true);
    setTimeout(() => setIsClicked(false), 200);
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

      <Box
        style={{
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        }}
      >
        <Tooltip label="Tạo nhiệm vụ mới" position="left">
          <ActionIcon
            size="lg"
            radius="xl"
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: '2px solid rgba(255, 255, 255, 0.8)',
              width: '56px',
              height: '56px',
              boxShadow: isHovered 
                ? '0 15px 40px rgba(102, 126, 234, 0.5), 0 0 0 0 rgba(102, 126, 234, 0.7)'
                : '0 8px 25px rgba(102, 126, 234, 0.3)',
              transform: `
                ${isHovered ? 'scale(1.1)' : 'scale(1)'} 
                ${isClicked ? 'scale(0.95)' : ''}
              `,
              transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
              cursor: 'pointer',
              animation: isHovered 
                ? 'none' 
                : 'pulse 3s ease-in-out infinite',
            }}
            className="floating-action-button"
          >
            <IconSparkles 
              size={22} 
              style={{ 
                color: 'white',
                transform: isHovered ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.4s ease',
              }} 
            />
          </ActionIcon>
        </Tooltip>
        
        {/* Add CSS keyframes for pulse animation */}
        <style>
          {`
            @keyframes pulse {
              0% {
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3), 0 0 0 0 rgba(102, 126, 234, 0.7);
              }
              50% {
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3), 0 0 0 8px rgba(102, 126, 234, 0);
              }
              100% {
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3), 0 0 0 0 rgba(102, 126, 234, 0);
              }
            }
            
            .floating-action-button:active {
              transform: scale(0.95) !important;
            }
            
            .floating-action-button:hover {
              animation: none !important;
            }
          `}
        </style>
      </Box>
    </>
  );
}
