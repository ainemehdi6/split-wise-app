import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { User } from '../types';
import { DollarSign, Mail, UserPlus, LogIn } from 'lucide-react';

export default function Auth() {
  const { setCurrentUser } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim()) return;
    if (!isLogin && !formData.name.trim()) return;

    const user: User = {
      id: Date.now().toString(),
      name: formData.name || formData.email.split('@')[0],
      email: formData.email,
    };

    setCurrentUser(user);
  };

  const handleGuestAccess = () => {
    const guestUser: User = {
      id: `guest-${Date.now()}`,
      name: 'Guest User',
      email: 'guest@example.com',
    };
    setCurrentUser(guestUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl mb-4">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            SplitWise
          </h1>
          <p className="text-gray-600 mt-2">
            Split expenses with friends and family
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                isLogin
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                !isLogin
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Enter your full name"
                  required={!isLogin}
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-600 hover:to-blue-600 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              <span>{isLogin ? 'Login' : 'Sign Up'}</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleGuestAccess}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
            >
              Continue as Guest
            </button>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Demo app - Data is stored locally in your browser
        </p>
      </div>
    </div>
  );
}