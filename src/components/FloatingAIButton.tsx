import { useState } from 'react';
import {
  ActionIcon,
  Tooltip,
  Box,
  Text,
} from '@mantine/core';
import { 
  IconRobot, 
  IconSparkles,
  IconBolt
} from '@tabler/icons-react';

interface FloatingAIButtonProps {
  onOpenAI: () => void;
  usingGemini?: boolean;
}

export function FloatingAIButton({ onOpenAI, usingGemini = true }: FloatingAIButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onOpenAI();
      setIsAnimating(false);
    }, 300);
  };

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {/* Main AI FAB */}
      <Tooltip 
        label={
          <Box>
            <Text size="sm" fw={600}>
              {usingGemini ? '🤖 Gemini AI Assistant' : '🔄 AI Assistant (Offline)'}
            </Text>
            <Text size="xs" c="dimmed">Click để mở chat AI</Text>
          </Box>
        } 
        position="top" 
        openDelay={500}
      >
        <ActionIcon
          size="lg"
          radius="xl"
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            background: usingGemini 
              ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
              : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            border: '2px solid rgba(255, 255, 255, 0.9)',
            width: '56px',
            height: '56px',
            boxShadow: isHovered 
              ? (usingGemini 
                  ? '0 15px 40px rgba(139, 92, 246, 0.5), 0 0 25px rgba(99, 102, 241, 0.3)'
                  : '0 15px 40px rgba(249, 115, 22, 0.5), 0 0 25px rgba(234, 88, 12, 0.3)')
              : (usingGemini 
                  ? '0 8px 25px rgba(139, 92, 246, 0.3)'
                  : '0 8px 25px rgba(249, 115, 22, 0.3)'),
            transform: isHovered 
              ? 'scale(1.1) rotate(360deg)' 
              : isAnimating 
                ? 'scale(0.95) rotate(180deg)'
                : 'scale(1) rotate(0deg)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: 'blur(20px)',
            animation: usingGemini ? 'ai-pulse-gemini 3s infinite' : 'ai-pulse-offline 3s infinite',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Rotating Sparkles Effect */}
          <Box
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.3s ease',
              animation: isHovered ? 'ai-rotate 2s linear infinite' : 'none',
            }}
          >
            <IconSparkles size={22} style={{ color: 'white' }} />
          </Box>
          
          {/* Main Robot Icon */}
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
            <IconRobot size={24} style={{ color: 'white' }} />
          </Box>

          {/* AI Energy Rings */}
          <Box
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '120%',
              height: '120%',
              transform: 'translate(-50%, -50%)',
              background: `conic-gradient(from 0deg, transparent, ${usingGemini ? 'rgba(139, 92, 246, 0.3)' : 'rgba(249, 115, 22, 0.3)'}, transparent)`,
              borderRadius: '50%',
              opacity: isHovered ? 1 : 0,
              animation: isHovered ? 'ai-ring-spin 1.5s linear infinite' : 'none',
            }}
          />

          {/* Lightning Effect */}
          <Box
            style={{
              position: 'absolute',
              top: '10%',
              right: '15%',
              opacity: isHovered ? 1 : 0,
              animation: isHovered ? 'ai-lightning 0.8s ease-in-out infinite' : 'none',
            }}
          >
            <IconBolt size={12} style={{ color: 'white' }} />
          </Box>

          <Box
            style={{
              position: 'absolute',
              bottom: '10%',
              left: '15%',
              opacity: isHovered ? 1 : 0,
              animation: isHovered ? 'ai-lightning 0.8s ease-in-out infinite 0.4s' : 'none',
            }}
          >
            <IconBolt size={12} style={{ color: 'white' }} />
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
              background: `radial-gradient(circle, ${usingGemini ? 'rgba(139, 92, 246, 0.3)' : 'rgba(249, 115, 22, 0.3)'} 0%, transparent 70%)`,
              borderRadius: '50%',
              opacity: isHovered ? 1 : 0,
              animation: isHovered ? 'ai-ripple 1s ease-out infinite' : 'none',
            }}
          />
        </ActionIcon>
      </Tooltip>

      {/* Status Indicator */}
      <Box
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: usingGemini ? '#22c55e' : '#f97316',
          boxShadow: `0 0 10px ${usingGemini ? '#22c55e' : '#f97316'}`,
          animation: 'ai-glow 2s ease-in-out infinite alternate',
        }}
      />
    </Box>
  );
}