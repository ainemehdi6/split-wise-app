import React from 'react';
import { render, screen } from '@testing-library/react';
import Balances from '../Balances';
import { AppProvider } from '../../contexts/AppContext';

describe('Balances component', () => {
  it('renders empty state message if no group selected', () => {
    render(
      <AppProvider>
        <Balances />
      </AppProvider>
    );
    expect(screen.getByText(/no group selected/i)).toBeInTheDocument();
  });
}); 