import React, { useState, useEffect, useMemo } from 'react';
import { Wallet, Plus, Target, ArrowRightLeft, CheckCircle2, Search, X, Eye, Edit, Trash2, TrendingUp, AlertCircle, Download } from 'lucide-react';
import api from '../../services/api';
import { DataTable, Column } from './shared/DataTable';
import { StatCard } from './shared/StatCard';
import { FilterBar } from './shared/FilterBar';
import { useNotification } from '../../contexts/NotificationContext';

interface Account {
  id: number;
  reference: string;
  name: string;
  balance: number;
  status: 'active' | 'inactive' | 'suspended';
  account_type_id: number;
  account_subtype_id?: number;
  accountType?: { id: number; name: string; code: string };
  accountSubtype?: { id: number; name: string };
  created_at: string;
  updated_at?: string;
}

interface AccountType {
  id: number;
  name: string;
  code: string;
}

const AccountManagementNew: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchAccounts(), fetchAccountTypes()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      showError('Failed to load accounts data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await api.accounts.getAll();
      if (response.success && response.data) {
        setAccounts(Array.isArray(response.data) ? response.data : []);
      } else {
        showError(response.error || 'Failed to fetch accounts');
      }
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
      showError(error.message || 'Failed to fetch accounts');
    }
  };

  const fetchAccountTypes = async () => {
    try {
      const response = await api.accounts.getTypes();
      if (response.success && response.data) {
        setAccountTypes(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching account types:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    showSuccess('Accounts refreshed successfully');
  };

  const handleExport = () => {
    // Export accounts to CSV
    const headers = ['Reference', 'Name', 'Type', 'Balance', 'Status', 'Created'];
    const rows = filteredAccounts.map(acc => [
      acc.reference,
      acc.name,
      acc.accountType?.name || 'N/A',
      acc.balance.toString(),
      acc.status,
      new Date(acc.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accounts_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showSuccess('Accounts exported successfully');
  };

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    let filtered = [...accounts];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(account =>
        account.name.toLowerCase().includes(query) ||
        account.reference.toLowerCase().includes(query) ||
        account.accountType?.name.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(account => account.status === statusFilter);
    }

    return filtered;
  }, [accounts, searchQuery, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    const activeAccounts = accounts.filter(acc => acc.status === 'active').length;
    const inactiveAccounts = accounts.filter(acc => acc.status === 'inactive').length;
    const suspendedAccounts = accounts.filter(acc => acc.status === 'suspended').length;

    return {
      totalBalance,
      totalAccounts: accounts.length,
      activeAccounts,
      inactiveAccounts,
      suspendedAccounts
    };
  }, [accounts]);

  // Define table columns
  const columns: Column<Account>[] = [
    {
      key: 'reference',
      header: 'Reference',
      sortable: true,
      render: (account) => (
        <div>
          <div className="font-mono font-medium text-foreground">{account.reference}</div>
          <div className="text-xs text-muted-foreground">
            {new Date(account.created_at).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Account Name',
      sortable: true,
      render: (account) => (
        <div>
          <div className="font-medium text-foreground">{account.name}</div>
          {account.accountType && (
            <div className="text-xs text-muted-foreground">{account.accountType.name}</div>
          )}
        </div>
      ),
    },
    {
      key: 'balance',
      header: 'Balance',
      sortable: true,
      render: (account) => (
        <div className="font-semibold text-primary">
          KES {(account.balance || 0).toLocaleString()}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (account) => {
        const status = account.status || 'inactive';
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            status === 'active'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : status === 'inactive'
              ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (account) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAccount(account);
            }}
            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle edit
            }}
            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="Edit account"
          >
            <Edit className="w-4 h-4" />
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
          <Wallet className="w-7 h-7 text-primary" />
          Account Management
        </h2>
        <p className="text-muted-foreground mt-1">Manage financial accounts, balances, and transfers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          value={`KES ${stats.totalBalance.toLocaleString()}`}
          subtitle={`Across ${stats.totalAccounts} accounts`}
          icon={Wallet}
          color="green"
          loading={loading}
        />
        <StatCard
          title="Active Accounts"
          value={stats.activeAccounts}
          subtitle={`${stats.totalAccounts} total accounts`}
          icon={CheckCircle2}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Inactive/Suspended"
          value={stats.inactiveAccounts + stats.suspendedAccounts}
          subtitle={`${stats.inactiveAccounts} inactive, ${stats.suspendedAccounts} suspended`}
          icon={AlertCircle}
          color="orange"
          loading={loading}
        />
        <StatCard
          title="Account Types"
          value={accountTypes.length}
          subtitle="Different account categories"
          icon={Target}
          color="purple"
          loading={loading}
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search accounts by name or reference..."
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { label: 'All Status', value: '' },
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
          { label: 'Suspended', value: 'suspended' },
        ]}
        filterLabel="Filter by Status"
        onExport={handleExport}
        onRefresh={handleRefresh}
        onCreate={() => setShowCreateModal(true)}
        createLabel="New Account"
        isRefreshing={refreshing}
        customFilters={
          <button
            onClick={() => setShowTransferModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Transfer Funds</span>
          </button>
        }
      />

      {/* Accounts Table */}
      <DataTable
        data={filteredAccounts}
        columns={columns}
        keyExtractor={(account) => account.id.toString()}
        loading={loading}
        emptyMessage="No accounts found. Create your first account to get started."
        itemsPerPage={10}
      />

      {/* Modals */}
      {showCreateModal && (
        <CreateAccountModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchAccounts();
            showSuccess('Account created successfully');
          }}
          accountTypes={accountTypes}
        />
      )}

      {showTransferModal && (
        <TransferModal
          onClose={() => setShowTransferModal(false)}
          onSuccess={() => {
            setShowTransferModal(false);
            fetchAccounts();
            showSuccess('Transfer completed successfully');
          }}
          accounts={accounts}
        />
      )}

      {selectedAccount && (
        <AccountDetailsModal
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
        />
      )}
    </div>
  );
};

// Create Account Modal
const CreateAccountModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
  accountTypes: AccountType[];
}> = ({ onClose, onSuccess, accountTypes }) => {
  const [formData, setFormData] = useState({
    name: '',
    account_type_id: '',
    account_subtype_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.account_type_id) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await api.accounts.create({
        ...formData,
        account_type_id: parseInt(formData.account_type_id),
        account_subtype_id: formData.account_subtype_id ? parseInt(formData.account_subtype_id) : undefined,
      });

      if (response.success) {
        onSuccess();
      } else {
        setError(response.error || 'Failed to create account');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-card rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-border animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Create New Account</h2>
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
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Account Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="e.g., Main Operating Account"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Account Type <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.account_type_id}
              onChange={(e) => setFormData({ ...formData, account_type_id: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              required
            >
              <option value="">Select Account Type</option>
              {accountTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
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
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Transfer Modal
const TransferModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
  accounts: Account[];
}> = ({ onClose, onSuccess, accounts }) => {
  const [formData, setFormData] = useState({
    source_account_id: '',
    destination_account_id: '',
    amount: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(false);

  const sourceAccount = accounts.find(a => a.id.toString() === formData.source_account_id);
  const destinationAccount = accounts.find(a => a.id.toString() === formData.destination_account_id);

  const handleValidate = async () => {
    if (!formData.source_account_id || !formData.destination_account_id || !formData.amount) {
      return;
    }

    try {
      setValidating(true);
      setError('');

      const response = await api.accounts.validateTransfer({
        source_account_id: parseInt(formData.source_account_id),
        destination_account_id: parseInt(formData.destination_account_id),
        amount: parseFloat(formData.amount),
      });

      if (!response.success) {
        setError(response.error || 'Invalid transfer');
      }
    } catch (err: any) {
      setError(err.message || 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const response = await api.accounts.transfer({
        source_account_id: parseInt(formData.source_account_id),
        destination_account_id: parseInt(formData.destination_account_id),
        amount: parseFloat(formData.amount),
        description: formData.description,
      });

      if (response.success) {
        onSuccess();
      } else {
        setError(response.error || 'Transfer failed');
      }
    } catch (err: any) {
      setError(err.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-card rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-border animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <ArrowRightLeft className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Transfer Funds</h2>
              <p className="text-sm text-muted-foreground">Move funds between accounts</p>
            </div>
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
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              From Account <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.source_account_id}
              onChange={(e) => {
                setFormData({ ...formData, source_account_id: e.target.value });
                setError('');
              }}
              onBlur={handleValidate}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              required
            >
              <option value="">Select Source Account</option>
              {accounts.filter(a => a.status === 'active').map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.reference}) - KES {account.balance.toLocaleString()}
                </option>
              ))}
            </select>
            {sourceAccount && (
              <p className="text-xs text-muted-foreground mt-1">
                Available: KES {sourceAccount.balance.toLocaleString()}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              To Account <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.destination_account_id}
              onChange={(e) => {
                setFormData({ ...formData, destination_account_id: e.target.value });
                setError('');
              }}
              onBlur={handleValidate}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              required
            >
              <option value="">Select Destination Account</option>
              {accounts
                .filter(a => a.status === 'active' && a.id.toString() !== formData.source_account_id)
                .map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.reference}) - KES {account.balance.toLocaleString()}
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
              onChange={(e) => {
                setFormData({ ...formData, amount: e.target.value });
                setError('');
              }}
              onBlur={handleValidate}
              min="1"
              step="0.01"
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="0.00"
              required
            />
            {validating && (
              <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Validating...
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              placeholder="Add a note about this transfer..."
              rows={3}
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
              disabled={loading || validating}
              className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : (
                'Transfer Funds'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Account Details Modal
const AccountDetailsModal: React.FC<{
  account: Account;
  onClose: () => void;
}> = ({ account, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-border animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Account Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Account Header */}
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold">{account.name}</h3>
                <p className="text-sm opacity-90 font-mono mt-1">{account.reference}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                account.status === 'active'
                  ? 'bg-white/20'
                  : 'bg-white/10'
              }`}>
                {account.status.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm opacity-75 mb-1">Current Balance</p>
              <p className="text-4xl font-bold">KES {account.balance.toLocaleString()}</p>
            </div>
          </div>

          {/* Account Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Account Type</p>
              <p className="font-semibold text-foreground">{account.accountType?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Account Subtype</p>
              <p className="font-semibold text-foreground">{account.accountSubtype?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Created</p>
              <p className="font-semibold text-foreground">
                {new Date(account.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
              <p className="font-semibold text-foreground">
                {account.updated_at
                  ? new Date(account.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg font-semibold transition-all"
            >
              Close
            </button>
            <button className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-all">
              View Transactions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountManagementNew;
