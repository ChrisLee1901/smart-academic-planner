import { useState } from 'react';
import {
  AppShell,
  Text,
  NavLink,
  Group,
  Burger,
  rem,
  Box,
  Badge,
  ThemeIcon,
  Avatar,
  Stack,
  Divider
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconDashboard,
  IconCalendar,
  IconChartBar,
  IconBrain,
  IconTarget,
  IconSparkles,
  IconUser
} from '@tabler/icons-react';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { FloatingAIButton } from '../components/FloatingAIButton';
import { AIStudyAssistant } from '../components/AIStudyAssistant';
import { geminiService } from '../services/geminiService';
import type { AcademicEvent } from '../types';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MainLayout({ children, activeTab, onTabChange }: MainLayoutProps) {
  const [opened, { toggle }] = useDisclosure();
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [isAIOpen, setIsAIOpen] = useState(false);

  const handleQuickAdd = async (eventData: AcademicEvent) => {
    // This will just navigate to dashboard where user can add tasks
    onTabChange('dashboard');
    console.log('Quick add:', eventData); // To use the parameter
  };

  const navLinks = [
    { 
      label: '🏠 Dashboard', 
      value: 'dashboard', 
      icon: IconDashboard,
      description: 'Tổng quan toàn bộ',
      color: 'blue',
      gradient: { from: '#667eea', to: '#764ba2' }
    },
    { 
      label: '🎯 Làm Ngay', 
      value: 'do-now', 
      icon: IconTarget,
      description: 'AI ưu tiên tasks',
      color: 'orange',
      gradient: { from: '#f093fb', to: '#f5576c' }
    },
    { 
      label: '📅 Lịch', 
      value: 'calendar', 
      icon: IconCalendar,
      description: 'Xem theo ngày',
      color: 'green',
      gradient: { from: '#43e97b', to: '#38f9d7' }
    },
    { 
      label: '📊 Phân tích', 
      value: 'analytics', 
      icon: IconChartBar,
      description: 'Thống kê chi tiết',
      color: 'grape',
      gradient: { from: '#ffecd2', to: '#fcb69f' }
    },
    { 
      label: '🤖 AI Assistant', 
      value: 'ai', 
      icon: IconBrain,
      description: 'Tạo bằng ngôn ngữ tự nhiên',
      color: 'violet',
      gradient: { from: '#a8edea', to: '#fed6e3' }
    }
  ];

  return (
    <AppShell
      header={{ height: 80 }}
      navbar={{
        width: 320,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
      styles={{
        main: {
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)',
          minHeight: '100vh',
        }
      }}
    >
      <AppShell.Header
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Group h="100%" px="xl" justify="space-between">
          <Group>
            <Burger 
              opened={opened} 
              onClick={toggle} 
              hiddenFrom="sm" 
              size="sm"
              style={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                border: '2px solid rgba(102, 126, 234, 0.2)',
                borderRadius: '12px',
                padding: '8px',
              }}
            />
            
            <Group gap="md">
              <ThemeIcon
                size="xl"
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                style={{
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                  animation: 'pulse 3s infinite',
                }}
              >
                <IconSparkles size={24} />
              </ThemeIcon>
              
              <Stack gap="xs">
                <Text 
                  size="xl" 
                  fw={800} 
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    letterSpacing: '-0.5px',
                  }}
                >
                  Smart Academic Planner
                </Text>
                <Badge 
                  variant="gradient" 
                  gradient={{ from: 'teal', to: 'blue', deg: 90 }}
                  size="sm"
                  style={{
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    boxShadow: '0 3px 12px rgba(0, 150, 136, 0.3)',
                  }}
                >
                  ✨ AI Powered
                </Badge>
              </Stack>
            </Group>
          </Group>
          
          <Group gap="lg">
            <Badge 
              variant="light" 
              color="grape" 
              size="md"
              style={{
                background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(123, 31, 162, 0.1) 100%)',
                border: '2px solid rgba(156, 39, 176, 0.2)',
                fontWeight: 600,
              }}
            >
              🏆 NAVER Vietnam AI Hackathon 2025
            </Badge>
            
            <Avatar
              radius="xl"
              size="md"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: '3px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              }}
            >
              <IconUser size={20} />
            </Avatar>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar 
        p="xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box mb="xl">
          <Text 
            size="xs" 
            tt="uppercase" 
            fw={800} 
            c="dimmed" 
            mb="md"
            style={{
              letterSpacing: '2px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            🧭 NAVIGATION
          </Text>
          
          <Stack gap="sm">
            {navLinks.map((link) => (
              <NavLink
                key={link.value}
                active={activeTab === link.value}
                label={link.label}
                description={link.description}
                leftSection={
                  <ThemeIcon
                    size="md"
                    variant={activeTab === link.value ? "filled" : "light"}
                    color={link.color}
                    style={{
                      background: activeTab === link.value 
                        ? `linear-gradient(135deg, ${link.gradient.from} 0%, ${link.gradient.to} 100%)`
                        : `linear-gradient(135deg, ${link.gradient.from}20 0%, ${link.gradient.to}20 100%)`,
                      transform: hoveredNav === link.value ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
                      transition: 'all 0.3s ease',
                      boxShadow: activeTab === link.value 
                        ? `0 6px 20px ${link.gradient.from}40`
                        : hoveredNav === link.value 
                          ? `0 6px 15px ${link.gradient.from}30`
                          : 'none',
                    }}
                  >
                    <link.icon style={{ width: rem(18), height: rem(18) }} />
                  </ThemeIcon>
                }
                onClick={() => onTabChange(link.value)}
                onMouseEnter={() => setHoveredNav(link.value)}
                onMouseLeave={() => setHoveredNav(null)}
                style={{
                  borderRadius: '16px',
                  padding: '16px',
                  margin: '4px 0',
                  background: activeTab === link.value 
                    ? `linear-gradient(135deg, ${link.gradient.from}15 0%, ${link.gradient.to}15 100%)`
                    : hoveredNav === link.value 
                      ? `linear-gradient(135deg, ${link.gradient.from}08 0%, ${link.gradient.to}08 100%)`
                      : 'transparent',
                  border: activeTab === link.value 
                    ? `2px solid ${link.gradient.from}40`
                    : hoveredNav === link.value 
                      ? `2px solid ${link.gradient.from}30`
                      : '2px solid transparent',
                  transform: hoveredNav === link.value ? 'translateX(8px) scale(1.02)' : 'translateX(0) scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: activeTab === link.value 
                    ? `0 8px 25px ${link.gradient.from}20`
                    : hoveredNav === link.value 
                      ? `0 6px 20px ${link.gradient.from}15`
                      : '0 2px 8px rgba(0, 0, 0, 0.05)',
                  fontWeight: activeTab === link.value ? 700 : 600,
                }}
              />
            ))}
            
            {/* Quick Action Buttons - Right after AI Assistant */}
            <Box mt="md" mb="sm">
              <Group gap="md" justify="center" align="flex-start">
                <FloatingAIButton 
                  onOpenAI={() => setIsAIOpen(true)}
                  usingGemini={geminiService.isGeminiAvailable()}
                />
                <FloatingActionButton onAddEvent={handleQuickAdd} />
              </Group>
            </Box>
          </Stack>
        </Box>

        <Divider 
          my="xl" 
          variant="dashed"
          style={{
            borderColor: 'rgba(102, 126, 234, 0.2)',
          }}
        />
        
        <Box style={{ marginTop: 'auto', marginBottom: '80px' }}>
          <Stack gap="md" align="center">
            <Avatar
              size="lg"
              radius="xl"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: '3px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
              }}
            >
              👨‍💻
            </Avatar>
            
            <Stack gap="xs" align="center">
              <Text 
                size="sm" 
                fw={700} 
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ChrisLee1901
              </Text>
              <Badge 
                size="xs" 
                variant="light" 
                color="blue"
                style={{
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                }}
              >
                💡 Developer
              </Badge>
              <Text size="xs" c="dimmed" ta="center" fw={500}>
                September 2025
              </Text>
            </Stack>
          </Stack>
        </Box>
      </AppShell.Navbar>

      <AppShell.Main>
        <Box
          style={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)',
            minHeight: 'calc(100vh - 80px)',
            borderRadius: '20px',
            padding: '20px',
            margin: '-20px',
            marginTop: '0',
            backdropFilter: 'blur(10px)',
          }}
        >
          {children}
        </Box>
        
        {/* AI Study Assistant Modal */}
        <AIStudyAssistant 
          isModalOpen={isAIOpen}
          onModalToggle={setIsAIOpen}
        />
      </AppShell.Main>
    </AppShell>
  );
}
