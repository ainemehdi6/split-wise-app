import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, User, Group, Expense } from '../types';

interface AppContextType {
  state: AppState;
  setCurrentUser: (user: User | null) => void;
  addGroup: (group: Group) => void;
  updateGroup: (group: Group) => void;
  setCurrentGroup: (groupId: string | null) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (expenseId: string) => void;
  joinGroup: (groupId: string, user: User) => void;
}

type Action = 
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'ADD_GROUP'; payload: Group }
  | { type: 'UPDATE_GROUP'; payload: Group }
  | { type: 'SET_CURRENT_GROUP'; payload: string | null }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'JOIN_GROUP'; payload: { groupId: string; user: User } }
  | { type: 'LOAD_STATE'; payload: AppState };

const initialState: AppState = {
  currentUser: null,
  groups: [],
  expenses: [],
  currentGroupId: null,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'ADD_GROUP':
      return { ...state, groups: [...state.groups, action.payload] };
    case 'UPDATE_GROUP':
      return {
        ...state,
        groups: state.groups.map(group =>
          group.id === action.payload.id ? action.payload : group
        ),
      };
    case 'SET_CURRENT_GROUP':
      return { ...state, currentGroupId: action.payload };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id ? action.payload : expense
        ),
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload),
      };
    case 'JOIN_GROUP':
      return {
        ...state,
        groups: state.groups.map(group =>
          group.id === action.payload.groupId
            ? { ...group, members: [...group.members, action.payload.user] }
            : group
        ),
      };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('splitwise-app-state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'LOAD_STATE', payload: parsedState });
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('splitwise-app-state', JSON.stringify(state));
  }, [state]);

  const contextValue: AppContextType = {
    state,
    setCurrentUser: (user) => dispatch({ type: 'SET_CURRENT_USER', payload: user }),
    addGroup: (group) => dispatch({ type: 'ADD_GROUP', payload: group }),
    updateGroup: (group) => dispatch({ type: 'UPDATE_GROUP', payload: group }),
    setCurrentGroup: (groupId) => dispatch({ type: 'SET_CURRENT_GROUP', payload: groupId }),
    addExpense: (expense) => dispatch({ type: 'ADD_EXPENSE', payload: expense }),
    updateExpense: (expense) => dispatch({ type: 'UPDATE_EXPENSE', payload: expense }),
    deleteExpense: (expenseId) => dispatch({ type: 'DELETE_EXPENSE', payload: expenseId }),
    joinGroup: (groupId, user) => dispatch({ type: 'JOIN_GROUP', payload: { groupId, user } }),
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}