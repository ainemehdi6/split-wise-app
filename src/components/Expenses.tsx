import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Expense, ExpenseParticipant } from '../types';
import { Plus, Edit3, Trash2, Calendar, DollarSign, User } from 'lucide-react';
import { formatCurrency, splitAmountEqually } from '../utils/calculations';
import { useTranslation } from 'react-i18next';
import { getSuggestedExpenseIconName } from '../utils/expenseIcons';
import * as LucideIcons from 'lucide-react';

export default function Expenses() {
  const { state, addExpense, updateExpense, deleteExpense } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    paidBy: '',
    date: new Date().toISOString().split('T')[0],
    participants: [] as string[],
    customShares: {} as { [userId: string]: string },
    splitType: 'equal' as 'equal' | 'custom',
    attachment: '' as string,
  });
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [icon, setIcon] = useState<string | undefined>(editingExpense?.icon);

  const { t } = useTranslation();

  const currentGroup = state.groups.find(g => g.id === state.currentGroupId);
  const groupExpenses = state.expenses.filter(e => e.groupId === state.currentGroupId);

  React.useEffect(() => {
    if (currentGroup && state.currentUser) {
      setFormData(prev => ({
        ...prev,
        paidBy: prev.paidBy || state.currentUser!.id,
        participants: prev.participants.length === 0 ? [state.currentUser!.id] : prev.participants,
      }));
    }
  }, [currentGroup, state.currentUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, attachment: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGroup || !state.currentUser || !formData.description.trim() || !formData.amount || formData.participants.length === 0) return;

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) return;

    let participants: ExpenseParticipant[];
    
    if (formData.splitType === 'equal') {
      const shareAmount = splitAmountEqually(amount, formData.participants.length);
      participants = formData.participants.map(userId => ({
        userId,
        share: shareAmount,
      }));
    } else {
      participants = formData.participants.map(userId => ({
        userId,
        share: parseFloat(formData.customShares[userId] || '0'),
      }));
    }

    const expense: Expense = {
      id: editingExpense?.id || Date.now().toString(),
      groupId: currentGroup.id,
      description: formData.description.trim(),
      amount,
      paidBy: formData.paidBy,
      date: formData.date,
      participants,
      createdAt: editingExpense?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachment: formData.attachment || undefined,
      icon: icon || undefined,
    };

    if (editingExpense) {
      updateExpense(expense);
    } else {
      addExpense(expense);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      paidBy: state.currentUser?.id || '',
      date: new Date().toISOString().split('T')[0],
      participants: state.currentUser ? [state.currentUser.id] : [],
      customShares: {},
      splitType: 'equal',
      attachment: '',
    });
    setEditingExpense(null);
    setShowModal(false);
    setIcon(undefined); // Reset icon when closing modal
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      paidBy: expense.paidBy,
      date: expense.date,
      participants: expense.participants.map(p => p.userId),
      customShares: expense.participants.reduce((acc, p) => ({ ...acc, [p.userId]: p.share.toString() }), {}),
      splitType: 'custom',
      attachment: expense.attachment || '',
    });
    setIcon(expense.icon);
    setShowModal(true);
  };

  const handleDelete = (expenseId: string) => {
    if (confirm(t('confirm_delete_expense'))) {
      deleteExpense(expenseId);
    }
  };

  const toggleParticipant = (userId: string) => {
    const isIncluded = formData.participants.includes(userId);
    const newParticipants = isIncluded
      ? formData.participants.filter(id => id !== userId)
      : [...formData.participants, userId];
    
    setFormData({ ...formData, participants: newParticipants });
  };

  const updateCustomShare = (userId: string, share: string) => {
    setFormData({
      ...formData,
      customShares: { ...formData.customShares, [userId]: share },
    });
  };

  if (!currentGroup) {
    return (
      <div className="text-center py-12">
        <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_group_selected')}</h3>
        <p className="text-gray-500">{t('select_group_to_manage_expenses')}</p>
      </div>
    );
  }

  const suggestedIconName = getSuggestedExpenseIconName(formData.description || '');
  const IconComponent = (LucideIcons as any)[icon || suggestedIconName] || LucideIcons.MoreHorizontal;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('expenses')}</h2>
          <p className="text-gray-600 mt-1">{currentGroup.name}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('add_expense')}</span>
        </button>
      </div>

      {groupExpenses.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_expenses_yet')}</h3>
          <p className="text-gray-500 mb-6">{t('add_your_first_expense_to_start_tracking')}</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-200"
          >
            {t('add_first_expense')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {groupExpenses
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((expense) => {
              const paidByUser = currentGroup.members.find(m => m.id === expense.paidBy);
              const ExpenseIcon = (LucideIcons as any)[expense.icon || getSuggestedExpenseIconName(expense.description)] || LucideIcons.MoreHorizontal;
              return (
                <div
                  key={expense.id}
                  className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <ExpenseIcon className="w-6 h-6 text-emerald-600" />
                        <span className="font-semibold text-gray-900">{expense.description}</span>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{t('paid_by')} {paidByUser?.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(expense.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 mb-2">{t('split_between')}:</p>
                        <div className="flex flex-wrap gap-2">
                          {expense.participants.map((participant) => {
                            const user = currentGroup.members.find(m => m.id === participant.userId);
                            return (
                              <div
                                key={participant.userId}
                                className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1"
                              >
                                <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-medium">
                                    {user?.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-sm font-medium">{user?.name}</span>
                                <span className="text-sm text-gray-600">
                                  {formatCurrency(participant.share)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      {expense.attachment && (
                        <div className="mt-4">
                          <img src={expense.attachment} alt="Expense attachment" className="max-h-40 rounded-lg border" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={t('edit_expense')}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={t('delete_expense')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Add/Edit Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {editingExpense ? t('edit_expense') : t('add_new_expense')}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('description')}
                  </label>
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-6 h-6 text-emerald-600" />
                    <input
                      type="text"
                      id="description"
                      value={formData.description}
                      onChange={e => {
                        setFormData({ ...formData, description: e.target.value });
                        if (!icon) setIcon(undefined); // reset icon to suggestion if pas d'override
                      }}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder={t('expense_description_placeholder')}
                      required
                    />
                    {/* bouton pour ouvrir la sélection d’icône */}
                    <button type="button" onClick={() => setShowIconPicker(true)} title="Change icon">
                      <LucideIcons.Palette className="w-5 h-5 text-gray-400 hover:text-emerald-600" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('amount')}
                    </label>
                    <input
                      type="number"
                      id="amount"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder={t('amount_placeholder')}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('date')}
                    </label>
                    <input
                      type="date"
                      id="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="paidBy" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('paid_by')}
                  </label>
                  <select
                    id="paidBy"
                    value={formData.paidBy}
                    onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    required
                  >
                    {currentGroup.members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('split_between')}
                  </label>
                  <div className="space-y-2">
                    {currentGroup.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={formData.participants.includes(member.id)}
                            onChange={() => toggleParticipant(member.id)}
                            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                          />
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium">{member.name}</span>
                          </div>
                        </div>
                        
                        {formData.participants.includes(member.id) && formData.splitType === 'custom' && (
                          <input
                            type="number"
                            value={formData.customShares[member.id] || ''}
                            onChange={e => updateCustomShare(member.id, e.target.value)}
                            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder={t('custom_share_placeholder')}
                            step="0.01"
                            min="0"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('split_type')}
                  </label>
                  <div className="flex rounded-lg bg-gray-100 p-1">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, splitType: 'equal' })}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                        formData.splitType === 'equal'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {t('equal_split')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, splitType: 'custom' })}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                        formData.splitType === 'custom'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {t('custom_split')}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('attachment_optional')}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                  {formData.attachment && (
                    <img src={formData.attachment} alt="Attachment preview" className="mt-2 max-h-32 rounded-lg border" />
                  )}
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-200"
                  >
                    {editingExpense ? t('update_expense') : t('add_expense')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal ou menu pour choisir une icône (exemple simple) */}
      {showIconPicker && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 shadow-xl max-w-md w-full">
            <div className="grid grid-cols-6 gap-3 max-h-60 overflow-y-auto">
              {['Utensils','ShoppingCart','Home','Car','Plane','Gift','Beer','Film','Book','Heart','DollarSign','MoreHorizontal'].map(name => {
                const Comp = (LucideIcons as any)[name];
                return (
                  <button key={name} onClick={() => { setIcon(name); setShowIconPicker(false); }} className="p-2 hover:bg-emerald-100 rounded">
                    <Comp className="w-7 h-7" />
                  </button>
                );
              })}
            </div>
            <button onClick={() => setShowIconPicker(false)} className="mt-4 px-4 py-2 bg-gray-200 rounded">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}