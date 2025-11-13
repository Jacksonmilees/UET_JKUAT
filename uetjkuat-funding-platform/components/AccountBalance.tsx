
import React from 'react';
import { Account } from '../types';
import { IconTrendingUp, IconTrendingDown } from './icons';

interface AccountBalanceProps {
  account: Account | null;
  isLoading?: boolean;
}

const AccountBalance: React.FC<AccountBalanceProps> = ({ account, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500">No account information available</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-blue-200 text-sm font-medium">Account Balance</p>
          <p className="text-3xl font-bold mt-1">KES {account.balance.toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-blue-500 bg-opacity-30 rounded-full p-3">
            <IconTrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>
      <div className="border-t border-blue-400 border-opacity-30 pt-4 mt-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-200">Account Number</p>
            <p className="font-semibold">{account.accountNumber}</p>
          </div>
          <div>
            <p className="text-blue-200">Account Type</p>
            <p className="font-semibold">{account.type || 'Standard'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountBalance;







