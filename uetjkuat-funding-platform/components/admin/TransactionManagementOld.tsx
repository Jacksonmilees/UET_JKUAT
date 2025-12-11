import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowUpRight, ArrowDownLeft, CheckCircle2, Clock, AlertCircle, Search, Filter, X, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { TableSkeleton, CardSkeleton } from '../ui/Skeleton';

interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit' | 'donation' | 'withdrawal';
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  date?: string; // Legacy field
  created_at: string;
  updated_at: string;
  description?: string;
  reference?: string;
  phone_number?: string;
  payer_name?: string; // User/Payer name from backend
  payment_method?: string;
  metadata?: any;
  processed_at?: string;
  account?: {
    id: number;
    name: string;
    reference: string;
    type: string;
    status: string;
  };
}

const TransactionManagement: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  // Search filtering effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTransactions(transactions);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = transactions.filter(t =>
      t.payer_name?.toLowerCase().includes(query) ||
      t.reference?.toLowerCase().includes(query) ||
      t.phone_number?.toLowerCase().includes(query) ||
      t.account?.name?.toLowerCase().includes(query) ||
      t.account?.reference?.toLowerCase().includes(query) ||
      t.id.toString().includes(query)
    );
    setFilteredTransactions(filtered);
  }, [searchQuery, transactions]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filters.type !== 'all') params.type = filters.type;
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.dateFrom) params.start_date = filters.dateFrom;
      if (filters.dateTo) params.end_date = filters.dateTo;

      const response = await api.transactions.getAll(params);
      if (response.success && response.data) {
        const txns = Array.isArray(response.data) ? response.data : [];
        setTransactions(txns);
        setFilteredTransactions(txns);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format date to human-readable format
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    // If less than 24 hours ago, show relative time
    if (diffInHours < 24) {
      if (diffInHours < 1) {
        const mins = Math.floor(diffInHours * 60);
        return mins <= 1 ? 'Just now' : `${mins} mins ago`;
      }
      const hours = Math.floor(diffInHours);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }

    // Otherwise show full date
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case 'debit':
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'donation':
        return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
      default:
        return <CreditCard className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      cancelled: 'bg-secondary text-secondary-foreground',
    };
    return badges[status as keyof typeof badges] || 'bg-secondary text-secondary-foreground';
  };

  const totalAmount = filteredTransactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const creditTotal = filteredTransactions
    .filter(t => t.type === 'credit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const debitTotal = filteredTransactions
    .filter(t => (t.type === 'debit' || t.type === 'withdrawal') && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            Transaction Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Loading transactions...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
        </div>
        <TableSkeleton rows={8} columns={6} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            Transaction Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">View and manage all financial transactions</p>
        </div>
        <button
          onClick={fetchTransactions}
          className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-card rounded-xl shadow-sm p-4 border border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, reference, phone, or account..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-xs text-muted-foreground mt-2">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
            {searchQuery ? 'Filtered' : 'Total'} Transactions
          </p>
          <p className="text-2xl font-bold text-foreground">{filteredTransactions.length}</p>
          {searchQuery && transactions.length !== filteredTransactions.length && (
            <p className="text-xs text-muted-foreground mt-1">of {transactions.length} total</p>
          )}
        </div>

        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
            {searchQuery ? 'Filtered' : 'Total'} Volume
          </p>
          <p className="text-2xl font-bold text-foreground">KES {totalAmount.toLocaleString()}</p>
        </div>

        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Credits</p>
          <p className="text-2xl font-bold text-green-600">KES {creditTotal.toLocaleString()}</p>
        </div>

        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Debits</p>
          <p className="text-2xl font-bold text-red-600">KES {debitTotal.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
        <div className="flex items-center gap-2 mb-4 text-sm font-medium text-foreground">
          <Filter className="w-4 h-4" />
          Filters
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
            >
              <option value="all">All Types</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
              <option value="donation">Donation</option>
              <option value="withdrawal">Withdrawal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="bg-card rounded-xl shadow-sm p-12 text-center border border-border">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="bg-card rounded-xl shadow-sm p-12 text-center border border-border">
          <CreditCard className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-lg text-foreground font-semibold">
            {searchQuery ? 'No matching transactions' : 'No transactions found'}
          </p>
          <p className="text-muted-foreground mt-2">
            {searchQuery ? 'Try a different search term' : 'Try adjusting your filters'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User/Payer</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground">
                        {formatDate(transaction.created_at || transaction.date)}
                      </div>
                      {transaction.created_at && (
                        <div className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground">
                        {transaction.payer_name || 'N/A'}
                      </div>
                      {transaction.phone_number && (
                        <div className="text-xs text-muted-foreground font-mono">{transaction.phone_number}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground">
                        {transaction.account?.name || 'N/A'}
                      </div>
                      {transaction.account?.reference && (
                        <div className="text-xs text-muted-foreground font-mono">{transaction.account.reference}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(transaction.type)}
                        <span className="text-sm capitalize text-foreground">{transaction.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold text-sm ${transaction.type === 'credit' || transaction.type === 'donation'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                        }`}>
                        {transaction.type === 'credit' || transaction.type === 'donation' ? '+' : '-'}
                        KES {transaction.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-lg w-full p-6 border border-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Transaction Details</h2>
              <button onClick={() => setSelectedTransaction(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Transaction ID</p>
                  <p className="font-mono text-sm font-semibold text-foreground">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Type</p>
                  <p className="text-sm font-semibold text-foreground capitalize flex items-center gap-2">
                    {getTypeIcon(selectedTransaction.type)}
                    {selectedTransaction.type}
                  </p>
                </div>
                {selectedTransaction.payer_name && (
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">User/Payer Name</p>
                    <p className="text-base font-semibold text-foreground">{selectedTransaction.payer_name}</p>
                  </div>
                )}
                {selectedTransaction.account && (
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Account</p>
                    <p className="text-sm font-semibold text-foreground">{selectedTransaction.account.name}</p>
                    <p className="font-mono text-xs text-muted-foreground mt-0.5">{selectedTransaction.account.reference}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Amount</p>
                  <p className={`text-xl font-bold ${selectedTransaction.type === 'credit' || selectedTransaction.type === 'donation'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                    }`}>
                    KES {selectedTransaction.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(selectedTransaction.status)}`}>
                    {selectedTransaction.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Date Created</p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatDate(selectedTransaction.created_at || selectedTransaction.date)}
                  </p>
                </div>
                {selectedTransaction.payment_method && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Payment Method</p>
                    <p className="text-sm font-semibold text-foreground capitalize">{selectedTransaction.payment_method}</p>
                  </div>
                )}
                {selectedTransaction.reference && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Reference</p>
                    <p className="font-mono text-sm font-semibold text-foreground">{selectedTransaction.reference}</p>
                  </div>
                )}
                {selectedTransaction.phone_number && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Phone Number</p>
                    <p className="text-sm font-semibold text-foreground">{selectedTransaction.phone_number}</p>
                  </div>
                )}
                {selectedTransaction.processed_at && (
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Processed At</p>
                    <p className="text-sm text-foreground">{formatDate(selectedTransaction.processed_at)}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border">
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManagement;
