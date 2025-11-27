import React from 'react';
import { Transaction } from '../types';
import { TrendingUp, TrendingDown, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onViewProject?: (projectId: number) => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  isLoading,
  onViewProject,
}) => {
  if (isLoading) {
    return (
      <div className="bg-secondary-900 rounded-3xl shadow-lg p-6 border border-secondary-800">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-secondary-800 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-secondary-900 rounded-3xl shadow-lg p-12 text-center border border-secondary-800">
        <div className="w-16 h-16 bg-secondary-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-secondary-600" />
        </div>
        <p className="text-white font-bold text-lg mb-2">No transactions found</p>
        <p className="text-secondary-500">Your transaction history will appear here</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
      case 'processing':
        return <Clock className="w-4 h-4 text-primary-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-secondary-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'pending':
      case 'processing':
        return 'bg-primary-500/10 text-primary-400 border-primary-500/20';
      case 'failed':
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-secondary-800 text-secondary-400 border-secondary-700';
    }
  };

  return (
    <div className="bg-secondary-900 rounded-3xl shadow-xl overflow-hidden border border-secondary-800">
      <div className="px-8 py-6 border-b border-secondary-800 bg-secondary-900/50 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-500" />
          Transaction History
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary-950/50">
            <tr>
              <th className="px-8 py-4 text-left text-xs font-bold text-secondary-500 uppercase tracking-wider">Date</th>
              <th className="px-8 py-4 text-left text-xs font-bold text-secondary-500 uppercase tracking-wider">Description</th>
              <th className="px-8 py-4 text-left text-xs font-bold text-secondary-500 uppercase tracking-wider">Type</th>
              <th className="px-8 py-4 text-left text-xs font-bold text-secondary-500 uppercase tracking-wider">Amount</th>
              <th className="px-8 py-4 text-left text-xs font-bold text-secondary-500 uppercase tracking-wider">Status</th>
              <th className="px-8 py-4 text-left text-xs font-bold text-secondary-500 uppercase tracking-wider">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-800">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-secondary-800/50 transition-colors group">
                <td className="px-8 py-5 whitespace-nowrap text-sm text-secondary-400">
                  {new Date(tx.date).toLocaleDateString('en-KE', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-8 py-5 text-sm text-white font-medium">
                  <div className="flex items-center gap-2">
                    {tx.projectTitle || tx.description || 'Transaction'}
                    {tx.projectId && onViewProject && (
                      <button
                        onClick={() => onViewProject(tx.projectId!)}
                        className="text-primary-500 hover:text-primary-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="View Project"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {tx.type === 'credit' || tx.type === 'donation' ? (
                      <div className="p-1.5 rounded-full bg-green-500/10">
                        <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                      </div>
                    ) : (
                      <div className="p-1.5 rounded-full bg-red-500/10">
                        <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                      </div>
                    )}
                    <span className="text-sm text-secondary-300 capitalize">{tx.type || 'N/A'}</span>
                  </div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-white">
                  <span className={tx.type === 'debit' || tx.type === 'withdrawal' ? 'text-red-400' : 'text-green-400'}>
                    {tx.type === 'debit' || tx.type === 'withdrawal' ? '-' : '+'}
                  </span>{' '}
                  KES {tx.amount.toLocaleString()}
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${getStatusColor(tx.status)}`}>
                    {getStatusIcon(tx.status)}
                    <span className="capitalize">{tx.status}</span>
                  </div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm text-secondary-500 font-mono tracking-wider">
                  {tx.reference || tx.id.substring(0, 8)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;






