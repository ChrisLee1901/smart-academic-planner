import { create } from 'zustand';
import { databaseService, type Habit, type HabitRecord } from '../services/databaseService';

interface HabitStore {
  habits: Habit[];
  records: HabitRecord[];
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  
  // Actions
  loadHabits: () => Promise<void>;
  loadRecords: () => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitCompletion: (habitId: string, date: string) => Promise<void>;
  clearError: () => void;
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  records: [],
  isLoading: false,
  error: null,
  initialized: false,

  loadHabits: async () => {
    set({ isLoading: true, error: null });
    
    try {
      await databaseService.init();
      const habits = await databaseService.getAllHabits();
      set({ habits, isLoading: false, initialized: true });
    } catch (error) {
      console.error('Failed to load habits:', error);
      set({ 
        error: 'Failed to load habits. Please try again.', 
        isLoading: false,
        initialized: true
      });
    }
  },

  loadRecords: async () => {
    try {
      const records = await databaseService.getAllHabitRecords();
      set({ records });
    } catch (error) {
      console.error('Failed to load habit records:', error);
      set({ error: 'Failed to load habit records. Please try again.' });
    }
  },

  addHabit: async (habitData) => {
    set({ isLoading: true, error: null });
    
    try {
      const habit: Habit = {
        ...habitData,
        id: Date.now().toString(),
        createdAt: new Date(),
        isActive: true
      };

      await databaseService.addHabit(habit);
      
      const currentHabits = get().habits;
      set({ 
        habits: [...currentHabits, habit], 
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to add habit:', error);
      set({ 
        error: 'Failed to add habit. Please try again.', 
        isLoading: false 
      });
      throw error;
    }
  },

  updateHabit: async (id, updates) => {
    set({ isLoading: true, error: null });
    
    try {
      const currentHabits = get().habits;
      const habitIndex = currentHabits.findIndex(h => h.id === id);
      
      if (habitIndex === -1) {
        throw new Error('Habit not found');
      }

      const updatedHabit = {
        ...currentHabits[habitIndex],
        ...updates
      };

      await databaseService.updateHabit(id, updatedHabit);
      
      const newHabits = [...currentHabits];
      newHabits[habitIndex] = updatedHabit;
      
      set({ 
        habits: newHabits, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to update habit:', error);
      set({ 
        error: 'Failed to update habit. Please try again.', 
        isLoading: false 
      });
      throw error;
    }
  },

  deleteHabit: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      await databaseService.deleteHabit(id);
      
      const currentHabits = get().habits;
      const currentRecords = get().records;
      
      set({ 
        habits: currentHabits.filter(h => h.id !== id),
        records: currentRecords.filter(r => r.habitId !== id),
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to delete habit:', error);
      set({ 
        error: 'Failed to delete habit. Please try again.', 
        isLoading: false 
      });
      throw error;
    }
  },

  toggleHabitCompletion: async (habitId, date) => {
    try {
      const currentRecords = get().records;
      const existingRecord = currentRecords.find(
        r => r.habitId === habitId && r.date === date
      );

      let newRecord: HabitRecord;
      
      if (existingRecord) {
        newRecord = {
          ...existingRecord,
          completed: !existingRecord.completed
        };
      } else {
        newRecord = {
          habitId,
          date,
          completed: true
        };
      }

      await databaseService.addOrUpdateHabitRecord(newRecord);
      
      const newRecords = existingRecord 
        ? currentRecords.map(r => 
            r.habitId === habitId && r.date === date ? newRecord : r
          )
        : [...currentRecords, newRecord];
      
      set({ records: newRecords });
    } catch (error) {
      console.error('Failed to toggle habit completion:', error);
      set({ error: 'Failed to update habit completion. Please try again.' });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));