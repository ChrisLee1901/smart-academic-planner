import type { AcademicEvent } from '../types';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: 'academic' | 'personal' | 'fitness' | 'skill' | 'habit';
  type: 'daily' | 'weekly' | 'monthly' | 'one-time';
  target: number;
  current: number;
  unit: string;
  startDate: Date;
  endDate?: Date;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'paused' | 'failed';
  streak: number;
  lastUpdated: Date;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: 'health' | 'productivity' | 'learning' | 'personal' | 'social';
  frequency: 'daily' | 'weekly' | 'custom';
  target: number;
  color: string;
  icon: string;
  createdAt: Date;
  isActive: boolean;
}

export interface HabitRecord {
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  notes?: string;
}

const DB_NAME = 'SmartAcademicPlannerDB';
const DB_VERSION = 2; // Increased version for new stores
const EVENTS_STORE = 'events';
const GOALS_STORE = 'goals';
const HABITS_STORE = 'habits';
const HABIT_RECORDS_STORE = 'habitRecords';

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

        // Create goals object store
        if (!this.db.objectStoreNames.contains(GOALS_STORE)) {
          const goalsStore = this.db.createObjectStore(GOALS_STORE, {
            keyPath: 'id'
          });

          goalsStore.createIndex('status', 'status', { unique: false });
          goalsStore.createIndex('category', 'category', { unique: false });
          goalsStore.createIndex('type', 'type', { unique: false });
        }

        // Create habits object store
        if (!this.db.objectStoreNames.contains(HABITS_STORE)) {
          const habitsStore = this.db.createObjectStore(HABITS_STORE, {
            keyPath: 'id'
          });

          habitsStore.createIndex('category', 'category', { unique: false });
          habitsStore.createIndex('isActive', 'isActive', { unique: false });
        }

        // Create habit records object store
        if (!this.db.objectStoreNames.contains(HABIT_RECORDS_STORE)) {
          const habitRecordsStore = this.db.createObjectStore(HABIT_RECORDS_STORE, {
            keyPath: ['habitId', 'date'] // Composite key
          });

          habitRecordsStore.createIndex('habitId', 'habitId', { unique: false });
          habitRecordsStore.createIndex('date', 'date', { unique: false });
          habitRecordsStore.createIndex('completed', 'completed', { unique: false });
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
        startTime: event.startTime instanceof Date ? event.startTime.toISOString() : new Date(event.startTime).toISOString(),
        endTime: event.endTime ? (event.endTime instanceof Date ? event.endTime.toISOString() : new Date(event.endTime).toISOString()) : undefined
      };

      const request = store.put(eventToStore);

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

  async updateEvent(_id: string, updatedEvent: AcademicEvent): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([EVENTS_STORE], 'readwrite');
      const store = transaction.objectStore(EVENTS_STORE);
      
      const eventToStore = {
        ...updatedEvent,
        startTime: updatedEvent.startTime instanceof Date ? updatedEvent.startTime.toISOString() : new Date(updatedEvent.startTime).toISOString(),
        endTime: updatedEvent.endTime ? (updatedEvent.endTime instanceof Date ? updatedEvent.endTime.toISOString() : new Date(updatedEvent.endTime).toISOString()) : undefined
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

  // Goals methods
  async getAllGoals(): Promise<Goal[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([GOALS_STORE], 'readonly');
      const store = transaction.objectStore(GOALS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const goals = request.result.map(goal => ({
          ...goal,
          startDate: new Date(goal.startDate),
          endDate: goal.endDate ? new Date(goal.endDate) : undefined,
          lastUpdated: new Date(goal.lastUpdated)
        }));
        resolve(goals);
      };

      request.onerror = () => {
        console.error('Failed to fetch goals');
        reject(request.error);
      };
    });
  }

  async addGoal(goal: Goal): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([GOALS_STORE], 'readwrite');
      const store = transaction.objectStore(GOALS_STORE);
      
      const goalToStore = {
        ...goal,
        startDate: goal.startDate instanceof Date ? goal.startDate.toISOString() : new Date(goal.startDate).toISOString(),
        endDate: goal.endDate ? (goal.endDate instanceof Date ? goal.endDate.toISOString() : new Date(goal.endDate).toISOString()) : undefined,
        lastUpdated: goal.lastUpdated instanceof Date ? goal.lastUpdated.toISOString() : new Date(goal.lastUpdated).toISOString()
      };

      const request = store.put(goalToStore);

      request.onsuccess = () => {
        console.log('Goal added to database');
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to add goal');
        reject(request.error);
      };
    });
  }

  async updateGoal(_id: string, updatedGoal: Goal): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([GOALS_STORE], 'readwrite');
      const store = transaction.objectStore(GOALS_STORE);
      
      const goalToStore = {
        ...updatedGoal,
        startDate: updatedGoal.startDate instanceof Date ? updatedGoal.startDate.toISOString() : new Date(updatedGoal.startDate).toISOString(),
        endDate: updatedGoal.endDate ? (updatedGoal.endDate instanceof Date ? updatedGoal.endDate.toISOString() : new Date(updatedGoal.endDate).toISOString()) : undefined,
        lastUpdated: updatedGoal.lastUpdated instanceof Date ? updatedGoal.lastUpdated.toISOString() : new Date(updatedGoal.lastUpdated).toISOString()
      };

      const request = store.put(goalToStore);

      request.onsuccess = () => {
        console.log('Goal updated in database');
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to update goal');
        reject(request.error);
      };
    });
  }

  async deleteGoal(id: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([GOALS_STORE], 'readwrite');
      const store = transaction.objectStore(GOALS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('Goal deleted from database');
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to delete goal');
        reject(request.error);
      };
    });
  }

  // Habits methods
  async getAllHabits(): Promise<Habit[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([HABITS_STORE], 'readonly');
      const store = transaction.objectStore(HABITS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const habits = request.result.map(habit => ({
          ...habit,
          createdAt: new Date(habit.createdAt)
        }));
        resolve(habits);
      };

      request.onerror = () => {
        console.error('Failed to fetch habits');
        reject(request.error);
      };
    });
  }

  async addHabit(habit: Habit): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([HABITS_STORE], 'readwrite');
      const store = transaction.objectStore(HABITS_STORE);
      
      const habitToStore = {
        ...habit,
        createdAt: habit.createdAt instanceof Date ? habit.createdAt.toISOString() : new Date(habit.createdAt).toISOString()
      };

      const request = store.put(habitToStore);

      request.onsuccess = () => {
        console.log('Habit added to database');
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to add habit');
        reject(request.error);
      };
    });
  }

  async updateHabit(_id: string, updatedHabit: Habit): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([HABITS_STORE], 'readwrite');
      const store = transaction.objectStore(HABITS_STORE);
      
      const habitToStore = {
        ...updatedHabit,
        createdAt: updatedHabit.createdAt instanceof Date ? updatedHabit.createdAt.toISOString() : new Date(updatedHabit.createdAt).toISOString()
      };

      const request = store.put(habitToStore);

      request.onsuccess = () => {
        console.log('Habit updated in database');
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to update habit');
        reject(request.error);
      };
    });
  }

  async deleteHabit(id: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([HABITS_STORE, HABIT_RECORDS_STORE], 'readwrite');
      const habitsStore = transaction.objectStore(HABITS_STORE);
      const recordsStore = transaction.objectStore(HABIT_RECORDS_STORE);
      
      // Delete habit
      habitsStore.delete(id);
      
      // Delete all related records
      const recordsIndex = recordsStore.index('habitId');
      const recordsRequest = recordsIndex.openCursor(IDBKeyRange.only(id));
      
      recordsRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      transaction.oncomplete = () => {
        console.log('Habit and related records deleted from database');
        resolve();
      };

      transaction.onerror = () => {
        console.error('Failed to delete habit');
        reject(transaction.error);
      };
    });
  }

  // Habit Records methods
  async getAllHabitRecords(): Promise<HabitRecord[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([HABIT_RECORDS_STORE], 'readonly');
      const store = transaction.objectStore(HABIT_RECORDS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to fetch habit records');
        reject(request.error);
      };
    });
  }

  async getHabitRecordsByHabit(habitId: string): Promise<HabitRecord[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([HABIT_RECORDS_STORE], 'readonly');
      const store = transaction.objectStore(HABIT_RECORDS_STORE);
      const index = store.index('habitId');
      const request = index.getAll(habitId);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to fetch habit records by habit');
        reject(request.error);
      };
    });
  }

  async addOrUpdateHabitRecord(record: HabitRecord): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([HABIT_RECORDS_STORE], 'readwrite');
      const store = transaction.objectStore(HABIT_RECORDS_STORE);
      const request = store.put(record);

      request.onsuccess = () => {
        console.log('Habit record saved to database');
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to save habit record');
        reject(request.error);
      };
    });
  }
}

export const databaseService = new DatabaseService();
