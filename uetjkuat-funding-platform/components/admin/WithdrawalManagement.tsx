import React, { useState, useEffect, useMemo } from 'react';
import { ArrowUpRight, Download, RefreshCw, Eye, Check, X, Clock, Send, AlertCircle, Phone } from 'lucide-react';
import api from '../../services/api';
import { Withdrawal, WithdrawalRequest, ApiResponse } from '../../types/backend';
import { DataTable, Column } from './shared/DataTable';
import { StatCard } from './shared/StatCard';
import { FilterBar } from './shared/FilterBar';
import { useNotification } from '../../contexts/NotificationContext';

const WithdrawalManagementNew: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response: ApiResponse<Withdrawal[]> = await api.withdrawals.getAll();

      if (response.status === 'success' && response.data) {
        setWithdrawals(Array.isArray(response.data) ? response.data : []);
      } else {
        showError(response.message || response.error || 'Failed to fetch withdrawals');
        setWithdrawals([]);
      }
    } catch (error: any) {
      console.error('Error fetching withdrawals:', error);
      showError(error.message || 'Failed to fetch withdrawals');
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWithdrawals();
    setRefreshing(false);
    showSuccess('Withdrawals refreshed successfully');
  };

  const handleExport = () => {
    const headers = ['ID', 'Date', 'Amount', 'Phone Number', 'Reason', 'Status', 'Initiated By', 'Reference'];
    const rows = filteredWithdrawals.map(w => [
      w.id.toString(),
      new Date(w.created_at).toLocaleString(),
      w.amount.toString(),
      w.phone_number,
      w.withdrawal_reason,
      w.status,
      w.initiated_by_name,
      w.reference || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `withdrawals_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showSuccess('Withdrawals exported successfully');
  };

  // Filter withdrawals locally
  const filteredWithdrawals = useMemo(() => {
    let filtered = [...withdrawals];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(w =>
        w.phone_number.toLowerCase().includes(query) ||
        w.initiated_by_name.toLowerCase().includes(query) ||
        w.receiver_name?.toLowerCase().includes(query) ||
        w.reference?.toLowerCase().includes(query) ||
        w.mpesa_transaction_id?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(w => w.status === statusFilter);
    }

    return filtered;
  }, [withdrawals, searchQuery, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalAmount = withdrawals.reduce((sum, w) => sum + Number(w.amount), 0);
    const completedAmount = withdrawals
      .filter(w => w.status === 'completed')
      .reduce((sum, w) => sum + Number(w.amount), 0);
    const pendingAmount = withdrawals
      .filter(w => w.status === 'pending' || w.status === 'initiated')
      .reduce((sum, w) => sum + Number(w.amount), 0);

    return {
      totalAmount,
      completedAmount,
      pendingAmount,
      totalCount: withdrawals.length,
      completedCount: withdrawals.filter(w => w.status === 'completed').length,
      pendingCount: withdrawals.filter(w => w.status === 'pending' || w.status === 'initiated').length,
      failedCount: withdrawals.filter(w => w.status === 'failed').length,
    };
  }, [withdrawals]);

  // Define table columns
  const columns: Column<Withdrawal>[] = [
    {
      key: 'created_at',
      header: 'Date/Time',
      sortable: true,
      render: (w) => (
        <div>
          <div className="font-medium text-foreground">
            {new Date(w.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(w.created_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      ),
    },
    {
      key: 'phone_number',
      header: 'Recipient',
      sortable: true,
      render: (w) => (
        <div>
          <div className="font-medium text-foreground">{w.receiver_name || 'N/A'}</div>
          <div className="text-xs text-muted-foreground font-mono">{w.phone_number}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (w) => (
        <div className="font-semibold text-orange-600">
          KES {Number(w.amount).toLocaleString()}
        </div>
      ),
    },
    {
      key: 'withdrawal_reason',
      header: 'Reason',
      render: (w) => (
        <span className="text-sm text-foreground">
          {w.withdrawal_reason.replace(/([A-Z])/g, ' $1').trim()}
        </span>
      ),
    },
    {
      key: 'initiated_by_name',
      header: 'Initiated By',
      sortable: true,
      render: (w) => (
        <div className="text-sm text-foreground">{w.initiated_by_name}</div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (w) => (
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
          w.status === 'completed'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            : w.status === 'pending' || w.status === 'initiated'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
            : w.status === 'failed'
            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
        }`}>
          {w.status === 'completed' && <Check className="w-3 h-3" />}
          {(w.status === 'pending' || w.status === 'initiated') && <Clock className="w-3 h-3" />}
          {w.status === 'failed' && <X className="w-3 h-3" />}
          {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (w) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedWithdrawal(w);
          }}
          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
          title="View details"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <ArrowUpRight className="w-7 h-7 text-primary" />
          Withdrawal Management
        </h2>
        <p className="text-muted-foreground mt-1">Process and monitor all withdrawal requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Withdrawals"
          value={stats.totalCount}
          subtitle={`KES ${stats.totalAmount.toLocaleString()} total`}
          icon={ArrowUpRight}
          color="orange"
          loading={loading}
        />
        <StatCard
          title="Completed"
          value={`KES ${stats.completedAmount.toLocaleString()}`}
          subtitle={`${stats.completedCount} transactions`}
          icon={Check}
          color="green"
          loading={loading}
        />
        <StatCard
          title="Pending"
          value={`KES ${stats.pendingAmount.toLocaleString()}`}
          subtitle={`${stats.pendingCount} awaiting processing`}
          icon={Clock}
          color="yellow"
          loading={loading}
        />
        <StatCard
          title="Failed"
          value={stats.failedCount}
          subtitle="Requires attention"
          icon={AlertCircle}
          color="red"
          loading={loading}
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by phone number, name, or reference..."
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { label: 'All Status', value: '' },
          { label: 'Initiated', value: 'initiated' },
          { label: 'Pending', value: 'pending' },
          { label: 'Completed', value: 'completed' },
          { label: 'Failed', value: 'failed' },
          { label: 'Cancelled', value: 'cancelled' },
        ]}
        filterLabel="Filter by Status"
        onExport={handleExport}
        onRefresh={handleRefresh}
        onCreate={() => setShowInitiateModal(true)}
        createLabel="New Withdrawal"
        isRefreshing={refreshing}
      />

      {/* Withdrawals Table */}
      <DataTable
        data={filteredWithdrawals}
        columns={columns}
        keyExtractor={(w) => w.id.toString()}
        loading={loading}
        emptyMessage="No withdrawals found. Initiate a new withdrawal to get started."
        itemsPerPage={15}
      />

      {/* Modals */}
      {showInitiateModal && (
        <InitiateWithdrawalModal
          onClose={() => setShowInitiateModal(false)}
          onSuccess={() => {
            setShowInitiateModal(false);
            fetchWithdrawals();
            showSuccess('Withdrawal initiated successfully');
          }}
        />
      )}

      {selectedWithdrawal && (
        <WithdrawalDetailsModal
          withdrawal={selectedWithdrawal}
          onClose={() => setSelectedWithdrawal(null)}
        />
      )}
    </div>
  );
};

// Initiate Withdrawal Modal
const InitiateWithdrawalModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    account_id: '',
    amount: '',
    phone_number: '',
    withdrawal_reason: 'BusinessPayment' as 'BusinessPayment' | 'SalaryPayment' | 'PromotionPayment',
    remarks: '',
    initiated_by_name: '',
    initiator_phone: '',
    otp: '',
  });
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [error, setError] = useState('');
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.accounts.getAll();
      if (response.success && response.data) {
        setAccounts(Array.isArray(response.data) ? response.data.filter((a: any) => a.status === 'active') : []);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleSendOTP = async () => {
    if (!formData.initiator_phone) {
      setError('Please enter initiator phone number');
      return;
    }

    // Validate phone format
    const phoneRegex = /^254[17][0-9]{8}$/;
    if (!phoneRegex.test(formData.initiator_phone)) {
      setError('Phone number must be in format 254XXXXXXXXX');
      return;
    }

    try {
      setSendingOTP(true);
      setError('');
      const response = await api.withdrawals.sendOTP(formData.initiator_phone);

      if (response.success) {
        showSuccess('OTP sent successfully to ' + formData.initiator_phone);
      } else {
        setError(response.error || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setSendingOTP(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    if (!formData.account_id || !formData.amount || !formData.phone_number ||
        !formData.initiated_by_name || !formData.initiator_phone || !formData.otp) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate phone numbers format (254XXXXXXXXX)
    const phoneRegex = /^254[17][0-9]{8}$/;
    if (!phoneRegex.test(formData.phone_number) || !phoneRegex.test(formData.initiator_phone)) {
      setError('Phone numbers must be in format 254XXXXXXXXX (e.g., 254712345678)');
      return;
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(formData.otp)) {
      setError('OTP must be exactly 6 digits');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const withdrawalRequest: WithdrawalRequest = {
        account_id: parseInt(formData.account_id),
        amount: parseFloat(formData.amount),
        phone_number: formData.phone_number,
        withdrawal_reason: formData.withdrawal_reason,
        remarks: formData.remarks,
        initiated_by_name: formData.initiated_by_name,
        initiator_phone: formData.initiator_phone,
        otp: formData.otp,
      };

      const response = await api.withdrawals.initiate(withdrawalRequest);

      if (response.success) {
        onSuccess();
      } else {
        setError(response.error || 'Failed to initiate withdrawal');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate withdrawal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
      <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-border animate-slide-up my-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Initiate Withdrawal</h2>
            <p className="text-sm text-muted-foreground mt-1">Send funds via M-Pesa B2C</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-foreground mb-2">
                Account <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.account_id}
                onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                required
              >
                <option value="">Select Account</option>
                {accounts.map((account: any) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.reference}) - KES {Number(account.balance).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Amount (KES) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                min="1"
                step="0.01"
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Recipient Phone <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                placeholder="254712345678"
                pattern="254[17][0-9]{8}"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Format: 254XXXXXXXXX</p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-foreground mb-2">
                Withdrawal Reason <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.withdrawal_reason}
                onChange={(e) => setFormData({ ...formData, withdrawal_reason: e.target.value as any })}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                required
              >
                <option value="BusinessPayment">Business Payment</option>
                <option value="SalaryPayment">Salary Payment</option>
                <option value="PromotionPayment">Promotion Payment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Initiated By <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.initiated_by_name}
                onChange={(e) => setFormData({ ...formData, initiated_by_name: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Initiator Phone <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.initiator_phone}
                  onChange={(e) => setFormData({ ...formData, initiator_phone: e.target.value })}
                  className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                  placeholder="254712345678"
                  pattern="254[17][0-9]{8}"
                  required
                />
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={sendingOTP || !formData.initiator_phone}
                  className="px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {sendingOTP ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  OTP
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Your phone for OTP verification</p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-foreground mb-2">
                OTP Code <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono text-center text-2xl tracking-widest"
                placeholder="000000"
                pattern="\d{6}"
                maxLength={6}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Enter the 6-digit OTP sent to your phone</p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-foreground mb-2">
                Remarks (Optional)
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                placeholder="Add any notes about this withdrawal..."
                rows={3}
              />
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
              className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : (
                'Initiate Withdrawal'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Withdrawal Details Modal
const WithdrawalDetailsModal: React.FC<{
  withdrawal: Withdrawal;
  onClose: () => void;
}> = ({ withdrawal, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-border animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Withdrawal Details</h2>
            {withdrawal.reference && (
              <p className="text-sm text-muted-foreground mt-1">Ref: {withdrawal.reference}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Withdrawal Header */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm opacity-90 font-medium">Withdrawal Amount</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                withdrawal.status === 'completed' ? 'bg-white/20' : 'bg-white/10'
              }`}>
                {withdrawal.status.toUpperCase()}
              </span>
            </div>
            <div className="text-4xl font-bold">KES {Number(withdrawal.amount).toLocaleString()}</div>
            <p className="text-sm opacity-75 mt-2">{withdrawal.withdrawal_reason.replace(/([A-Z])/g, ' $1').trim()}</p>
          </div>

          {/* Withdrawal Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Recipient Phone</p>
              <p className="font-mono font-semibold text-foreground">{withdrawal.phone_number}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Recipient Name</p>
              <p className="font-semibold text-foreground">{withdrawal.receiver_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Initiated By</p>
              <p className="font-semibold text-foreground">{withdrawal.initiated_by_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Date Initiated</p>
              <p className="font-semibold text-foreground">
                {new Date(withdrawal.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          {/* M-Pesa Information */}
          {(withdrawal.mpesa_transaction_id || withdrawal.mpesa_conversation_id) && (
            <div className="border-t border-border pt-4">
              <h3 className="font-semibold text-foreground mb-3">M-Pesa Information</h3>
              <div className="grid grid-cols-2 gap-4">
                {withdrawal.mpesa_transaction_id && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
                    <p className="font-mono text-sm font-semibold text-foreground">{withdrawal.mpesa_transaction_id}</p>
                  </div>
                )}
                {withdrawal.mpesa_conversation_id && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Conversation ID</p>
                    <p className="font-mono text-sm font-semibold text-foreground">{withdrawal.mpesa_conversation_id}</p>
                  </div>
                )}
                {withdrawal.mpesa_result_code && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Result Code</p>
                    <p className="font-semibold text-foreground">{withdrawal.mpesa_result_code}</p>
                  </div>
                )}
                {withdrawal.mpesa_result_desc && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">Result Description</p>
                    <p className="font-semibold text-foreground">{withdrawal.mpesa_result_desc}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Remarks */}
          {withdrawal.remarks && (
            <div className="border-t border-border pt-4">
              <h3 className="font-semibold text-foreground mb-2">Remarks</h3>
              <p className="text-foreground">{withdrawal.remarks}</p>
            </div>
          )}

          {/* Completion Information */}
          {withdrawal.completed_at && (
            <div className="border-t border-border pt-4">
              <h3 className="font-semibold text-foreground mb-2">Completion Information</h3>
              <p className="text-sm text-muted-foreground mb-1">Completed At</p>
              <p className="font-semibold text-foreground">
                {new Date(withdrawal.completed_at).toLocaleString('en-US', {
                  dateStyle: 'long',
                  timeStyle: 'long'
                })}
              </p>
            </div>
          )}

          {/* Metadata */}
          {withdrawal.metadata && Object.keys(withdrawal.metadata).length > 0 && (
            <div className="border-t border-border pt-4">
              <h3 className="font-semibold text-foreground mb-3">Additional Information</h3>
              <div className="bg-secondary/20 rounded-lg p-4">
                <pre className="text-xs text-foreground whitespace-pre-wrap font-mono">
                  {JSON.stringify(withdrawal.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg font-semibold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalManagementNew;
