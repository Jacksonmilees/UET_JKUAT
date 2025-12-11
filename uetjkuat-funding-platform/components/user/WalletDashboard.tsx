import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  ArrowDownToLine,
  RefreshCw,
  Filter,
  Download,
  DollarSign,
  Activity
} from 'lucide-react';
import api from '../../services/api';

interface WalletBalance {
  balance: number;
  unsettled_balance: number;
  total_available_funds: number;
  currency: string;
}

interface WalletTransaction {
  id: number;
  type: 'credit' | 'debit';
  amount: number;
  balance_after: number;
  source?: string;
  purpose?: string;
  reference_type?: string;
  reference_id?: number;
  metadata?: any;
  status: 'completed' | 'pending' | 'failed' | 'reversed';
  created_at: string;
}

interface WalletStatistics {
  total_credits: number;
  total_debits: number;
  transaction_count: number;
  current_balance: number;
  unsettled_balance: number;
  recent_credits: number;
  recent_debits: number;
}

const WalletDashboard: React.FC = () => {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [statistics, setStatistics] = useState<WalletStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [settling, setSettling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, [selectedFilter, dateFilter]);

  const fetchWalletData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [balanceRes, transactionsRes, statsRes] = await Promise.all([
        api.get('/v1/wallet/balance'),
        api.get('/v1/wallet/transactions', {
          params: {
            type: selectedFilter !== 'all' ? selectedFilter : undefined,
            from_date: dateFilter.from || undefined,
            to_date: dateFilter.to || undefined,
          }
        }),
        api.get('/v1/wallet/statistics'),
      ]);

      if (balanceRes.data.success) {
        setBalance(balanceRes.data.data);
      }

      if (transactionsRes.data.success) {
        setTransactions(transactionsRes.data.data);
      }

      if (statsRes.data.success) {
        setStatistics(statsRes.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWalletData();
    setRefreshing(false);
  };

  const handleSettleFunds = async () => {
    if (!balance || balance.unsettled_balance <= 0) return;

    setSettling(true);
    setError(null);

    try {
      const response = await api.post('/v1/wallet/settle-funds', {
        amount: balance.unsettled_balance,
      });

      if (response.data.success) {
        await fetchWalletData();
      } else {
        setError(response.data.message || 'Failed to settle funds');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to settle funds');
    } finally {
      setSettling(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return `KES ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionDescription = (transaction: WalletTransaction): string => {
    if (transaction.type === 'credit') {
      switch (transaction.source) {
        case 'recharge': return 'Wallet recharge';
        case 'settlement': return 'Funds settled';
        case 'refund': return 'Refund received';
        case 'contribution': return 'Contribution received';
        default: return 'Wallet credited';
      }
    } else {
      switch (transaction.purpose) {
        case 'project': return `Project: ${transaction.metadata?.project_title || 'Unknown'}`;
        case 'merchandise': return `Merchandise: ${transaction.metadata?.merchandise_name || 'Purchase'}`;
        case 'withdrawal': return 'Withdrawal';
        case 'transfer': return 'Account transfer';
        default: return 'Wallet payment';
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Wallet className="w-8 h-8 text-blue-600" />
          My Wallet
        </h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Available Balance */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-6 h-6" />
              <span className="text-sm opacity-90">Available Balance</span>
            </div>
          </div>
          <div className="text-3xl font-bold mb-2">
            {balance ? formatCurrency(balance.balance) : 'KES 0.00'}
          </div>
          <p className="text-sm opacity-75">Ready to spend</p>
        </div>

        {/* Unsettled Funds */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6" />
              <span className="text-sm opacity-90">Unsettled Funds</span>
            </div>
          </div>
          <div className="text-3xl font-bold mb-2">
            {balance ? formatCurrency(balance.unsettled_balance) : 'KES 0.00'}
          </div>
          {balance && balance.unsettled_balance > 0 && (
            <button
              onClick={handleSettleFunds}
              disabled={settling}
              className="mt-2 px-4 py-2 bg-white text-amber-600 rounded-lg hover:bg-amber-50 disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
            >
              <ArrowDownToLine className="w-4 h-4" />
              {settling ? 'Settling...' : 'Settle to Wallet'}
            </button>
          )}
        </div>

        {/* Total Available */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              <span className="text-sm opacity-90">Total Available</span>
            </div>
          </div>
          <div className="text-3xl font-bold mb-2">
            {balance ? formatCurrency(balance.total_available_funds) : 'KES 0.00'}
          </div>
          <p className="text-sm opacity-75">Wallet + Unsettled</p>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Wallet Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Total Credits</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(statistics.total_credits)}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm font-medium">Total Debits</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(statistics.total_debits)}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Transactions</span>
              </div>
              <p className="text-2xl font-bold">{statistics.transaction_count}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">Recent Activity (30d)</span>
              </div>
              <p className="text-sm">
                <span className="text-green-600 font-bold">
                  +{formatCurrency(statistics.recent_credits)}
                </span>
                {' / '}
                <span className="text-red-600 font-bold">
                  -{formatCurrency(statistics.recent_debits)}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Transaction History
          </h2>
          <div className="flex gap-2">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Transactions</option>
              <option value="credit">Credits Only</option>
              <option value="debit">Debits Only</option>
            </select>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Wallet className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No transactions yet</p>
            <p className="text-sm">Your wallet transactions will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'credit'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {transaction.type === 'credit' ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{getTransactionDescription(transaction)}</p>
                    <p className="text-sm text-gray-500">{formatDate(transaction.created_at)}</p>
                    {transaction.metadata?.donor_name && (
                      <p className="text-xs text-gray-400">From: {transaction.metadata.donor_name}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Balance: {formatCurrency(transaction.balance_after)}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    transaction.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : transaction.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/user/recharge"
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Recharge Wallet</p>
              <p className="text-sm text-gray-500">Add funds via M-Pesa</p>
            </div>
          </a>
          <a
            href="/user/projects"
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Fund Projects</p>
              <p className="text-sm text-gray-500">Support a cause</p>
            </div>
          </a>
          <a
            href="/user/merchandise"
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Buy Merchandise</p>
              <p className="text-sm text-gray-500">Shop with wallet</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default WalletDashboard;
