import React, { useState, useEffect } from 'react';
import { IconAlertCircle, IconPlus, IconEdit, IconTrash, IconCheckCircle } from '../icons';
import api from '../../services/api';

interface Announcement {
  id: number;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  active: boolean;
  expires_at?: string;
  created_at: string;
}

const AnnouncementManagement: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    active: true,
    expires_at: '',
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await api.announcements.getAll({ active: 'all' });
      if (response.success && response.data) {
        setAnnouncements(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        await api.announcements.update(editingItem.id.toString(), formData);
      } else {
        await api.announcements.create(formData);
      }

      setShowModal(false);
      setEditingItem(null);
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('Failed to save announcement');
    }
  };

  const handleEdit = (item: Announcement) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      message: item.message,
      priority: item.priority,
      active: item.active,
      expires_at: item.expires_at || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await api.announcements.delete(id.toString());
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Failed to delete announcement');
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await api.announcements.toggleActive(id.toString());
      fetchAnnouncements();
    } catch (error) {
      console.error('Error toggling announcement:', error);
      alert('Failed to update announcement');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      priority: 'medium',
      active: true,
      expires_at: '',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <IconAlertCircle className="w-8 h-8 text-orange-600" />
            Announcement Management
          </h2>
          <p className="text-gray-600 mt-1">Create and manage system announcements</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            resetForm();
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-700 hover:to-red-700 shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
        >
          <IconPlus className="w-5 h-5" />
          New Announcement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-xl p-6 border-2 border-orange-200">
          <p className="text-orange-700 font-semibold mb-2">Total</p>
          <p className="text-4xl font-extrabold text-orange-800">{announcements.length}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl p-6 border-2 border-green-200">
          <p className="text-green-700 font-semibold mb-2">Active</p>
          <p className="text-4xl font-extrabold text-green-800">
            {announcements.filter(a => a.active).length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl shadow-xl p-6 border-2 border-red-200">
          <p className="text-red-700 font-semibold mb-2">High Priority</p>
          <p className="text-4xl font-extrabold text-red-800">
            {announcements.filter(a => a.priority === 'high').length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl shadow-xl p-6 border-2 border-gray-200">
          <p className="text-gray-700 font-semibold mb-2">Inactive</p>
          <p className="text-4xl font-extrabold text-gray-800">
            {announcements.filter(a => !a.active).length}
          </p>
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading announcements...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <IconAlertCircle className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600 font-semibold">No announcements yet</p>
          <p className="text-gray-500 mt-2">Create your first announcement to notify users</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`rounded-2xl shadow-lg p-6 border-2 ${
                announcement.active ? getPriorityColor(announcement.priority) : 'bg-gray-50 border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{announcement.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      announcement.priority === 'high'
                        ? 'bg-red-500 text-white'
                        : announcement.priority === 'medium'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-blue-500 text-white'
                    }`}>
                      {announcement.priority.toUpperCase()}
                    </span>
                    {announcement.active ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white flex items-center gap-1">
                        <IconCheckCircle className="w-3 h-3" />
                        ACTIVE
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-500 text-white">
                        INACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-3">{announcement.message}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Created: {new Date(announcement.created_at).toLocaleDateString()}</span>
                    {announcement.expires_at && (
                      <span>Expires: {new Date(announcement.expires_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(announcement.id)}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                    announcement.active
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {announcement.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleEdit(announcement)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <IconEdit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(announcement.id)}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                >
                  <IconTrash className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              {editingItem ? 'Edit Announcement' : 'New Announcement'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Expires At (Optional)</label>
                  <input
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-5 h-5 text-orange-600"
                />
                <label className="text-sm font-semibold text-gray-700">Active (visible to users)</label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-700 hover:to-red-700 shadow-lg transform hover:scale-105 transition-all"
                >
                  {editingItem ? 'Update' : 'Create'} Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementManagement;
