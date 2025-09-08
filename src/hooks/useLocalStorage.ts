import { useEffect } from 'react';
import { useEventStore } from '../store/eventStore';
import type { AcademicEvent } from '../types';

const STORAGE_KEY = 'smart-academic-planner-events';

export const useLocalStorage = () => {
  const { events, setEvents } = useEventStore();

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedEvents: AcademicEvent[] = JSON.parse(storedData);
        // Convert date strings back to Date objects
        const eventsWithDates = parsedEvents.map(event => ({
          ...event,
          startTime: new Date(event.startTime),
          endTime: event.endTime ? new Date(event.endTime) : undefined
        }));
        setEvents(eventsWithDates);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, [setEvents]);

  // Save data to localStorage whenever events change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }, [events]);

  // Clear all data
  const clearStorage = () => {
    localStorage.removeItem(STORAGE_KEY);
    setEvents([]);
  };

  return { clearStorage };
};
