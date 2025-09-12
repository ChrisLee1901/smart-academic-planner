import { useState, useEffect } from 'react';
import { MantineProvider, createTheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { useEventStore } from './store/eventStore';
import { useNotificationSystem } from './hooks/useNotificationSystem';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { CalendarView } from './pages/CalendarView';
import { DoNowView } from './pages/DoNowView';
import  AnalyticsView from './pages/AnalyticsView';
import { AIAssistantView } from './pages/AIAssistantView';

// Import Mantine CSS
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

const theme = createTheme({
  primaryColor: 'blue',
  colors: {
    // Modern blue gradient palette
    blue: [
      '#e3f2fd',
      '#bbdefb',
      '#90caf9',
      '#64b5f6',
      '#42a5f5',
      '#2196f3',
      '#1e88e5',
      '#1976d2',
      '#1565c0',
      '#0d47a1'
    ],
    // Vibrant gradient colors
    gradient: [
      '#667eea',
      '#764ba2',
      '#f093fb',
      '#f5576c',
      '#4facfe',
      '#00f2fe',
      '#43e97b',
      '#38f9d7',
      '#ffecd2',
      '#fcb69f'
    ],
    // Success green gradient
    success: [
      '#e8f5e8',
      '#c8e6c9',
      '#a5d6a7',
      '#81c784',
      '#66bb6a',
      '#4caf50',
      '#43a047',
      '#388e3c',
      '#2e7d32',
      '#1b5e20'
    ],
    // Warning orange gradient
    warning: [
      '#fff3e0',
      '#ffe0b2',
      '#ffcc02',
      '#ffb74d',
      '#ffa726',
      '#ff9800',
      '#fb8c00',
      '#f57c00',
      '#ef6c00',
      '#e65100'
    ],
    // Error red gradient
    error: [
      '#ffebee',
      '#ffcdd2',
      '#ef9a9a',
      '#e57373',
      '#ef5350',
      '#f44336',
      '#e53935',
      '#d32f2f',
      '#c62828',
      '#b71c1c'
    ]
  },
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  defaultRadius: 'md',
  shadows: {
    xs: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 15px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.05), 0 20px 25px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.05), 0 25px 50px rgba(0, 0, 0, 0.15)',
  },
  headings: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '2rem' },
    },
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: {
          transition: 'all 200ms ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }
        }
      }
    },
    Card: {
      defaultProps: {
        radius: 'lg',
        shadow: 'sm',
      },
      styles: {
        root: {
          transition: 'all 300ms ease',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
          }
        }
      }
    },
    Paper: {
      defaultProps: {
        radius: 'md',
        shadow: 'xs',
      }
    }
  }
});

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { initializeStore, isLoading, error } = useEventStore();
  
  // Initialize notification system
  useNotificationSystem({
    deadlineReminders: true,
    overdueAlerts: true,
    dailyDigest: true,
    motivationalMessages: true
  });
  
  // Initialize database when app starts
  useEffect(() => {
    initializeStore().catch(console.error);
  }, [initializeStore]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onTabChange={setActiveTab} />;
      case 'do-now':
        return <DoNowView />;
      case 'calendar':
        return <CalendarView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'ai':
        return <AIAssistantView />;
      default:
        return <Dashboard onTabChange={setActiveTab} />;
    }
  };

  return (
    <MantineProvider theme={theme}>
      <ModalsProvider 
        modalProps={{ 
          zIndex: 200,
          styles: {
            header: { paddingBottom: '1rem' },
            body: { padding: '1rem' }
          }
        }}
      >
        <Notifications position="top-right" limit={5} zIndex={9999} />
        {error && (
          <div style={{ 
            background: '#ffe6e6', 
            color: '#d63384', 
            padding: '10px', 
            textAlign: 'center',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
          {isLoading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '200px',
              fontSize: '16px',
              color: '#666'
            }}>
              Đang tải dữ liệu...
            </div>
          ) : (
            renderContent()
          )}
        </MainLayout>
      </ModalsProvider>
    </MantineProvider>
  );
}

export default App;