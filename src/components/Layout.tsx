import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Users, DollarSign, Calculator, Settings, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function Layout({ children, currentView, onViewChange }: LayoutProps) {
  const { state, setCurrentUser, setCurrentGroup } = useApp();
  const currentGroup = state.groups.find(g => g.id === state.currentGroupId);

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentGroup(null);
  };

  const navItems = [
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'expenses', label: 'Expenses', icon: DollarSign },
    { id: 'balances', label: 'Balances', icon: Calculator },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-emerald-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  SplitWise
                </h1>
              </div>
              {currentGroup && (
                <div className="hidden sm:block">
                  <span className="text-gray-400">•</span>
                  <span className="ml-2 text-gray-700 font-medium">{currentGroup.name}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {state.currentUser && (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {state.currentUser.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden sm:block text-gray-700 font-medium">
                      {state.currentUser.name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Navigation */}
        {state.currentUser && (
          <nav className="w-64 bg-white/50 backdrop-blur-sm border-r border-emerald-100 hidden md:block">
            <div className="p-6">
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => onViewChange(item.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg shadow-emerald-200'
                            : 'text-gray-700 hover:bg-white/70 hover:shadow-sm'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      {state.currentUser && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-emerald-100 z-50">
          <div className="flex justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-emerald-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}