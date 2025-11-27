import React, { useState, useEffect } from 'react';
import { IconCreditCard, IconArrowUp, IconArrowDown, IconCheckCircle, IconClock, IconAlertCircle } from '../icons';
import api from '../../services/api';

interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit' | 'donation' | 'withdrawal';
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  date: string;
  description?: string;
  reference?: string;
  phoneNumber?: string;
  projectTitle?: string;
  account?: {
    id: number;
    name: string;
    reference: string;
  };
}

const TransactionManagement: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
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

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filters.type !== 'all') params.type = filters.type;
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.dateFrom) params.from_date = filters.dateFrom;
      if (filters.dateTo) params.to_date = filters.dateTo;

      const response = await api.transactions.getAll(params);
      if (response.success && response.data) {
        setTransactions(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <IconArrowDown className="w-5 h-5 text-green-600" />;
      case 'debit':
      case 'withdrawal':
        return <IconArrowUp className="w-5 h-5 text-red-600" />;
      case 'donation':
        return <IconCheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <IconCreditCard className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-700';
  };

  const totalAmount = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const creditTotal = transactions
    .filter(t => t.type === 'credit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const debitTotal = transactions
    .filter(t => (t.type === 'debit' || t.type === 'withdrawal') && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <IconCreditCard className="w-8 h-8 text-blue-600" />
          Transaction Management
        </h2>
        <p className="text-gray-600 mt-1">View and manage all financial transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 border-2 border-blue-200">
          <p className="text-blue-700 font-semibold mb-2">Total Transactions</p>
          <p className="text-4xl font-extrabold text-blue-800">{transactions.length}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 border-2 border-purple-200">
          <p className="text-purple-700 font-semibold mb-2">Total Volume</p>
          <p className="text-3xl font-extrabold text-purple-800">KES {totalAmount.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl p-6 border-2 border-green-200">
          <p className="text-green-700 font-semibold mb-2">Credits</p>
          <p className="text-3xl font-extrabold text-green-800">KES {creditTotal.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl shadow-xl p-6 border-2 border-red-200">
          <p className="text-red-700 font-semibold mb-2">Debits</p>
          <p className="text-3xl font-extrabold text-red-800">KES {debitTotal.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
              <option value="donation">Donation</option>
              <option value="withdrawal">Withdrawal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <IconCreditCard className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600 font-semibold">No transactions found</p>
          <p className="text-gray-500 mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Date & Time</th>
                  <th className="px-6 py-4 text-left font-bold">Type</th>
                  <th className="px-6 py-4 text-left font-bold">Description</th>
                  <th className="px-6 py-4 text-right font-bold">Amount</th>
                  <th className="px-6 py-4 text-center font-bold">Status</th>
                  <th className="px-6 py-4 text-center font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-800">
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(transaction.type)}
                        <span className="font-semibold capitalize">{transaction.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-800">
                        {transaction.description || transaction.projectTitle || 'N/A'}
                      </div>
                      {transaction.reference && (
                        <div className="text-xs text-gray-500 font-mono">{transaction.reference}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold text-lg ${
                        transaction.type === 'credit' || transaction.type === 'donation'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' || transaction.type === 'donation' ? '+' : '-'}
                        KES {transaction.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(transaction.status)}`}>
                        {transaction.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                      >
                        View Details
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Transaction Details</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                  <p className="font-mono font-semibold text-gray-800">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Type</p>
                  <p className="font-semibold text-gray-800 capitalize">{selectedTransaction.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    KES {selectedTransaction.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(selectedTransaction.status)}`}>
                    {selectedTransaction.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(selectedTransaction.date).toLocaleString()}
                  </p>
                </div>
                {selectedTransaction.reference && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Reference</p>
                    <p className="font-mono text-sm font-semibold text-gray-800">{selectedTransaction.reference}</p>
                  </div>
                )}
                {selectedTransaction.phoneNumber && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                    <p className="font-semibold text-gray-800">{selectedTransaction.phoneNumber}</p>
                  </div>
                )}
                {selectedTransaction.description && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="text-gray-800">{selectedTransaction.description}</p>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 shadow-lg transform hover:scale-105 transition-all"
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
