import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Expense, ExpenseParticipant } from '../types';
import { Plus, Edit3, Trash2, Calendar, DollarSign, User } from 'lucide-react';
import { formatCurrency, splitAmountEqually } from '../utils/calculations';

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
  });

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
    });
    setEditingExpense(null);
    setShowModal(false);
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
    });
    setShowModal(true);
  };

  const handleDelete = (expenseId: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">No group selected</h3>
        <p className="text-gray-500">Select a group to manage expenses</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>
          <p className="text-gray-600 mt-1">{currentGroup.name}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {groupExpenses.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
          <p className="text-gray-500 mb-6">Add your first expense to start tracking</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-200"
          >
            Add First Expense
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {groupExpenses
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((expense) => {
              const paidByUser = currentGroup.members.find(m => m.id === expense.paidBy);
              return (
                <div
                  key={expense.id}
                  className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{expense.description}</h3>
                        <span className="text-2xl font-bold text-emerald-600">
                          {formatCurrency(expense.amount)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>Paid by {paidByUser?.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(expense.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 mb-2">Split between:</p>
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
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit expense"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete expense"
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
                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="e.g., Dinner at restaurant"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                      Amount
                    </label>
                    <input
                      type="number"
                      id="amount"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                      Date
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
                    Paid by
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
                    Split between
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
                            placeholder="0.00"
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
                    Split type
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
                      Equal Split
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
                      Custom Split
                    </button>
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-200"
                  >
                    {editingExpense ? 'Update Expense' : 'Add Expense'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}