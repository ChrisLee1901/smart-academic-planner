import { create } from 'zustand';
import { databaseService, type Goal } from '../services/databaseService';

interface GoalStore {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  
  // Actions
  loadGoals: () => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: [],
  isLoading: false,
  error: null,
  initialized: false,

  loadGoals: async () => {
    set({ isLoading: true, error: null });
    
    try {
      await databaseService.init();
      const goals = await databaseService.getAllGoals();
      set({ goals, isLoading: false, initialized: true });
    } catch (error) {
      console.error('Failed to load goals:', error);
      set({ 
        error: 'Failed to load goals. Please try again.', 
        isLoading: false,
        initialized: true
      });
    }
  },

  addGoal: async (goalData) => {
    set({ isLoading: true, error: null });
    
    try {
      const goal: Goal = {
        ...goalData,
        id: Date.now().toString(),
        current: 0,
        status: 'active',
        streak: 0,
        lastUpdated: new Date()
      };

      await databaseService.addGoal(goal);
      
      const currentGoals = get().goals;
      set({ 
        goals: [...currentGoals, goal], 
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to add goal:', error);
      set({ 
        error: 'Failed to add goal. Please try again.', 
        isLoading: false 
      });
      throw error;
    }
  },

  updateGoal: async (id, updates) => {
    console.log('goalStore.updateGoal called:', { id, updates });
    set({ isLoading: true, error: null });
    
    try {
      const currentGoals = get().goals;
      const goalIndex = currentGoals.findIndex(g => g.id === id);
      
      console.log('Current goals:', currentGoals.length);
      console.log('Goal index:', goalIndex);
      
      if (goalIndex === -1) {
        console.error('Goal not found in store:', id);
        throw new Error('Goal not found');
      }

      const updatedGoal = {
        ...currentGoals[goalIndex],
        ...updates,
        lastUpdated: new Date()
      };

      console.log('Updating goal in database:', updatedGoal);
      await databaseService.updateGoal(id, updatedGoal);
      
      const newGoals = [...currentGoals];
      newGoals[goalIndex] = updatedGoal;
      
      console.log('Goal updated successfully in store');
      set({ 
        goals: newGoals, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to update goal:', error);
      set({ 
        error: 'Failed to update goal. Please try again.', 
        isLoading: false 
      });
      throw error;
    }
  },

  deleteGoal: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      await databaseService.deleteGoal(id);
      
      const currentGoals = get().goals;
      set({ 
        goals: currentGoals.filter(g => g.id !== id), 
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to delete goal:', error);
      set({ 
        error: 'Failed to delete goal. Please try again.', 
        isLoading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));