import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Download, Upload, Trash2, Settings as SettingsIcon, User, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Settings() {
  const { state, setCurrentUser } = useApp();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { t, i18n } = useTranslation();

  const exportData = () => {
    const dataToExport = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: {
        currentUser: state.currentUser,
        groups: state.groups,
        expenses: state.expenses,
      },
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `splitwise-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (importedData.data) {
          localStorage.setItem('splitwise-app-state', JSON.stringify(importedData.data));
          window.location.reload();
        }
      } catch (error) {
        alert('Invalid file format. Please select a valid SplitWise export file.');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    localStorage.removeItem('splitwise-app-state');
    setCurrentUser(null);
    window.location.reload();
  };

  const updateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would update the user profile
    alert('Profile update functionality would be implemented here');
  };

  return (
    <div className="space-y-6">
      {/* Sélecteur de langue */}
      <div className="flex justify-end mb-4">
        <label htmlFor="lang-select" className="mr-2 font-medium">{t('settings.language')}:</label>
        <select
          id="lang-select"
          value={i18n.language}
          onChange={e => i18n.changeLanguage(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="en">English</option>
          <option value="fr">Français</option>
        </select>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h2>
        <p className="text-gray-600 mt-1">{t('settings.description')}</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <User className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">{t('settings.profile.title')}</h3>
        </div>
        
        {state.currentUser && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-medium">
                  {state.currentUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900">{state.currentUser.name}</h4>
                <p className="text-gray-600">{state.currentUser.email}</p>
              </div>
            </div>
            
            <form onSubmit={updateProfile} className="space-y-4">
              <div>
                <label htmlFor="profileName" className="block text-sm font-medium text-gray-700 mb-2">{t('settings.profile.display_name')}</label>
                <input
                  type="text"
                  id="profileName"
                  defaultValue={state.currentUser.name}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="profileEmail" className="block text-sm font-medium text-gray-700 mb-2">{t('settings.profile.email_address')}</label>
                <input
                  type="email"
                  id="profileEmail"
                  defaultValue={state.currentUser.email}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-200"
              >
                {t('settings.profile.update_profile')}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Data Management Section */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Database className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">{t('settings.data_management.title')}</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{t('settings.data_management.export_data')}</h4>
            <p className="text-sm text-gray-600 mb-3">{t('settings.data_management.export_description')}</p>
            <button
              onClick={exportData}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{t('settings.data_management.export_button')}</span>
            </button>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{t('settings.data_management.import_data')}</h4>
            <p className="text-sm text-gray-600 mb-3">{t('settings.data_management.import_description')}</p>
            <label className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>{t('settings.data_management.import_button')}</span>
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <SettingsIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">{t('settings.app_statistics.title')}</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{state.groups.length}</div>
            <div className="text-sm text-gray-600">{t('settings.app_statistics.groups')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{state.expenses.length}</div>
            <div className="text-sm text-gray-600">{t('settings.app_statistics.expenses')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {state.groups.reduce((sum, group) => sum + group.members.length, 0)}
            </div>
            <div className="text-sm text-gray-600">{t('settings.app_statistics.total_members')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              ${state.expenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">{t('settings.app_statistics.total_spent')}</div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Trash2 className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-red-900">{t('settings.danger_zone.title')}</h3>
        </div>
        
        <div>
          <h4 className="font-medium text-red-900 mb-2">{t('settings.danger_zone.clear_all_data')}</h4>
          <p className="text-sm text-red-700 mb-4">{t('settings.danger_zone.clear_all_data_description')}</p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {t('settings.danger_zone.clear_all_data_button')}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-red-900">
                {t('settings.danger_zone.confirm_clear_all_data')}
              </p>
              <div className="space-x-3">
                <button
                  onClick={clearAllData}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {t('settings.danger_zone.confirm_clear_all_data_yes')}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  {t('settings.danger_zone.confirm_clear_all_data_cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm">
        <p>{t('settings.footer')}</p>
      </div>
    </div>
  );
}