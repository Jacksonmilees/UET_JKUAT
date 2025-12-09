import React, { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, RefreshCw, Plus, Edit2, Send, Loader2, CheckCircle, AlertCircle, Archive, Clock, TrendingUp } from 'lucide-react';
import api from '../../services/api';

interface Semester {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  mandatory_amount: number;
  status: 'active' | 'archived';
  created_by?: number;
  notes?: string;
  settings?: any;
  stats?: {
    total_users: number;
    paid_users: number;
    unpaid_users: number;
    payment_rate: number;
    total_collected: number;
    target_amount: number;
  };
  is_current?: boolean;
  created_at: string;
  creator?: { id: number; name: string };
}

interface SemesterFormData {
  name: string;
  start_date: string;
  end_date: string;
  mandatory_amount: number;
  notes: string;
}

const SemesterManagement: React.FC = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [formData, setFormData] = useState<SemesterFormData>({
    name: '',
    start_date: '',
    end_date: '',
    mandatory_amount: 100,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [activating, setActivating] = useState<number | null>(null);
  const [sendingReminders, setSendingReminders] = useState<number | null>(null);

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    setLoading(true);
    try {
      const response = await api.get('/v1/semesters');
      if (response.data.success && response.data.data) {
        setSemesters(response.data.data as Semester[]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch semesters');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await api.post('/v1/semesters', formData);
      if (response.data.success && response.data.data) {
        setSemesters(prev => [response.data.data as Semester, ...prev]);
        setShowCreateModal(false);
        resetForm();
      } else {
        setError(response.data.error || 'Failed to create semester');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create semester');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSemester) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await api.put(`/v1/semesters/${selectedSemester.id}`, formData);
      if (response.data.success && response.data.data) {
        setSemesters(prev => prev.map(s => s.id === selectedSemester.id ? { ...s, ...response.data.data as Semester } : s));
        setShowEditModal(false);
        resetForm();
      } else {
        setError(response.data.error || 'Failed to update semester');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update semester');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivateSemester = async (semesterId: number) => {
    if (!confirm('Activating this semester will reset all users\' mandatory payment status. Continue?')) {
      return;
    }

    setActivating(semesterId);
    try {
      const response = await api.post(`/v1/semesters/${semesterId}/activate`);
      if (response.data.success) {
        alert(response.data.message || 'Semester activated');
        fetchSemesters();
      } else {
        setError(response.data.error || 'Failed to activate semester');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to activate semester');
    } finally {
      setActivating(null);
    }
  };

  const handleSendReminders = async (semesterId: number) => {
    setSendingReminders(semesterId);
    try {
      const response = await api.post(`/v1/semesters/${semesterId}/send-reminders`);
      if (response.data.success) {
        alert(response.data.message || 'Reminders sent');
      } else {
        setError(response.data.error || 'Failed to send reminders');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reminders');
    } finally {
      setSendingReminders(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      start_date: '',
      end_date: '',
      mandatory_amount: 100,
      notes: '',
    });
    setSelectedSemester(null);
  };

  const openEditModal = (semester: Semester) => {
    setSelectedSemester(semester);
    setFormData({
      name: semester.name,
      start_date: semester.start_date.split('T')[0],
      end_date: semester.end_date.split('T')[0],
      mandatory_amount: semester.mandatory_amount,
      notes: semester.notes || '',
    });
    setShowEditModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Semester Management</h2>
          <p className="text-muted-foreground">Manage academic semesters and track mandatory contributions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Semester
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Semesters List */}
      <div className="space-y-4">
        {semesters.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Semesters</h3>
            <p className="text-muted-foreground mb-4">Create your first semester to start tracking contributions.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-primary hover:underline"
            >
              Create Semester
            </button>
          </div>
        ) : (
          semesters.map(semester => (
            <div
              key={semester.id}
              className={`bg-card border rounded-xl p-6 ${
                semester.is_current ? 'border-primary ring-1 ring-primary' : 'border-border'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Semester Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{semester.name}</h3>
                    {semester.is_current && (
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        Current
                      </span>
                    )}
                    {semester.status === 'archived' && (
                      <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full flex items-center gap-1">
                        <Archive className="w-3 h-3" />
                        Archived
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(semester.start_date)} - {formatDate(semester.end_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      KES {semester.mandatory_amount}
                    </span>
                  </div>
                  {semester.notes && (
                    <p className="text-sm text-muted-foreground mb-4">{semester.notes}</p>
                  )}

                  {/* Stats Grid */}
                  {semester.stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <Users className="w-3 h-3" />
                          Total Users
                        </div>
                        <div className="text-lg font-semibold text-foreground">
                          {semester.stats.total_users}
                        </div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 mb-1">
                          <CheckCircle className="w-3 h-3" />
                          Paid
                        </div>
                        <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                          {semester.stats.paid_users}
                        </div>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 mb-1">
                          <Clock className="w-3 h-3" />
                          Unpaid
                        </div>
                        <div className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                          {semester.stats.unpaid_users}
                        </div>
                      </div>
                      <div className="bg-primary/5 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-xs text-primary mb-1">
                          <TrendingUp className="w-3 h-3" />
                          Payment Rate
                        </div>
                        <div className="text-lg font-semibold text-primary">
                          {semester.stats.payment_rate}%
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Collection Progress */}
                  {semester.stats && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Collection Progress</span>
                        <span className="font-medium text-foreground">
                          KES {semester.stats.total_collected.toLocaleString()} / {semester.stats.target_amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{
                            width: `${semester.stats.target_amount > 0 
                              ? Math.min(100, (semester.stats.total_collected / semester.stats.target_amount) * 100) 
                              : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 lg:flex-col">
                  <button
                    onClick={() => openEditModal(semester)}
                    className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  {semester.status === 'active' && !semester.is_current && (
                    <button
                      onClick={() => handleActivateSemester(semester.id)}
                      disabled={activating === semester.id}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {activating === semester.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      Activate
                    </button>
                  )}
                  {semester.is_current && semester.stats && semester.stats.unpaid_users > 0 && (
                    <button
                      onClick={() => handleSendReminders(semester.id)}
                      disabled={sendingReminders === semester.id}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                    >
                      {sendingReminders === semester.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Send Reminders
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Create New Semester</h3>
            </div>
            <form onSubmit={handleCreateSemester} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Semester Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Semester 1 2024/2025"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Mandatory Amount (KES)</label>
                <input
                  type="number"
                  value={formData.mandatory_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, mandatory_amount: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="Any additional notes about this semester..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Semester
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedSemester && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Edit Semester</h3>
            </div>
            <form onSubmit={handleUpdateSemester} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Semester Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Mandatory Amount (KES)</label>
                <input
                  type="number"
                  value={formData.mandatory_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, mandatory_amount: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); resetForm(); }}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SemesterManagement;
