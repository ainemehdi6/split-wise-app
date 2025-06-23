import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Group, User } from '../types';
import { Plus, Users, Calendar, Copy, Check, Trash2, UserPlus } from 'lucide-react';
import { generateInviteCode } from '../utils/calculations';

export default function Groups() {
  const { state, addGroup, setCurrentGroup, updateGroup } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !state.currentUser) return;

    const group: Group = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      members: [state.currentUser],
      createdBy: state.currentUser.id,
      createdAt: new Date().toISOString(),
      inviteCode: generateInviteCode(),
    };

    addGroup(group);
    setFormData({ name: '', description: '' });
    setShowCreateModal(false);
  };

  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim() || !state.currentUser) return;

    const group = state.groups.find(g => g.inviteCode === inviteCode.trim().toUpperCase());
    if (group && !group.members.find(m => m.id === state.currentUser.id)) {
      const updatedGroup = {
        ...group,
        members: [...group.members, state.currentUser],
      };
      updateGroup(updatedGroup);
      setInviteCode('');
      setShowJoinModal(false);
      setCurrentGroup(group.id);
    }
  };

  const copyInviteCode = async (code: string, groupId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(groupId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy invite code:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Groups</h2>
          <p className="text-gray-600 mt-1">Manage your expense groups</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Join Group</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Group</span>
          </button>
        </div>
      </div>

      {state.groups.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No groups yet</h3>
          <p className="text-gray-500 mb-6">Create your first group to start splitting expenses</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-200"
          >
            Create Your First Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.groups.map((group) => (
            <div
              key={group.id}
              className={`bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer ${
                state.currentGroupId === group.id ? 'ring-2 ring-emerald-500' : ''
              }`}
              onClick={() => setCurrentGroup(group.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{group.name}</h3>
                {state.currentGroupId === group.id && (
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                )}
              </div>
              
              {group.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{group.description}</p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{group.members.length} members</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(group.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {group.members.slice(0, 3).map((member) => (
                    <div
                      key={member.id}
                      className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full border-2 border-white flex items-center justify-center"
                      title={member.name}
                    >
                      <span className="text-white text-xs font-medium">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  ))}
                  {group.members.length > 3 && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-gray-600 text-xs font-medium">
                        +{group.members.length - 3}
                      </span>
                    </div>
                  )}
                </div>
                
                {group.inviteCode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyInviteCode(group.inviteCode!, group.id);
                    }}
                    className="flex items-center space-x-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    title="Copy invite code"
                  >
                    {copiedId === group.id ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                    <span className="text-xs font-mono">{group.inviteCode}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Create New Group</h3>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  id="groupName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="e.g., Weekend Trip, Roommates"
                  required
                />
              </div>
              <div>
                <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="groupDescription"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Brief description of the group"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-200"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Join Group</h3>
            <form onSubmit={handleJoinGroup} className="space-y-4">
              <div>
                <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Invite Code
                </label>
                <input
                  type="text"
                  id="inviteCode"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors font-mono uppercase"
                  placeholder="Enter 6-character code"
                  maxLength={6}
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-200"
                >
                  Join Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}