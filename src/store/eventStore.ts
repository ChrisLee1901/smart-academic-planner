import { create } from 'zustand';
import type { AcademicEvent } from '../types';

interface EventStoreState {
  events: AcademicEvent[];
  addEvent: (event: AcademicEvent) => void;
  updateEvent: (eventId: string, updatedData: Partial<AcademicEvent>) => void;
  deleteEvent: (eventId: string) => void;
  getEvents: () => AcademicEvent[];
  setEvents: (events: AcademicEvent[]) => void;
  getEventsByType: (type: AcademicEvent['type']) => AcademicEvent[];
  getEventsByStatus: (status: AcademicEvent['status']) => AcademicEvent[];
  getUpcomingEvents: (days?: number) => AcademicEvent[];
}

export const useEventStore = create<EventStoreState>((set, get) => ({
  events: [],
  
  addEvent: (event) => {
    set((state) => ({
      events: [...state.events, event]
    }));
  },
  
  updateEvent: (eventId, updatedData) => {
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId ? { ...event, ...updatedData } : event
      )
    }));
  },
  
  deleteEvent: (eventId) => {
    set((state) => ({
      events: state.events.filter((event) => event.id !== eventId)
    }));
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
  }
}));
