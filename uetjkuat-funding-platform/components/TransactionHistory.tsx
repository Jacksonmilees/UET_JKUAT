
import React from 'react';
import { Transaction } from '../types';
import { IconTrendingUp, IconTrendingDown, IconCheck, IconX, IconClock } from './icons';

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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500 mb-4">No transactions found</p>
        <p className="text-sm text-gray-400">Your transaction history will appear here</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return <IconCheck className="w-5 h-5 text-green-600" />;
      case 'pending':
      case 'processing':
        return <IconClock className="w-5 h-5 text-yellow-600" />;
      case 'failed':
      case 'cancelled':
        return <IconX className="w-5 h-5 text-red-600" />;
      default:
        return <IconClock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-800">Transaction History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(tx.date).toLocaleDateString('en-KE', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {tx.projectTitle || tx.description || 'Transaction'}
                  {tx.projectId && onViewProject && (
                    <button
                      onClick={() => onViewProject(tx.projectId!)}
                      className="ml-2 text-blue-600 hover:underline text-xs"
                    >
                      View Project
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {tx.type === 'credit' || tx.type === 'donation' ? (
                      <IconTrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <IconTrendingDown className="w-4 h-4 text-red-600 mr-1" />
                    )}
                    <span className="text-sm text-gray-700 capitalize">{tx.type || 'N/A'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {tx.type === 'debit' || tx.type === 'withdrawal' ? '-' : '+'}
                  KES {tx.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(tx.status)}
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
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






