import React, { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Groups from './components/Groups';
import Expenses from './components/Expenses';
import Balances from './components/Balances';
import Settings from './components/Settings';

function AppContent() {
  const { state } = useApp();
  const [currentView, setCurrentView] = useState('groups');

  if (!state.currentUser) {
    return <Auth />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'groups':
        return <Groups />;
      case 'expenses':
        return <Expenses />;
      case 'balances':
        return <Balances />;
      case 'settings':
        return <Settings />;
      default:
        return <Groups />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderCurrentView()}
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;