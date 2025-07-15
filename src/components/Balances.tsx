import React from 'react';
import { useApp } from '../contexts/AppContext';
import { calculateBalances, calculateSettlements, formatCurrency } from '../utils/calculations';
import { TrendingUp, TrendingDown, ArrowRight, Calculator } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Balances() {
  const { state } = useApp();
  const { t } = useTranslation();
  
  const currentGroup = state.groups.find(g => g.id === state.currentGroupId);
  const groupExpenses = state.expenses.filter(e => e.groupId === state.currentGroupId);

  if (!currentGroup) {
    return (
      <div className="text-center py-12">
        <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('balances.noGroupSelected')}</h3>
        <p className="text-gray-500">{t('balances.selectGroupMessage')}</p>
      </div>
    );
  }

  const balances = calculateBalances(groupExpenses, currentGroup.members);
  const settlements = calculateSettlements(balances);

  const totalExpenses = groupExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const creditors = balances.filter(b => b.balance > 0.01);
  const debtors = balances.filter(b => b.balance < -0.01);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('balances.balancesTitle')}</h2>
        <p className="text-gray-600 mt-1">{currentGroup.name}</p>
      </div>

      {groupExpenses.length === 0 ? (
        <div className="text-center py-12">
          <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('balances.noExpensesMessage')}</h3>
          <p className="text-gray-500">{t('balances.addExpensesMessage')}</p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('balances.totalExpensesLabel')}</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('balances.peopleOwedLabel')}</p>
                  <p className="text-2xl font-bold text-emerald-600">{creditors.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('balances.peopleOwingLabel')}</p>
                  <p className="text-2xl font-bold text-orange-600">{debtors.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-400 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Individual Balances */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('balances.individualBalancesTitle')}</h3>
            <div className="space-y-3">
              {balances
                .sort((a, b) => b.balance - a.balance)
                .map((balance) => {
                  const user = currentGroup.members.find(m => m.id === balance.userId);
                  if (!user) return null;

                  const isPositive = balance.balance > 0.01;
                  const isNegative = balance.balance < -0.01;
                  const isEven = Math.abs(balance.balance) <= 0.01;

                  return (
                    <div key={balance.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">
                            {isEven ? t('balances.settledUp') : isPositive ? t('balances.getsBack') : t('balances.owes')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          isEven ? 'text-gray-500' :
                          isPositive ? 'text-emerald-600' : 'text-orange-600'
                        }`}>
                          {isEven ? '—' : formatCurrency(Math.abs(balance.balance))}
                        </p>
                        {!isEven && (
                          <div className="flex items-center justify-end space-x-1">
                            {isPositive ? (
                              <TrendingUp className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-orange-600" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Settlement Suggestions */}
          {settlements.length > 0 && (
            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('balances.settlementSuggestionsTitle')}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {t('balances.settlementSuggestionsMessage')}
              </p>
              <div className="space-y-3">
                {settlements.map((settlement, index) => {
                  const fromUser = currentGroup.members.find(m => m.id === settlement.from);
                  const toUser = currentGroup.members.find(m => m.id === settlement.to);
                  
                  if (!fromUser || !toUser) return null;

                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {fromUser.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{fromUser.name}</span>
                        </div>
                        
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {toUser.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{toUser.name}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">
                          {formatCurrency(settlement.amount)}
                        </p>
                        <p className="text-xs text-gray-600">{t('balances.toSettle')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  💡 <strong>{t('balances.tip')}:</strong> {t('balances.tipMessage', { count: settlements.length })}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}