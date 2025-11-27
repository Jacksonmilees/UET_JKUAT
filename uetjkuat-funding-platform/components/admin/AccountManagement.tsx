import React, { useState, useEffect } from 'react';
import { Wallet, Plus, Target, ArrowUpRight, ArrowDownLeft, CheckCircle2, Search, X } from 'lucide-react';
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            Account Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Manage financial accounts and transfers</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTransferModal(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
          >
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Transfer Funds
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Account
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Balance</p>
              <p className="text-2xl font-bold text-foreground">
                KES {totalBalance.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Accounts</p>
              <p className="text-2xl font-bold text-foreground">{accounts.length}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Active Accounts</p>
              <p className="text-2xl font-bold text-foreground">{activeAccounts}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder="Search accounts by name or reference..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-colors shadow-sm"
        />
      </div>

      {/* Accounts Grid */}
      {loading ? (
        <div className="bg-card rounded-xl shadow-sm p-12 text-center border border-border">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading accounts...</p>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="bg-card rounded-xl shadow-sm p-12 text-center border border-border">
          <Wallet className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-lg text-foreground font-semibold">No accounts found</p>
          <p className="text-muted-foreground mt-2">Create your first account to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map((account) => (
            <div
              key={account.id}
              className="bg-card rounded-xl shadow-sm p-6 hover:shadow-md transition-all border border-border group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="text-lg font-semibold text-foreground truncate" title={account.name}>{account.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{account.reference}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize flex-shrink-0 ${account.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-secondary text-secondary-foreground'
                  }`}>
                  {account.status}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Balance</p>
                <p className="text-2xl font-bold text-primary">
                  KES {(account.balance || 0).toLocaleString()}
                </p>
              </div>

              {account.accountType && (
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="bg-secondary text-secondary-foreground text-xs font-medium px-2 py-1 rounded-md">
                    {account.accountType.name}
                  </span>
                  {account.accountSubtype && (
                    <span className="bg-secondary/50 text-secondary-foreground text-xs font-medium px-2 py-1 rounded-md">
                      {account.accountSubtype.name}
                    </span>
                  )}
                </div>
              )}

              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <button className="flex-1 px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
                  Details
                </button>
                <button className="flex-1 px-3 py-2 text-sm font-medium text-muted-foreground bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-2xl max-w-lg w-full p-6 border border-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-foreground">Create New Account</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-6">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Account Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
              placeholder="e.g., Main Operating Account"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Account Type</label>
            <select
              value={formData.account_type_id}
              onChange={(e) => setFormData({ ...formData, account_type_id: e.target.value })}
              className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
            >
              <option value="">Select Type</option>
              {accountTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-input rounded-lg font-medium text-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.name || !formData.account_type_id}
              className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-2xl max-w-lg w-full p-6 border border-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-foreground">Transfer Funds</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-6">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">From Account</label>
            <select
              value={formData.source_account_id}
              onChange={(e) => setFormData({ ...formData, source_account_id: e.target.value })}
              className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
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
            <label className="block text-sm font-medium text-foreground mb-1.5">To Account</label>
            <select
              value={formData.destination_account_id}
              onChange={(e) => setFormData({ ...formData, destination_account_id: e.target.value })}
              className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
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
            <label className="block text-sm font-medium text-foreground mb-1.5">Amount (KES)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
              rows={3}
              placeholder="Transfer description..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-input rounded-lg font-medium text-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.source_account_id || !formData.destination_account_id || !formData.amount}
              className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
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
