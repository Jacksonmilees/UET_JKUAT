import React, { useState, useEffect } from 'react';
import { IconCreditCard, IconArrowUp, IconArrowDown, IconCheckCircle, IconClock, IconFilter } from '../icons';
import api from '../../services/api';

interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit' | 'donation' | 'withdrawal' | 'purchase' | 'registration';
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description?: string;
  reference?: string;
  projectTitle?: string;
  merchantName?: string;
}

const MyTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year' | 'all'>('all');

  useEffect(() => {
    fetchTransactions();
  }, [filter, dateRange]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filter !== 'all') params.status = filter;
      
      // Add date filtering
      if (dateRange !== 'all') {
        const now = new Date();
        const fromDate = new Date();
        if (dateRange === 'week') fromDate.setDate(now.getDate() - 7);
        if (dateRange === 'month') fromDate.setMonth(now.getMonth() - 1);
        if (dateRange === 'year') fromDate.setFullYear(now.getFullYear() - 1);
        params.from_date = fromDate.toISOString().split('T')[0];
      }

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

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const totalSpent = filteredTransactions
    .filter(t => (t.type === 'debit' || t.type === 'purchase' || t.type === 'donation') && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReceived = filteredTransactions
    .filter(t => t.type === 'credit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <IconArrowDown className="w-5 h-5 text-green-600" />;
      case 'debit':
      case 'withdrawal':
      case 'purchase':
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
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <IconCreditCard className="w-8 h-8 text-blue-600" />
          My Transactions
        </h2>
        <p className="text-gray-600 mt-1">View all your payment history and transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 border-2 border-blue-200">
          <p className="text-blue-700 font-semibold mb-2">Total Transactions</p>
          <p className="text-4xl font-extrabold text-blue-800">{filteredTransactions.length}</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl shadow-xl p-6 border-2 border-red-200">
          <p className="text-red-700 font-semibold mb-2">Total Spent</p>
          <p className="text-3xl font-extrabold text-red-800">KES {totalSpent.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl p-6 border-2 border-green-200">
          <p className="text-green-700 font-semibold mb-2">Total Received</p>
          <p className="text-3xl font-extrabold text-green-800">KES {totalReceived.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <IconFilter className="w-4 h-4 inline mr-1" />
              Status
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <IconCreditCard className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600 font-semibold">No transactions found</p>
          <p className="text-gray-500 mt-2">Start making contributions to see your transaction history</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Date</th>
                  <th className="px-6 py-4 text-left font-bold">Type</th>
                  <th className="px-6 py-4 text-left font-bold">Description</th>
                  <th className="px-6 py-4 text-right font-bold">Amount</th>
                  <th className="px-6 py-4 text-center font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
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
                        {transaction.description || transaction.projectTitle || transaction.merchantName || 'N/A'}
                      </div>
                      {transaction.reference && (
                        <div className="text-xs text-gray-500 font-mono">{transaction.reference}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold text-lg ${
                        transaction.type === 'credit'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}
                        KES {transaction.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(transaction.status)}`}>
                        {transaction.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Export Transactions</h3>
        <div className="flex flex-wrap gap-4">
          <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 shadow-lg transform hover:scale-105 transition-all">
            📄 Download PDF
          </button>
          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 shadow-lg transform hover:scale-105 transition-all">
            📊 Export CSV
          </button>
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 shadow-lg transform hover:scale-105 transition-all">
            📧 Email Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyTransactions;
