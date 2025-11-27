import React, { useState, useEffect } from 'react';
import { IconWallet, IconPlus, IconTarget, IconArrowUp, IconArrowDown, IconCheckCircle } from '../icons';
import api from '../../services/api';

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
}

interface AccountType {
  id: number;
  name: string;
  code: string;
}

const AccountManagement: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAccounts();
    fetchAccountTypes();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await api.accounts.getAll();
      if (response.success && response.data) {
        setAccounts(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
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

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const activeAccounts = accounts.filter(acc => acc.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <IconWallet className="w-8 h-8 text-green-600" />
            Account Management
          </h2>
          <p className="text-gray-600 mt-1">Manage financial accounts and transfers</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTransferModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 shadow-lg transform hover:scale-105 transition-all"
          >
            <IconArrowUp className="w-5 h-5 inline mr-2" />
            Transfer Funds
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 shadow-lg transform hover:scale-105 transition-all"
          >
            <IconPlus className="w-5 h-5 inline mr-2" />
            New Account
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl p-6 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 font-semibold mb-2">Total Balance</p>
              <p className="text-4xl font-extrabold text-green-800">
                KES {totalBalance.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-green-600 rounded-xl">
              <IconWallet className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 font-semibold mb-2">Total Accounts</p>
              <p className="text-4xl font-extrabold text-blue-800">{accounts.length}</p>
            </div>
            <div className="p-4 bg-blue-600 rounded-xl">
              <IconTarget className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 border-2 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700 font-semibold mb-2">Active Accounts</p>
              <p className="text-4xl font-extrabold text-purple-800">{activeAccounts}</p>
            </div>
            <div className="p-4 bg-purple-600 rounded-xl">
              <IconCheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <input
          type="text"
          placeholder="Search accounts by name or reference..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-6 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
        />
      </div>

      {/* Accounts Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading accounts...</p>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <IconWallet className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600 font-semibold">No accounts found</p>
          <p className="text-gray-500 mt-2">Create your first account to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map((account) => (
            <div
              key={account.id}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all border-2 border-transparent hover:border-green-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{account.name}</h3>
                  <p className="text-sm text-gray-500 font-mono">{account.reference}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  account.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {account.status}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Balance</p>
                <p className="text-3xl font-extrabold text-green-600">
                  KES {(account.balance || 0).toLocaleString()}
                </p>
              </div>

              {account.accountType && (
                <div className="mb-4">
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                    {account.accountType.name}
                  </span>
                  {account.accountSubtype && (
                    <span className="ml-2 bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
                      {account.accountSubtype.name}
                    </span>
                  )}
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  View Details
                </button>
                <button className="flex-1 bg-gray-600 text-white py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateAccountModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchAccounts();
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
          }}
          accounts={accounts}
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

  const handleSubmit = async () => {
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
    } catch (err) {
      setError('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Create New Account</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Account Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Main Operating Account"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Account Type</label>
            <select
              value={formData.account_type_id}
              onChange={(e) => setFormData({ ...formData, account_type_id: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select Type</option>
              {accountTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.name || !formData.account_type_id}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 shadow-lg transform hover:scale-105 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </div>
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

  const handleSubmit = async () => {
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
    } catch (err) {
      setError('Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Transfer Funds</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">From Account</label>
            <select
              value={formData.source_account_id}
              onChange={(e) => setFormData({ ...formData, source_account_id: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Source Account</option>
              {accounts.filter(a => a.status === 'active').map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} - KES {account.balance?.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">To Account</label>
            <select
              value={formData.destination_account_id}
              onChange={(e) => setFormData({ ...formData, destination_account_id: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Destination Account</option>
              {accounts.filter(a => a.status === 'active' && a.id.toString() !== formData.source_account_id).map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (KES)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Transfer description..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.source_account_id || !formData.destination_account_id || !formData.amount}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 shadow-lg transform hover:scale-105 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Transfer Funds'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountManagement;
