import { Expense, Balance, Settlement, User } from '../types';

export function calculateBalances(expenses: Expense[], members: User[]): Balance[] {
  const balances: { [userId: string]: number } = {};
  
  // Initialize balances for all members
  members.forEach(member => {
    balances[member.id] = 0;
  });

  expenses.forEach(expense => {
    // Add the amount paid to the payer's balance
    balances[expense.paidBy] += expense.amount;
    
    // Subtract each participant's share from their balance
    expense.participants.forEach(participant => {
      balances[participant.userId] -= participant.share;
    });
  });

  return Object.entries(balances).map(([userId, balance]) => ({
    userId,
    balance: Math.round(balance * 100) / 100, // Round to 2 decimal places
  }));
}

export function calculateSettlements(balances: Balance[]): Settlement[] {
  const settlements: Settlement[] = [];
  const debtors = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);
  const creditors = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);

  let i = 0, j = 0;
  
  while (i < debtors.length && j < creditors.length) {
    const debt = Math.abs(debtors[i].balance);
    const credit = creditors[j].balance;
    const settlement = Math.min(debt, credit);
    
    if (settlement > 0.01) { // Only create settlements for amounts > 1 cent
      settlements.push({
        from: debtors[i].userId,
        to: creditors[j].userId,
        amount: Math.round(settlement * 100) / 100,
      });
    }
    
    debtors[i].balance += settlement;
    creditors[j].balance -= settlement;
    
    if (Math.abs(debtors[i].balance) < 0.01) i++;
    if (Math.abs(creditors[j].balance) < 0.01) j++;
  }
  
  return settlements;
}

export function splitAmountEqually(amount: number, participants: number): number {
  return Math.round((amount / participants) * 100) / 100;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}