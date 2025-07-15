import React from 'react';
import { render, screen } from '@testing-library/react';
import Settings from '../Settings';
import { AppProvider } from '../../contexts/AppContext';

describe('Settings component', () => {
  it('renders at least one Export Data button', () => {
    render(
      <AppProvider>
        <Settings />
      </AppProvider>
    );
    const exportButtons = screen.getAllByRole('button', { name: /export data/i });
    expect(exportButtons.length).toBeGreaterThan(0);
  });

  it('renders at least one Import Data label', () => {
    render(
      <AppProvider>
        <Settings />
      </AppProvider>
    );
    const importLabels = screen.getAllByText(/import data/i);
    expect(importLabels.length).toBeGreaterThan(0);
  });
}); 