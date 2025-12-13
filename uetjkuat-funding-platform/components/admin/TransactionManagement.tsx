import React, { useState, useEffect, useMemo } from 'react';
import { CreditCard, Download, TrendingUp, TrendingDown, Calendar, Filter, Eye, Search, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { Transaction, TransactionFilters, ApiResponse } from '../../types/backend';
import { DataTable, Column } from './shared/DataTable';
import { StatCard } from './shared/StatCard';
import { FilterBar, DateRangeFilter } from './shared/FilterBar';
import { useNotification } from '../../contexts/NotificationContext';

const TransactionManagementNew: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TransactionFilters>({
    sort_by: 'created_at',
    sort_direction: 'desc',
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchTransactions();
  }, [filters.type, filters.status]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response: ApiResponse<Transaction[]> = await api.transactions.getAll(filters as Record<string, string>);

      if (response.status === 'success' && response.data) {
        setTransactions(Array.isArray(response.data) ? response.data : []);
      } else {
        showError(response.message || response.error || 'Failed to fetch transactions');
        setTransactions([]);
      }
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      showError(error.message || 'Failed to fetch transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
    showSuccess('Transactions refreshed successfully');
  };

  const handleExport = () => {
    const headers = ['ID', 'Date', 'Reference', 'Type', 'Amount', 'Status', 'Payer Name', 'Phone Number', 'Payment Method'];
    const rows = filteredTransactions.map(tx => [
      tx.id.toString(),
      new Date(tx.created_at).toLocaleString(),
      tx.reference,
      tx.type,
      tx.amount.toString(),
      tx.status,
      tx.payer_name || 'N/A',
      tx.phone_number || 'N/A',
      tx.payment_method
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showSuccess('Transactions exported successfully');
  };

  // Filter transactions locally
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tx =>
        tx.reference?.toLowerCase().includes(query) ||
        tx.payer_name?.toLowerCase().includes(query) ||
        tx.phone_number?.toLowerCase().includes(query) ||
        tx.transaction_id?.toLowerCase().includes(query) ||
        tx.account?.name?.toLowerCase().includes(query) ||
        tx.user?.name?.toLowerCase().includes(query)
      );
    }

    // Date range filter
    if (filters.start_date) {
      filtered = filtered.filter(tx => new Date(tx.created_at) >= new Date(filters.start_date!));
    }
    if (filters.end_date) {
      filtered = filtered.filter(tx => new Date(tx.created_at) <= new Date(filters.end_date!));
    }

    return filtered;
  }, [transactions, searchQuery, filters.start_date, filters.end_date]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalAmount = filteredTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
    const totalCredit = filteredTransactions
      .filter(tx => tx.type === 'credit')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    const totalDebit = filteredTransactions
      .filter(tx => tx.type === 'debit')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    const completedCount = filteredTransactions.filter(tx => tx.status === 'completed').length;
    const pendingCount = filteredTransactions.filter(tx => tx.status === 'pending').length;

    return {
      totalAmount,
      totalCredit,
      totalDebit,
      totalCount: filteredTransactions.length,
      completedCount,
      pendingCount,
    };
  }, [filteredTransactions]);

  // Define table columns
  const columns: Column<Transaction>[] = [
    {
      key: 'created_at',
      header: 'Date/Time',
      sortable: true,
      render: (tx) => (
        <div>
          <div className="font-medium text-foreground">
            {new Date(tx.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(tx.created_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      ),
    },
    {
      key: 'reference',
      header: 'Reference',
      sortable: true,
      render: (tx) => (
        <div>
          <div className="font-mono text-sm font-medium text-foreground">{tx.reference}</div>
          {tx.transaction_id && (
            <div className="text-xs text-muted-foreground font-mono">{tx.transaction_id}</div>
          )}
        </div>
      ),
    },
    {
      key: 'payer_name',
      header: 'Payer/Account',
      sortable: true,
      render: (tx) => (
        <div>
          <div className="font-medium text-foreground">{tx.payer_name || tx.user?.name || 'N/A'}</div>
          {tx.account && (
            <div className="text-xs text-muted-foreground">{tx.account.name}</div>
          )}
          {tx.phone_number && (
            <div className="text-xs text-muted-foreground font-mono">{tx.phone_number}</div>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (tx) => (
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
          tx.type === 'credit'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
        }`}>
          {tx.type === 'credit' ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (tx) => (
        <div className={`font-semibold ${
          tx.type === 'credit' ? 'text-green-600' : 'text-orange-600'
        }`}>
          {tx.type === 'credit' ? '+' : '-'}KES {Number(tx.amount).toLocaleString()}
        </div>
      ),
    },
    {
      key: 'payment_method',
      header: 'Method',
      render: (tx) => (
        <span className="text-sm text-foreground">{tx.payment_method || 'N/A'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (tx) => {
        const status = tx.status || 'pending';
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            status === 'completed'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : status === 'pending'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
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
      render: (tx) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedTransaction(tx);
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
          <CreditCard className="w-7 h-7 text-primary" />
          Transaction Management
        </h2>
        <p className="text-muted-foreground mt-1">Monitor and manage all financial transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Transactions"
          value={stats.totalCount}
          subtitle={`${stats.completedCount} completed, ${stats.pendingCount} pending`}
          icon={CreditCard}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Total Credits"
          value={`KES ${stats.totalCredit.toLocaleString()}`}
          subtitle="Money received"
          icon={TrendingUp}
          color="green"
          loading={loading}
        />
        <StatCard
          title="Total Debits"
          value={`KES ${stats.totalDebit.toLocaleString()}`}
          subtitle="Money sent out"
          icon={TrendingDown}
          color="orange"
          loading={loading}
        />
        <StatCard
          title="Net Balance"
          value={`KES ${(stats.totalCredit - stats.totalDebit).toLocaleString()}`}
          subtitle="Credits - Debits"
          icon={TrendingUp}
          color={stats.totalCredit >= stats.totalDebit ? 'green' : 'red'}
          loading={loading}
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by reference, payer name, phone, or account..."
        filterValue={filters.type || ''}
        onFilterChange={(value) => setFilters({ ...filters, type: value as any })}
        filterOptions={[
          { label: 'All Types', value: '' },
          { label: 'Credits Only', value: 'credit' },
          { label: 'Debits Only', value: 'debit' },
        ]}
        filterLabel="Filter by Type"
        onExport={handleExport}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
        customFilters={
          <>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground cursor-pointer min-w-[150px]"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            <DateRangeFilter
              startDate={filters.start_date || ''}
              endDate={filters.end_date || ''}
              onStartDateChange={(date) => setFilters({ ...filters, start_date: date })}
              onEndDateChange={(date) => setFilters({ ...filters, end_date: date })}
              onClear={() => setFilters({ ...filters, start_date: undefined, end_date: undefined })}
            />
          </>
        }
      />

      {/* Transactions Table */}
      <DataTable
        data={filteredTransactions}
        columns={columns}
        keyExtractor={(tx) => tx.id.toString()}
        loading={loading}
        emptyMessage="No transactions found. Transactions will appear here once they are processed."
        itemsPerPage={15}
      />

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
};

// Transaction Details Modal
const TransactionDetailsModal: React.FC<{
  transaction: Transaction;
  onClose: () => void;
}> = ({ transaction, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-border animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Transaction Details</h2>
            <p className="text-sm text-muted-foreground mt-1">Reference: {transaction.reference}</p>
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

        <div className="space-y-6">
          {/* Transaction Header */}
          <div className={`rounded-xl p-6 text-white ${
            transaction.type === 'credit' ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm opacity-90 font-medium">
                {transaction.type === 'credit' ? 'Money Received' : 'Money Sent'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                transaction.status === 'completed' ? 'bg-white/20' : 'bg-white/10'
              }`}>
                {transaction.status.toUpperCase()}
              </span>
            </div>
            <div className="text-4xl font-bold">
              {transaction.type === 'credit' ? '+' : '-'}KES {Number(transaction.amount).toLocaleString()}
            </div>
          </div>

          {/* Transaction Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
              <p className="font-mono text-sm font-medium text-foreground">{transaction.transaction_id || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Date & Time</p>
              <p className="font-semibold text-foreground">
                {new Date(transaction.created_at).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
              <p className="font-semibold text-foreground">{transaction.payment_method || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Type</p>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                transaction.type === 'credit'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
              }`}>
                {transaction.type.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Payer/User Information */}
          {(transaction.payer_name || transaction.phone_number || transaction.user) && (
            <div className="border-t border-border pt-4">
              <h3 className="font-semibold text-foreground mb-3">Payer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                {transaction.payer_name && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Name</p>
                    <p className="font-semibold text-foreground">{transaction.payer_name}</p>
                  </div>
                )}
                {transaction.phone_number && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
                    <p className="font-mono font-semibold text-foreground">{transaction.phone_number}</p>
                  </div>
                )}
                {transaction.user && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">User</p>
                      <p className="font-semibold text-foreground">{transaction.user.name}</p>
                    </div>
                    {transaction.user.member_id && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Member ID</p>
                        <p className="font-mono font-semibold text-foreground">{transaction.user.member_id}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Account Information */}
          {transaction.account && (
            <div className="border-t border-border pt-4">
              <h3 className="font-semibold text-foreground mb-3">Account Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Account Name</p>
                  <p className="font-semibold text-foreground">{transaction.account.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Account Reference</p>
                  <p className="font-mono font-semibold text-foreground">{transaction.account.reference}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Account Type</p>
                  <p className="font-semibold text-foreground">{transaction.account.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Account Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    transaction.account.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                  }`}>
                    {transaction.account.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
            <div className="border-t border-border pt-4">
              <h3 className="font-semibold text-foreground mb-3">Additional Information</h3>
              <div className="bg-secondary/20 rounded-lg p-4">
                <pre className="text-xs text-foreground whitespace-pre-wrap font-mono">
                  {JSON.stringify(transaction.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Processing Information */}
          {transaction.processed_at && (
            <div className="border-t border-border pt-4">
              <h3 className="font-semibold text-foreground mb-3">Processing Information</h3>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Processed At</p>
                <p className="font-semibold text-foreground">
                  {new Date(transaction.processed_at).toLocaleString('en-US', {
                    dateStyle: 'long',
                    timeStyle: 'long'
                  })}
                </p>
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

export default TransactionManagementNew;
