import type { AcademicEvent } from '../types';

const DB_NAME = 'SmartAcademicPlannerDB';
const DB_VERSION = 1;
const EVENTS_STORE = 'events';

class DatabaseService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Database failed to open');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('Database opened successfully');
        resolve();
      };

      request.onupgradeneeded = () => {
        this.db = request.result;

        // Create events object store
        if (!this.db.objectStoreNames.contains(EVENTS_STORE)) {
          const eventsStore = this.db.createObjectStore(EVENTS_STORE, {
            keyPath: 'id'
          });

          // Create indexes for efficient querying
          eventsStore.createIndex('status', 'status', { unique: false });
          eventsStore.createIndex('type', 'type', { unique: false });
          eventsStore.createIndex('startTime', 'startTime', { unique: false });
          eventsStore.createIndex('course', 'course', { unique: false });
        }

        console.log('Database setup complete');
      };
    });
  }

  async getAllEvents(): Promise<AcademicEvent[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([EVENTS_STORE], 'readonly');
      const store = transaction.objectStore(EVENTS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const events = request.result.map(event => ({
          ...event,
          startTime: new Date(event.startTime),
          endTime: event.endTime ? new Date(event.endTime) : undefined
        }));
        resolve(events);
      };

      request.onerror = () => {
        console.error('Failed to fetch events');
        reject(request.error);
      };
    });
  }

  async addEvent(event: AcademicEvent): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([EVENTS_STORE], 'readwrite');
      const store = transaction.objectStore(EVENTS_STORE);
      
      const eventToStore = {
        ...event,
        startTime: event.startTime.toISOString(),
        endTime: event.endTime ? event.endTime.toISOString() : undefined
      };

      const request = store.add(eventToStore);

      request.onsuccess = () => {
        console.log('Event added to database');
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to add event');
        reject(request.error);
      };
    });
  }

  async updateEvent(id: string, updatedEvent: AcademicEvent): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([EVENTS_STORE], 'readwrite');
      const store = transaction.objectStore(EVENTS_STORE);
      
      const eventToStore = {
        ...updatedEvent,
        startTime: updatedEvent.startTime.toISOString(),
        endTime: updatedEvent.endTime ? updatedEvent.endTime.toISOString() : undefined
      };

      const request = store.put(eventToStore);

      request.onsuccess = () => {
        console.log('Event updated in database');
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to update event');
        reject(request.error);
      };
    });
  }

  async deleteEvent(id: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([EVENTS_STORE], 'readwrite');
      const store = transaction.objectStore(EVENTS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('Event deleted from database');
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to delete event');
        reject(request.error);
      };
    });
  }

  async getEventsByStatus(status: AcademicEvent['status']): Promise<AcademicEvent[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([EVENTS_STORE], 'readonly');
      const store = transaction.objectStore(EVENTS_STORE);
      const index = store.index('status');
      const request = index.getAll(status);

      request.onsuccess = () => {
        const events = request.result.map(event => ({
          ...event,
          startTime: new Date(event.startTime),
          endTime: event.endTime ? new Date(event.endTime) : undefined
        }));
        resolve(events);
      };

      request.onerror = () => {
        console.error('Failed to fetch events by status');
        reject(request.error);
      };
    });
  }

  async getEventsByType(type: AcademicEvent['type']): Promise<AcademicEvent[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([EVENTS_STORE], 'readonly');
      const store = transaction.objectStore(EVENTS_STORE);
      const index = store.index('type');
      const request = index.getAll(type);

      request.onsuccess = () => {
        const events = request.result.map(event => ({
          ...event,
          startTime: new Date(event.startTime),
          endTime: event.endTime ? new Date(event.endTime) : undefined
        }));
        resolve(events);
      };

      request.onerror = () => {
        console.error('Failed to fetch events by type');
        reject(request.error);
      };
    });
  }

  async clearAllEvents(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([EVENTS_STORE], 'readwrite');
      const store = transaction.objectStore(EVENTS_STORE);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('All events cleared from database');
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to clear events');
        reject(request.error);
      };
    });
  }
}

export const databaseService = new DatabaseService();
