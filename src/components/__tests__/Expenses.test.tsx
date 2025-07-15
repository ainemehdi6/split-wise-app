import React from 'react';
import { render, screen } from '@testing-library/react';
import Expenses from '../Expenses';
import { AppProvider } from '../../contexts/AppContext';

describe('Expenses component', () => {
  it('renders empty state message if no group selected', () => {
    render(
      <AppProvider>
        <Expenses />
      </AppProvider>
    );
    expect(screen.getByText(/no group selected/i)).toBeInTheDocument();
  });
}); 