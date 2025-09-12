import { create } from 'zustand';
import type { AcademicEvent } from '../types';
import { databaseService } from '../services/databaseService';
import { migrateFromLocalStorage } from '../services/migrationService';
import { ProcrastinationAnalysisService } from '../services/procrastinationService';

interface EventStoreState {
  events: AcademicEvent[];
  isLoading: boolean;
  error: string | null;
  
  // Database operations
  initializeStore: () => Promise<void>;
  addEvent: (event: AcademicEvent) => Promise<void>;
  updateEvent: (eventId: string, updatedData: Partial<AcademicEvent>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  
  // Local operations
  getEvents: () => AcademicEvent[];
  setEvents: (events: AcademicEvent[]) => void;
  getEventsByType: (type: AcademicEvent['type']) => AcademicEvent[];
  getEventsByStatus: (status: AcademicEvent['status']) => AcademicEvent[];
  getUpcomingEvents: (days?: number) => AcademicEvent[];
  
  // Utility
  clearError: () => void;
}

export const useEventStore = create<EventStoreState>((set, get) => ({
  events: [],
  isLoading: false,
  error: null,
  
  initializeStore: async () => {
    set({ isLoading: true, error: null });
    try {
      await databaseService.init();
      
      // Try to migrate from localStorage first
      const migrated = await migrateFromLocalStorage();
      if (migrated) {
        console.log('Successfully migrated data from localStorage');
      }
      
      const events = await databaseService.getAllEvents();
      set({ events, isLoading: false });
      console.log(`Loaded ${events.length} events from database`);
    } catch (error) {
      console.error('Failed to initialize store:', error);
      set({ 
        error: 'Failed to load events from database', 
        isLoading: false,
        events: [] // Use empty array as fallback
      });
    }
  },
  
  addEvent: async (event) => {
    set({ isLoading: true, error: null });
    try {
      // Calculate realistic deadline based on procrastination patterns
      const currentEvents = get().events;
      const realisticDeadline = ProcrastinationAnalysisService.calculateRealisticDeadline(event);
      const procrastinationCoefficient = ProcrastinationAnalysisService.calculateProcrastinationCoefficient(currentEvents).overallCoefficient;
      
      // Add calculated fields to event
      const eventWithRealisticData: AcademicEvent = {
        ...event,
        realisticDeadline,
        procrastinationCoefficient
      };
      
      await databaseService.addEvent(eventWithRealisticData);
      set((state) => ({
        events: [...state.events, eventWithRealisticData],
        isLoading: false
      }));
      console.log('Event added successfully with realistic deadline');
    } catch (error) {
      console.error('Failed to add event:', error);
      set({ error: 'Failed to add event', isLoading: false });
      throw error;
    }
  },
  
  updateEvent: async (eventId, updatedData) => {
    set({ isLoading: true, error: null });
    try {
      const currentEvent = get().events.find(e => e.id === eventId);
      if (!currentEvent) {
        throw new Error('Event not found');
      }
      
      const updatedEvent = { ...currentEvent, ...updatedData };
      
      // If task is being marked as completed, update procrastination patterns
      if (updatedData.status === 'done' && currentEvent.status !== 'done') {
        const allEvents = get().events;
        ProcrastinationAnalysisService.updatePatternOnTaskCompletion([...allEvents, updatedEvent]);
      }
      
      await databaseService.updateEvent(eventId, updatedEvent);
      
      set((state) => ({
        events: state.events.map((event) =>
          event.id === eventId ? updatedEvent : event
        ),
        isLoading: false
      }));
      console.log('Event updated successfully');
    } catch (error) {
      console.error('Failed to update event:', error);
      set({ error: 'Failed to update event', isLoading: false });
      throw error;
    }
  },
  
  deleteEvent: async (eventId) => {
    set({ isLoading: true, error: null });
    try {
      await databaseService.deleteEvent(eventId);
      set((state) => ({
        events: state.events.filter((event) => event.id !== eventId),
        isLoading: false
      }));
      console.log('Event deleted successfully');
    } catch (error) {
      console.error('Failed to delete event:', error);
      set({ error: 'Failed to delete event', isLoading: false });
      throw error;
    }
  },
  
  getEvents: () => get().events,
  
  setEvents: (events) => set({ events }),
  
  getEventsByType: (type) => {
    return get().events.filter((event) => event.type === type);
  },
  
  getEventsByStatus: (status) => {
    return get().events.filter((event) => event.status === status);
  },
  
  getUpcomingEvents: (days = 7) => {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return get().events.filter((event) => {
      const eventDate = new Date(event.startTime);
      return eventDate >= now && eventDate <= futureDate;
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  },
  
  clearError: () => set({ error: null })
}));
