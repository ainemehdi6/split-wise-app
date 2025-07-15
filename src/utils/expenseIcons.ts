import {
  Utensils,
  ShoppingCart,
  Home,
  Car,
  Plane,
  Gift,
  Beer,
  Film,
  Book,
  Heart,
  DollarSign,
  MoreHorizontal
} from 'lucide-react';

export function getSuggestedExpenseIconName(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('restaurant') || lower.includes('dinner') || lower.includes('food')) return 'Utensils';
  if (lower.includes('course') || lower.includes('book')) return 'Book';
  if (lower.includes('cinema') || lower.includes('movie') || lower.includes('film')) return 'Film';
  if (lower.includes('gift') || lower.includes('birthday')) return 'Gift';
  if (lower.includes('beer') || lower.includes('bar') || lower.includes('drink')) return 'Beer';
  if (lower.includes('shopping') || lower.includes('groceries')) return 'ShoppingCart';
  if (lower.includes('house') || lower.includes('rent') || lower.includes('apartment')) return 'Home';
  if (lower.includes('car') || lower.includes('taxi') || lower.includes('uber')) return 'Car';
  if (lower.includes('flight') || lower.includes('plane') || lower.includes('travel')) return 'Plane';
  if (lower.includes('health') || lower.includes('doctor')) return 'Heart';
  if (lower.includes('money') || lower.includes('bank')) return 'DollarSign';
  // Default icon
  return 'MoreHorizontal';
} 