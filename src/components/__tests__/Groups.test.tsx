import React from 'react';
import { render, screen } from '@testing-library/react';
import Groups from '../Groups';
import { AppProvider } from '../../contexts/AppContext';

describe('Groups component', () => {
  it('renders create group button', () => {
    render(
      <AppProvider>
        <Groups />
      </AppProvider>
    );
    expect(screen.getByRole('button', { name: /create group/i })).toBeInTheDocument();
  });

  it('renders join group button', () => {
    render(
      <AppProvider>
        <Groups />
      </AppProvider>
    );
    expect(screen.getByRole('button', { name: /join group/i })).toBeInTheDocument();
  });
}); 