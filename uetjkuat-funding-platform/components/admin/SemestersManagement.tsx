import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from './shared/DataTable';
import { StatCard } from './shared/StatCard';
import { FilterBar } from './shared/FilterBar';
import { ApiResponse } from '../../types/backend';
import {
  Calendar, Plus, X, Edit2, Trash2, CheckCircle, XCircle, Clock
} from 'lucide-react';
import api from '../../services/api';

interface Semester {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function SemestersManagement({ className = '' }: { className?: string }) {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    is_active: false,
  });

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      const response: ApiResponse<Semester[]> = await api.semesters.getAll();
      if (response.success && response.data) {
        setSemesters(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching semesters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response: ApiResponse<Semester> = await api.semesters.create(formData);
      if (response.success) {
        await fetchSemesters();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating semester:', error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedSemester) return;
    try {
      const response: ApiResponse<Semester> = await api.semesters.update(selectedSemester.id.toString(), formData);
      if (response.success) {
        await fetchSemesters();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating semester:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this semester?')) return;
    try {
      const response: ApiResponse = await api.semesters.delete(id.toString());
      if (response.success) {
        await fetchSemesters();
      }
    } catch (error) {
      console.error('Error deleting semester:', error);
    }
  };

  const handleActivate = async (id: number) => {
    try {
      const response: ApiResponse = await api.semesters.activate(id.toString());
      if (response.success) {
        await fetchSemesters();
      }
    } catch (error) {
      console.error('Error activating semester:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      start_date: '',
      end_date: '',
      is_active: false,
    });
    setSelectedSemester(null);
    setIsCreating(false);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreating(true);
    setShowModal(true);
  };

  const openEditModal = (semester: Semester) => {
    setSelectedSemester(semester);
    setFormData({
      name: semester.name,
      start_date: semester.start_date,
      end_date: semester.end_date,
      is_active: semester.is_active,
    });
    setIsCreating(false);
    setShowModal(true);
  };

  const filteredSemesters = useMemo(() => {
    let filtered = [...semesters];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(semester =>
        semester.name.toLowerCase().includes(query)
      );
    }

    if (statusFilter === 'active') {
      filtered = filtered.filter(semester => semester.is_active);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(semester => !semester.is_active);
    }

    return filtered;
  }, [semesters, searchQuery, statusFilter]);

  const stats = {
    total: semesters.length,
    active: semesters.filter(s => s.is_active).length,
    upcoming: semesters.filter(s => new Date(s.start_date) > new Date()).length,
    past: semesters.filter(s => new Date(s.end_date) < new Date()).length,
  };

  const columns = [
    {
      key: 'name',
      header: 'Semester Name',
      render: (semester: Semester) => (
        <div className="font-medium text-gray-900">{semester.name}</div>
      )
    },
    {
      key: 'dates',
      header: 'Period',
      render: (semester: Semester) => (
        <div className="text-sm text-gray-600">
          {new Date(semester.start_date).toLocaleDateString()} - {new Date(semester.end_date).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (semester: Semester) => {
        const now = new Date();
        const start = new Date(semester.start_date);
        const end = new Date(semester.end_date);

        let statusText = 'Upcoming';
        let statusColor = 'bg-blue-100 text-blue-800';

        if (semester.is_active && now >= start && now <= end) {
          statusText = 'Active';
          statusColor = 'bg-green-100 text-green-800';
        } else if (now > end) {
          statusText = 'Past';
          statusColor = 'bg-gray-100 text-gray-800';
        }

        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
            {statusText}
          </span>
        );
      }
    },
    {
      key: 'active',
      header: 'Activated',
      render: (semester: Semester) => semester.is_active ? (
        <CheckCircle className="w-5 h-5 text-green-600" />
      ) : (
        <XCircle className="w-5 h-5 text-gray-400" />
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (semester: Semester) => (
        <div className="flex items-center space-x-2">
          {!semester.is_active && (
            <button
              onClick={() => handleActivate(semester.id)}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
              title="Activate"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => openEditModal(semester)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(semester.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Semesters Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage academic periods and semesters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Semesters" value={stats.total.toString()} icon={Calendar} gradient="blue" loading={loading} />
        <StatCard title="Active" value={stats.active.toString()} icon={CheckCircle} gradient="green" loading={loading} />
        <StatCard title="Upcoming" value={stats.upcoming.toString()} icon={Clock} gradient="orange" loading={loading} />
        <StatCard title="Past" value={stats.past.toString()} icon={XCircle} gradient="gray" loading={loading} />
      </div>

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search semesters..."
        filters={[
          {
            label: 'Status',
            value: statusFilter,
            onChange: (value) => setStatusFilter(value as typeof statusFilter),
            options: [
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ],
          },
        ]}
        onRefresh={fetchSemesters}
        onCreate={openCreateModal}
        createLabel="New Semester"
      />

      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={filteredSemesters}
          columns={columns}
          keyExtractor={(semester) => semester.id.toString()}
          loading={loading}
          emptyMessage="No semesters found"
          itemsPerPage={15}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h2 className="text-xl font-semibold text-gray-900">
                {isCreating ? 'Create New Semester' : 'Edit Semester'}
              </h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Fall 2025, Spring 2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Set as active semester
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={isCreating ? handleCreate : handleUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {isCreating ? 'Create Semester' : 'Update Semester'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
