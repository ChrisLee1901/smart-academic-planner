import { useState, useEffect } from 'react';
import { MantineProvider, createTheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { useEventStore } from './store/eventStore';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { CalendarView } from './pages/CalendarView';
import AnalyticsView from './pages/AnalyticsView';
import { AIAssistantView } from './pages/AIAssistantView';

// Import Mantine CSS
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
  shadows: {
    md: '1px 1px 3px rgba(0, 0, 0, .25)',
    xl: '5px 5px 3px rgba(0, 0, 0, .25)',
  },
  headings: {
    fontFamily: 'Roboto, sans-serif',
    sizes: {
      h1: { fontSize: '2rem' },
    },
  },
});

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { initializeStore, isLoading, error } = useEventStore();
  
  // Initialize database when app starts
  useEffect(() => {
    initializeStore().catch(console.error);
  }, [initializeStore]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onTabChange={setActiveTab} />;
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
      <ModalsProvider>
        <Notifications position="top-right" limit={5} />
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