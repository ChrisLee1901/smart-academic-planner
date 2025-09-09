import type { AcademicEvent } from '../types';
import { databaseService } from './databaseService';

const STORAGE_KEY = 'smart-academic-planner-events';

export const migrateFromLocalStorage = async (): Promise<boolean> => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      console.log('No localStorage data to migrate');
      return false;
    }

    const parsedEvents: AcademicEvent[] = JSON.parse(storedData);
    if (!Array.isArray(parsedEvents) || parsedEvents.length === 0) {
      console.log('No valid events in localStorage to migrate');
      return false;
    }

    // Convert date strings back to Date objects
    const eventsWithDates = parsedEvents.map(event => ({
      ...event,
      startTime: new Date(event.startTime),
      endTime: event.endTime ? new Date(event.endTime) : undefined
    }));

    console.log(`Migrating ${eventsWithDates.length} events from localStorage to database...`);

    // Initialize database
    await databaseService.init();

    // Check if database already has events (avoid duplicate migration)
    const existingEvents = await databaseService.getAllEvents();
    if (existingEvents.length > 0) {
      console.log('Database already has events, skipping migration');
      return false;
    }

    // Migrate each event
    for (const event of eventsWithDates) {
      try {
        await databaseService.addEvent(event);
      } catch (error) {
        console.error('Failed to migrate event:', event.id, error);
      }
    }

    console.log('Migration completed successfully');

    // Optionally clear localStorage after successful migration
    localStorage.removeItem(STORAGE_KEY);
    console.log('Cleared localStorage after migration');

    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
};
