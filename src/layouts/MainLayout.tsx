import {
  AppShell,
  Text,
  NavLink,
  Group,
  Burger,
  rem
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconDashboard,
  IconCalendar,
  IconChartBar,
  IconBrain,
  IconTarget
} from '@tabler/icons-react';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MainLayout({ children, activeTab, onTabChange }: MainLayoutProps) {
  const [opened, { toggle }] = useDisclosure();

  const navLinks = [
    { 
      label: 'Dashboard', 
      value: 'dashboard', 
      icon: IconDashboard,
      description: 'Tổng quan'
    },
    { 
      label: 'Làm Ngay', 
      value: 'do-now', 
      icon: IconTarget,
      description: 'AI ưu tiên tasks'
    },
    { 
      label: 'Lịch', 
      value: 'calendar', 
      icon: IconCalendar,
      description: 'Xem theo ngày'
    },
    { 
      label: 'Phân tích', 
      value: 'analytics', 
      icon: IconChartBar,
      description: 'Thống kê'
    },
    { 
      label: 'AI Assistant', 
      value: 'ai', 
      icon: IconBrain,
      description: 'Tạo bằng ngôn ngữ tự nhiên'
    }
  ];

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text 
              size="xl" 
              fw={700} 
              variant="gradient"
              gradient={{ from: 'blue', to: 'teal', deg: 90 }}
            >
              Smart Academic Planner
            </Text>
          </Group>
          
          <Text size="sm" c="dimmed">
            NAVER Vietnam AI Hackathon 2025
          </Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="md">
          Navigation
        </Text>
        
        {navLinks.map((link) => (
          <NavLink
            key={link.value}
            active={activeTab === link.value}
            label={link.label}
            description={link.description}
            leftSection={<link.icon style={{ width: rem(16), height: rem(16) }} />}
            onClick={() => onTabChange(link.value)}
            mb="xs"
          />
        ))}
        
        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
          <Text size="xs" c="dimmed" ta="center">
            Phát triển bởi ChrisLee1901
          </Text>
          <Text size="xs" c="dimmed" ta="center">
            September 2025
          </Text>
        </div>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
