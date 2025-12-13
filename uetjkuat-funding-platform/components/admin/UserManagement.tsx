import React, { useState, useEffect, useMemo } from 'react';
import { Users, Download, RefreshCw, Eye, Edit, Trash2, UserPlus, Shield, Lock, Mail, Phone, GraduationCap, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import { User, ApiResponse } from '../../types/backend';
import { DataTable, Column } from './shared/DataTable';
import { StatCard } from './shared/StatCard';
import { FilterBar } from './shared/FilterBar';
import { useNotification } from '../../contexts/NotificationContext';

const UserManagementNew: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const response: ApiResponse<User[]> = await api.users.getAll();

      if (response.success && response.data) {
        setUsers(Array.isArray(response.data) ? response.data : []);
      } else {
        showError(response.error || 'Failed to fetch users');
        setUsers([]);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      showError(error.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
    showSuccess('Users refreshed successfully');
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const response = await api.users.toggleStatus(user.id);
      if (response.success) {
        showSuccess(`User ${user.status === 'active' ? 'deactivated' : 'activated'} successfully`);
        fetchUsers();
      } else {
        showError(response.error || 'Failed to update user status');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to update user status');
    }
  };

  const handleToggleRole = async (user: User) => {
    try {
      const response = await api.users.toggleRole(user.id);
      if (response.success) {
        showSuccess('User role updated successfully');
        fetchUsers();
      } else {
        showError(response.error || 'Failed to update user role');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to update user role');
    }
  };

  const handleResetPassword = async (user: User) => {
    if (!window.confirm(`Reset password for ${user.name}? A new password will be generated.`)) {
      return;
    }

    try {
      const response = await api.users.resetPassword(user.id);
      if (response.success && response.data) {
        showSuccess(`Password reset successfully. New password: ${response.data.new_password}`);
        // You might want to show this in a modal instead for better UX
        alert(`New password for ${user.name}: ${response.data.new_password}\n\nPlease save this password securely.`);
      } else {
        showError(response.error || 'Failed to reset password');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to reset password');
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await api.users.delete(user.id);
      if (response.success) {
        showSuccess('User deleted successfully');
        fetchUsers();
      } else {
        showError(response.error || 'Failed to delete user');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to delete user');
    }
  };

  const handleExport = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Member ID', 'Role', 'Status', 'College', 'Year', 'Course', 'Joined'];
    const rows = filteredUsers.map(u => [
      u.id.toString(),
      u.name,
      u.email,
      u.phone_number || 'N/A',
      u.member_id || 'N/A',
      u.role,
      u.status,
      u.college || 'N/A',
      u.year_of_study || 'N/A',
      u.course || 'N/A',
      new Date(u.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showSuccess('Users exported successfully');
  };

  // Filter users locally
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u.name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.member_id?.toLowerCase().includes(query) ||
        u.phone_number?.toLowerCase().includes(query) ||
        u.admission_number?.toLowerCase().includes(query) ||
        u.course?.toLowerCase().includes(query) ||
        u.college?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [users, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const adminUsers = users.filter(u => u.role === 'admin' || u.role === 'super_admin').length;
    const inactiveUsers = users.filter(u => u.status === 'inactive' || u.status === 'suspended').length;

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      inactiveUsers,
    };
  }, [users]);

  // Define table columns
  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'User',
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          {u.avatar ? (
            <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {u.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-semibold text-foreground">{u.name}</div>
            <div className="text-xs text-muted-foreground">{u.email}</div>
            {u.member_id && (
              <div className="text-xs text-primary font-mono">{u.member_id}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'phone_number',
      header: 'Contact',
      render: (u) => (
        <div>
          {u.phone_number && (
            <div className="text-sm font-mono text-foreground">{u.phone_number}</div>
          )}
          {u.admission_number && (
            <div className="text-xs text-muted-foreground">Adm: {u.admission_number}</div>
          )}
        </div>
      ),
    },
    {
      key: 'college',
      header: 'Academic Info',
      render: (u) => (
        <div>
          {u.college && (
            <div className="text-sm text-foreground">{u.college}</div>
          )}
          {u.year_of_study && (
            <div className="text-xs text-muted-foreground">Year {u.year_of_study}</div>
          )}
          {u.course && (
            <div className="text-xs text-muted-foreground line-clamp-1" title={u.course}>{u.course}</div>
          )}
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
            u.role === 'super_admin'
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
              : u.role === 'admin'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
          }`}>
            {u.role === 'super_admin' || u.role === 'admin' ? <Shield className="w-3 h-3" /> : null}
            {u.role.replace('_', ' ')}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (u) => {
        const status = u.status || 'inactive';
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
            status === 'active'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : status === 'suspended'
              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
          }`}>
            {status === 'active' && <CheckCircle className="w-3 h-3" />}
            {status === 'suspended' && <XCircle className="w-3 h-3" />}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (u) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(u);
            }}
            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(u);
              setShowEditModal(true);
            }}
            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="Edit user"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(u);
            }}
            className="p-2 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
            title={`${u.status === 'active' ? 'Deactivate' : 'Activate'} user`}
          >
            {u.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleResetPassword(u);
            }}
            className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
            title="Reset password"
          >
            <Lock className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(u);
            }}
            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            title="Delete user"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-7 h-7 text-primary" />
          User Management
        </h2>
        <p className="text-muted-foreground mt-1">Manage user accounts, roles, and permissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          subtitle={`${stats.activeUsers} active`}
          icon={Users}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          subtitle="Currently active"
          icon={CheckCircle}
          color="green"
          loading={loading}
        />
        <StatCard
          title="Administrators"
          value={stats.adminUsers}
          subtitle="Admin & Super Admin"
          icon={Shield}
          color="purple"
          loading={loading}
        />
        <StatCard
          title="Inactive/Suspended"
          value={stats.inactiveUsers}
          subtitle="Requires attention"
          icon={AlertCircle}
          color="orange"
          loading={loading}
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name, email, member ID, phone, or admission number..."
        filterValue={roleFilter}
        onFilterChange={setRoleFilter}
        filterOptions={[
          { label: 'All Roles', value: '' },
          { label: 'Users', value: 'user' },
          { label: 'Admins', value: 'admin' },
          { label: 'Super Admins', value: 'super_admin' },
        ]}
        filterLabel="Filter by Role"
        onExport={handleExport}
        onRefresh={handleRefresh}
        onCreate={() => setShowCreateAdminModal(true)}
        createLabel="Create Admin"
        isRefreshing={refreshing}
        customFilters={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground cursor-pointer min-w-[150px]"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        }
      />

      {/* Users Table */}
      <DataTable
        data={filteredUsers}
        columns={columns}
        keyExtractor={(u) => u.id.toString()}
        loading={loading}
        emptyMessage="No users found."
        itemsPerPage={15}
      />

      {/* Modals */}
      {showCreateAdminModal && (
        <CreateAdminModal
          onClose={() => setShowCreateAdminModal(false)}
          onSuccess={() => {
            setShowCreateAdminModal(false);
            fetchUsers();
            showSuccess('Admin created successfully!');
          }}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            fetchUsers();
            showSuccess('User updated successfully');
          }}
        />
      )}

      {selectedUser && !showEditModal && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

// Create Admin Modal
const CreateAdminModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      setError('Name and email are required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await api.users.createAdmin(formData);

      if (response.success && response.data) {
        setCredentials(response.data.credentials);
        // Don't close immediately, show credentials first
      } else {
        setError(response.error || 'Failed to create admin');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  if (credentials) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-6 border border-border animate-slide-up">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Admin Created!</h2>
            <p className="text-sm text-muted-foreground mt-2">Please save these credentials securely</p>
          </div>

          <div className="bg-secondary/30 rounded-lg p-4 mb-6">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="font-mono font-semibold text-foreground">{credentials.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Temporary Password</p>
                <p className="font-mono font-semibold text-foreground text-lg">{credentials.password}</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-lg p-3 mb-6">
            <p className="text-xs text-orange-800 dark:text-orange-300">
              ⚠️ This password will only be shown once. Please copy it now and share it securely with the admin.
            </p>
          </div>

          <button
            onClick={onSuccess}
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-6 border border-border animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Create Admin User</h2>
            <p className="text-sm text-muted-foreground mt-1">A temporary password will be generated</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Full Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Email Address <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Phone Number (Optional)
            </label>
            <input
              type="text"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="254712345678"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-input rounded-lg font-semibold text-foreground hover:bg-secondary transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </span>
              ) : (
                'Create Admin'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit User Modal
const EditUserModal: React.FC<{
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone_number: user.phone_number || '',
    year_of_study: user.year_of_study || '',
    course: user.course || '',
    college: user.college || '',
    admission_number: user.admission_number || '',
    ministry_interest: user.ministry_interest || '',
    residence: user.residence || '',
    role: user.role,
    status: user.status,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const response = await api.users.update(user.id, formData);

      if (response.success) {
        onSuccess();
      } else {
        setError(response.error || 'Failed to update user');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
      <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-border animate-slide-up my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Edit User</h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Phone Number</label>
              <input
                type="text"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Admission Number</label>
              <input
                type="text"
                value={formData.admission_number}
                onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">College</label>
              <input
                type="text"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Year of Study</label>
              <input
                type="text"
                value={formData.year_of_study}
                onChange={(e) => setFormData({ ...formData, year_of_study: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-foreground mb-2">Course</label>
              <input
                type="text"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground cursor-pointer"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-input rounded-lg font-semibold text-foreground hover:bg-secondary transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// User Details Modal
const UserDetailsModal: React.FC<{
  user: User;
  onClose: () => void;
}> = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-card rounded-2xl shadow-2xl max-w-3xl w-full p-6 border border-border animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.member_id && (
                <p className="text-sm text-primary font-mono mt-1">{user.member_id}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Status Badges */}
          <div className="flex gap-2">
            <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full ${
              user.role === 'super_admin'
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                : user.role === 'admin'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
            }`}>
              <Shield className="w-4 h-4" />
              {user.role.replace('_', ' ').toUpperCase()}
            </span>
            <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full ${
              user.status === 'active'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : user.status === 'suspended'
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
            }`}>
              {user.status === 'active' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {user.status.toUpperCase()}
            </span>
          </div>

          {/* Contact Information */}
          <div className="border-t border-border pt-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="font-semibold text-foreground">{user.email}</p>
              </div>
              {user.phone_number && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
                  <p className="font-mono font-semibold text-foreground">{user.phone_number}</p>
                </div>
              )}
            </div>
          </div>

          {/* Academic Information */}
          {(user.college || user.year_of_study || user.course || user.admission_number) && (
            <div className="border-t border-border pt-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Academic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {user.college && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">College</p>
                    <p className="font-semibold text-foreground">{user.college}</p>
                  </div>
                )}
                {user.year_of_study && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Year of Study</p>
                    <p className="font-semibold text-foreground">{user.year_of_study}</p>
                  </div>
                )}
                {user.course && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">Course</p>
                    <p className="font-semibold text-foreground">{user.course}</p>
                  </div>
                )}
                {user.admission_number && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Admission Number</p>
                    <p className="font-mono font-semibold text-foreground">{user.admission_number}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Information */}
          {(user.ministry_interest || user.residence) && (
            <div className="border-t border-border pt-4">
              <h3 className="font-semibold text-foreground mb-3">Additional Information</h3>
              <div className="grid grid-cols-2 gap-4">
                {user.ministry_interest && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ministry Interest</p>
                    <p className="font-semibold text-foreground">{user.ministry_interest}</p>
                  </div>
                )}
                {user.residence && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Residence</p>
                    <p className="font-semibold text-foreground">{user.residence}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Registration Information */}
          <div className="border-t border-border pt-4">
            <h3 className="font-semibold text-foreground mb-3">Registration Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Joined</p>
                <p className="font-semibold text-foreground">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              {user.registration_completed_at && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Registration Completed</p>
                  <p className="font-semibold text-foreground">
                    {new Date(user.registration_completed_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagementNew;
