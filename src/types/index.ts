export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: User[];
  createdBy: string;
  createdAt: string;
  inviteCode?: string;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidBy: string;
  date: string;
  participants: ExpenseParticipant[];
  createdAt: string;
  updatedAt: string;
  attachment?: string; // base64 image data or image URL
}

export interface ExpenseParticipant {
  userId: string;
  share: number; // Amount this person owes
}

export interface Balance {
  userId: string;
  balance: number; // Positive = owed money, Negative = owes money
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export interface AppState {
  currentUser: User | null;
  groups: Group[];
  expenses: Expense[];
  currentGroupId: string | null;
}